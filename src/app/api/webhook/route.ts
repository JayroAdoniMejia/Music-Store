import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const sig = headerList.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret!);
  } catch (err: any) {
    console.error(`❌ Error de Webhook: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Convertir userId a Int
    const userId = parseInt(session.metadata?.userId || "0");

    if (userId === 0) {
      console.error("❌ userId es inválido o no existe en los metadatos de la sesión.");
      return new NextResponse("UserId inválido", { status: 400 });
    }

    try {
      // 1. Recuperar los ítems detallados desde Stripe
      const checkoutSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items.data.price.product'],
      });

      const lineItems = checkoutSession.line_items?.data;

      if (!lineItems || lineItems.length === 0) {
        console.error("❌ La sesión de checkout no contiene productos.");
        return new NextResponse("Datos de productos incompletos", { status: 400 });
      }

      // 2. Resolver los productos en SQLite FUERA de la transacción para evitar bloqueos/timeouts
      const itemsParaProcesar: { product: any; quantity: number; price: number }[] = [];

      for (const item of lineItems) {
        const productName = (item.description || "").trim();

        // Buscar producto por nombre exacto
        const product = await prisma.product.findFirst({
          where: { name: productName },
        });

        if (!product) {
          console.error(`❌ Producto no encontrado en DB: "${productName}"`);
          throw new Error(`Producto no encontrado en DB: ${productName}`);
        }

        itemsParaProcesar.push({
          product,
          quantity: item.quantity || 1,
          price: (item.price?.unit_amount || 0) / 100,
        });
      }

      // 3. Transacción atómica ultrarrápida (solo operaciones de escritura)
      await prisma.$transaction(async (tx) => {
        // A. Crear la Orden
        const order = await tx.order.create({
          data: {
            userId: userId,
            total: session.amount_total ? session.amount_total / 100 : 0,
            status: "COMPLETED",
          },
        });

        // B. Crear OrderItems y descontar stock
        for (const item of itemsParaProcesar) {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.product.id,
              quantity: item.quantity,
              price: item.price,
            },
          });

          await tx.product.update({
            where: { id: item.product.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
      });

      console.log(`✅ Orden creada y stock descontado exitosamente para el usuario ${userId} (Sesión: ${session.id})`);

    } catch (dbError: any) {
      console.error("❌ Error en DB Webhook:", dbError.message);
      return new NextResponse(`Error Interno: ${dbError.message}`, { status: 500 });
    }
  }

  // Responder inmediatamente a Stripe con un 200 OK
  return NextResponse.json({ received: true });
}
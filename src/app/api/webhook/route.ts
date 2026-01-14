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

    // Recuperar items detallados desde Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items.data.price.product'],
    });

    const lineItems = checkoutSession.line_items?.data;

    if (!lineItems || userId === 0) {
      console.error("❌ Datos de sesión incompletos.");
      return new NextResponse("Datos incompletos", { status: 400 });
    }

    try {
      // Transacción atómica: o se guarda todo o nada (Igual que en FUNDESUR)
      await prisma.$transaction(async (tx) => {
        // 1. Crear la Orden
        const order = await tx.order.create({
          data: {
            userId: userId,
            total: session.amount_total ? session.amount_total / 100 : 0,
            status: "COMPLETED",
          },
        });

        // 2. Procesar cada producto
        for (const item of lineItems) {
          const productName = item.description || "";

          const product = await tx.product.findFirst({
            where: { name: productName }
          });

          if (product) {
            // Crear el item de la orden
            await tx.orderItem.create({
              data: {
                orderId: order.id,
                productId: product.id,
                quantity: item.quantity || 1,
                price: (item.price?.unit_amount || 0) / 100,
              }
            });

            // Descontar del inventario
            await tx.product.update({
              where: { id: product.id },
              data: { stock: { decrement: item.quantity || 1 } }
            });
          } else {
            // Error crítico si el producto no existe en DB pero sí en Stripe
            throw new Error(`Producto no encontrado en DB: ${productName}`);
          }
        }
      });

      console.log(`✅ Orden #${session.id} completada para el usuario ${userId}`);

    } catch (dbError: any) {
      console.error("❌ Error en DB Webhook:", dbError.message);
      return new NextResponse(`Error Interno: ${dbError.message}`, { status: 500 });
    }
  }

  // Responder a Stripe que recibimos el aviso correctamente
  return NextResponse.json({ received: true });
}
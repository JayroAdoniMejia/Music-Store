'use server';

import Stripe from 'stripe';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
});

export async function createCheckoutSession(cartItems: any[]) {
  const sessionUser = await getServerSession(authOptions);

  if (!sessionUser || !sessionUser.user) {
    throw new Error("Debes iniciar sesión para realizar la compra");
  }

  // 1. VALIDACIÓN DE URL BASE (Evita el error "Not a valid URL")
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl || !baseUrl.startsWith('http')) {
    console.error("ERROR: NEXT_PUBLIC_BASE_URL no está configurada correctamente en .env.local");
    throw new Error("Error de configuración en el servidor");
  }

  const tasa = parseFloat(process.env.TASA_CAMBIO || '24.75');
  const userId = (sessionUser.user as any).id?.toString();

  // 2. FORMATEO DE PRODUCTOS
  const line_items = cartItems.map((item) => {
    const rawImage = item.imageUrl || item.image;
    // Solo enviamos la imagen si es una URL absoluta (http/https)
    const images = (typeof rawImage === 'string' && rawImage.startsWith('http')) 
      ? [rawImage] 
      : [];

    return {
      price_data: {
        currency: 'hnl',
        product_data: {
          name: item.name,
          images: images,
        },
        unit_amount: Math.round(item.price * tasa * 100),
      },
      quantity: item.quantity,
    };
  });

  // 3. CREACIÓN DE SESIÓN CON URLS VALIDANTES
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${baseUrl}/profile?success=true`,
    cancel_url: `${baseUrl}/cart?canceled=true`,
    customer_email: sessionUser.user?.email as string,
    metadata: {
      userId: userId,
    },
  });

  return { url: session.url };
}
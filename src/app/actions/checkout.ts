'use server';

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Importación centralizada corregida [cite: 17-09-2017]

export async function createOrder(cartItems: any[], total: number) {
  try {
    // 1. Obtenemos la sesión para sacar el ID del usuario [cite: 17-09-2017]
    const session = await getServerSession(authOptions);
    
    // Verificamos si la sesión existe y tiene el ID que inyectamos en auth.ts [cite: 17-09-2017]
    if (!session || !session.user) {
      console.error("DEBUG: No se encontró sesión activa al intentar comprar.");
      return { success: false, error: "Debes iniciar sesión para comprar." };
    }

    // Usamos una transacción para asegurar integridad [cite: 17-09-2017]
    const result = await prisma.$transaction(async (tx) => {
      
      // 2. Validamos stock antes de procesar cada item [cite: 17-09-2017]
      for (const item of cartItems) {
        const product = await tx.product.findUnique({
          where: { id: Number(item.id) } // Forzamos Number para evitar errores de tipo [cite: 17-09-2017]
        });

        if (!product || product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product?.name || 'producto'}`);
        }
      }

      // 3. Creamos la orden vinculada al userId (según tu schema) [cite: 17-09-2017]
      const order = await tx.order.create({
        data: {
          total: total,
          status: "pending",
          userId: Number(session.user.id), // Vinculamos con el ID del usuario logueado [cite: 17-09-2017]
          items: {
            create: cartItems.map((item) => ({
              productId: Number(item.id),
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // 4. Descontamos el stock en la base de datos [cite: 17-09-2017]
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: Number(item.id) },
          data: {
            stock: { decrement: item.quantity }
          }
        });
      }

      return order;
    });

    return { success: true, orderId: result.id };
  } catch (error: any) {
    // IMPORTANTE: Este log te dirá en la terminal de VS Code el error exacto de Prisma [cite: 17-09-2017]
    console.error("ERROR CRÍTICO EN CHECKOUT:", error.message || error);
    return { success: false };
  }
}
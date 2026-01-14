'use server';

import prisma from "@/lib/prisma";

export async function getUserOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true // Para traer el nombre y la imagen del instrumento [cite: 17-09-2025]
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Los más recientes primero
      }
    });
    return orders;
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return [];
  }
}
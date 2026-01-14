'use server';

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getUserDashboardData() {
  // 1. Obtenemos la sesión del servidor para identificar al usuario
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    throw new Error("No autorizado");
  }

  const userId = Number(session.user.id);

  try {
    // 2. Traemos al usuario con sus órdenes e INCLUIMOS los ítems y productos
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          include: {
            items: {         // Entramos a los detalles de la orden
              include: {
                product: true // Traemos el nombre, precio y categoría del instrumento
              }
            }
          },
          orderBy: {
            createdAt: 'desc' // Los pedidos más recientes aparecerán primero
          }
        }
      }
    });

    if (!user) return null;

    // 3. Retornamos el objeto completo para que la factura tenga datos que mapear
    return {
      nombre: user.nombre, 
      email: user.email,
      role: user.role,
      orders: user.orders,
      totalOrders: user.orders.length
    };

  } catch (error) {
    console.error("Error al cargar perfil con relaciones:", error);
    return null;
  }
}
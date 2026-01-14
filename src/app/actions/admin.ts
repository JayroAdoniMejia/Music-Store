'use server';
import prisma from "@/lib/prisma";

export async function getAdminStats() {
  try {
    // 1. Sumamos solo las órdenes con estado COMPLETED
    // Esto evita sumar carritos abandonados o intentos fallidos.
    const totalSales = await prisma.order.aggregate({
      where: {
        status: "COMPLETED"
      },
      _sum: { 
        total: true 
      }
    });

    // 2. Contamos solo órdenes reales completadas
    const ordersCount = await prisma.order.count({
      where: {
        status: "COMPLETED"
      }
    });
    
    // 3. Conteo total de productos en catálogo
    const productsCount = await prisma.product.count();

    // 4. Obtenemos los productos más vendidos [cite: 17-09-2017]
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ['productId'],
      _count: { productId: true },
      orderBy: { 
        _count: { 
          productId: 'desc' 
        } 
      },
      take: 3
    });

    // Opcional: Podrías traer los nombres de esos productos si los necesitas en el Dashboard
    
    return {
      // El total ya está en Lempiras desde el Webhook, se envía directo
      totalRevenue: totalSales._sum.total || 0,
      ordersCount,
      productsCount,
      topProducts: topProductsRaw
    };
  } catch (error) {
    console.error("❌ Error en getAdminStats:", error);
    return {
      totalRevenue: 0,
      ordersCount: 0,
      productsCount: 0,
      topProducts: []
    };
  }
}
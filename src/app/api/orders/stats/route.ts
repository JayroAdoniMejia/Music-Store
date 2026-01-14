import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Definimos el inicio del día de hoy (00:00:00)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 2. Ejecutamos las consultas en paralelo para mayor velocidad
    const [aggregate, count, todayStats] = await Promise.all([
      // Ingreso Total Histórico
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      // Conteo Total Histórico
      prisma.order.count(),
      // Estadísticas de Hoy
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startOfToday,
          },
        },
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      // Globales
      revenue: aggregate._sum.total || 0,
      count: count,
      // De Hoy
      todayRevenue: todayStats._sum.total || 0,
      todayOrders: todayStats._count.id || 0,
    });
  } catch (error) {
    console.error("Error en API Stats:", error);
    return NextResponse.json(
      { revenue: 0, count: 0, todayRevenue: 0, todayOrders: 0 },
      { status: 500 }
    );
  }
}
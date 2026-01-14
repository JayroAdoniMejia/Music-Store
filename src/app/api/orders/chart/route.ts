import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    // Agrupamos los datos para la gráfica [cite: 17-09-2017]
    const chartData = orders.reduce((acc: any, order) => {
      const month = new Date(order.createdAt).toLocaleString('es-HN', { month: 'short' });
      const existing = acc.find((item: any) => item.name === month);
      
      if (existing) {
        existing.ventas += order.total;
      } else {
        acc.push({ name: month, ventas: order.total });
      }
      return acc;
    }, []);

    return NextResponse.json(chartData);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const orderItems = await prisma.orderItem.findMany({
      include: { product: true }
    });

    // Agrupamos el dinero total por cada categoría
    const categoryMap = orderItems.reduce((acc: any, item) => {
      const cat = item.product.category;
      const totalItem = item.quantity * item.product.price;
      acc[cat] = (acc[cat] || 0) + totalItem;
      return acc;
    }, {});

    const data = Object.keys(categoryMap).map(cat => ({
      name: cat,
      value: categoryMap[cat]
    }));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
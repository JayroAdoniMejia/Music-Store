import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const mostSold = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 1,
  });

  if (mostSold.length === 0) return NextResponse.json(null);

  const product = await prisma.product.findUnique({
    where: { id: mostSold[0].productId },
  });

  return NextResponse.json({
    ...product,
    totalSold: mostSold[0]._sum.quantity
  });
}
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc', // Ordenados alfabéticamente para facilitar la gestión
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los productos" }, 
      { status: 500 }
    );
  }
}
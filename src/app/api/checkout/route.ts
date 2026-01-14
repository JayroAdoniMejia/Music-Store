import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Debes iniciar sesión" }, { status: 401 });
    }

    const { cartItems } = await req.json();

    // Validamos cada producto del carrito contra el stock real de PostgreSQL [cite: 17-09-2017]
    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.id }
      });

      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { message: `Stock insuficiente para: ${product?.name || 'Producto'}` }, 
          { status: 400 }
        );
      }
    }

    // Aquí iría la lógica para crear la Order y restar el stock (puedes usar Celery para esto) [cite: 17-09-2017]
    
    return NextResponse.json({ message: "Pedido procesado con éxito" });
  } catch (error) {
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
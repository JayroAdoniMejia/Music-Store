'use server';

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteProduct(id: number) {
  // 1. Verificación de seguridad profesional [cite: 17-09-2017]
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado para eliminar productos");
  }

  try {
    // 2. Eliminación en la base de datos (PostgreSQL/SQLite) [cite: 17-09-2017]
    await prisma.product.delete({
      where: { id: id },
    });

    // 3. Refrescar la caché de la página de stock para mostrar el cambio [cite: 17-09-2017]
    revalidatePath("/admin/stock");
    
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar:", error);
    return { success: false, error: "No se pudo eliminar el producto" };
  }
}
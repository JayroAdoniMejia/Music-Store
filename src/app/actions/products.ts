'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// --- ACCIÓN PARA ACTUALIZAR STOCK (RÁPIDO) ---
export async function updateProductStock(productId: number, newStock: number) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });
    revalidatePath('/');
    revalidatePath('/admin/stock');
    return { success: true };
  } catch (error) {
    console.error("Error actualizando stock:", error);
    return { success: false };
  }
}

// --- ACCIÓN PARA CREAR PRODUCTO ---
export async function createProduct(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const brand = formData.get('brand') as string;
    const category = formData.get('category') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const description = formData.get('description') as string || "";
    
    let searchName = formData.get('searchName') as string;
    if (!searchName || searchName.trim() === "") {
      searchName = `${name} ${brand}`.toLowerCase();
    } else {
      searchName = searchName.toLowerCase();
    }

    const file = formData.get('image') as File | null;

    if (!file || file.size === 0) {
      return { success: false, error: "La imagen es obligatoria" };
    }

    const uploadDir = join(process.cwd(), 'public/products');
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const path = join(uploadDir, filename);
    
    await writeFile(path, buffer);
    
    const imageUrl = `/products/${filename}`;

    const newProduct = await prisma.product.create({
      data: {
        name,
        brand,
        category,
        price,
        stock,
        description,
        searchName, 
        imageUrl: imageUrl, 
      },
    });

    revalidatePath('/');
    revalidatePath('/admin/stock');

    return { success: true, product: newProduct };
  } catch (error) {
    console.error("Error al crear el producto:", error);
    return { success: false, error: "Error interno al crear el instrumento" };
  }
}

// --- ACCIÓN PARA EDITAR PRODUCTO (NUEVA) ---
export async function updateProduct(id: number, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const brand = formData.get('brand') as string;
    const category = formData.get('category') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const description = formData.get('description') as string || "";
    
    let data: any = {
      name,
      brand,
      category,
      price,
      stock,
      description,
      searchName: `${name} ${brand}`.toLowerCase(),
    };

    // Lógica de Imagen: Solo actualizamos si se subió un archivo nuevo
    const file = formData.get('image') as File | null;
    if (file && file.size > 0) {
      const uploadDir = join(process.cwd(), 'public/products');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      await writeFile(join(uploadDir, filename), buffer);
      data.imageUrl = `/products/${filename}`;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: data,
    });

    revalidatePath('/');
    revalidatePath('/admin/stock');

    return { success: true, product: updatedProduct };
  } catch (error) {
    console.error("Error al editar el producto:", error);
    return { success: false, error: "Error al actualizar los datos del instrumento" };
  }
}

// --- ACCIÓN PARA ELIMINAR PRODUCTO ---
export async function deleteProduct(productId: number) {
  try {
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath('/');
    revalidatePath('/admin/stock');

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return { 
      success: false, 
      error: "No se puede eliminar: este producto tiene registros de ventas asociados." 
    };
  }
}
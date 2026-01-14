import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";

// Definimos la tasa de cambio para asegurar coherencia con el catálogo
const TASA_CAMBIO = 24.75;

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  // 1. Buscamos el producto específico usando el cliente centralizado [cite: 17-09-2025]
  const product = await prisma.product.findUnique({
    where: { id: Number(params.id) },
  });

  // Si el producto no existe en la base de datos, disparamos el error 404 de Next.js
  if (!product) {
    notFound();
  }

  // 2. Calculamos el precio convertido a Lempiras
  const precioLempiras = product.price * TASA_CAMBIO;

  return (
    <main className="max-w-6xl mx-auto p-8 min-h-screen">
      {/* Enlace de volver con estilos Rocker */}
      <Link href="/" className="text-secondary hover:text-primary mb-8 inline-block font-bold transition-colors duration-300">
        ← Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        {/* LADO IZQUIERDO: Imagen con fondo accent y bordes redondeados estilizados */}
        <div className="relative aspect-square bg-accent border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm group">
          <Image
            src={product.imageUrl || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
            priority 
          />
        </div>

        {/* LADO DERECHO: Detalles, Precio Localizado y Gestión de Inventario */}
        <div className="flex flex-col">
          <p className="text-sm text-primary font-black uppercase tracking-[0.3em]">
            {product.brand}
          </p>
          
          <h1 className="text-5xl font-black text-secondary mt-4 leading-tight">
            {product.name}
          </h1>
          
          <p className="text-4xl font-light text-secondary mt-6 tabular-nums">
            L {precioLempiras.toLocaleString('es-HN', { 
              minimumFractionDigits: 0,
              maximumFractionDigits: 0 
            })}
          </p>
          
          <div className="mt-10 border-t border-gray-100 pt-8">
            <h3 className="text-xl font-bold text-secondary uppercase tracking-wider">
              Descripción
            </h3>
            <p className="mt-4 text-gray-600 leading-relaxed text-lg italic">
              {product.description}
            </p>
          </div>

          <div className="mt-12">
            {/* El AddToCartButton recibe el objeto product completo para manejar LocalStorage [cite: 17-09-2025] */}
            <AddToCartButton product={product} />

            <div className="flex flex-col items-center gap-4 mt-6">
              {product.stock > 0 ? (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">
                    {product.stock <= 5 ? `¡Últimas ${product.stock} unidades!` : `${product.stock} unidades listas para envío en Honduras`}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-red-500 flex items-center gap-2 font-bold uppercase">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  Agotado temporalmente
                </p>
              )}
              
              <p className="text-xs text-gray-400 uppercase font-bold tracking-tighter">
                Garantía oficial incluida en cada compra
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
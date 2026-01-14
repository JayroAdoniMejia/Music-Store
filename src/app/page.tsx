import Link from 'next/link';
import Image from 'next/image'; 
import prisma from '@/lib/prisma';

const TASA_CAMBIO = 24.75;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  // Extraemos los parámetros de la URL [cite: 17-09-2025]
  const selectedCategory = searchParams.category;
  const searchTerm = searchParams.search;

  let whereClause: any = {};

  // Construcción de la consulta dinámica a PostgreSQL/SQLite [cite: 17-09-2025]
  if (selectedCategory || searchTerm) {
    const conditions = [];

    if (selectedCategory) {
      conditions.push({ category: selectedCategory });
    }

    if (searchTerm) {
      // Normalización para búsquedas sin acentos
      const termClean = searchTerm
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      conditions.push({
        OR: [
          { searchName: { contains: termClean } },
          { brand: { contains: termClean } },
          { name: { contains: termClean } },
        ],
      });
    }

    if (conditions.length > 0) {
      whereClause = { AND: conditions };
    }
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { id: 'desc' } // Los más nuevos primero
  });

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      {/* Encabezado Dinámico basado en la búsqueda */}
      <h1 className="text-4xl font-black mb-12 text-center uppercase tracking-tighter text-secondary">
        {searchTerm ? (
          <>Resultados para: <span className="text-primary">"{searchTerm}"</span></>
        ) : selectedCategory ? (
          <>Instrumentos: <span className="text-primary">{selectedCategory}</span></>
        ) : (
          "🎸 Catálogo Rockero"
        )}
      </h1>
      
      {/* Estado Vacío */}
      {products.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-300 max-w-2xl mx-auto shadow-sm">
          <p className="text-gray-500 text-lg font-bold">No encontramos instrumentos que coincidan.</p>
          <p className="text-sm text-gray-400 mt-2">
            Intenta con términos generales o verifica la categoría.
          </p>
          <Link href="/" className="text-primary font-black underline mt-6 inline-block hover:text-secondary transition uppercase italic text-xs"> 
            Ver todo el catálogo 
          </Link>
        </div>
      )}

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {products.map((product) => {
          const precioLempiras = product.price * TASA_CAMBIO;

          return (
            <div key={product.id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group">
              {/* Imagen con Link */}
              <Link href={`/product/${product.id}`} className="relative h-72 w-full overflow-hidden bg-accent">
                <Image 
                  src={product.imageUrl || '/placeholder.jpg'} 
                  alt={product.name} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={product.id <= 3}
                />
                <div className="absolute top-6 right-6 bg-secondary text-white px-4 py-2 rounded-2xl font-black text-sm shadow-xl">
                  L {precioLempiras.toLocaleString('es-HN', { maximumFractionDigits: 0 })}
                </div>
              </Link>

              <div className="p-8 flex flex-col flex-grow">
                <div className="mb-4 flex justify-between items-start gap-2">
                  <div>
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-1">{product.brand}</p>
                    <Link href={`/product/${product.id}`}>
                      <h2 className="text-2xl font-black text-secondary group-hover:text-primary transition-colors duration-300 leading-tight">
                        {product.name}
                      </h2>
                    </Link>
                  </div>
                  
                  {/* Badge de Stock Dinámico [cite: 17-09-2025] */}
                  <div className="shrink-0">
                    {product.stock <= 0 ? (
                      <span className="bg-red-50 text-red-500 text-[9px] font-black px-3 py-1.5 rounded-full uppercase border border-red-100">Agotado</span>
                    ) : product.stock <= 5 ? (
                      <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-3 py-1.5 rounded-full uppercase border border-orange-100 animate-pulse">Últimas {product.stock}</span>
                    ) : (
                      <span className="bg-green-50 text-green-600 text-[9px] font-black px-3 py-1.5 rounded-full uppercase border border-green-100">Disponible</span>
                    )}
                  </div>
                </div>

                <p className="text-gray-400 text-sm line-clamp-2 mb-8 italic font-medium leading-relaxed">
                  {product.description}
                </p>
                
                <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">Precio</span>
                    <span className="text-2xl font-black text-secondary">
                      L {precioLempiras.toLocaleString('es-HN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  
                  <Link href={`/product/${product.id}`}>
                    <button 
                      disabled={product.stock <= 0}
                      className={`px-8 py-4 rounded-2xl font-black transition-all duration-300 uppercase italic text-xs tracking-tighter shadow-lg ${
                        product.stock <= 0 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" 
                        : "bg-secondary text-white hover:bg-primary hover:-translate-y-1 active:scale-95 shadow-secondary/20"
                      }`}
                    >
                      {product.stock <= 0 ? "Sin Stock" : "Comprar"}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
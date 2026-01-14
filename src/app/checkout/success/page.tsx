'use client';

import Link from 'next/link';
import { CheckCircle2, Music, ArrowRight, ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';

export default function SuccessPage() {
  
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      {/* Icono de éxito con animación de pulso */}
      <div className="bg-green-50 p-6 rounded-full mb-8 animate-pulse">
        <CheckCircle2 size={80} className="text-green-500" strokeWidth={1.5} />
      </div>

      <h1 className="text-5xl font-black text-secondary uppercase italic tracking-tighter mb-4">
        ¡Orden <span className="text-primary">Confirmada</span>! 🤘
      </h1>
      
      <p className="text-gray-500 text-lg max-w-md mb-10 font-medium">
        Tu pedido ha sido procesado con éxito. Estamos preparando tus instrumentos para que la música no se detenga.
      </p>

      {/* Botones de acción post-compra [cite: 17-09-2025] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <Link 
          href="/profile" 
          className="flex items-center justify-center gap-2 bg-secondary text-white px-6 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg group"
        >
          <ShoppingBag size={20} />
          Ver mis pedidos
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 bg-accent text-secondary px-6 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all border border-gray-100"
        >
          <Music size={20} />
          Seguir comprando
        </Link>
      </div>

      <p className="mt-12 text-[10px] text-gray-400 uppercase font-black tracking-[0.3em]">
        Gracias por confiar en MusicStore Honduras
      </p>
    </main>
  );
}
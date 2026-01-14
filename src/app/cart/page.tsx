'use client';

import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
// 1. Importamos la acción de Stripe
import { createCheckoutSession } from '@/app/actions/stripe';
import { toast } from 'react-hot-toast';

const TASA_CAMBIO = 24.75;

export default function CartPage() {
  const { items, removeItem, clearCart, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalLempiras = items.reduce(
    (acc, item) => acc + (item.price * TASA_CAMBIO) * item.quantity, 
    0
  );

  // LÓGICA DE STRIPE ACTUALIZADA
  const handleCheckout = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      // 2. Llamamos a la pasarela de Stripe
      const result = await createCheckoutSession(items);
      
      if (result.url) {
        // Redirección externa a Stripe
        window.location.href = result.url;
      } else {
        toast.error("No se pudo generar la sesión de pago.");
      }
    } catch (error: any) {
      console.error(error);
      // Si falla por falta de sesión, NextAuth suele manejarlo, 
      // pero aquí capturamos el error manual:
      toast.error(error.message || "Error al conectar con Stripe.");
      
      if (error.message.includes("sesión")) {
        router.push('/login');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-accent p-6 rounded-full mb-6">
          <ShoppingCart size={64} className="text-gray-300" />
        </div>
        <h1 className="text-4xl font-black mb-4 text-secondary uppercase tracking-tighter">
          Tu carrito está vacío 🎸
        </h1>
        <p className="text-gray-500 mb-10 text-lg max-w-md">
          ¡No dejes que el escenario se quede en silencio! Añade algunos instrumentos a tu colección.
        </p>
        <Link href="/" className="bg-secondary text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary transition-all shadow-lg active:scale-95 uppercase tracking-widest">
          Volver a la tienda
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <Link href="/" className="p-2 hover:bg-accent rounded-full transition-colors text-secondary">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-4xl font-black text-secondary uppercase tracking-tighter italic">
          Tu Selección <span className="text-primary">Rockera</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Lista de Productos */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="relative h-28 w-28 flex-shrink-0 bg-accent rounded-2xl overflow-hidden border border-gray-50">
                <Image 
                  src={item.imageUrl || '/placeholder.jpg'} 
                  alt={item.name} 
                  fill 
                  className="object-contain p-3"
                />
              </div>
              
              <div className="flex-grow text-center sm:text-left">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{item.brand}</p>
                <h3 className="text-xl font-bold text-secondary leading-tight">{item.name}</h3>
                <p className="text-secondary/60 font-medium mt-1">
                  L {(item.price * TASA_CAMBIO).toLocaleString('es-HN', { maximumFractionDigits: 0 })} c/u
                </p>
              </div>

              <div className="flex items-center gap-4 bg-accent px-4 py-2 rounded-2xl border border-gray-100 font-bold text-secondary">
                <button 
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  disabled={isProcessing}
                  className="hover:text-primary transition-colors p-1 disabled:opacity-30"
                >
                  <Minus size={18} strokeWidth={3} />
                </button>
                <span className="w-6 text-center text-lg tabular-nums">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={isProcessing}
                  className="hover:text-primary transition-colors p-1 disabled:opacity-30"
                >
                  <Plus size={18} strokeWidth={3} />
                </button>
              </div>

              <button 
                onClick={() => removeItem(item.id)}
                disabled={isProcessing}
                className="text-gray-300 hover:text-red-500 p-2 transition-colors disabled:opacity-30"
                title="Eliminar producto"
              >
                <Trash2 size={22} />
              </button>
            </div>
          ))}
          
          <button 
            onClick={clearCart}
            disabled={isProcessing}
            className="group flex items-center gap-2 text-gray-400 text-xs hover:text-red-500 font-bold uppercase tracking-widest mt-4 ml-2 transition-colors disabled:opacity-30"
          >
            <Trash2 size={14} />
            Vaciar carrito completo
          </button>
        </div>

        {/* Resumen del Pedido */}
        <div className="bg-secondary text-white p-10 rounded-[2.5rem] shadow-2xl h-fit sticky top-24 border-4 border-white/5">
          <h2 className="text-2xl font-black mb-8 uppercase tracking-tight">Resumen</h2>
          
          <div className="space-y-6 text-gray-300 font-medium">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white tabular-nums">
                L {totalLempiras.toLocaleString('es-HN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Envío</span>
              <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest border border-primary/20">Gratis</span>
            </div>
            
            <div className="border-t border-white/10 pt-8 flex justify-between items-end">
              <span className="text-lg font-bold text-white uppercase tracking-tighter">Total</span>
              <div className="text-right">
                <p className="text-4xl font-black text-white tabular-nums leading-none tracking-tighter">
                  L {totalLempiras.toLocaleString('es-HN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-widest text-nowrap">Music Store Honduras</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={isProcessing}
            className={`w-full py-5 rounded-2xl font-black text-xl mt-10 transition-all uppercase italic shadow-xl flex items-center justify-center gap-3 ${
              isProcessing 
                ? "bg-gray-700 cursor-not-allowed text-gray-400" 
                : "bg-primary text-white hover:scale-[1.03] active:scale-95 shadow-primary/20"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" />
                Cargando...
              </>
            ) : (
              "Finalizar Compra 🤘"
            )}
          </button>
          
          <p className="mt-8 text-[9px] text-center text-gray-500 uppercase font-black tracking-[0.3em]">
            Pasarela Segura via Stripe
          </p>
        </div>
      </div>
    </main>
  );
}
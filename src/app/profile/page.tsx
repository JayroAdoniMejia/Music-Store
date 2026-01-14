'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { 
  User, Package, Settings, LogOut, ArrowLeft, 
  Music2, Loader2, Guitar, Drum, Piano, ShieldCheck, 
  FileText, Music, Speaker, Mic2, CheckCircle2 
} from 'lucide-react';
import { getUserDashboardData } from '@/app/actions/user';

export default function ProfilePage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const isSuccess = searchParams.get('success') === 'true';

  // --- CONTROL DE HIDRATACIÓN Y ÉXITO DE PAGO ---
  useEffect(() => {
    setMounted(true);
    if (isSuccess) {
      clearCart(); // Limpiamos el carrito local tras el pago exitoso
    }
  }, [isSuccess, clearCart]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getUserDashboardData();
        setUserData(data);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (!mounted) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  const isAdmin = userData?.role === "ADMIN" || (session?.user as any)?.role === "ADMIN";

  const getCategoryIcon = (category: string) => {
    const iconProps = { size: 24, className: "text-secondary" };
    const cat = category ? category.toLowerCase() : '';
    switch (true) {
      case cat.includes('teclado'): return <Piano {...iconProps} />;
      case cat.includes('percusión') || cat.includes('percusion'): return <Drum {...iconProps} />;
      case cat.includes('guitarra'): return <Guitar {...iconProps} />;
      case cat.includes('bajo'): return <Guitar {...iconProps} className="text-primary" />; 
      case cat.includes('viento'): return <Music {...iconProps} />;
      case cat.includes('cuerda'): return <Music2 {...iconProps} />;
      case cat.includes('audio'): return <Speaker {...iconProps} />;
      case cat.includes('accesorio'): return <Mic2 {...iconProps} />;
      default: return <Package {...iconProps} />;
    }
  };

  const handleDownloadInvoice = async (order: any) => {
    if (typeof window === 'undefined') return;
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      
      const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-HN') : new Date().toLocaleDateString('es-HN');

      // --- DISEÑO DE CABECERA ---
      doc.setFontSize(22);
      doc.setTextColor(20, 20, 20);
      doc.text('MUSIC STORE HONDURAS', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Cliente: ${userData?.nombre || session?.user?.name}`, 14, 30);
      doc.text(`Fecha: ${date} | Factura: #INV-${order.id.toString().padStart(4, '0')}`, 14, 35);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 45, 196, 45);

      // --- FILAS DE LA TABLA ---
      const tableRows = order.items.map((item: any) => {
        // Usamos item.price que es el valor histórico guardado en la DB
        const precioUnitario = item.price || 0;
        const nombreProducto = item.product?.name || "Instrumento Musical";
        
        return [
          nombreProducto,
          item.quantity,
          `L ${precioUnitario.toLocaleString()}`,
          `L ${(item.quantity * precioUnitario).toLocaleString()}`
        ];
      });

      autoTable(doc, {
        startY: 55,
        head: [['Instrumento', 'Cant.', 'Precio Unit.', 'Subtotal']],
        body: tableRows,
        headStyles: { fillColor: [20, 20, 20], fontStyle: 'bold' },
        foot: [[
          { content: 'TOTAL PAGADO', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: `L ${order.total.toLocaleString()}`, styles: { fontStyle: 'bold' } }
        ]],
        theme: 'striped'
      });

      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.setFontSize(8);
      doc.text('Gracias por confiar en Music Store Honduras. ¡Sigue rockeando!', 14, finalY + 10);

      doc.save(`Factura_MusicStore_${order.id}.pdf`);
    } catch (err) { 
      console.error("Error al generar PDF:", err); 
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-12 min-h-screen">
      
      {/* 1. MENSAJE DE ÉXITO */}
      {isSuccess && (
        <div className="mb-12 bg-green-50 border-2 border-green-500/20 rounded-[2.5rem] p-8 text-center animate-in zoom-in duration-500">
          <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
            <CheckCircle2 className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-secondary uppercase tracking-tighter mb-2">
            ¡Pago Recibido! 🤘
          </h1>
          <p className="text-green-700 font-medium mb-4">
            Tu equipo está siendo preparado. Revisa los detalles abajo.
          </p>
        </div>
      )}

      <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-primary mb-8 transition-colors font-black uppercase text-[10px] tracking-[0.2em]">
        <ArrowLeft size={16} />
        <span>Volver a la tienda</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Perfil */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm text-center">
            <div className="w-24 h-24 bg-secondary rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-white text-3xl font-black shadow-xl">
              {session?.user?.name?.charAt(0)}
            </div>
            <h2 className="text-xl font-black text-secondary uppercase italic">
              {userData?.nombre || session?.user?.name || "Cargando..."}
            </h2>
            <p className="text-gray-400 text-xs mb-4">{session?.user?.email}</p>
            <span className="inline-block bg-primary text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
              {isAdmin ? "Administrador" : "Miembro Backstage"}
            </span>
          </div>

          <nav className="bg-white border border-gray-100 p-3 rounded-[2rem] shadow-sm flex flex-col gap-1 font-black text-[11px] uppercase tracking-widest text-secondary">
            <button className="flex items-center gap-3 p-4 bg-accent rounded-2xl text-primary">
              <Package size={18} /> Mis Pedidos
            </button>
            {isAdmin && (
              <Link href="/admin/stock" className="flex items-center gap-3 p-4 hover:bg-accent rounded-2xl transition-colors">
                <ShieldCheck size={18} className="text-primary" /> Panel de Stock
              </Link>
            )}
            <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors mt-2">
              <LogOut size={18} /> Cerrar Sesión
            </button>
          </nav>
        </div>

        {/* Lado Derecho: Contenido */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-secondary text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <Music2 className="absolute -right-10 -bottom-10 text-white/5 w-48 h-48 rotate-12" />
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Mi Actividad</h3>
            <p className="text-gray-400 font-medium text-sm">
              {loading ? "Sincronizando..." : `Has completado ${userData?.orders?.length || 0} pedidos en Music Store.`}
            </p>
          </div>

          <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
            <h4 className="font-black text-secondary uppercase tracking-widest text-[10px] mb-8 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Historial de Pedidos
            </h4>
            
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
              ) : userData?.orders?.length > 0 ? (
                userData.orders.map((order: any) => (
                  <div key={order.id} className="p-6 bg-accent/30 rounded-[2rem] border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="bg-white w-14 h-14 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                          {getCategoryIcon(order.items?.[0]?.product?.category || "")}
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter mb-1">Orden #{order.id}</p>
                          {order.items?.map((item: any) => (
                            <p key={item.id} className="font-black text-secondary text-sm">
                              {item.quantity}x {item.product?.name}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="sm:text-right flex flex-row sm:flex-col justify-between items-end">
                        <p className="font-black text-secondary">
                          L {order.total.toLocaleString()}
                        </p>
                        <button 
                          onClick={() => handleDownloadInvoice(order)}
                          className="flex items-center gap-1 text-[9px] font-black text-primary hover:text-secondary uppercase tracking-tighter"
                        >
                          <FileText size={12} /> PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Music className="mx-auto text-gray-200 mb-4" size={48} />
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Aún no hay instrumentos en tu colección</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
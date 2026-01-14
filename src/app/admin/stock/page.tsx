'use client';

import { useState, useEffect } from 'react';
import { 
  Check, Save, Loader2, ArrowLeft, 
  TrendingUp, PieChart as PieIcon, 
  FileText, Plus, X, Upload, Trash2, Pencil, Calendar, Star 
} from 'lucide-react';
import Link from 'next/link';
import { updateProductStock, createProduct, deleteProduct, updateProduct } from '@/app/actions/products';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- GRÁFICA DE VENTAS MENSUALES ---
function SalesChart() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/orders/chart').then(res => res.json()).then(json => setData(json));
  }, []);

  return (
    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-[400px] w-full relative overflow-hidden">
      <div className="flex items-center gap-2 mb-8">
        <div className="bg-primary/10 p-2 rounded-lg text-primary"><TrendingUp size={20} /></div>
        <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Ingresos Mensuales</h3>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '900', fill: '#9ca3af'}} />
          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} tickFormatter={(v) => `L ${v.toLocaleString()}`} />
          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '20px', border: 'none' }} />
          <Bar dataKey="ventas" fill="#FF4B2B" radius={[10, 10, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- GRÁFICA DE CATEGORÍAS (MEJORADA) ---
function CategoryChart() {
  const [data, setData] = useState([]);
  const COLORS = ['#FF4B2B', '#1A1A1A', '#4A4A4A', '#888888', '#6366f1', '#f59e0b'];
  
  useEffect(() => {
    fetch('/api/orders/categories').then(res => res.json()).then(json => setData(json));
  }, []);

  return (
    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-[400px] w-full relative overflow-hidden">
      <div className="flex items-center gap-2 mb-8">
        <div className="bg-secondary/10 p-2 rounded-lg text-secondary"><PieIcon size={20} /></div>
        <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Ventas por Categoría</h3>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center h-[70%] gap-4">
        {/* Gráfico */}
        <div className="w-full sm:w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                {data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', fontWeight: 'bold' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Leyenda Detallada para entender mejor */}
        <div className="w-full sm:w-1/2 space-y-3 px-4">
          {data.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between border-b border-gray-50 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{item.name}</span>
              </div>
              <span className="text-xs font-black text-secondary italic">{item.value} <span className="text-[9px] text-gray-400 font-normal">uds</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- FILA DE STOCK ---
function StockRow({ product, onRefresh, onEdit }: { product: any, onRefresh: () => void, onEdit: (p: any) => void }) {
  const [stock, setStock] = useState(product.stock);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    const result = await updateProductStock(product.id, stock);
    setIsUpdating(false);
    if (result.success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${product.name}" del inventario?`)) return;
    setIsDeleting(true);
    const result = await deleteProduct(product.id);
    if (result.success) onRefresh();
    else { alert(result.error); setIsDeleting(false); }
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
      <td className="p-6">
        <p className="font-black text-secondary">{product.name}</p>
        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">ID: #{product.id} • {product.brand}</p>
      </td>
      <td className="p-6">
        <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase italic">{product.category}</span>
      </td>
      <td className="p-6 text-center">
        <input 
          type="number" value={stock}
          onChange={(e) => setStock(parseInt(e.target.value) || 0)}
          className="w-20 p-2 border-2 border-gray-100 rounded-xl font-black text-center focus:border-primary outline-none"
        />
      </td>
      <td className="p-6">
        <span className={`text-[10px] font-black uppercase italic ${stock <= 0 ? 'text-red-500' : stock <= 5 ? 'text-orange-500 animate-pulse' : 'text-green-500'}`}>
          {stock <= 0 ? 'Agotado' : stock <= 5 ? 'Crítico' : 'OK'}
        </span>
      </td>
      <td className="p-6 text-right">
        <div className="flex justify-end gap-2">
          <button onClick={handleSave} className={`p-3 rounded-2xl transition-all ${isSaved ? "bg-green-500 text-white" : "bg-secondary text-white hover:bg-primary shadow-lg shadow-secondary/20"}`}>
            {isUpdating ? <Loader2 className="animate-spin" size={20} /> : isSaved ? <Check size={20} /> : <Save size={20} />}
          </button>
          <button onClick={() => onEdit(product)} className="p-3 rounded-2xl bg-blue-50 text-blue-400 hover:bg-blue-500 hover:text-white transition-all border border-blue-100 shadow-sm">
            <Pencil size={20} />
          </button>
          <button onClick={handleDelete} disabled={isDeleting} className="p-3 rounded-2xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-100 disabled:opacity-50">
            {isDeleting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function StockAdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, orders: 0, todayRevenue: 0, todayOrders: 0 });
  const [mostSold, setMostSold] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes, mRes] = await Promise.all([
        fetch('/api/products'), 
        fetch('/api/orders/stats'),
        fetch('/api/orders/most-sold')
      ]);
      
      setProducts(await pRes.json());
      const sData = await sRes.json();
      const mData = await mRes.json();

      setStats({ 
        revenue: sData.revenue, 
        orders: sData.count,
        todayRevenue: sData.todayRevenue,
        todayOrders: sData.todayOrders
      });
      setMostSold(mData);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    setMounted(true);
    refreshData(); 
  }, []);

  const handleOpenModal = (product: any | null = null) => {
    setEditingProduct(product);
    setImagePreview(product ? product.imageUrl : null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = editingProduct ? await updateProduct(editingProduct.id, formData) : await createProduct(formData);
    setIsSubmitting(false);
    if (result.success) { setShowModal(false); refreshData(); } else { alert(result.error); }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("MUSICSTORE - REPORTE DE INVENTARIO", 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [['Producto', 'Marca', 'Categoría', 'Stock', 'Precio (USD)']],
      body: products.map(p => [p.name, p.brand, p.category, p.stock, `$${p.price}`]),
      headStyles: { fillColor: [26, 26, 26] }
    });
    doc.save(`Reporte_MusicStore_${new Date().toLocaleDateString()}.pdf`);
  };

  const displayProductsCount = mounted ? products.length : 0;
  const displayRevenue = mounted ? stats.revenue.toLocaleString() : "0";
  const displayTodayRevenue = mounted ? stats.todayRevenue.toLocaleString() : "0";
  const displayOrders = mounted ? stats.orders : 0;
  const displayTodayOrders = mounted ? stats.todayOrders : 0;

  return (
    <main className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-primary mb-8 font-black uppercase text-xs">
        <ArrowLeft size={18} /> Volver a la Tienda
      </Link>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-6xl font-black text-secondary uppercase italic tracking-tighter mb-4">
            Admin <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">Panel de control de Music Store</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => handleOpenModal()} className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl hover:bg-secondary transition-all font-black uppercase text-xs shadow-xl active:scale-95">
            <Plus size={20} /> Nuevo Instrumento
          </button>
          <button onClick={downloadPDF} className="flex items-center gap-3 bg-secondary text-white px-8 py-4 rounded-2xl hover:bg-primary transition-all font-black uppercase text-xs shadow-xl active:scale-95">
            <FileText size={20} /> Reporte PDF
          </button>
        </div>
      </header>

      {/* PRODUCTO MÁS VENDIDO */}
      {mostSold && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-gradient-to-r from-secondary to-black rounded-[3rem] p-8 shadow-2xl relative overflow-hidden border-2 border-primary/30 flex flex-col md:flex-row items-center gap-8">
            <Star className="absolute -right-4 -bottom-4 text-primary/10 rotate-12" size={180} />
            <div className="relative h-32 w-32 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 flex-shrink-0 overflow-hidden">
               <img src={mostSold.imageUrl} className="w-full h-full object-cover p-2" alt="Star Product" />
            </div>
            <div className="text-center md:text-left relative z-10">
              <span className="bg-primary text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.2em] italic mb-4 inline-block">Producto Estrella</span>
              <h2 className="text-4xl font-black text-white italic uppercase">{mostSold.name}</h2>
              <p className="text-white/60 font-bold uppercase text-xs mt-1">{mostSold.brand} • {mostSold.totalSold} Unidades vendidas</p>
            </div>
          </div>
        </div>
      )}

      {/* GRID DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-12">
        <div className="bg-primary/5 p-6 rounded-[2.5rem] border-2 border-primary/20 shadow-sm relative overflow-hidden group">
          <Calendar className="absolute -right-2 -bottom-2 text-primary/20 group-hover:scale-110 transition-transform" size={90} />
          <p className="text-[10px] font-black uppercase text-primary mb-2">Ventas de Hoy</p>
          <p className="text-3xl font-black text-secondary italic">{displayTodayOrders}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-1">L {displayTodayRevenue}</p>
        </div>

        <div className="bg-emerald-50 p-6 rounded-[2.5rem] border-2 border-emerald-100 shadow-sm relative overflow-hidden group">
          <TrendingUp className="absolute -right-2 -bottom-2 text-emerald-500/20 group-hover:scale-110 transition-transform" size={90} />
          <p className="text-[10px] font-black uppercase text-emerald-600/70 mb-2">Total Lempiras</p>
          <p className="text-2xl font-black text-emerald-900 italic">L {displayRevenue}</p>
        </div>

        <div className="bg-secondary p-6 rounded-[2.5rem] shadow-lg text-white relative overflow-hidden group">
          <FileText className="absolute -right-2 -bottom-2 text-white/10 group-hover:scale-110 transition-transform" size={90} />
          <p className="text-[10px] font-black uppercase text-white/50 mb-2">Órdenes Totales</p>
          <p className="text-3xl font-black">{displayOrders}</p>
        </div>

        <div className="bg-indigo-50 p-6 rounded-[2.5rem] border-2 border-indigo-100 shadow-sm relative overflow-hidden group">
          <Plus className="absolute -right-2 -bottom-2 text-indigo-500/20 group-hover:scale-110 transition-transform" size={90} />
          <p className="text-[10px] font-black uppercase text-indigo-600/70 mb-2">Modelos Activos</p>
          <p className="text-3xl font-black text-indigo-900">{displayProductsCount}</p>
        </div>

        <div className="bg-orange-50 p-6 rounded-[2.5rem] border-2 border-orange-100 text-orange-700 relative overflow-hidden group">
          <X className="absolute -right-2 -bottom-2 text-orange-500/20 group-hover:scale-110 transition-transform" size={90} />
          <p className="text-[10px] font-black uppercase mb-2">Stock Crítico</p>
          <p className="text-3xl font-black">{mounted ? products.filter(p => p.stock <= 5).length : 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <SalesChart />
        <CategoryChart />
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
            <tr>
              <th className="p-6">Producto / Marca</th>
              <th className="p-6">Categoría</th>
              <th className="p-6 text-center">Stock</th>
              <th className="p-6">Estado</th>
              <th className="p-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!mounted || loading ? (
              <tr><td colSpan={5} className="p-20 text-center animate-pulse font-black text-gray-300">SINCRONIZANDO BODEGA...</td></tr>
            ) : (
              products.map(p => <StockRow key={p.id} product={p} onRefresh={refreshData} onEdit={handleOpenModal} />)
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-secondary/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="font-black text-secondary uppercase text-lg italic">{editingProduct ? 'Editar Instrumento' : 'Registrar Instrumento'}</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase">SQLite Database</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white p-2 rounded-full shadow hover:text-primary transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nombre</label>
                    <input name="name" defaultValue={editingProduct?.name} required className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 focus:border-primary font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Marca</label>
                    <input name="brand" defaultValue={editingProduct?.brand} required className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 focus:border-primary font-bold" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Categoría</label>
                  <select name="category" defaultValue={editingProduct?.category} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 focus:border-primary font-bold">
                    <option value="Guitarras">🎸 Guitarras</option>
                    <option value="Percusión">🥁 Percusión</option>
                    <option value="Teclados">🎹 Teclados</option>
                    <option value="Bajos">🎸 Bajos</option>
                    <option value="Vientos">🎷 Vientos</option>
                    <option value="Cuerdas">🎻 Cuerdas</option>
                    <option value="Amplificadores">🔊 Amplificadores</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Precio (USD)</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 focus:border-primary font-bold" />
                  </div>
                  <div className="w-1/2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Stock</label>
                    <input name="stock" type="number" defaultValue={editingProduct?.stock} required className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 focus:border-primary font-bold" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Descripción</label>
                  <textarea name="description" defaultValue={editingProduct?.description} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 focus:border-primary font-bold min-h-[100px] resize-none"></textarea>
                </div>
              </div>
              <div className="flex flex-col space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Imagen del Producto</label>
                <div className="relative border-4 border-dashed border-gray-100 rounded-[2.5rem] flex-grow flex items-center justify-center bg-gray-50 hover:bg-gray-100 group overflow-hidden">
                  <input type="file" name="image" required={!editingProduct} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setImagePreview(URL.createObjectURL(file));
                  }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover p-2 rounded-[2.5rem]" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto text-gray-300 group-hover:text-primary mb-2" size={48} />
                      <p className="text-[10px] font-black text-gray-400 uppercase">Cambiar imagen</p>
                    </div>
                  )}
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full bg-secondary text-white p-6 rounded-[2rem] font-black uppercase text-xs hover:bg-primary transition-all shadow-2xl">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : editingProduct ? 'Guardar Cambios' : 'Registrar Instrumento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
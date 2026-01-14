'use client';

import { useState } from 'react';
import { Mail, Lock, User, Music, Loader2, Guitar, Disc } from 'lucide-react';
import { handleLogin, handleSignUp } from '@/app/actions/auth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = isLogin ? await handleLogin(formData) : await handleSignUp(formData);
    
    setLoading(false);

    if (result.success) {
      // Redirección basada en el rol del usuario [cite: 17-09-2025]
      window.location.href = result.user?.role === 'ADMIN' ? '/admin/stock' : '/';
    } else {
      setError(result.error || 'Error en el Backstage');
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-[#111111] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative">
        
        {/* CABECERA */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#7c3aed] p-3 rounded-2xl mb-4 shadow-lg shadow-purple-500/20">
            <Music size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            BACKSTAGE <span className="text-[#7c3aed] not-italic">ACCESS</span>
          </h1>
          <p className="text-gray-500 text-[12px] mt-2 font-medium text-center">
            {isLogin ? 'Conéctate a tu ritmo, Jayro.' : 'Crea tu cuenta de artista.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold p-3 rounded-xl mb-6 text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* CAMPO NOMBRE: Aparece solo en registro [cite: 17-09-2025] */}
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Nombre Artístico</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input name="name" type="text" required placeholder="Tu nombre" className="w-full bg-[#1a1a1a] border border-white/5 p-4 pl-12 rounded-xl focus:border-purple-500 outline-none transition-all font-bold text-sm" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input name="email" type="email" required placeholder="tu@email.com" className="w-full bg-[#1a1a1a] border border-white/5 p-4 pl-12 rounded-xl focus:border-purple-500 outline-none transition-all font-bold text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Clave</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input name="password" type="password" required placeholder="••••••••" className="w-full bg-[#1a1a1a] border border-white/5 p-4 pl-12 rounded-xl focus:border-purple-500 outline-none transition-all font-bold text-sm" />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-white text-black p-5 rounded-2xl font-black uppercase text-xs hover:bg-purple-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'ENCENDER EL SHOW' : 'CREAR MI CUENTA')}
          </button>
        </form>

        {/* --- ENLACE DE REGISTRO MOVIDO PARA MÁS VISIBILIDAD --- */}
        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[11px] font-black uppercase tracking-widest text-purple-400 hover:text-white transition-colors underline underline-offset-4"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya eres miembro? Inicia sesión'}
          </button>
        </div>

        {/* ICONOS SOCIALES ABAJO */}
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-center gap-6 text-gray-700">
          <Guitar size={18} />
          <Music size={18} />
          <Disc size={18} />
        </div>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Music2, Guitar, Mic2, Disc, User, Loader2, 
  Eye, EyeOff, Lock // Añadimos iconos para la contraseña
} from "lucide-react";
import { signIn } from "next-auth/react";
import { handleLogin, handleSignUp } from "@/app/actions/auth";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Estado para ver/ocultar
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await (isLogin ? handleLogin(formData) : handleSignUp(formData));

    if (result.success) {
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        const msg = "Error al iniciar sesión automática.";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      toast.success(isLogin ? "¡Bienvenido de nuevo!" : "¡Registro exitoso! Entrando...");
      
      const targetPath = result.user?.role === "ADMIN" ? "/admin/stock" : "/";
      router.push(targetPath);
      router.refresh();
    } else {
      const msg = result.error || "Ocurrió un error en el Backstage.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden py-12">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px] translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-[#161616] border border-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10">
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform -rotate-3">
              <Music2 className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight text-center italic uppercase">
              BACKSTAGE <span className="text-indigo-500 not-italic">ACCESS</span>
            </h2>
            <p className="text-gray-400 text-sm mt-2 font-medium">
              {isLogin ? "Conéctate a tu ritmo, Jayro." : "Únete a la banda ahora."}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-[10px] font-bold py-3 px-4 rounded-xl mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Disc className="animate-spin" size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">
                  Nombre de Artista
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    name="name"
                    type="text"
                    placeholder="Tu nombre artístico"
                    className="w-full bg-[#222] border border-white/5 rounded-xl py-3 px-4 pl-12 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">
                Email de Artista
              </label>
              <input
                name="email"
                type="email"
                placeholder="tu@email.com"
                className="w-full bg-[#222] border border-white/5 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">
                Clave Maestra
              </label>
              <div className="relative group">
                {/* Input de Contraseña */}
                <input
                  name="password"
                  type={showPassword ? "text" : "password"} // Cambio dinámico de tipo
                  placeholder="••••••••"
                  className="w-full bg-[#222] border border-white/5 rounded-xl py-3 px-4 pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  required
                />
                {/* Botón para Ver/Ocultar */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-400 transition-colors focus:outline-none"
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-indigo-500 hover:text-white transition-all duration-300 transform active:scale-95 shadow-xl flex items-center justify-center gap-2 uppercase text-sm tracking-widest"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {isLogin ? "Encender el Show" : "Crear Cuenta"}
                  <Mic2 size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setLoading(false);
                setShowPassword(false); // Resetear al cambiar de modo
              }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-white transition-colors"
            >
              {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya eres miembro? Entra"}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex justify-center gap-6">
             <Guitar size={20} className="text-gray-600" />
             <Music2 size={20} className="text-gray-600" />
             <Disc size={20} className="text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
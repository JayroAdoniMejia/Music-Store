'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingCart, User, Search, Music2, LogOut, Loader2, Menu, X } from 'lucide-react'; 
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession(); 
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // EFECTO: Si hay productos y el componente ya cargó, activamos el salto infinito
  const shouldBounce = mounted && totalItems > 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* LADO IZQUIERDO: Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-secondary hover:bg-accent rounded-xl transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <Link href="/" className="group flex items-center gap-2">
              <div className="bg-secondary p-2 rounded-lg group-hover:bg-primary transition-all shadow-md">
                <Music2 className="text-white" size={20} />
              </div>
              <span className="text-xl font-black text-secondary tracking-tighter uppercase italic hidden sm:block">
                Music<span className="text-primary">Store</span>
              </span>
            </Link>
          </div>

          {/* CENTRO: Búsqueda */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-grow max-w-md relative group mx-8">
            <input
              type="text"
              placeholder="¿Qué buscas?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-accent border border-transparent rounded-full py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all text-sm font-medium text-secondary"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary" size={16} />
          </form>

          {/* DERECHA: Carrito y Perfil */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* CARRITO: Salto infinito si tiene items, reposo si está vacío */}
            <Link 
              href="/cart" 
              className={`relative p-2.5 hover:bg-accent rounded-xl transition-all group
                ${shouldBounce ? 'animate-bounce' : ''}`}
            >
              <ShoppingCart 
                size={22} 
                className={`transition-colors ${shouldBounce ? 'text-primary' : 'text-secondary group-hover:text-primary'}`} 
              />
              
              {mounted && totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Perfil o Iniciar Sesión */}
            {!mounted ? (
              <Loader2 className="animate-spin text-gray-300" size={18} />
            ) : session ? (
              <div className="flex items-center gap-2">
                <Link href="/profile" className="flex items-center gap-2 bg-accent/50 p-1.5 pr-3 rounded-full hover:bg-accent transition-all group">
                  <div className="bg-white p-1.5 rounded-full shadow-sm text-secondary group-hover:text-primary">
                    <User size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-secondary hidden md:block">
                    {session.user?.name?.split(' ')[0]}
                  </span>
                </Link>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="bg-secondary text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-md">
                  Iniciar Sesión
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* --- MENÚ LATERAL MÓVIL --- */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        <div className={`absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 space-y-8">
            <div className="flex items-center justify-between">
              <span className="font-black text-secondary uppercase italic">Menú</span>
              <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
            </div>
            {/* Contenido del menú móvil... */}
          </div>
        </div>
      </div>
    </nav>
  );
}
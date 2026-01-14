'use client';

import { useCartStore } from '@/store/useCartStore';
import { useState } from 'react';

export default function AddToCartButton({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);

  const handlePress = () => {
    setIsAdding(true);
    addItem(product);
    
    // Feedback visual temporal
    setTimeout(() => setIsAdding(false), 1000);
  };

  // Verificamos si hay stock disponible [cite: 17-09-2025]
  const hasStock = product.stock > 0;

  return (
    <button 
      onClick={handlePress}
      disabled={!hasStock}
      className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg active:scale-95 ${
        !hasStock 
          ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" 
          : isAdding
            ? "bg-green-600 text-white"
            : "bg-primary text-white hover:bg-secondary shadow-red-100"
      }`}
    >
      {!hasStock ? "Sin existencias" : isAdding ? "¡Añadido! 🤘" : "Añadir al carrito"}
    </button>
  );
}
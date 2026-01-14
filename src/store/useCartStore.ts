import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Definimos la estructura incluyendo 'brand' [cite: 17-09-2025]
interface CartItem {
  id: number;
  name: string;
  brand: string; 
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void; // Añadida para resolver error 2339
  clearCart: () => void;
  getTotalItems: () => number;
}

// 2. Usamos 'persist' para que el carrito se guarde en el navegador [cite: 17-09-2025]
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => set((state) => {
        const existingItem = state.items.find((item) => item.id === product.id);
        
        if (existingItem) {
          return {
            items: state.items.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          };
        }
        
        // Al añadir, desestructuramos para asegurar que 'brand' se guarde
        return { 
          items: [...state.items, { 
            id: product.id, 
            name: product.name, 
            brand: product.brand, 
            price: product.price, 
            imageUrl: product.imageUrl, 
            quantity: 1 
          }] 
        };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),

      // 3. Implementación de updateQuantity para los botones + y -
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      })),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // Nombre de la llave en LocalStorage
    }
  )
);
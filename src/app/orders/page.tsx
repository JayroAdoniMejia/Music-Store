import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // Consultamos las órdenes del usuario logueado [cite: 17-09-2025]
  const orders = await prisma.order.findMany({
    where: { userId: Number(session.user.id) },
    include: {
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-12 min-h-screen">
      <h1 className="text-4xl font-black text-secondary uppercase italic mb-8">
        Mis <span className="text-primary">Conciertos</span> Pasados
      </h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">Aún no has adquirido ningún instrumento. ¡El escenario te espera!</p>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border-2 border-accent rounded-[2rem] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-accent pb-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Orden #{order.id}</p>
                  <p className="text-sm text-secondary font-medium">
                    {new Date(order.createdAt).toLocaleDateString('es-HN')}
                  </p>
                </div>
                <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-black uppercase">
                  {order.status}
                </span>
              </div>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-12 w-12 bg-accent rounded-lg overflow-hidden">
                      <Image 
                        src={item.product.imageUrl || '/placeholder.jpg'} 
                        alt={item.product.name} 
                        fill 
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold text-secondary text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} unidad(es)</p>
                    </div>
                    <p className="font-bold text-secondary">L {item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-accent flex justify-between items-center">
                <span className="font-black text-secondary uppercase tracking-tighter">Total Pagado</span>
                <span className="text-2xl font-black text-primary">L {order.total.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
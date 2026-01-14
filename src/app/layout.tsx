import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers"; 
// 1. Importamos el Toaster y la función toast
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Music Store",
  description: "Tu tienda de música online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {/* 2. Configuramos el Toaster con el estilo "Backstage" */}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#161616', // Fondo oscuro
                color: '#fff',         // Texto blanco
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              },
              success: {
                iconTheme: {
                  primary: '#6366f1', // Color índigo de tu marca
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Navbar />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
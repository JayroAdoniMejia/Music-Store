import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isProfilePage = req.nextUrl.pathname.startsWith("/profile");
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

    // 1. Control de Rol: Si intenta entrar a /admin y no es ADMIN, al Home
    if (isAdminPage && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. Control de Perfil: Si el usuario está logueado pero no tiene token (caso raro), 
    // el callback 'authorized' ya lo habrá enviado al login antes de llegar aquí.
  },
  {
    callbacks: {
      // Este callback es vital: si retorna 'false', NextAuth redirige automáticamente al login
      authorized: ({ token }) => !!token,
    },
  }
);

// El matcher define qué rutas requieren sesión obligatoria
export const config = { 
  matcher: [
    "/admin/:path*",   // Protege todo lo que empiece con /admin
    "/profile/:path*", // Protege el panel del usuario
    "/checkout/:path*" // Protege la pasarela de pago (opcional pero recomendado)
  ] 
};
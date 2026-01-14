import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Importamos la configuración centralizada [cite: 17-09-2017]

// El handler ahora es mucho más limpio porque la lógica reside en lib/auth.ts [cite: 17-09-2017]
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
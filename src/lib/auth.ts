import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt"; 

// 1. Extendemos los tipos para que TypeScript reconozca 'id' y 'role' en la sesión
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // Buscamos el usuario en la base de datos
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) return null;

        // --- COMPARACIÓN SEGURA CON BCRYPT ---
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (isPasswordValid) {
          return { 
            id: user.id.toString(), 
            // CAMBIO CLAVE: Mapeamos 'nombre' de la DB al campo 'name' de NextAuth
            name: user.nombre, 
            email: user.email,
            role: user.role 
          };
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        
        // --- RED DE SEGURIDAD PARA ACCESO ADMIN ---
        if (user.email === "admin@musicstore.hn" || user.email?.includes("jayro")) {
          token.role = "ADMIN";
        } else {
          token.role = user.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { 
    signIn: "/login" 
  },
  session: {
    strategy: "jwt", 
  }
};
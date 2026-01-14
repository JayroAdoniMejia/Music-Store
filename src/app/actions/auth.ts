'use server';

import prisma from "@/lib/prisma"; 
import bcrypt from "bcrypt"; 

export type AuthResponse = {
  success: boolean;
  user?: {
    name: string;
    role: string;
  };
  error?: string;
  message?: string;
};

export async function handleSignUp(formData: FormData): Promise<AuthResponse> {
    const nameValue = formData.get('name') as string; // Lo que viene del formulario
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { success: false, error: "Este email ya está en el Backstage." };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // AQUÍ EL CAMBIO CLAVE: Usamos 'nombre' porque la DB así lo pide
        const newUser = await prisma.user.create({
            data: {
                nombre: nameValue, // Cambiado de 'name' a 'nombre'
                email: email,
                password: hashedPassword,
                role: "USER" 
            }
        });

        return { 
          success: true, 
          user: { 
            name: newUser.nombre || "Artista", 
            role: newUser.role 
          },
          message: "¡Bienvenido a la banda!" 
        };

    } catch (e: any) {
        console.error("DETALLE DEL ERROR:", e);
        return { success: false, error: `Error DB: ${e.message || 'Fallo de conexión'}` };
    }
}

export async function handleLogin(formData: FormData): Promise<AuthResponse> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return { success: false, error: "Credenciales incorrectas" };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return { success: false, error: "Credenciales incorrectas" };
        }

        return { 
            success: true, 
            user: { 
                name: user.nombre || "Usuario", // Cambiado de 'name' a 'nombre'
                role: user.role 
            } 
        };

    } catch (e) {
        return { success: false, error: "Error de acceso" };
    }
}
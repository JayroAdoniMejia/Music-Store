/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rojo vibrante para botones de acción y destacados
        primary: "#dc2626", // red-600
        // Negro elegante para textos principales y fondos oscuros
        secondary: "#18181b", // zinc-900
        // Gris muy claro para fondos de secciones o tarjetas
        accent: "#f4f4f5", // zinc-100
      },
    },
  },
  plugins: [],
}
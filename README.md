# 🎸 Music Store & Admin Dashboard

Un sistema de E-commerce musical moderno desarrollado con **Next.js 15.1**, que incluye una tienda para clientes y un panel administrativo completo para la gestión de productos y análisis de ventas.

## Características principaless
- **Tienda Virtual:** Catálogo de instrumentos con carrito de compras funcional.
- **Pagos con Stripe:** Integración completa con Stripe Checkout para transacciones reales y seguras.
- **Dashboard Administrativo:**
  - Visualización de ingresos y ventas mediante gráficas interactivas (**Recharts**).
  - Gestión de inventario (CRUD de productos: crear, leer, actualizar, eliminar).
  - Reportes de ventas automáticos.
- **Seguridad:** Protección de rutas administrativas mediante middleware.
- **Base de Datos:** Gestión eficiente de datos con **Prisma ORM** y SQLite.

## 🛠️ Stack Tecnológico
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide React.
- **Backend:** Next.js API Routes, Prisma.
- **Pagos:** Stripe API.
- **Gráficas:** Recharts.

## 📦 Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto localmente:

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/JayroAdoniMejia/Music-Store.git](https://github.com/JayroAdoniMejia/Music-Store.git)
   cd Music-Store ```

## Instalar dependencias
```bash
npm install 
```

## Configurar variables de entorno 🔑
Crea un archivo .env en la raíz del proyecto basado en el archivo .env.example y añade tus credenciales:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Stripe Keys
STRIPE_SECRET_KEY=tu_sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_pk_test_...
STRIPE_WEBHOOK_SECRET=tu_whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

# Preparar la Base de Datos 🗄️

```bash
npx prisma migrate dev 
```

# Iniciar el servidor

```bash
npm run dev
```

📸 Vistas del Proyecto
🛒 Home: Catálogo completo de instrumentos musicales.

📊 Admin Dashboard: Visualización de métricas de ventas y gestión de stock.

💳 Stripe Checkout: Flujo de pago seguro e integrado con Webhooks.

Desarrollado por Jayro Mejia
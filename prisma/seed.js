const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function main() {
  console.log('🎸 Iniciando el sembrado de datos con inventario completo...')
  
  // Limpiamos la base de datos antes de sembrar para evitar duplicados [cite: 17-09-2025]
  await prisma.product.deleteMany()

  const productsData = [
    // --- ORIGINALES ---
    { 
      name: 'Guitarra Fender Stratocaster', 
      brand: 'Fender', 
      category: 'Guitarras', 
      price: 650.00, 
      stock: 15, 
      description: 'Clásica guitarra eléctrica de color rojo.',
      imageUrl: '/products/fender.jpg'
    },
    { 
      name: 'Batería Yamaha Stage Custom', 
      brand: 'Yamaha', 
      category: 'Percusión', 
      price: 1200.00, 
      stock: 5, 
      description: 'Set completo de batería de abedul.',
      imageUrl: '/products/yamaha.jpg'
    },
    { 
      name: 'Teclado Roland FP-30X', 
      brand: 'Roland', 
      category: 'Teclados', 
      price: 750.00, 
      stock: 8, 
      description: 'Piano digital con sonido premium.',
      imageUrl: '/products/roland.jpg'
    },
    // --- NUEVOS INSTRUMENTOS ---
    { 
      name: 'Bajo Ibanez SR300E', 
      brand: 'Ibanez', 
      category: 'Bajos', 
      price: 350.00, 
      stock: 4, 
      description: 'Bajo activo de 4 cuerdas versátil y ergonómico.',
      imageUrl: '/products/bajo-ibanez.jpg'
    },
    { 
      name: 'Saxofón Alto Yamaha YAS-280', 
      brand: 'Yamaha', 
      category: 'Vientos', 
      price: 1100.00, 
      stock: 2, 
      description: 'Saxofón ideal para estudiantes con afinación excelente.',
      imageUrl: '/products/saxo-yamaha.jpg'
    },
    { 
      name: 'Ukelele Tenor Kala KA-15T', 
      brand: 'Kala', 
      category: 'Cuerdas', 
      price: 120.00, 
      stock: 10, 
      description: 'Ukelele de caoba con tono cálido y brillante.',
      imageUrl: '/products/ukelele-kala.jpg'
    },
    { 
      name: 'Violín Stentor Student II', 
      brand: 'Stentor', 
      category: 'Cuerdas', 
      price: 250.00, 
      stock: 3, 
      description: 'Violín de madera sólida con acabado artesanal.',
      imageUrl: '/products/violin-stentor.jpg'
    },
    { 
      name: 'Amplificador Boss Katana-50 MkII', 
      brand: 'Boss', 
      category: 'Amplificadores', 
      price: 280.00, 
      stock: 6, 
      description: 'Amplificador de guitarra con efectos integrados.',
      imageUrl: '/products/amplificador-boss.jpg' // Nota: Si el archivo es .JPG en mayúsculas, cámbialo aquí a .JPG
    }
  ];

  for (const item of productsData) {
    await prisma.product.create({
      data: {
        ...item,
        // Normalización para que la búsqueda en Honduras sea robusta [cite: 17-09-2025]
        searchName: normalizeText(`${item.name} ${item.brand}`)
      }
    })
  }
}

main()
  .then(() => console.log('✅ Base de datos poblada con éxito con todos los instrumentos.'))
  .catch((e) => {
    console.error('❌ Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
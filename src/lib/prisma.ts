import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

// EL ERROR ESTABA AQUÍ: Debe ser 'prisma', no 'prismaS'
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
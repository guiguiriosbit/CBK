import { PrismaClient } from "@prisma/client"

// Versión simple: una sola instancia de Prisma
// Si en dev ves avisos de demasiadas conexiones, se puede volver a la variante con globalThis.
export const prisma = new PrismaClient({
  log: ["error"],
})

/**
 * Cliente Prisma para reemplazar Supabase.
 * Uso: import { prisma } from "@/lib/db/prisma"
 */

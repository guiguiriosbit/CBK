import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

// Endpoint de utilidad para verificar si un usuario existe y el formato de su contraseña
export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ 
        exists: false,
        message: "Usuario no encontrado" 
      })
    }

    const hasPassword = !!user.passwordHash
    const isBcryptHash = user.passwordHash 
      ? (user.passwordHash.startsWith("$2a$") || 
         user.passwordHash.startsWith("$2b$") || 
         user.passwordHash.startsWith("$2y$"))
      : false

    return NextResponse.json({
      exists: true,
      hasPassword,
      isBcryptHash,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      passwordInfo: {
        hashLength: user.passwordHash?.length || 0,
        hashPrefix: user.passwordHash?.substring(0, 10) || "N/A",
      },
    })
  } catch (error: any) {
    console.error("Error en check-user:", error)
    return NextResponse.json({ error: "Error al verificar usuario" }, { status: 500 })
  }
}

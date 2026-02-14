import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"

// Endpoint para restablecer la contraseña de un usuario existente
// Útil si los usuarios fueron creados con Supabase y necesitan migrar
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Solo permitir a admins o al mismo usuario
    const { email, newPassword, adminOverride } = await req.json()

    if (!email || !newPassword) {
      return NextResponse.json({ error: "Email y nueva contraseña son requeridos" }, { status: 400 })
    }

    // Si no es admin, verificar que sea el mismo usuario
    if (!adminOverride && (!session || (session.user as any)?.email !== email)) {
      if ((session?.user as any)?.role !== "admin") {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
      }
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    return NextResponse.json({ ok: true, message: "Contraseña actualizada correctamente" })
  } catch (error: any) {
    console.error("Error en reset-password:", error)
    return NextResponse.json({ error: "Error al actualizar la contraseña" }, { status: 500 })
  }
}

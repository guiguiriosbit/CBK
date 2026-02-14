import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

// Endpoint para asignar rol de admin a un usuario
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Permitir que cualquier usuario autenticado se haga admin (útil para el primer setup)
    // En producción, deberías restringir esto solo a usuarios admin existentes
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Actualizar el rol a admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    })

    return NextResponse.json({
      ok: true,
      message: `Usuario ${updatedUser.email} ahora es administrador`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    })
  } catch (error: any) {
    console.error("Error en set-admin:", error)
    return NextResponse.json({ error: "Error al asignar rol de admin" }, { status: 500 })
  }
}

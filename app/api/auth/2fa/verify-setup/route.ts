import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import { verifyTotpToken } from "@/lib/auth/totp"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token || typeof token !== "string" || token.length !== 6) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    if (!user.totpSecret) {
      return NextResponse.json(
        { error: "No hay secreto TOTP configurado. Genera uno primero." },
        { status: 400 }
      )
    }

    // Verificar código TOTP
    const isValid = verifyTotpToken(user.totpSecret, token)

    if (!isValid) {
      return NextResponse.json({ error: "Código inválido o expirado" }, { status: 400 })
    }

    // Activar 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpEnabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Autenticación de dos factores activada correctamente",
    })
  } catch (error) {
    console.error("[2FA Verify Setup] Error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

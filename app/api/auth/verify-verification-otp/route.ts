import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || typeof email !== "string" || !code || typeof code !== "string") {
      return NextResponse.json({ error: "Correo y código son requeridos" }, { status: 400 })
    }

    const now = new Date()

    const otp = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!otp) {
      return NextResponse.json({ error: "Código inválido o expirado" }, { status: 400 })
    }

    // Marcar código como usado
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    })

    // Marcar email como verificado para el usuario
    const user = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: now,
      },
    })

    return NextResponse.json({
      ok: true,
      message: "Correo verificado correctamente",
      userId: user.id,
    })
  } catch (error) {
    console.error("Error en verify-verification-otp:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}


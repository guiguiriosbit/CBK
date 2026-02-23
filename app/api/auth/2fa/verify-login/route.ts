import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyTotpToken } from "@/lib/auth/totp"

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json({ error: "Email y código son requeridos" }, { status: 400 })
    }

    const cleanToken = String(token).trim().replace(/\D/g, "")
    if (cleanToken.length !== 6) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    const emailNorm = email.toLowerCase().trim()
    const user = await prisma.user.findUnique({
      where: { email: emailNorm },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Usuarios con 2FA: aceptar código de la app (TOTP) o código enviado por correo
    if (user.totpEnabled && user.totpSecret) {
      const totpValid = verifyTotpToken(user.totpSecret, cleanToken)
      if (totpValid) {
        return NextResponse.json({
          success: true,
          message: "Código verificado correctamente",
        })
      }
    }

    // Código por correo: buscar en OtpCode (mismo flujo que verificación de email)
    const otp = await prisma.otpCode.findFirst({
      where: {
        email: emailNorm,
        code: cleanToken,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    if (otp) {
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: { used: true },
      })
      return NextResponse.json({
        success: true,
        message: "Código verificado correctamente",
      })
    }

    return NextResponse.json({ error: "Código inválido o expirado" }, { status: 400 })
  } catch (error) {
    console.error("[2FA Verify Login] Error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

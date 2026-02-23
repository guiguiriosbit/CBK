import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import { generateTotpSecret } from "@/lib/auth/totp"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Si ya tiene 2FA activado, no permitir crear otro secreto
    if (user.totpEnabled) {
      return NextResponse.json(
        { error: "Ya tienes autenticación de dos factores activada" },
        { status: 400 }
      )
    }

    // Generar nuevo secreto TOTP
    const { secret, otpauthUrl } = generateTotpSecret(user.email, "Adornos CBK")

    // Guardar secreto temporalmente (aún no activado)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpSecret: secret,
        totpEnabled: false, // Aún no está activado hasta que verifique el código
      },
    })

    return NextResponse.json({
      secret,
      otpauthUrl,
      message: "Secreto TOTP generado. Escanea el QR y verifica con un código.",
    })
  } catch (error) {
    console.error("[2FA Setup] Error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

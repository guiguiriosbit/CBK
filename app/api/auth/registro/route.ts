import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const { email, password, fullName, phone } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Correo y contraseña son obligatorios" }, { status: 400 })
    }

    // Normalizar email y contraseña (trim para que coincida con el login)
    const normalizedEmail = email.toLowerCase().trim()
    const passwordTrimmed = String(password).trim()

    if (passwordTrimmed.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con este correo" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(passwordTrimmed, 10)

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: fullName?.trim() || null,
        phone: phone?.trim() || null,
        role: "cliente",
      },
    })

    console.log(`[REGISTRO] Usuario creado: ${normalizedEmail}`)
    return NextResponse.json({ ok: true, role: user.role })
  } catch (e: any) {
    console.error("Error en registro:", e)
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Ya existe una cuenta con este correo" }, { status: 400 })
    }
    return NextResponse.json({ error: "Error al crear la cuenta" }, { status: 500 })
  }
}


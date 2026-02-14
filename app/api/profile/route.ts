import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined

  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
  })
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined

  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { name, phone } = await req.json()

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name ?? null,
      phone: phone ?? null,
    },
  })

  return NextResponse.json({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    phone: updated.phone,
  })
}


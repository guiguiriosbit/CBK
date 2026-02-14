import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

// GET - Listar todas las categorías
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error en GET /api/admin/categories:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nueva categoría
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, imageUrl } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error("Error en POST /api/admin/categories:", error)

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 400 })
    }

    return NextResponse.json({ error: "Error al crear la categoría" }, { status: 500 })
  }
}

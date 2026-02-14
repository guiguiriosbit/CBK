import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

// GET - Obtener una categoría por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error en GET /api/admin/categories/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PATCH - Actualizar una categoría
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, imageUrl } = body

    const updateData: Record<string, string | null> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(category)
  } catch (error: any) {
    console.error("Error en PATCH /api/admin/categories/[id]:", error)

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 400 })
    }

    return NextResponse.json({ error: "Error al actualizar la categoría" }, { status: 500 })
  }
}

// DELETE - Eliminar una categoría
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Categoría eliminada correctamente" })
  } catch (error: any) {
    console.error("Error en DELETE /api/admin/categories/[id]:", error)

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ error: "Error al eliminar la categoría" }, { status: 500 })
  }
}

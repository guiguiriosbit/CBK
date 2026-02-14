import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import { Decimal } from "@prisma/client/runtime/library"

// GET - Obtener un producto por ID
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
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const priceNum = Number(product.price)
    const discountNum = product.discountPercent ? Number(product.discountPercent) : null
    const finalPrice = discountNum ? priceNum * (1 - discountNum / 100) : priceNum

    return NextResponse.json({
      ...product,
      price: priceNum,
      discountPercent: discountNum,
      finalPrice: finalPrice,
    })
  } catch (error) {
    console.error("Error en GET /api/admin/products/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PATCH - Actualizar un producto
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
    const {
      name,
      description,
      price,
      discountPercent,
      stock,
      categoryId,
      imageUrl,
      isActive,
      featured,
      isNew,
    } = body

    const updateData: any = {}

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "El nombre no puede estar vacío" }, { status: 400 })
      }
      updateData.name = name.trim()
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }

    if (price !== undefined) {
      const priceNum = Number(price)
      if (isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json({ error: "El precio debe ser un número mayor o igual a 0" }, { status: 400 })
      }
      updateData.price = new Decimal(priceNum)
    }

    if (discountPercent !== undefined) {
      if (discountPercent === null) {
        updateData.discountPercent = null
      } else {
        const discount = Number(discountPercent)
        if (isNaN(discount) || discount < 0 || discount > 100) {
          return NextResponse.json(
            { error: "El porcentaje de descuento debe estar entre 0 y 100" },
            { status: 400 }
          )
        }
        updateData.discountPercent = new Decimal(discount)
      }
    }

    if (stock !== undefined) {
      const stockNum = Number(stock)
      if (isNaN(stockNum) || stockNum < 0) {
        return NextResponse.json({ error: "El stock debe ser un número mayor o igual a 0" }, { status: 400 })
      }
      updateData.stock = stockNum
    }

    if (categoryId !== undefined) {
      if (categoryId === null || categoryId === "") {
        updateData.category = { disconnect: true }
      } else {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        })
        if (!category) {
          return NextResponse.json({ error: "La categoría especificada no existe" }, { status: 400 })
        }
        updateData.category = { connect: { id: categoryId } }
      }
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl?.trim() || null
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive)
    }

    if (featured !== undefined) {
      updateData.featured = Boolean(featured)
    }

    if (isNew !== undefined) {
      updateData.isNew = Boolean(isNew)
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const priceNum = Number(product.price)
    const discountNum = product.discountPercent ? Number(product.discountPercent) : null
    const finalPrice = discountNum ? priceNum * (1 - discountNum / 100) : priceNum

    return NextResponse.json({
      ...product,
      price: priceNum,
      discountPercent: discountNum,
      finalPrice: finalPrice,
    })
  } catch (error: any) {
    console.error("Error en PATCH /api/admin/products/[id]:", error)

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ error: "Error al actualizar el producto" }, { status: 500 })
  }
}

// DELETE - Eliminar un producto
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
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Producto eliminado correctamente" })
  } catch (error: any) {
    console.error("Error en DELETE /api/admin/products/[id]:", error)

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ error: "Error al eliminar el producto" }, { status: 500 })
  }
}

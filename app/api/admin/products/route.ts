import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import { Decimal } from "@prisma/client/runtime/library"

// GET - Listar todos los productos
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Mapear productos para incluir información calculada
    const productsWithDiscount = products.map((product) => {
      const price = Number(product.price)
      const discountPercent = product.discountPercent ? Number(product.discountPercent) : null
      const finalPrice = discountPercent
        ? price * (1 - discountPercent / 100)
        : price

      return {
        ...product,
        price: price,
        discountPercent: discountPercent,
        finalPrice: finalPrice,
      }
    })

    return NextResponse.json(productsWithDiscount)
  } catch (error) {
    console.error("Error en GET /api/admin/products:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

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

    // Validaciones
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ error: "El precio es requerido y debe ser mayor o igual a 0" }, { status: 400 })
    }

    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
      return NextResponse.json({ error: "El stock es requerido y debe ser mayor o igual a 0" }, { status: 400 })
    }

    if (discountPercent !== null && discountPercent !== undefined) {
      const discount = Number(discountPercent)
      if (isNaN(discount) || discount < 0 || discount > 100) {
        return NextResponse.json(
          { error: "El porcentaje de descuento debe estar entre 0 y 100" },
          { status: 400 }
        )
      }
    }

    // Verificar que la categoría existe si se proporciona
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      })
      if (!category) {
        return NextResponse.json({ error: "La categoría especificada no existe" }, { status: 400 })
      }
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: new Decimal(price),
        discountPercent: discountPercent !== null && discountPercent !== undefined ? new Decimal(discountPercent) : null,
        stock: Number(stock),
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
        imageUrl: imageUrl?.trim() || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        featured: featured !== undefined ? Boolean(featured) : false,
        isNew: isNew !== undefined ? Boolean(isNew) : false,
      },
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

    return NextResponse.json(
      {
        ...product,
        price: priceNum,
        discountPercent: discountNum,
        finalPrice: finalPrice,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error en POST /api/admin/products:", error)
    const message =
      error?.message ||
      error?.meta?.cause ||
      "Error al crear el producto. Si acabas de agregar el campo 'Nuevo', ejecuta: npx prisma migrate dev --name add_is_new_to_product"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

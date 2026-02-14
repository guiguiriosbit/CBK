import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

async function requireUserId() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined
  if (!userId) {
    return null
  }
  return userId
}

export async function GET() {
  const userId = await requireUserId()
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const result = items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    product_id: item.productId,
    products: {
      id: item.product.id,
      name: item.product.name,
      price: Number(item.product.price),
      image_url: item.product.imageUrl ?? "",
      stock: item.product.stock,
    },
  }))

  return NextResponse.json({ items: result })
}

export async function POST(req: Request) {
  const userId = await requireUserId()
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { productId, quantity: qty } = await req.json()
  if (!productId) {
    return NextResponse.json({ error: "productId es obligatorio" }, { status: 400 })
  }

  const quantityToAdd = Math.max(1, Math.min(999, Number(qty) || 1))

  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId },
  })

  if (existing) {
    const newQuantity = existing.quantity + quantityToAdd
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQuantity },
      include: { product: true },
    })

    return NextResponse.json({
      id: updated.id,
      quantity: updated.quantity,
      product_id: updated.productId,
      products: {
        id: updated.product.id,
        name: updated.product.name,
        price: Number(updated.product.price),
        image_url: updated.product.imageUrl ?? "",
        stock: updated.product.stock,
      },
    })
  }

  const created = await prisma.cartItem.create({
    data: {
      userId,
      productId,
      quantity: quantityToAdd,
    },
    include: { product: true },
  })

  return NextResponse.json(
    {
      id: created.id,
      quantity: created.quantity,
      product_id: created.productId,
      products: {
        id: created.product.id,
        name: created.product.name,
        price: Number(created.product.price),
        image_url: created.product.imageUrl ?? "",
        stock: created.product.stock,
      },
    },
    { status: 201 }
  )
}

export async function PATCH(req: Request) {
  const userId = await requireUserId()
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { itemId, quantity } = await req.json()
  if (!itemId || typeof quantity !== "number") {
    return NextResponse.json({ error: "itemId y quantity son obligatorios" }, { status: 400 })
  }

  const updated = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: { product: true },
  })

  return NextResponse.json({
    id: updated.id,
    quantity: updated.quantity,
    product_id: updated.productId,
    products: {
      id: updated.product.id,
      name: updated.product.name,
      price: Number(updated.product.price),
      image_url: updated.product.imageUrl ?? "",
      stock: updated.product.stock,
    },
  })
}

export async function DELETE(req: Request) {
  const userId = await requireUserId()
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { itemId } = await req.json()
  if (!itemId) {
    return NextResponse.json({ error: "itemId es obligatorio" }, { status: 400 })
  }

  await prisma.cartItem.delete({
    where: { id: itemId },
  })

  return NextResponse.json({ ok: true })
}


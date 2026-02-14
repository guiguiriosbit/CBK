import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined

  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await req.json()
  const { orderId, paymentIntentId } = body || {}

  if (!orderId || !paymentIntentId) {
    return NextResponse.json(
      { error: "orderId y paymentIntentId son obligatorios" },
      { status: 400 },
    )
  }

  // Asegurarnos de que el pedido pertenece al usuario
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      orderItems: {
        include: { product: true },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
  }

  // Actualizar transacción asociada al paymentIntent
  await prisma.transaction.updateMany({
    where: {
      stripePaymentIntentId: paymentIntentId,
      userId,
    },
    data: {
      status: "succeeded",
    },
  })

  // Actualizar pedido a pagado
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "paid",
      status: "processing",
    },
  })

  // Actualizar stock de productos
  for (const item of order.orderItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    })
  }

  // Limpiar carrito del usuario
  await prisma.cartItem.deleteMany({
    where: { userId },
  })

  return NextResponse.json({ ok: true })
}


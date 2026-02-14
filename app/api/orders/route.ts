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
  const { shippingAddress, notes } = body || {}

  // Cargar items del carrito desde Prisma
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  })

  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json(
      { error: "Tu carrito está vacío" },
      { status: 400 },
    )
  }

  // Crear o reutilizar dirección de envío
  let shippingAddressId: string | undefined = shippingAddress?.id

  if (!shippingAddressId) {
    const {
      full_name,
      email,
      phone_country_code,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
    } = shippingAddress || {}

    if (!full_name || !email || !phone || !address_line1 || !city || !state || !postal_code || !country) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: nombre completo, email, celular y dirección" },
        { status: 400 },
      )
    }

    await prisma.shippingAddress.updateMany({
      where: { userId },
      data: { isDefault: false },
    })

    const createdAddress = await prisma.shippingAddress.create({
      data: {
        userId,
        fullName: full_name,
        email,
        phoneCountryCode: phone_country_code || "+52",
        phone,
        addressLine1: address_line1,
        addressLine2: address_line2 || null,
        city,
        state,
        postalCode: postal_code,
        country,
        isDefault: true,
      },
    })

    shippingAddressId = createdAddress.id
  }

  // Calcular total
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  )
  const shipping = subtotal > 1000 ? 0 : 150
  const total = subtotal + shipping

  // Crear pedido + items con Prisma
  const order = await prisma.order.create({
    data: {
      userId,
      shippingAddressId,
      totalAmount: total,
      status: "pending",
      paymentStatus: "pending",
      notes: notes || null,
      orderItems: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.price,
          subtotal: item.product.price * item.quantity,
        })),
      },
    },
  })

  return NextResponse.json({
    orderId: order.id,
    amount: Number(order.totalAmount),
    currency: "mxn",
  })
}


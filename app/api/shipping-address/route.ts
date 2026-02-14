import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined

  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const addresses = await prisma.shippingAddress.findMany({
    where: { userId },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  })

  return NextResponse.json({
    addresses: addresses.map((a) => ({
      id: a.id,
      full_name: a.fullName,
      email: a.email,
      phone_country_code: a.phoneCountryCode,
      phone: a.phone,
      address_line1: a.addressLine1,
      address_line2: a.addressLine2,
      city: a.city,
      state: a.state,
      postal_code: a.postalCode,
      country: a.country,
      is_default: a.isDefault,
    })),
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined

  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await req.json()
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
  } = body || {}

  if (!full_name || !email || !phone || !address_line1 || !city || !state || !postal_code || !country) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios: nombre completo, email, celular y dirección" },
      { status: 400 },
    )
  }

  const count = await prisma.shippingAddress.count({
    where: { userId },
  })

  const created = await prisma.shippingAddress.create({
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
      isDefault: count === 0,
    },
  })

  return NextResponse.json(
    {
      address: {
        id: created.id,
        full_name: created.fullName,
        email: created.email,
        phone_country_code: created.phoneCountryCode,
        phone: created.phone,
        address_line1,
        address_line2: address_line2 || "",
        city,
        state,
        postal_code,
        country,
        is_default: created.isDefault,
      },
    },
    { status: 201 },
  )
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined

  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { addressId } = await req.json()
  if (!addressId) {
    return NextResponse.json(
      { error: "addressId es obligatorio" },
      { status: 400 },
    )
  }

  await prisma.shippingAddress.deleteMany({
    where: {
      id: addressId,
      userId,
    },
  })

  return NextResponse.json({ ok: true })
}


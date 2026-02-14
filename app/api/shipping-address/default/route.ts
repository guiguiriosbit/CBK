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

  const address = await prisma.shippingAddress.findFirst({
    where: { userId, isDefault: true },
  })

  if (!address) {
    return NextResponse.json({ address: null })
  }

  return NextResponse.json({
    address: {
      id: address.id,
      full_name: address.fullName,
      email: address.email,
      phone_country_code: address.phoneCountryCode,
      phone: address.phone,
      address_line1: address.addressLine1,
      address_line2: address.addressLine2,
      city: address.city,
      state: address.state,
      postal_code: address.postalCode,
      country: address.country,
    },
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined

  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await req.json()

  // Si viene addressId, solo marcamos una existente como predeterminada
  if (body.addressId) {
    const addressId = body.addressId as string

    await prisma.shippingAddress.updateMany({
      where: { userId },
      data: { isDefault: false },
    })

    const updated = await prisma.shippingAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    })

    return NextResponse.json({
      address: {
        id: updated.id,
        full_name: updated.fullName,
        email: updated.email,
        phone_country_code: updated.phoneCountryCode,
        phone: updated.phone,
        address_line1: updated.addressLine1,
        address_line2: updated.addressLine2,
        city: updated.city,
        state: updated.state,
        postal_code: updated.postalCode,
        country: updated.country,
      },
    })
  }

  // Si no hay addressId, creamos una nueva dirección por defecto (usado por checkout)
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

  await prisma.shippingAddress.updateMany({
    where: { userId },
    data: { isDefault: false },
  })

  const newAddress = await prisma.shippingAddress.create({
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

  return NextResponse.json({
    address: {
      id: newAddress.id,
      full_name: newAddress.fullName,
      email: newAddress.email,
      phone_country_code: newAddress.phoneCountryCode,
      phone: newAddress.phone,
      address_line1,
      address_line2: address_line2 || "",
      city,
      state,
      postal_code,
      country,
    },
  })
}



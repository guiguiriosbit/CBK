// app/api/payments/create-intent/route.ts
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY no está configurada")
  return new Stripe(key, { apiVersion: "2025-12-15.clover" })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    const email = session?.user?.email ?? undefined

    if (!userId || !email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, currency = "mxn", description, metadata } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 })
    }

    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      description,
      receipt_email: email,
      metadata: {
        userId,
        userEmail: email,
        ...metadata,
      },
    })

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        orderId: metadata?.orderId || null,
        stripePaymentIntentId: paymentIntent.id,
        amount,
        currency,
        status: "pending",
        description,
        metadata: metadata || {},
      },
    })

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      clientSecret: paymentIntent.client_secret,
      amount,
      currency,
    })
  } catch (error: any) {
    console.error("Error creando intención de pago:", error)
    return NextResponse.json(
      { error: error.message || "Error procesando el pago" },
      { status: 500 },
    )
  }
}

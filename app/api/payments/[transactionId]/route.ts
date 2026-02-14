import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> },
) {
  try {
    const { transactionId } = await params
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transacción no encontrada" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      transaction,
    })
  } catch (error: any) {
    console.error("Error consultando transacción:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    )
  }
}

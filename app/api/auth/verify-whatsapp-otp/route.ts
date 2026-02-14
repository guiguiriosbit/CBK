import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { phone, code, email } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: "Teléfono y código OTP requeridos" }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar OTP en la base de datos
    const phoneClean = phone.replace(/\D/g, "") // Solo números

    const { data: otpData, error: otpError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", phoneClean)
      .eq("code", code)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpData) {
      return NextResponse.json({ error: "Código OTP inválido o expirado" }, { status: 401 })
    }

    // Eliminar el código usado
    await supabase.from("otp_codes").delete().eq("id", otpData.id)

    // Si hay email, intentar crear o actualizar usuario en Supabase
    // Nota: La autenticación completa se maneja en el frontend
    // Esta API solo verifica el código OTP

    return NextResponse.json({
      success: true,
      message: "Código OTP verificado correctamente",
      verified: true,
    })
  } catch (error: any) {
    console.error("Error en verify-whatsapp-otp:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

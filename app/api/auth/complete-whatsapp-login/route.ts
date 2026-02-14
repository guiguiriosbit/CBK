import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Completa el login por WhatsApp: verifica el OTP y devuelve un magic link
 * para crear la sesión de Supabase sin pedir email/password.
 */
export async function POST(request: NextRequest) {
  try {
    const { phone, code, email, fullName } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: "Teléfono y código OTP requeridos" }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json(
        { error: "Se requiere correo electrónico para iniciar sesión. Por favor ingresa tu email." },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Faltan variables de entorno de Supabase")
      return NextResponse.json({ error: "Configuración del servidor incompleta" }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // 1. Verificar OTP
    const phoneClean = phone.replace(/\D/g, "")
    const { data: otpData, error: otpError } = await supabaseAdmin
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
    await supabaseAdmin.from("otp_codes").delete().eq("id", otpData.id)

    // 2. Crear usuario si no existe y generar magic link para la sesión
    const baseUrl =
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000"
    const redirectTo = baseUrl.replace(/\/$/, "") + "/cliente/dashboard"

    const userMetadata: Record<string, string> = { phone: phone }
    if (fullName) userMetadata.full_name = fullName

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email.trim().toLowerCase(),
      options: {
        data: userMetadata,
        redirectTo: redirectTo,
      },
    })

    if (linkError) {
      // Si el usuario no existe, crearlo primero
      if (linkError.message?.includes("User not found") || linkError.message?.includes("not found")) {
        const { error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email.trim().toLowerCase(),
          email_confirm: true,
          user_metadata: userMetadata,
        })

        if (createError) {
          console.error("Error creando usuario:", createError)
          return NextResponse.json(
            { error: "No se pudo crear la cuenta. Verifica tu correo." },
            { status: 500 }
          )
        }

        // Reintentar generar el link
        const { data: retryData, error: retryError } = await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: email.trim().toLowerCase(),
          options: { redirectTo },
        })

        if (retryError) {
          console.error("Error generando link:", retryError)
          return NextResponse.json({ error: "Error al completar el inicio de sesión" }, { status: 500 })
        }

        const actionLink = retryData?.properties?.action_link
        if (!actionLink) {
          return NextResponse.json({ error: "Error al generar el enlace de acceso" }, { status: 500 })
        }

        return NextResponse.json({ success: true, redirectUrl: actionLink })
      }

      console.error("Error generateLink:", linkError)
      return NextResponse.json({ error: "Error al completar el inicio de sesión" }, { status: 500 })
    }

    const actionLink = linkData?.properties?.action_link
    if (!actionLink) {
      return NextResponse.json({ error: "Error al generar el enlace de acceso" }, { status: 500 })
    }

    return NextResponse.json({ success: true, redirectUrl: actionLink })
  } catch (error: unknown) {
    console.error("Error en complete-whatsapp-login:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}

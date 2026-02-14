import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Función para generar código OTP de 6 dígitos
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Función para enviar WhatsApp usando Twilio con plantilla de contenido
async function sendWhatsAppOTP(phone: string, otpCode: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM // Formato: whatsapp:+14155238886
  const contentSid = process.env.TWILIO_CONTENT_SID // ID de la plantilla de contenido

  if (!accountSid || !authToken || !whatsappFrom) {
    throw new Error("Configuración de Twilio incompleta. Verifica las variables de entorno.")
  }

  // Formatear número de teléfono (debe incluir código de país)
  // Ejemplo: +521234567890
  const formattedPhone = phone.startsWith("+") ? phone : `+${phone.replace(/\D/g, "")}`
  const whatsappTo = `whatsapp:${formattedPhone}`

  // Si hay ContentSid configurado, usar plantilla de contenido
  if (contentSid) {
    // Usar plantilla de contenido de Twilio
    // ContentVariables debe coincidir con los placeholders de la plantilla
    // Ejemplo: {"1": "123456"} donde "1" es el placeholder en la plantilla
    const contentVariables = JSON.stringify({
      "1": otpCode, // Código OTP
    })

    // Crear autenticación básica correctamente
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64")

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          To: whatsappTo,
          From: whatsappFrom,
          ContentSid: contentSid,
          ContentVariables: contentVariables,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = "Error desconocido"
      
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorText
        console.error("Error de Twilio:", errorJson)
        
        // Mensajes de error más específicos
        if (errorJson.code === 20003) {
          errorMessage = "Error de autenticación. Verifica que TWILIO_AUTH_TOKEN esté correcto en .env.local"
        } else if (errorJson.code === 21211) {
          errorMessage = "Número de teléfono inválido. Verifica el formato (debe incluir código de país)"
        } else if (errorJson.code === 21608) {
          errorMessage = "No estás unido al Sandbox de Twilio. Envía 'join [palabra-clave]' al número de Twilio"
        }
      } catch (e) {
        errorMessage = errorText
      }
      
      throw new Error(`Error al enviar WhatsApp: ${errorMessage}`)
    }

    const data = await response.json()
    console.log("WhatsApp enviado exitosamente con plantilla:", data.sid)
  } else {
    // Método alternativo: enviar mensaje simple sin plantilla
    const message = `🔐 Tu código de verificación Adornos CBK es: ${otpCode}\n\nEste código expira en 10 minutos.\n\nNo compartas este código con nadie.`

    // Crear autenticación básica correctamente
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64")

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          From: whatsappFrom,
          To: whatsappTo,
          Body: message,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = "Error desconocido"
      
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorText
        console.error("Error de Twilio:", errorJson)
        
        // Mensajes de error más específicos
        if (errorJson.code === 20003) {
          errorMessage = "Error de autenticación. Verifica que TWILIO_AUTH_TOKEN esté correcto en .env.local"
        } else if (errorJson.code === 21211) {
          errorMessage = "Número de teléfono inválido. Verifica el formato (debe incluir código de país)"
        } else if (errorJson.code === 21608) {
          errorMessage = "No estás unido al Sandbox de Twilio. Envía 'join [palabra-clave]' al número de Twilio"
        }
      } catch (e) {
        errorMessage = errorText
      }
      
      throw new Error(`Error al enviar WhatsApp: ${errorMessage}`)
    }

    const data = await response.json()
    console.log("WhatsApp enviado exitosamente:", data.sid)
  }
}

// Función alternativa usando WhatsApp Business API directamente (si no usas Twilio)
async function sendWhatsAppDirectAPI(phone: string, otpCode: string): Promise<void> {
  const apiUrl = process.env.WHATSAPP_API_URL // Ejemplo: https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!apiUrl || !accessToken || !phoneNumberId) {
    throw new Error("Configuración de WhatsApp Business API incompleta.")
  }

  const formattedPhone = phone.startsWith("+") ? phone : `+${phone.replace(/\D/g, "")}`

  const message = {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "text",
    text: {
      body: `🔐 Tu código de verificación Adornos CBK es: ${otpCode}\n\nEste código expira en 10 minutos.\n\nNo compartas este código con nadie.`,
    },
  }

  const response = await fetch(apiUrl.replace("{PHONE_NUMBER_ID}", phoneNumberId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(message),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("Error enviando WhatsApp:", error)
    throw new Error(`Error al enviar WhatsApp: ${error}`)
  }

  const data = await response.json()
  console.log("WhatsApp enviado exitosamente:", data)
}

export async function POST(request: NextRequest) {
  try {
    const { phone, email } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: "Número de teléfono requerido" }, { status: 400 })
    }

    // Generar código OTP
    const otpCode = generateOTP()

    // Guardar OTP en Supabase (usando la tabla auth.users o una tabla personalizada)
    const supabase = await createClient()

    // Opción 1: Usar Supabase Auth para almacenar OTP temporalmente
    // Opción 2: Crear una tabla personalizada para OTPs
    // Por ahora, usaremos Supabase Auth con signInWithOtp pero para teléfono
    
    // Nota: Supabase no tiene soporte nativo para OTP por teléfono en el plan gratuito
    // Por eso usamos nuestra propia implementación con Twilio/WhatsApp API

    // Intentar enviar por WhatsApp
    try {
      // Intentar con Twilio primero (más común)
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        await sendWhatsAppOTP(phone, otpCode)
      }
      // Si no está configurado Twilio, intentar con WhatsApp Business API
      else if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
        await sendWhatsAppDirectAPI(phone, otpCode)
      } else {
        return NextResponse.json(
          { error: "WhatsApp no está configurado. Configura Twilio o WhatsApp Business API." },
          { status: 500 }
        )
      }
    } catch (error: any) {
      console.error("Error enviando WhatsApp:", error)
      return NextResponse.json(
        { error: `Error al enviar WhatsApp: ${error.message}` },
        { status: 500 }
      )
    }

    // Guardar OTP en base de datos para verificación posterior
    // Usar una tabla temporal o Redis (por ahora usaremos una tabla en Supabase)
    const { error: dbError } = await supabase.from("otp_codes").insert({
      phone: phone.replace(/\D/g, ""), // Solo números
      email: email || null,
      code: otpCode,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutos
      created_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error("Error guardando OTP en BD:", dbError)
      
      // Si la tabla no existe, dar instrucciones claras
      if (dbError.code === "PGRST205" || dbError.message?.includes("Could not find the table")) {
        console.error("⚠️  La tabla 'otp_codes' no existe en Supabase.")
        console.error("📋 Ejecuta el script SQL: scripts/002-create-otp-table.sql en Supabase SQL Editor")
        // No fallar completamente, pero el código no se podrá verificar sin la tabla
        return NextResponse.json({
          success: true,
          message: "Código OTP enviado por WhatsApp",
          warning: "La tabla 'otp_codes' no existe. Ejecuta el script SQL en Supabase para poder verificar códigos.",
        })
      }
      
      // Para otros errores, continuar pero advertir
      console.warn("⚠️  El código se envió pero no se guardó en BD. La verificación puede fallar.")
    }

    return NextResponse.json({
      success: true,
      message: "Código OTP enviado por WhatsApp",
    })
  } catch (error: any) {
    console.error("Error en send-whatsapp-otp:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

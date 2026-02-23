import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { prisma } from "@/lib/db/prisma"

// Genera un código OTP de 6 dígitos
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Template HTML para el email de OTP
function getOTPEmailHTML(code: string, userName?: string | null): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificación - Adornos CBK</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); border-radius: 8px 8px 0 0;">
              <div style="display: inline-block; width: 64px; height: 64px; background-color: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="font-size: 32px; color: #ffffff;">❄️</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Adornos CBK</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 24px; font-weight: 600;">
                ${userName ? `Hola ${userName},` : "Hola,"}
              </h2>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Gracias por registrarte en Adornos CBK. Para completar tu registro y verificar tu correo electrónico, utiliza el siguiente código de verificación:
              </p>
              
              <!-- OTP Code Box -->
              <div style="background-color: #f9fafb; border: 2px dashed #dc2626; border-radius: 8px; padding: 24px; margin: 32px 0; text-align: center;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
                  Tu código de verificación
                </p>
                <div style="font-size: 36px; font-weight: 700; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${code}
                </div>
              </div>
              
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Este código es válido por <strong>10 minutos</strong>. Si no solicitaste este código, puedes ignorar este correo.
              </p>
              
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong>⚠️ Importante:</strong> No compartas este código con nadie. Adornos CBK nunca te pedirá tu código de verificación por teléfono o correo.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px;">
                Este es un correo automático, por favor no respondas.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Adornos CBK. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Correo electrónico requerido" }, { status: 400 })
    }

    // Verificar que el usuario exista
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "No existe una cuenta con este correo" }, { status: 404 })
    }

    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

    // Invalidar códigos previos no usados para este correo
    await prisma.otpCode.updateMany({
      where: {
        email,
        used: false,
      },
      data: {
        used: true,
      },
    })

    // Crear nuevo OTP
    await prisma.otpCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    })

    // Enviar email con Gmail (SMTP)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpFrom = process.env.SMTP_FROM || smtpUser

    if (!smtpUser || !smtpPass || !smtpFrom) {
      console.error("[OTP] SMTP_USER, SMTP_PASS o SMTP_FROM no están configurados en .env")
      console.log(`[OTP] Código de verificación para ${email}: ${code}`)
      return NextResponse.json({
        ok: true,
        message: "Código generado. Revisa la consola del servidor (SMTP no configurado).",
        warning: "SMTP no configurado",
      })
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: "🔐 Tu código de verificación - Adornos CBK",
        html: getOTPEmailHTML(code, user.name),
      })

      console.log(`[OTP] Email enviado exitosamente a ${email} usando Gmail SMTP`)
    } catch (smtpError) {
      console.error("[OTP] Error enviando email con Gmail SMTP:", smtpError)
      console.log(`[OTP] Código de verificación para ${email}: ${code}`)
      return NextResponse.json({
        ok: true,
        message: "Código generado. Revisa la consola del servidor (error al enviar email).",
        warning: "Error enviando email",
      })
    }

    return NextResponse.json({
      ok: true,
      message: "Código de verificación enviado. Revisa tu correo electrónico.",
    })
  } catch (error) {
    console.error("Error en send-verification-otp:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}


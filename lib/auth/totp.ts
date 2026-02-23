import { authenticator } from "otplib"

// Configurar TOTP con parámetros estándar
authenticator.options = {
  step: 30, // ventana de tiempo de 30 segundos
  window: 1, // tolerancia de ±1 paso (30s) para desfase de reloj
}

/**
 * Genera un secreto TOTP y la URL otpauth para mostrar en QR
 * @param email Email del usuario (para identificar en la app autenticadora)
 * @param serviceName Nombre del servicio (aparece en la app autenticadora)
 * @returns Objeto con secret (base32) y otpauthUrl (para QR)
 */
export function generateTotpSecret(
  email: string,
  serviceName: string = "Adornos CBK"
): { secret: string; otpauthUrl: string } {
  const secret = authenticator.generateSecret()
  const otpauthUrl = authenticator.keyuri(email, serviceName, secret)

  return {
    secret,
    otpauthUrl,
  }
}

/**
 * Verifica un código TOTP contra un secreto
 * @param secret Secreto TOTP en base32
 * @param token Código de 6 dígitos ingresado por el usuario
 * @returns true si el código es válido, false en caso contrario
 */
export function verifyTotpToken(secret: string, token: string): boolean {
  try {
    // Limpiar espacios y asegurar que sea string
    const cleanToken = String(token).trim().replace(/\s/g, "")
    
    if (!cleanToken || cleanToken.length !== 6) {
      return false
    }

    return authenticator.verify({ token: cleanToken, secret })
  } catch (error) {
    console.error("[TOTP] Error verificando token:", error)
    return false
  }
}

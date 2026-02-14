/**
 * Mensajes de error amigables para el usuario
 * NextAuth usa códigos genéricos por seguridad (evitar user enumeration)
 */

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin:
    "No encontramos una cuenta con ese correo o la contraseña es incorrecta. Si no tienes cuenta, regístrate primero.",
  OAuthAccountNotLinked:
    "Este correo ya está registrado con otro método. Intenta iniciar sesión de otra forma.",
  OAuthCallback:
    "Error al conectar con el proveedor. Intenta de nuevo.",
  OAuthCreateAccount:
    "No se pudo crear la cuenta. Intenta de nuevo.",
  CallbackRouteError:
    "Error al procesar la autenticación. Intenta de nuevo.",
  Default:
    "Ocurrió un error al iniciar sesión. Intenta de nuevo o regístrate si no tienes cuenta.",
}

export function getAuthErrorMessage(errorCode: string | undefined): string {
  if (!errorCode) return AUTH_ERROR_MESSAGES.Default
  return AUTH_ERROR_MESSAGES[errorCode] ?? AUTH_ERROR_MESSAGES.Default
}

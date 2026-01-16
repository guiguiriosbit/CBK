# Configuración de Email en Supabase

## Problema
Los códigos OTP no se están enviando por email. Esto generalmente se debe a que Supabase no tiene configurado un proveedor de email.

## Solución: Configurar Email en Supabase

### Opción 1: Usar el Email de Supabase (Gratis, limitado)

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Auth** → **Email Templates**
4. Verifica que las plantillas estén configuradas:
   - **Magic Link** (para OTP)
   - **Confirm signup** (para registro)
5. Ve a **Settings** → **Auth** → **SMTP Settings**
6. Por defecto, Supabase usa su propio servicio de email (limitado a 3 emails/hora en el plan gratuito)

### Opción 2: Configurar SMTP Personalizado (Recomendado para producción)

1. Ve a **Settings** → **Auth** → **SMTP Settings**
2. Habilita "Enable Custom SMTP"
3. Configura tu proveedor de email:

#### Para Gmail:
```
Host: smtp.gmail.com
Port: 587
Username: tu-email@gmail.com
Password: tu-contraseña-de-aplicación (no tu contraseña normal)
Sender email: tu-email@gmail.com
Sender name: Adornos CBK
```

**Nota:** Para Gmail necesitas crear una "Contraseña de aplicación":
- Ve a tu cuenta de Google → Seguridad
- Activa la verificación en 2 pasos
- Genera una "Contraseña de aplicación"
- Usa esa contraseña en Supabase

#### Para SendGrid:
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: tu-api-key-de-sendgrid
Sender email: tu-email-verificado@sendgrid.com
Sender name: Adornos CBK
```

#### Para Mailgun:
```
Host: smtp.mailgun.org
Port: 587
Username: postmaster@tu-dominio.mailgun.org
Password: tu-password-de-mailgun
Sender email: noreply@tu-dominio.com
Sender name: Adornos CBK
```

### Opción 3: Usar Resend (Recomendado - Fácil y gratuito)

1. Crea una cuenta en https://resend.com
2. Verifica tu dominio o usa el dominio de prueba
3. Obtén tu API key
4. En Supabase, configura SMTP con:
```
Host: smtp.resend.com
Port: 587
Username: resend
Password: tu-api-key-de-resend
Sender email: onboarding@resend.dev (o tu email verificado)
Sender name: Adornos CBK
```

## Verificar que Funciona

1. Después de configurar SMTP, prueba enviando un código OTP:
   - Ve a `/auth/login`
   - Selecciona la pestaña "Código OTP"
   - Ingresa tu email
   - Haz clic en "Enviar Código OTP"
   - Revisa tu correo (y spam)

2. Si no recibes el email:
   - Verifica la configuración SMTP
   - Revisa los logs en Supabase: **Logs** → **Auth Logs**
   - Verifica que el email no esté en spam
   - Asegúrate de que el email esté verificado en tu proveedor SMTP

## Configuración de Plantillas de Email

1. Ve a **Settings** → **Auth** → **Email Templates**
2. Personaliza las plantillas si lo deseas
3. Asegúrate de que incluyan:
   - El código OTP (para Magic Link)
   - El enlace de verificación (para Confirm signup)

## Notas Importantes

- **Plan Gratuito de Supabase:** Solo permite 3 emails por hora
- **Para producción:** Usa un proveedor SMTP personalizado
- **Spam:** Los emails pueden ir a spam, especialmente con el servicio gratuito de Supabase
- **Verificación de dominio:** Algunos proveedores requieren verificar tu dominio

## Solución Rápida para Desarrollo

Si solo necesitas probar en desarrollo:

1. Usa el servicio de email de Supabase (gratis, limitado)
2. O configura un servicio como Mailtrap para desarrollo: https://mailtrap.io
3. O usa Resend con su dominio de prueba

## Próximos Pasos

Una vez configurado el email:
1. Prueba el flujo completo de registro con OTP
2. Prueba el flujo de login con OTP
3. Verifica que los códigos lleguen correctamente
4. Configura WhatsApp cuando esté listo (requiere API de WhatsApp Business)


# 🚀 Guía Completa de Despliegue - Ubuntu + Virtualmin
## Sistema de E-commerce con Stripe y OTP (Email/WhatsApp)

---

## 📋 Índice

1. [Requisitos Previos](#1-requisitos-previos)
2. [Preparación del Servidor](#2-preparación-del-servidor)
3. [Configuración de Virtualmin](#3-configuración-de-virtualmin)
4. [Instalación de la Aplicación](#4-instalación-de-la-aplicación)
5. [Configuración de Variables de Entorno](#5-configuración-de-variables-de-entorno)
6. [Configuración de Stripe](#6-configuración-de-stripe)
7. [Configuración de OTP - Email](#7-configuración-de-otp---email)
8. [Configuración de OTP - WhatsApp](#8-configuración-de-otp---whatsapp)
9. [Configuración de Nginx](#9-configuración-de-nginx)
10. [Iniciar con PM2](#10-iniciar-con-pm2)
11. [Configurar SSL](#11-configurar-ssl)
12. [Verificación Final](#12-verificación-final)
13. [Solución de Problemas](#13-solución-de-problemas)

---

## 1. Requisitos Previos

### 1.1. Servidor Ubuntu
- Ubuntu 20.04 LTS o superior
- Mínimo 2GB RAM (recomendado 4GB+)
- Mínimo 20GB espacio en disco
- Acceso root o sudo

### 1.2. Virtualmin
- Virtualmin instalado y configurado
- Dominio configurado y apuntando al servidor
- Certificado SSL (o configurarlo después)

### 1.3. Cuentas Necesarias
- ✅ Cuenta de Supabase (https://supabase.com)
- ✅ Cuenta de Stripe (https://stripe.com)
- ✅ Cuenta de WhatsApp Business API (opcional, para WhatsApp OTP)
- ✅ Proveedor de email SMTP (Gmail, SendGrid, Resend, etc.)

---

## 2. Preparación del Servidor

### 2.1. Conectarse al Servidor

```bash
ssh usuario@tu-servidor.com
# O con clave SSH:
ssh -i ~/.ssh/tu_clave usuario@tu-servidor.com
```

### 2.2. Actualizar el Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3. Instalar Node.js 20.x

```bash
# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x.x
npm --version   # Debe mostrar 10.x.x
```

### 2.4. Instalar PM2 (Gestor de Procesos)

```bash
sudo npm install -g pm2
pm2 --version

# Configurar PM2 para iniciar al arrancar
pm2 startup
# Sigue las instrucciones que aparecen
```

### 2.5. Instalar Git (si no está instalado)

```bash
sudo apt install -y git
```

### 2.6. Verificar Nginx

```bash
nginx -v
# Si no está instalado:
sudo apt install -y nginx
```

---

## 3. Configuración de Virtualmin

### 3.1. Crear Dominio Virtual en Virtualmin

1. Accede a Virtualmin: `https://tu-servidor.com:10000`
2. Inicia sesión con tus credenciales
3. Ve a **Create Virtual Server**
4. Completa el formulario:
   - **Domain name**: `tu-dominio.com`
   - **Description**: Adornos CBK
   - **Password**: (genera una contraseña segura)
   - **Features**: Selecciona las que necesites
5. Haz clic en **Create Server**

### 3.2. Configurar Directorio del Dominio

El dominio se creará en: `/home/usuario/domains/tu-dominio.com/`

### 3.3. Configurar Permisos

```bash
# Asegúrate de tener permisos correctos
sudo chown -R usuario:usuario /home/usuario/domains/tu-dominio.com/
chmod -R 755 /home/usuario/domains/tu-dominio.com/
```

---

## 4. Instalación de la Aplicación

### 4.1. Subir Archivos al Servidor

**Opción A: Usando Git (Recomendado)**

```bash
cd /home/usuario/domains/tu-dominio.com/
git clone https://github.com/tu-usuario/crb.git public_html
cd public_html
```

**Opción B: Usando SCP**

```bash
# Desde tu máquina local:
cd /Users/juang/Downloads/crb
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    -czf crb-app.tar.gz .

# Subir al servidor:
scp crb-app.tar.gz usuario@tu-servidor.com:/home/usuario/domains/tu-dominio.com/

# En el servidor:
cd /home/usuario/domains/tu-dominio.com/
tar -xzf crb-app.tar.gz -C public_html
cd public_html
```

**Opción C: Usando FTP/SFTP**

- Usa FileZilla o similar
- Sube todos los archivos a `/home/usuario/domains/tu-dominio.com/public_html/`

### 4.2. Instalar Dependencias

```bash
cd /home/usuario/domains/tu-dominio.com/public_html
npm install --production
```

### 4.3. Construir la Aplicación

```bash
npm run build
```

Esto creará la carpeta `.next/` con la aplicación compilada.

---

## 5. Configuración de Variables de Entorno

### 5.1. Crear Archivo .env.local

```bash
cd /home/usuario/domains/tu-dominio.com/public_html
nano .env.local
```

### 5.2. Configurar Variables de Supabase

```env
# ============================================
# SUPABASE - Base de Datos
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
SUPABASE_SECRET_KEY=tu_secret_key_aqui
SUPABASE_JWT_SECRET=tu_jwt_secret_aqui

# URL de redirección después de autenticación
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://tu-dominio.com
```

**Obtener estas credenciales:**
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
   - **JWT Secret** → `SUPABASE_JWT_SECRET`

### 5.3. Configurar Variables de Stripe

```env
# ============================================
# STRIPE - Sistema de Pagos
# ============================================
STRIPE_SECRET_KEY=sk_live_tu_secret_key_produccion
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_tu_publishable_key_produccion
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_produccion
```

**Obtener estas credenciales:**
1. Ve a https://dashboard.stripe.com
2. Asegúrate de estar en modo **LIVE** (no Test)
3. Ve a **Developers** → **API keys**
4. Copia:
   - **Secret key** → `STRIPE_SECRET_KEY`
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Para el webhook:
   - Ve a **Developers** → **Webhooks**
   - Crea un endpoint: `https://tu-dominio.com/api/webhooks/stripe`
   - Selecciona eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copia el **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 5.4. Configurar Variables de Email (para OTP)

```env
# ============================================
# EMAIL - Para OTP (opcional, si usas SMTP personalizado)
# ============================================
# Estas variables son opcionales si configuras SMTP en Supabase
# Si usas el email de Supabase, no necesitas estas variables
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-contraseña-de-aplicación
SMTP_FROM=noreply@tu-dominio.com
```

### 5.5. Configurar Variables de WhatsApp (Opcional)

```env
# ============================================
# WHATSAPP - Para OTP (Opcional)
# ============================================
# Estas variables se usarán cuando implementes WhatsApp OTP
WHATSAPP_API_KEY=tu_api_key_de_whatsapp
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=tu_business_account_id
WHATSAPP_VERIFY_TOKEN=tu_verify_token_seguro
```

### 5.6. Variables Adicionales

```env
# ============================================
# APLICACIÓN
# ============================================
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### 5.7. Proteger el Archivo .env.local

```bash
chmod 600 .env.local
```

---

## 6. Configuración de Stripe

### 6.1. Obtener Claves de Producción

1. **Accede a Stripe Dashboard:**
   - Ve a https://dashboard.stripe.com
   - Asegúrate de estar en modo **LIVE** (cambia desde el toggle en la esquina superior derecha)

2. **Obtener API Keys:**
   - Ve a **Developers** → **API keys**
   - Copia tu **Secret key** (empieza con `sk_live_`)
   - Copia tu **Publishable key** (empieza con `pk_live_`)

3. **Configurar Webhook:**
   - Ve a **Developers** → **Webhooks**
   - Haz clic en **Add endpoint**
   - **Endpoint URL**: `https://tu-dominio.com/api/webhooks/stripe`
   - **Description**: Webhook para Adornos CBK
   - **Events to send**: Selecciona:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
   - Haz clic en **Add endpoint**
   - Copia el **Signing secret** (empieza con `whsec_`)

### 6.2. Verificar Configuración en la Aplicación

Los archivos ya están configurados para usar Stripe:
- `app/api/payments/create-intent/route.ts` - Crea payment intents
- `app/api/webhooks/stripe/route.ts` - Maneja webhooks
- `components/checkout/checkout-wrapper.tsx` - Integración frontend

### 6.3. Probar Stripe en Producción

**⚠️ IMPORTANTE:** En producción, usa tarjetas reales o las tarjetas de prueba de Stripe en modo LIVE.

Para probar en modo LIVE, Stripe tiene tarjetas de prueba especiales. Consulta: https://stripe.com/docs/testing

---

## 7. Configuración de OTP - Email

### 7.1. Opción A: Usar Email de Supabase (Gratis, Limitado)

**Limitaciones:**
- Solo 3 emails por hora en plan gratuito
- Puede ir a spam
- No personalizable

**Configuración:**
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Auth** → **Email Templates**
4. Verifica que las plantillas estén configuradas
5. El email funcionará automáticamente (sin configuración adicional)

### 7.2. Opción B: Configurar SMTP Personalizado (Recomendado)

#### 7.2.1. Usando Gmail

1. **Crear Contraseña de Aplicación:**
   - Ve a tu cuenta de Google → **Seguridad**
   - Activa la **Verificación en 2 pasos** (si no está activada)
   - Ve a **Contraseñas de aplicaciones**
   - Genera una nueva contraseña para "Correo"
   - Copia la contraseña generada

2. **Configurar en Supabase:**
   - Ve a **Settings** → **Auth** → **SMTP Settings**
   - Habilita **Enable Custom SMTP**
   - Completa:
     ```
     Host: smtp.gmail.com
     Port: 587
     Username: tu-email@gmail.com
     Password: tu-contraseña-de-aplicación
     Sender email: tu-email@gmail.com
     Sender name: Adornos CBK
     ```
   - Haz clic en **Save**

#### 7.2.2. Usando Resend (Recomendado - Fácil y Gratuito)

1. **Crear Cuenta en Resend:**
   - Ve a https://resend.com
   - Crea una cuenta gratuita
   - Verifica tu email

2. **Obtener API Key:**
   - Ve a **API Keys**
   - Crea una nueva API key
   - Copia la key (empieza con `re_`)

3. **Configurar en Supabase:**
   - Ve a **Settings** → **Auth** → **SMTP Settings**
   - Habilita **Enable Custom SMTP**
   - Completa:
     ```
     Host: smtp.resend.com
     Port: 587
     Username: resend
     Password: tu-api-key-de-resend
     Sender email: onboarding@resend.dev (o tu email verificado)
     Sender name: Adornos CBK
     ```
   - Haz clic en **Save**

#### 7.2.3. Usando SendGrid

1. **Crear Cuenta en SendGrid:**
   - Ve a https://sendgrid.com
   - Crea una cuenta (plan gratuito disponible)
   - Verifica tu email

2. **Obtener API Key:**
   - Ve a **Settings** → **API Keys**
   - Crea una nueva API key con permisos de "Mail Send"
   - Copia la key

3. **Configurar en Supabase:**
   - Ve a **Settings** → **Auth** → **SMTP Settings**
   - Habilita **Enable Custom SMTP**
   - Completa:
     ```
     Host: smtp.sendgrid.net
     Port: 587
     Username: apikey
     Password: tu-api-key-de-sendgrid
     Sender email: tu-email-verificado@sendgrid.com
     Sender name: Adornos CBK
     ```
   - Haz clic en **Save**

### 7.3. Personalizar Plantillas de Email

1. Ve a **Settings** → **Auth** → **Email Templates**
2. Edita las plantillas:
   - **Magic Link** (para OTP)
   - **Confirm signup** (para registro)
3. Asegúrate de incluir el código OTP o el enlace de verificación

### 7.4. Verificar que Funciona

1. Prueba enviando un código OTP desde la aplicación
2. Revisa tu correo (y spam)
3. Verifica los logs en Supabase: **Logs** → **Auth Logs**

---

## 8. Configuración de OTP - WhatsApp

### 8.1. Requisitos para WhatsApp OTP

- ✅ Cuenta de WhatsApp Business API
- ✅ Número de teléfono verificado
- ✅ API Key de WhatsApp Business

### 8.2. Opciones de Proveedores

#### Opción A: WhatsApp Business API (Oficial)

1. **Crear Cuenta:**
   - Ve a https://business.facebook.com
   - Crea una cuenta de negocio
   - Configura WhatsApp Business API

2. **Obtener Credenciales:**
   - **Phone Number ID**: ID de tu número de WhatsApp
   - **Business Account ID**: ID de tu cuenta de negocio
   - **Access Token**: Token de acceso permanente
   - **Verify Token**: Token personalizado para verificación

3. **Configurar Webhook:**
   - URL: `https://tu-dominio.com/api/webhooks/whatsapp`
   - Verify Token: El mismo que configuraste
   - Suscribirse a eventos: `messages`

#### Opción B: Twilio WhatsApp API

1. **Crear Cuenta en Twilio:**
   - Ve a https://www.twilio.com
   - Crea una cuenta
   - Solicita acceso a WhatsApp (puede tardar)

2. **Obtener Credenciales:**
   - **Account SID**
   - **Auth Token**
   - **WhatsApp Number**: Número de Twilio para WhatsApp

3. **Configurar:**
   - Usa la API de Twilio para enviar mensajes
   - Configura webhooks para recibir respuestas

#### Opción C: 360dialog (Recomendado para WhatsApp)

1. **Crear Cuenta:**
   - Ve a https://360dialog.com
   - Crea una cuenta
   - Conecta tu número de WhatsApp

2. **Obtener API Key:**
   - Ve a **API Keys**
   - Copia tu API key

3. **Configurar:**
   - Usa la API de 360dialog para enviar mensajes
   - Más fácil de configurar que la API oficial

### 8.3. Implementar Endpoint de WhatsApp OTP

**Nota:** Esta funcionalidad aún no está implementada en el código. Aquí está la estructura que necesitarías:

```typescript
// app/api/auth/send-whatsapp-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { phone } = await request.json();
  
  // Generar código OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Enviar por WhatsApp usando tu proveedor
  // Ejemplo con 360dialog:
  const response = await fetch('https://waba.360dialog.io/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: phone,
      type: 'text',
      text: {
        body: `Tu código OTP es: ${otpCode}. Válido por 10 minutos.`
      }
    })
  });
  
  // Guardar código en base de datos con expiración
  // ...
  
  return NextResponse.json({ success: true });
}
```

### 8.4. Configurar Variables de Entorno para WhatsApp

Agrega a tu `.env.local`:

```env
# WhatsApp Business API (360dialog)
WHATSAPP_API_KEY=tu_api_key_de_360dialog
WHATSAPP_PHONE_NUMBER=+521234567890

# O si usas Twilio:
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 8.5. Estado Actual

**⚠️ IMPORTANTE:** La funcionalidad de WhatsApp OTP está preparada en la UI pero **aún no está implementada** en el backend. Por ahora, solo funciona Email OTP.

**Para implementar WhatsApp OTP:**
1. Elige un proveedor (360dialog recomendado)
2. Crea la cuenta y obtén las credenciales
3. Implementa el endpoint `/api/auth/send-whatsapp-otp`
4. Actualiza `app/auth/login/page.tsx` y `app/auth/registro/page.tsx` para llamar al endpoint
5. Actualiza `app/auth/verificar-otp/page.tsx` para verificar códigos de WhatsApp

---

## 9. Configuración de Nginx

### 9.1. Crear Configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/tu-dominio.com
```

### 9.2. Configuración Completa

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirigir HTTP a HTTPS (después de configurar SSL)
    # return 301 https://$server_name$request_uri;

    # Por ahora, proxy a la aplicación
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Configuración para WebSockets (si es necesario)
    location /_next/webpack-hmr {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Configuración HTTPS (después de configurar SSL)
# server {
#     listen 443 ssl http2;
#     server_name tu-dominio.com www.tu-dominio.com;
#
#     ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
#
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
# }
```

### 9.3. Habilitar el Sitio

```bash
sudo ln -s /etc/nginx/sites-available/tu-dominio.com /etc/nginx/sites-enabled/
sudo nginx -t  # Verificar configuración
sudo systemctl reload nginx
```

### 9.4. Si Usas Virtualmin

Virtualmin puede crear la configuración automáticamente. Asegúrate de:
1. Configurar el dominio en Virtualmin
2. Configurar el proxy a `localhost:3000` desde el panel de Virtualmin
3. O edita manualmente la configuración que Virtualmin crea

---

## 10. Iniciar con PM2

### 10.1. Actualizar ecosystem.config.js

```bash
cd /home/usuario/domains/tu-dominio.com/public_html
nano ecosystem.config.js
```

Configuración recomendada:

```javascript
module.exports = {
  apps: [{
    name: 'adornos-cbk',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    cwd: '/home/usuario/domains/tu-dominio.com/public_html',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/usuario/domains/tu-dominio.com/logs/pm2-error.log',
    out_file: '/home/usuario/domains/tu-dominio.com/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    // Variables de entorno
    env_file: '.env.local'
  }]
};
```

### 10.2. Crear Directorio de Logs

```bash
mkdir -p /home/usuario/domains/tu-dominio.com/logs
chmod 755 /home/usuario/domains/tu-dominio.com/logs
```

### 10.3. Iniciar la Aplicación

```bash
cd /home/usuario/domains/tu-dominio.com/public_html
pm2 start ecosystem.config.js
pm2 save  # Guardar configuración para que persista después de reiniciar
```

### 10.4. Comandos Útiles de PM2

```bash
pm2 status              # Ver estado de la aplicación
pm2 logs adornos-cbk    # Ver logs en tiempo real
pm2 restart adornos-cbk # Reiniciar aplicación
pm2 stop adornos-cbk    # Detener aplicación
pm2 monit               # Monitor en tiempo real
```

---

## 11. Configurar SSL

### 11.1. Opción A: Usando Let's Encrypt (Gratis)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Seguir las instrucciones
# Certbot configurará automáticamente Nginx
```

### 11.2. Opción B: Usando Virtualmin

1. Ve al panel de Virtualmin
2. Selecciona tu dominio
3. Ve a **SSL Certificates**
4. Haz clic en **Let's Encrypt**
5. Sigue las instrucciones

### 11.3. Renovación Automática

Let's Encrypt expira cada 90 días. Certbot configura la renovación automática, pero puedes verificar:

```bash
sudo certbot renew --dry-run
```

---

## 12. Verificación Final

### 12.1. Verificar que la Aplicación Está Corriendo

```bash
pm2 status
curl http://localhost:3000
```

### 12.2. Verificar que Nginx Está Funcionando

```bash
sudo systemctl status nginx
curl http://tu-dominio.com
```

### 12.3. Verificar Stripe

1. Abre https://tu-dominio.com
2. Agrega productos al carrito
3. Ve a checkout
4. Prueba con una tarjeta de prueba de Stripe (modo LIVE)
5. Verifica en Stripe Dashboard que el pago aparece

### 12.4. Verificar OTP por Email

1. Ve a https://tu-dominio.com/auth/login
2. Selecciona la pestaña "Código OTP"
3. Selecciona "Email"
4. Ingresa tu correo
5. Haz clic en "Enviar Código OTP"
6. Revisa tu correo (y spam)
7. Ingresa el código en `/auth/verificar-otp`
8. Verifica que inicias sesión correctamente

### 12.5. Verificar Registro

1. Ve a https://tu-dominio.com/auth/registro
2. Completa el formulario
3. Prueba tanto con contraseña como con OTP
4. Verifica que recibes el email de verificación

---

## 13. Solución de Problemas

### 13.1. La Aplicación No Inicia

```bash
# Ver logs de PM2
pm2 logs adornos-cbk --lines 50

# Verificar que el puerto 3000 esté libre
sudo netstat -tulpn | grep 3000

# Verificar variables de entorno
cd /home/usuario/domains/tu-dominio.com/public_html
cat .env.local
```

### 13.2. Error 502 Bad Gateway

- Verifica que la aplicación esté corriendo: `pm2 status`
- Verifica que Nginx esté configurado correctamente
- Revisa los logs de Nginx: `sudo tail -f /var/log/nginx/error.log`

### 13.3. Los Emails No Llegan

1. **Verifica configuración SMTP en Supabase:**
   - Ve a Settings → Auth → SMTP Settings
   - Verifica que esté habilitado y configurado correctamente

2. **Revisa logs de Supabase:**
   - Ve a Logs → Auth Logs
   - Busca errores relacionados con email

3. **Verifica spam:**
   - Revisa la carpeta de spam
   - Agrega el remitente a contactos

4. **Prueba con otro proveedor:**
   - Si Gmail no funciona, prueba Resend o SendGrid

### 13.4. Los Pagos de Stripe No Funcionan

1. **Verifica claves de Stripe:**
   - Asegúrate de usar claves LIVE (no test)
   - Verifica que las claves estén correctas en `.env.local`

2. **Verifica webhook:**
   - Ve a Stripe Dashboard → Webhooks
   - Verifica que el endpoint esté activo
   - Revisa los logs del webhook

3. **Verifica logs de la aplicación:**
   ```bash
   pm2 logs adornos-cbk --lines 100
   ```

### 13.5. WhatsApp OTP No Funciona

**Estado actual:** WhatsApp OTP aún no está implementado. Solo funciona Email OTP.

Para implementar:
1. Elige un proveedor (360dialog recomendado)
2. Implementa el endpoint de envío
3. Actualiza el código frontend
4. Prueba el flujo completo

### 13.6. Problemas de Permisos

```bash
# Asegurar permisos correctos
sudo chown -R usuario:usuario /home/usuario/domains/tu-dominio.com/
chmod -R 755 /home/usuario/domains/tu-dominio.com/
chmod 600 /home/usuario/domains/tu-dominio.com/public_html/.env.local
```

### 13.7. La Aplicación se Reinicia Constantemente

```bash
# Verificar uso de memoria
pm2 monit

# Ajustar límite de memoria en ecosystem.config.js
max_memory_restart: '2G'  # Aumentar si es necesario
```

---

## 14. Mantenimiento

### 14.1. Actualizar la Aplicación

```bash
cd /home/usuario/domains/tu-dominio.com/public_html

# Si usas Git:
git pull origin main

# O subir nueva versión manualmente

# Reinstalar dependencias si es necesario
npm install --production

# Reconstruir
npm run build

# Reiniciar
pm2 restart adornos-cbk
```

### 14.2. Backup

```bash
# Backup de la base de datos (Supabase)
# Configura backups automáticos en Supabase Dashboard

# Backup de archivos
tar -czf backup-$(date +%Y%m%d).tar.gz \
    /home/usuario/domains/tu-dominio.com/public_html \
    --exclude='node_modules' \
    --exclude='.next'
```

### 14.3. Monitoreo

```bash
# Ver logs en tiempo real
pm2 logs adornos-cbk

# Ver uso de recursos
pm2 monit

# Ver estado
pm2 status
```

---

## 15. Checklist Final

Antes de considerar el despliegue completo, verifica:

- [ ] Node.js 20.x instalado
- [ ] PM2 instalado y configurado
- [ ] Aplicación construida (`npm run build`)
- [ ] Variables de entorno configuradas (`.env.local`)
- [ ] Supabase configurado y conectado
- [ ] Stripe configurado (claves LIVE)
- [ ] Webhook de Stripe configurado
- [ ] SMTP configurado en Supabase (para emails)
- [ ] Nginx configurado y funcionando
- [ ] SSL configurado (HTTPS)
- [ ] Aplicación corriendo con PM2
- [ ] Dominio apuntando correctamente
- [ ] Pruebas de pago exitosas
- [ ] Pruebas de OTP por email exitosas
- [ ] Logs funcionando correctamente

---

## 16. Recursos Adicionales

- **Documentación de Next.js:** https://nextjs.org/docs
- **Documentación de Supabase:** https://supabase.com/docs
- **Documentación de Stripe:** https://stripe.com/docs
- **Documentación de PM2:** https://pm2.keymetrics.io/docs
- **Documentación de Nginx:** https://nginx.org/en/docs/

---

## 17. Soporte

Si encuentras problemas:

1. Revisa los logs: `pm2 logs adornos-cbk`
2. Revisa logs de Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Verifica configuración de Supabase
4. Verifica configuración de Stripe
5. Consulta la documentación de cada servicio

---

**¡Despliegue completado! 🎉**

Tu aplicación debería estar funcionando en `https://tu-dominio.com`


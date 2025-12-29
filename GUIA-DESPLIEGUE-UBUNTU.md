# Guía de Despliegue en Ubuntu con Virtualmin

## Requisitos Previos

- Servidor Ubuntu con Virtualmin instalado
- Acceso SSH al servidor
- Dominio configurado en Virtualmin
- Node.js 18+ instalado en el servidor

## Paso 1: Preparar la Aplicación Localmente

### 1.1. Verificar que todo funciona en desarrollo

```bash
# En tu máquina local
cd /Users/juang/Downloads/crb
npm run build
```

Si hay errores, corrígelos antes de continuar.

### 1.2. Crear archivo .env.production

Crea un archivo `.env.production` con las variables de producción:

```env
# Supabase - Producción
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_produccion
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_produccion

# Stripe - Producción (usa claves LIVE, no test)
STRIPE_SECRET_KEY=sk_live_tu_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_tu_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_produccion

# URL de producción
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://tu-dominio.com
```

### 1.3. Crear archivo .gitignore (si no existe)

Asegúrate de que `.gitignore` incluya:
```
.env.local
.env.production
node_modules
.next
.DS_Store
```

## Paso 2: Preparar el Servidor

### 2.1. Conectarse al servidor por SSH

```bash
ssh usuario@tu-servidor.com
# O si usas una clave SSH:
ssh -i ~/.ssh/tu_clave usuario@tu-servidor.com
```

### 2.2. Instalar Node.js (si no está instalado)

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x (recomendado para Next.js)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 2.3. Instalar PM2 (gestor de procesos)

```bash
sudo npm install -g pm2
```

PM2 mantendrá tu aplicación corriendo y la reiniciará automáticamente si se cae.

## Paso 3: Crear el Subdominio en Virtualmin

### 3.1. Crear subdominio virtual

1. Accede a Virtualmin: `https://tu-servidor.com:10000`
2. Inicia sesión con tus credenciales
3. Ve a **Create Virtual Server**
4. Completa:
   - **Domain name**: `tienda.tu-dominio.com` (o el subdominio que prefieras, ej: `adornos.tu-dominio.com`, `shop.tu-dominio.com`)
   - **Description**: Adornos CBK
   - **Password**: (deja el que genera o crea uno)
5. Haz clic en **Create Server**

**Nota**: Reemplaza `tienda` con el subdominio que prefieras. Ejemplos:
- `tienda.tu-dominio.com`
- `adornos.tu-dominio.com`
- `shop.tu-dominio.com`
- `app.tu-dominio.com`

### 3.2. Configurar el subdominio

1. Selecciona tu subdominio en la lista
2. Ve a **Server Configuration** → **Website Options**
3. Anota la ruta del directorio: `/home/usuario/domains/tienda.tu-dominio.com/public_html`
4. **Importante**: Asegúrate de que el DNS del subdominio apunte a tu servidor:
   - Crea un registro A en tu panel de DNS: `tienda` → IP de tu servidor
   - O un registro CNAME: `tienda` → `tu-dominio.com`

## Paso 4: Subir los Archivos al Servidor

### Opción A: Usando SCP (desde tu máquina local)

```bash
# Desde tu máquina local (en otra terminal, NO cierres la SSH)
cd /Users/juang/Downloads/crb

# Crear archivo comprimido (excluyendo node_modules y .next)
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    -czf crb-app.tar.gz .

# Subir al servidor
scp crb-app.tar.gz usuario@tu-servidor.com:/home/usuario/
```

### Opción B: Usando Git (recomendado)

```bash
# En tu máquina local, inicializa git si no lo has hecho
cd /Users/juang/Downloads/crb
git init
git add .
git commit -m "Initial commit"

# Crea un repositorio en GitHub/GitLab y sube el código
# Luego en el servidor:
cd /home/usuario/domains/tu-dominio.com
git clone https://github.com/tu-usuario/tu-repo.git public_html
cd public_html
```

### Opción C: Usando FileZilla o cliente FTP

1. Conecta a tu servidor con FileZilla usando SFTP
2. Navega a `/home/usuario/domains/tu-dominio.com/`
3. Sube todos los archivos (excepto `node_modules` y `.next`)

## Paso 5: Configurar la Aplicación en el Servidor

### 5.1. Descomprimir archivos (si usaste SCP)

```bash
# En el servidor (reemplaza 'tienda.tu-dominio.com' con tu subdominio)
cd /home/usuario/domains/tienda.tu-dominio.com
mkdir -p public_html
cd public_html
tar -xzf ~/crb-app.tar.gz
```

### 5.2. Instalar dependencias

```bash
cd /home/usuario/domains/tienda.tu-dominio.com/public_html
npm install --production
```

**Nota**: Ajusta la ruta según el nombre de tu subdominio.

### 5.3. Crear archivo .env.local

```bash
nano .env.local
```

Pega las variables de entorno de producción (las del Paso 1.2) y guarda con `Ctrl+O`, `Enter`, `Ctrl+X`.

### 5.4. Construir la aplicación

```bash
npm run build
```

Esto puede tardar varios minutos. Al finalizar deberías ver:
```
✓ Compiled successfully
```

## Paso 6: Configurar Nginx (Proxy Reverso)

### 6.1. Crear configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/tienda.tu-dominio.com
```

Pega esta configuración (reemplaza `tienda.tu-dominio.com` con tu subdominio):

```nginx
server {
    listen 80;
    server_name tienda.tu-dominio.com;

    # Redirigir HTTP a HTTPS (después de configurar SSL)
    # return 301 https://$server_name$request_uri;

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
}
```

**Nota**: Si quieres usar un puerto diferente para esta app (por ejemplo 3001), cambia `localhost:3000` a `localhost:3001` y actualiza el `PORT` en `ecosystem.config.js`.

Guarda y cierra (`Ctrl+O`, `Enter`, `Ctrl+X`).

### 6.2. Habilitar el sitio

```bash
sudo ln -s /etc/nginx/sites-available/tienda.tu-dominio.com /etc/nginx/sites-enabled/
sudo nginx -t  # Verificar que la configuración es correcta
sudo systemctl reload nginx
```

**Nota**: Reemplaza `tienda.tu-dominio.com` con tu subdominio real.

## Paso 7: Iniciar la Aplicación con PM2

### 7.1. Crear archivo de configuración PM2

```bash
cd /home/usuario/domains/tienda.tu-dominio.com/public_html
nano ecosystem.config.js
```

Pega esto (ajusta las rutas con tu subdominio):

```javascript
module.exports = {
  apps: [{
    name: 'adornos-cbk',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/usuario/domains/tienda.tu-dominio.com/public_html',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/usuario/domains/tienda.tu-dominio.com/logs/pm2-error.log',
    out_file: '/home/usuario/domains/tienda.tu-dominio.com/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

**Importante**: 
- Reemplaza `tienda.tu-dominio.com` con tu subdominio real
- Si ya tienes otra app en el puerto 3000, cambia a otro puerto (ej: 3001) y actualiza Nginx también

### 7.2. Crear directorio de logs

```bash
mkdir -p /home/usuario/domains/tienda.tu-dominio.com/logs
```

### 7.3. Iniciar con PM2

```bash
cd /home/usuario/domains/tienda.tu-dominio.com/public_html
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

El último comando te dará un comando para ejecutar con `sudo`. Cópialo y ejecútalo.

### 7.4. Verificar que está corriendo

```bash
pm2 status
pm2 logs adornos-cbk
```

## Paso 8: Configurar SSL (HTTPS)

### 8.1. Usando Let's Encrypt en Virtualmin

1. En Virtualmin, selecciona tu **subdominio** (ej: `tienda.tu-dominio.com`)
2. Ve a **Webmin** → **Virtualmin** → **Server Configuration** → **SSL Certificate**
3. Haz clic en **Let's Encrypt**
4. Completa:
   - **Email**: tu-email@ejemplo.com
   - **Domains**: tienda.tu-dominio.com (solo el subdominio)
5. Haz clic en **Request Certificate**

### 8.2. Actualizar Nginx para HTTPS

Después de obtener el certificado, edita la configuración:

```bash
sudo nano /etc/nginx/sites-available/tienda.tu-dominio.com
```

Reemplaza con (ajusta el subdominio):

```nginx
server {
    listen 80;
    server_name tienda.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tienda.tu-dominio.com;

    ssl_certificate /home/usuario/domains/tienda.tu-dominio.com/ssl.cert;
    ssl_certificate_key /home/usuario/domains/tienda.tu-dominio.com/ssl.key;

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
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Paso 9: Configurar Webhook de Stripe

### 9.1. Obtener la URL del webhook

Tu webhook estará en: `https://tienda.tu-dominio.com/api/webhooks/stripe`

**Nota**: Reemplaza `tienda.tu-dominio.com` con tu subdominio real.

### 9.2. Configurar en Stripe Dashboard

1. Ve a https://dashboard.stripe.com/webhooks
2. Haz clic en **Add endpoint**
3. URL: `https://tienda.tu-dominio.com/api/webhooks/stripe` (usa tu subdominio)
4. Selecciona eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copia el **Signing secret** y actualiza `STRIPE_WEBHOOK_SECRET` en `.env.local`

### 9.3. Reiniciar la aplicación

```bash
pm2 restart adornos-cbk
```

## Paso 10: Verificar que Todo Funciona

1. Visita `https://tienda.tu-dominio.com` (tu subdominio)
2. Verifica que la página carga correctamente
3. Prueba el flujo de compra completo
4. Revisa los logs si hay problemas:

```bash
pm2 logs adornos-cbk
tail -f /home/usuario/domains/tienda.tu-dominio.com/logs/pm2-error.log
```

## Paso 11: Configurar DNS del Subdominio

**IMPORTANTE**: Antes de que el subdominio funcione, debes configurar el DNS:

1. Ve a tu panel de DNS (donde gestionas tu dominio)
2. Crea un nuevo registro:
   - **Tipo**: A (o CNAME)
   - **Nombre/Host**: `tienda` (o el nombre de tu subdominio)
   - **Valor/Destino**: IP de tu servidor (para registro A) o `tu-dominio.com` (para CNAME)
   - **TTL**: 3600 (o el valor por defecto)

3. Espera a que se propague el DNS (puede tardar de minutos a horas)
4. Verifica con: `ping tienda.tu-dominio.com` o `nslookup tienda.tu-dominio.com`

## Comandos Útiles

```bash
# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs adornos-cbk

# Reiniciar aplicación
pm2 restart adornos-cbk

# Detener aplicación
pm2 stop adornos-cbk

# Actualizar aplicación (después de hacer cambios)
cd /home/usuario/domains/tu-dominio.com/public_html
git pull  # Si usas Git
npm install
npm run build
pm2 restart adornos-cbk
```

## Solución de Problemas

### Error: Puerto 3000 ya en uso
```bash
# Ver qué está usando el puerto
sudo lsof -i :3000
# Matar el proceso si es necesario
sudo kill -9 PID
```

### Error: Permisos
```bash
# Dar permisos al usuario (ajusta el subdominio)
sudo chown -R usuario:usuario /home/usuario/domains/tienda.tu-dominio.com
```

### La aplicación no inicia
```bash
# Ver logs detallados
pm2 logs adornos-cbk --lines 100
# Verificar variables de entorno
cd /home/usuario/domains/tu-dominio.com/public_html
cat .env.local
```

### Error 502 Bad Gateway
- Verifica que PM2 esté corriendo: `pm2 status`
- Verifica que la app esté en el puerto 3000: `netstat -tulpn | grep 3000`
- Revisa los logs de Nginx: `sudo tail -f /var/log/nginx/error.log`


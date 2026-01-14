# 🚀 Guía Completa de Despliegue - Ubuntu + Virtualmin

## 📋 Índice
1. [Preparación Local](#1-preparación-local)
2. [Preparación del Servidor](#2-preparación-del-servidor)
3. [Configurar Virtualmin](#3-configurar-virtualmin)
4. [Subir Archivos](#4-subir-archivos)
5. [Configurar la Aplicación](#5-configurar-la-aplicación)
6. [Configurar Nginx](#6-configurar-nginx)
7. [Iniciar con PM2](#7-iniciar-con-pm2)
8. [Configurar SSL](#8-configurar-ssl)
9. [Verificación Final](#9-verificación-final)

---

## 1. Preparación Local

### 1.1. Verificar que la aplicación compila

```bash
cd /Users/juang/Downloads/crb
npm run build
```

Si hay errores, corrígelos antes de continuar.

### 1.2. Preparar variables de entorno

Crea un archivo `.env.production` con tus credenciales de producción:

```env
# Supabase - Producción
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_produccion
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_produccion

# Stripe - Producción (usa claves LIVE)
STRIPE_SECRET_KEY=sk_live_tu_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_tu_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_produccion

# URL de producción
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://tu-dominio.com
```

### 1.3. Crear archivo comprimido (excluyendo archivos innecesarios)

```bash
cd /Users/juang/Downloads/crb
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    -czf crb-app.tar.gz .
```

Esto creará `crb-app.tar.gz` con todos los archivos necesarios.

---

## 2. Preparación del Servidor

### 2.1. Conectarse al servidor por SSH

```bash
ssh usuario@tu-servidor.com
# O con clave SSH:
ssh -i ~/.ssh/tu_clave usuario@tu-servidor.com
```

### 2.2. Instalar Node.js 20.x

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x.x
npm --version   # Debe mostrar 10.x.x
```

### 2.3. Instalar PM2 (gestor de procesos)

```bash
sudo npm install -g pm2
pm2 --version
```

### 2.4. Verificar que Nginx está instalado

```bash
nginx -v
# Si no está instalado:
sudo apt install -y nginx
```

---

## 3. Configurar Virtualmin

### 3.1. Crear subdominio virtual

1. Accede a Virtualmin: `https://tu-servidor.com:10000`
2. Inicia sesión con tus credenciales de administrador
3. Ve a **Create Virtual Server**
4. Completa el formulario:
   - **Domain name**: `tienda.tu-dominio.com` (o el subdominio que prefieras)
   - **Description**: Adornos CBK - Tienda Navideña
   - **Password**: (deja el generado o crea uno seguro)
   - **Server template**: Deja el por defecto
5. Haz clic en **Create Server**

**Ejemplos de subdominios:**
- `tienda.tu-dominio.com`
- `adornos.tu-dominio.com`
- `shop.tu-dominio.com`
- `app.tu-dominio.com`

### 3.2. Anotar la ruta del directorio

Después de crear el servidor virtual, anota la ruta que Virtualmin muestra. Normalmente será:

```
/home/usuario/domains/tienda.tu-dominio.com/public_html
```

**Reemplaza:**
- `usuario` → tu usuario del servidor
- `tienda.tu-dominio.com` → tu subdominio real

### 3.3. Configurar DNS del subdominio

**IMPORTANTE**: Antes de continuar, configura el DNS:

1. Ve a tu panel de DNS (donde gestionas tu dominio)
2. Crea un nuevo registro:
   - **Tipo**: A (o CNAME)
   - **Nombre/Host**: `tienda` (o el nombre de tu subdominio)
   - **Valor/Destino**: 
     - IP de tu servidor (para registro A)
     - `tu-dominio.com` (para CNAME)
   - **TTL**: 3600
3. Espera a que se propague (puede tardar minutos u horas)
4. Verifica con: `ping tienda.tu-dominio.com`

---

## 4. Subir Archivos

### Opción A: Usando SCP (Recomendado para primera vez)

**Desde tu máquina local** (en otra terminal, NO cierres la SSH):

```bash
# Desde tu máquina local
cd /Users/juang/Downloads/crb
scp crb-app.tar.gz usuario@tu-servidor.com:/home/usuario/
```

**En el servidor** (en la terminal SSH):

```bash
# Mover el archivo al directorio del dominio
cd /home/usuario/domains/tienda.tu-dominio.com
mv ~/crb-app.tar.gz .

# Descomprimir en public_html
cd public_html
tar -xzf ../crb-app.tar.gz
```

### Opción B: Usando Git (Recomendado para actualizaciones)

**En tu máquina local:**

```bash
cd /Users/juang/Downloads/crb
git init
git add .
git commit -m "Initial commit"
# Sube a GitHub/GitLab
```

**En el servidor:**

```bash
cd /home/usuario/domains/tienda.tu-dominio.com
rm -rf public_html/*  # Limpiar si ya hay archivos
git clone https://github.com/tu-usuario/tu-repo.git public_html
cd public_html
```

### Opción C: Usando FileZilla (SFTP)

1. Conecta con FileZilla usando SFTP
2. Navega a `/home/usuario/domains/tienda.tu-dominio.com/`
3. Sube todos los archivos (excepto `node_modules` y `.next`) a `public_html`

---

## 5. Configurar la Aplicación

### 5.1. Instalar dependencias

```bash
cd /home/usuario/domains/tienda.tu-dominio.com/public_html
npm install --production
```

### 5.2. Crear archivo .env.local

```bash
nano .env.local
```

Pega las variables de entorno de producción (las del Paso 1.2) y guarda:
- `Ctrl+O` → Enter → `Ctrl+X`

### 5.3. Actualizar ecosystem.config.js

```bash
nano ecosystem.config.js
```

Asegúrate de que tenga esta configuración (ajusta las rutas):

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

**Reemplaza `tienda.tu-dominio.com` con tu subdominio real.**

### 5.4. Crear directorio de logs

```bash
mkdir -p /home/usuario/domains/tienda.tu-dominio.com/logs
```

### 5.5. Construir la aplicación

```bash
cd /home/usuario/domains/tienda.tu-dominio.com/public_html
npm run build
```

Esto puede tardar varios minutos. Al finalizar deberías ver:
```
✓ Compiled successfully
```

---

## 6. Configurar Nginx

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Guarda y cierra: `Ctrl+O` → Enter → `Ctrl+X`

### 6.2. Habilitar el sitio

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/tienda.tu-dominio.com /etc/nginx/sites-enabled/

# Verificar que la configuración es correcta
sudo nginx -t

# Si todo está bien, recargar Nginx
sudo systemctl reload nginx
```

**Nota**: Si ya tienes otra app en el puerto 3000, cambia el puerto en `ecosystem.config.js` (ej: 3001) y actualiza Nginx también.

---

## 7. Iniciar con PM2

### 7.1. Iniciar la aplicación

```bash
cd /home/usuario/domains/tienda.tu-dominio.com/public_html
pm2 start ecosystem.config.js
```

### 7.2. Guardar configuración de PM2

```bash
pm2 save
pm2 startup
```

El último comando te dará un comando para ejecutar con `sudo`. Cópialo y ejecútalo tal como aparece.

### 7.3. Verificar que está corriendo

```bash
pm2 status
pm2 logs adornos-cbk
```

Deberías ver que la aplicación está corriendo y los logs sin errores.

---

## 8. Configurar SSL (HTTPS)

### 8.1. Usando Let's Encrypt en Virtualmin

1. En Virtualmin, selecciona tu **subdominio** (ej: `tienda.tu-dominio.com`)
2. Ve a **Webmin** → **Virtualmin** → **Server Configuration** → **SSL Certificate**
3. Haz clic en **Let's Encrypt**
4. Completa:
   - **Email**: tu-email@ejemplo.com
   - **Domains**: tienda.tu-dominio.com (solo el subdominio)
5. Haz clic en **Request Certificate**
6. Espera a que se genere el certificado

### 8.2. Actualizar Nginx para HTTPS

Después de obtener el certificado, edita la configuración:

```bash
sudo nano /etc/nginx/sites-available/tienda.tu-dominio.com
```

Reemplaza con (ajusta el subdominio y usuario):

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Reemplaza:**
- `tienda.tu-dominio.com` → tu subdominio
- `usuario` → tu usuario del servidor

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 9. Verificación Final

### 9.1. Verificar que la aplicación funciona

1. Visita `https://tienda.tu-dominio.com` (tu subdominio)
2. Verifica que la página carga correctamente
3. Prueba navegar por las diferentes secciones

### 9.2. Configurar Webhook de Stripe

1. Ve a https://dashboard.stripe.com/webhooks
2. Haz clic en **Add endpoint**
3. URL: `https://tienda.tu-dominio.com/api/webhooks/stripe`
4. Selecciona eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copia el **Signing secret** y actualiza `STRIPE_WEBHOOK_SECRET` en `.env.local`
6. Reinicia la aplicación:

```bash
pm2 restart adornos-cbk
```

### 9.3. Verificar logs

```bash
# Logs de PM2
pm2 logs adornos-cbk

# Logs de errores
tail -f /home/usuario/domains/tienda.tu-dominio.com/logs/pm2-error.log

# Logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 📝 Comandos Útiles

### Ver estado de la aplicación
```bash
pm2 status
pm2 list
```

### Ver logs en tiempo real
```bash
pm2 logs adornos-cbk
pm2 logs adornos-cbk --lines 100
```

### Reiniciar aplicación
```bash
pm2 restart adornos-cbk
```

### Detener aplicación
```bash
pm2 stop adornos-cbk
```

### Actualizar aplicación (después de hacer cambios)
```bash
cd /home/usuario/domains/tienda.tu-dominio.com/public_html
git pull  # Si usas Git
npm install
npm run build
pm2 restart adornos-cbk
```

### Ver qué está usando el puerto 3000
```bash
sudo lsof -i :3000
```

---

## 🔧 Solución de Problemas

### Error: Puerto 3000 ya en uso
```bash
# Ver qué está usando el puerto
sudo lsof -i :3000
# Matar el proceso si es necesario
sudo kill -9 PID
# O cambiar el puerto en ecosystem.config.js
```

### Error: Permisos
```bash
# Dar permisos al usuario
sudo chown -R usuario:usuario /home/usuario/domains/tienda.tu-dominio.com
```

### La aplicación no inicia
```bash
# Ver logs detallados
pm2 logs adornos-cbk --lines 100
# Verificar variables de entorno
cat .env.local
# Verificar que el build fue exitoso
ls -la .next
```

### Error 502 Bad Gateway
```bash
# Verificar que PM2 está corriendo
pm2 status

# Verificar que la app está en el puerto 3000
netstat -tulpn | grep 3000

# Revisar logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar configuración de Nginx
sudo nginx -t
```

### Error: Cannot find module
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart adornos-cbk
```

### Las imágenes no se cargan
- Verifica que las URLs de las imágenes son correctas
- Revisa la consola del navegador para errores
- Verifica que `next.config.mjs` tiene configurados los dominios remotos

---

## ✅ Checklist Final

- [ ] Node.js 20.x instalado
- [ ] PM2 instalado y configurado
- [ ] Subdominio creado en Virtualmin
- [ ] DNS del subdominio configurado
- [ ] Archivos subidos al servidor
- [ ] Dependencias instaladas (`npm install`)
- [ ] Variables de entorno configuradas (`.env.local`)
- [ ] Aplicación construida (`npm run build`)
- [ ] Nginx configurado y funcionando
- [ ] PM2 iniciado y aplicación corriendo
- [ ] SSL configurado (HTTPS)
- [ ] Webhook de Stripe configurado
- [ ] Sitio accesible desde el navegador
- [ ] Logs sin errores críticos

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en `https://tienda.tu-dominio.com`

Si tienes algún problema, revisa los logs y la sección de solución de problemas.


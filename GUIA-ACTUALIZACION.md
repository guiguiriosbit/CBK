# 🔄 Guía de Actualización del Proyecto
## Actualizar Versión en Servidor Ubuntu + Virtualmin

Esta guía te ayudará a actualizar el proyecto cuando ya está desplegado en el servidor.

---

## 📋 Índice

1. [Preparación Local](#1-preparación-local)
2. [Backup de la Versión Actual](#2-backup-de-la-versión-actual)
3. [Subir Nueva Versión](#3-subir-nueva-versión)
4. [Actualizar en el Servidor](#4-actualizar-en-el-servidor)
5. [Verificación Post-Actualización](#5-verificación-post-actualización)
6. [Rollback (Revertir Cambios)](#6-rollback-revertir-cambios)
7. [Actualización Automatizada](#7-actualización-automatizada)

---

## 1. Preparación Local

### 1.1. Verificar Cambios

```bash
# En tu máquina local
cd /Users/juang/Downloads/crb

# Ver qué archivos han cambiado
git status

# Ver diferencias (si usas Git)
git diff

# Verificar que no hay errores
npm run lint
```

### 1.2. Probar que Compila

```bash
# Construir la aplicación localmente
npm run build

# Si hay errores, corrígelos antes de continuar
```

### 1.3. Verificar Variables de Entorno

Asegúrate de que las variables de entorno en `.env.local` estén actualizadas y sean correctas para producción.

### 1.4. Crear Lista de Cambios

Anota los cambios importantes que vas a desplegar:
- Nuevas funcionalidades
- Correcciones de bugs
- Cambios en variables de entorno
- Cambios en dependencias
- Cambios en configuración

---

## 2. Backup de la Versión Actual

### 2.1. Conectarse al Servidor

```bash
ssh usuario@tu-servidor.com
```

### 2.2. Crear Backup Completo

```bash
# Ir al directorio del proyecto
cd /home/usuario/domains/tu-dominio.com/public_html

# Crear directorio de backups si no existe
mkdir -p ../backups

# Crear backup con fecha y hora
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
tar -czf ../backups/${BACKUP_NAME}.tar.gz \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='*.log' \
    .

echo "✅ Backup creado: ../backups/${BACKUP_NAME}.tar.gz"
```

### 2.3. Backup de Base de Datos (Supabase)

**Nota:** Si usas Supabase, los backups se manejan automáticamente. Pero puedes:

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Database** → **Backups**
4. Verifica que los backups automáticos estén activos

O crea un backup manual:
- Ve a **Database** → **Backups**
- Haz clic en **Create backup**

### 2.4. Backup de Variables de Entorno

```bash
# Guardar copia del .env.local actual
cp .env.local .env.local.backup-$(date +%Y%m%d-%H%M%S)
```

### 2.5. Verificar Estado Actual de PM2

```bash
# Ver estado actual
pm2 status

# Guardar lista de procesos
pm2 save

# Ver logs actuales (por si necesitas comparar después)
pm2 logs adornos-cbk --lines 50 --nostream > ../backups/pm2-logs-$(date +%Y%m%d-%H%M%S).log
```

---

## 3. Subir Nueva Versión

### 3.1. Opción A: Usando Git (Recomendado)

**En tu máquina local:**

```bash
cd /Users/juang/Downloads/crb

# Asegúrate de que todos los cambios estén commiteados
git add .
git commit -m "Actualización: [describe los cambios]"
git push origin main  # o la rama que uses
```

**En el servidor:**

```bash
cd /home/usuario/domains/tu-dominio.com/public_html

# Guardar cambios locales si los hay (opcional)
git stash

# Obtener última versión
git pull origin main

# Si hay conflictos, resuélvelos manualmente
```

### 3.2. Opción B: Usando SCP (Sin Git)

**En tu máquina local:**

```bash
cd /Users/juang/Downloads/crb

# Crear archivo comprimido de la nueva versión
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    --exclude='.env.local' \
    -czf crb-update-$(date +%Y%m%d).tar.gz .

# Subir al servidor
scp crb-update-*.tar.gz usuario@tu-servidor.com:/home/usuario/domains/tu-dominio.com/
```

**En el servidor:**

```bash
cd /home/usuario/domains/tu-dominio.com

# Extraer nueva versión en directorio temporal
mkdir -p update-temp
tar -xzf crb-update-*.tar.gz -C update-temp

# Verificar contenido antes de reemplazar
ls -la update-temp/
```

### 3.3. Opción C: Usando FTP/SFTP

1. Conecta con FileZilla o similar
2. Sube los archivos modificados
3. Asegúrate de mantener `.env.local` intacto

---

## 4. Actualizar en el Servidor

### 4.1. Detener la Aplicación

```bash
cd /home/usuario/domains/tu-dominio.com/public_html

# Detener PM2 (opcional, puedes hacer hot reload)
pm2 stop adornos-cbk

# O mantener corriendo y hacer restart después
```

### 4.2. Actualizar Archivos

**Si usaste Git (Opción A):**

```bash
# Ya tienes los archivos actualizados con git pull
# Solo necesitas verificar que .env.local esté intacto
ls -la .env.local
```

**Si usaste SCP (Opción B):**

```bash
cd /home/usuario/domains/tu-dominio.com

# Hacer backup de archivos críticos
cp public_html/.env.local public_html/.env.local.backup

# Reemplazar archivos (excepto .env.local y node_modules)
rsync -av --exclude='.env.local' \
         --exclude='node_modules' \
         --exclude='.next' \
         update-temp/ public_html/

# O manualmente:
# cp -r update-temp/* public_html/
# Mantener .env.local original
cp public_html/.env.local.backup public_html/.env.local
```

### 4.3. Verificar Variables de Entorno

```bash
cd /home/usuario/domains/tu-dominio.com/public_html

# Verificar que .env.local existe y tiene las variables correctas
cat .env.local | grep -E "SUPABASE|STRIPE|EMAIL|WHATSAPP"

# Si hay nuevas variables de entorno necesarias, agrégalas
nano .env.local
```

### 4.4. Actualizar Dependencias (Si es Necesario)

```bash
cd /home/usuario/domains/tu-dominio.com/public_html

# Verificar si package.json cambió
# Comparar con backup si es necesario

# Instalar nuevas dependencias
npm install --production

# Si hay cambios importantes en dependencias:
# npm ci --production  # Instalación limpia
```

### 4.5. Reconstruir la Aplicación

```bash
# Construir nueva versión
npm run build

# Verificar que no hay errores
# Si hay errores, revisa los logs y corrige
```

### 4.6. Verificar Archivos Importantes

```bash
# Verificar que .next existe y tiene contenido
ls -la .next/

# Verificar que node_modules está completo
ls -la node_modules/ | head -20

# Verificar permisos
chmod 600 .env.local
chmod -R 755 .
```

---

## 5. Verificación Post-Actualización

### 5.1. Reiniciar la Aplicación

```bash
# Reiniciar con PM2
pm2 restart adornos-cbk

# O si la detuviste antes:
pm2 start ecosystem.config.js

# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs adornos-cbk --lines 50
```

### 5.2. Verificar que la Aplicación Inicia Correctamente

```bash
# Probar localmente en el servidor
curl http://localhost:3000

# Debe responder con HTML (no error)
```

### 5.3. Verificar que Nginx Funciona

```bash
# Verificar configuración de Nginx
sudo nginx -t

# Recargar Nginx si es necesario
sudo systemctl reload nginx

# Verificar logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

### 5.4. Pruebas Funcionales

**Desde tu navegador:**

1. **Página Principal:**
   - Abre https://tu-dominio.com
   - Verifica que carga correctamente
   - Verifica que no hay errores en la consola del navegador

2. **Autenticación:**
   - Prueba login con contraseña
   - Prueba login con OTP por email
   - Verifica que los emails llegan correctamente

3. **E-commerce:**
   - Agrega productos al carrito
   - Ve a checkout
   - Verifica que Stripe funciona (modo test primero)
   - Completa un pago de prueba

4. **Panel Administrativo:**
   - Accede como admin
   - Verifica que el dashboard carga
   - Verifica que puedes ver pedidos, productos, etc.

### 5.5. Verificar Logs

```bash
# Ver logs de PM2
pm2 logs adornos-cbk --lines 100

# Buscar errores
pm2 logs adornos-cbk --err --lines 50

# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 5.6. Verificar Recursos del Sistema

```bash
# Ver uso de memoria y CPU
pm2 monit

# Ver procesos de Node
ps aux | grep node

# Ver uso de disco
df -h
du -sh /home/usuario/domains/tu-dominio.com/public_html
```

---

## 6. Rollback (Revertir Cambios)

Si algo sale mal, puedes revertir a la versión anterior:

### 6.1. Detener la Aplicación

```bash
pm2 stop adornos-cbk
```

### 6.2. Restaurar Backup

```bash
cd /home/usuario/domains/tu-dominio.com

# Listar backups disponibles
ls -la backups/

# Restaurar backup (reemplaza BACKUP_NAME con el nombre real)
cd public_html
tar -xzf ../backups/BACKUP_NAME.tar.gz

# O restaurar solo archivos específicos
tar -xzf ../backups/BACKUP_NAME.tar.gz --wildcards 'app/*' 'components/*'
```

### 6.3. Restaurar Variables de Entorno

```bash
# Si necesitas restaurar .env.local
cp .env.local.backup-YYYYMMDD-HHMMSS .env.local
```

### 6.4. Reconstruir y Reiniciar

```bash
# Reinstalar dependencias si es necesario
npm install --production

# Reconstruir
npm run build

# Reiniciar
pm2 restart adornos-cbk
```

### 6.5. Si Usas Git

```bash
cd /home/usuario/domains/tu-dominio.com/public_html

# Ver historial de commits
git log --oneline -10

# Revertir a commit anterior
git reset --hard HEAD~1

# O revertir a un commit específico
git reset --hard COMMIT_HASH

# Reconstruir y reiniciar
npm run build
pm2 restart adornos-cbk
```

---

## 7. Actualización Automatizada

### 7.1. Crear Script de Actualización

Crea un script para automatizar el proceso:

```bash
# Crear script
nano /home/usuario/domains/tu-dominio.com/update.sh
```

Contenido del script:

```bash
#!/bin/bash

# Script de Actualización Automática
# Uso: ./update.sh

set -e  # Salir si hay errores

DOMAIN_DIR="/home/usuario/domains/tu-dominio.com"
APP_DIR="${DOMAIN_DIR}/public_html"
BACKUP_DIR="${DOMAIN_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "🔄 Iniciando actualización..."
echo "📅 Timestamp: ${TIMESTAMP}"

# 1. Crear backup
echo "📦 Creando backup..."
mkdir -p ${BACKUP_DIR}
cd ${APP_DIR}
tar -czf ${BACKUP_DIR}/backup-${TIMESTAMP}.tar.gz \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='*.log' \
    .

# 2. Backup de .env.local
cp .env.local .env.local.backup-${TIMESTAMP}

# 3. Actualizar código (si usas Git)
if [ -d ".git" ]; then
    echo "📥 Actualizando desde Git..."
    git stash  # Guardar cambios locales
    git pull origin main
else
    echo "⚠️  No se detectó Git. Actualiza manualmente los archivos."
    exit 1
fi

# 4. Verificar .env.local
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local no encontrado. Restaurando desde backup..."
    cp .env.local.backup-${TIMESTAMP} .env.local
fi

# 5. Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --production

# 6. Reconstruir
echo "🔨 Construyendo aplicación..."
npm run build

# 7. Reiniciar aplicación
echo "🔄 Reiniciando aplicación..."
pm2 restart adornos-cbk

# 8. Verificar estado
echo "✅ Verificando estado..."
sleep 5
pm2 status

# Verificar que responde
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicación respondiendo correctamente"
else
    echo "❌ Error: La aplicación no responde"
    echo "🔄 Revirtiendo cambios..."
    cd ${APP_DIR}
    tar -xzf ${BACKUP_DIR}/backup-${TIMESTAMP}.tar.gz
    npm run build
    pm2 restart adornos-cbk
    exit 1
fi

echo "🎉 Actualización completada exitosamente!"
echo "📦 Backup guardado en: ${BACKUP_DIR}/backup-${TIMESTAMP}.tar.gz"
```

Hacer ejecutable:

```bash
chmod +x /home/usuario/domains/tu-dominio.com/update.sh
```

### 7.2. Usar el Script

```bash
cd /home/usuario/domains/tu-dominio.com
./update.sh
```

### 7.3. Actualización con Confirmación

Versión más segura que pide confirmación:

```bash
#!/bin/bash

# ... (código anterior) ...

# Preguntar confirmación antes de actualizar
read -p "¿Estás seguro de actualizar? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Actualización cancelada"
    exit 0
fi

# Continuar con la actualización...
```

---

## 8. Checklist de Actualización

Antes de actualizar, verifica:

- [ ] ✅ Backup de la versión actual creado
- [ ] ✅ Backup de `.env.local` creado
- [ ] ✅ Cambios probados localmente
- [ ] ✅ Aplicación compila sin errores (`npm run build`)
- [ ] ✅ Variables de entorno actualizadas (si hay cambios)
- [ ] ✅ Dependencias revisadas (si `package.json` cambió)
- [ ] ✅ Documentación de cambios revisada

Durante la actualización:

- [ ] ✅ Archivos subidos correctamente
- [ ] ✅ `.env.local` preservado
- [ ] ✅ Dependencias instaladas
- [ ] ✅ Aplicación reconstruida
- [ ] ✅ PM2 reiniciado
- [ ] ✅ Aplicación responde correctamente

Después de actualizar:

- [ ] ✅ Página principal carga
- [ ] ✅ Login funciona
- [ ] ✅ OTP por email funciona
- [ ] ✅ Checkout y pagos funcionan
- [ ] ✅ Panel admin funciona
- [ ] ✅ No hay errores en logs
- [ ] ✅ Performance es aceptable

---

## 9. Tipos de Actualizaciones

### 9.1. Actualización Menor (Hot Fix)

Cambios pequeños, sin cambios en dependencias:

```bash
# Proceso rápido
cd /home/usuario/domains/tu-dominio.com/public_html
git pull origin main
npm run build
pm2 restart adornos-cbk
```

### 9.2. Actualización Media

Cambios en código, posiblemente nuevas dependencias:

```bash
# Proceso estándar
cd /home/usuario/domains/tu-dominio.com/public_html
git pull origin main
npm install --production
npm run build
pm2 restart adornos-cbk
```

### 9.3. Actualización Mayor

Cambios importantes, nuevas dependencias, cambios en estructura:

```bash
# Proceso completo con backup
./update.sh  # Usar script automatizado
# O seguir pasos manuales de esta guía
```

### 9.4. Actualización de Dependencias Críticas

Si actualizas Next.js, React, o dependencias importantes:

```bash
cd /home/usuario/domains/tu-dominio.com/public_html

# Backup completo
tar -czf ../backups/pre-dependency-update-$(date +%Y%m%d).tar.gz .

# Limpiar e instalar
rm -rf node_modules package-lock.json
npm install --production
npm run build
pm2 restart adornos-cbk

# Probar exhaustivamente antes de considerar completo
```

---

## 10. Actualización de Variables de Entorno

### 10.1. Agregar Nuevas Variables

```bash
cd /home/usuario/domains/tu-dominio.com/public_html

# Editar .env.local
nano .env.local

# Agregar nuevas variables
# Ejemplo:
# NUEVA_VARIABLE=valor

# Reiniciar para que tome los cambios
pm2 restart adornos-cbk
```

### 10.2. Actualizar Variables Existentes

```bash
# Editar .env.local
nano .env.local

# Actualizar valores
# Ejemplo:
# STRIPE_SECRET_KEY=sk_live_nueva_key

# Reiniciar
pm2 restart adornos-cbk
```

### 10.3. Verificar Variables

```bash
# Ver todas las variables (sin mostrar valores)
cat .env.local | grep -v "^#" | cut -d'=' -f1

# Verificar que variables críticas existen
grep -E "SUPABASE_URL|STRIPE_SECRET|NEXT_PUBLIC" .env.local
```

---

## 11. Actualización de Base de Datos

### 11.1. Scripts SQL en Supabase

Si hay cambios en la base de datos:

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Ejecuta los nuevos scripts SQL en orden:
   - `scripts/001-VERIFICAR-Y-COMPLETAR.sql`
   - Cualquier script nuevo

### 11.2. Migraciones

Si usas migraciones:

```bash
# En Supabase SQL Editor, ejecuta las migraciones nuevas
# O usa el CLI de Supabase si lo tienes configurado
```

---

## 12. Monitoreo Post-Actualización

### 12.1. Monitorear Primera Hora

```bash
# Ver logs en tiempo real
pm2 logs adornos-cbk

# Monitorear recursos
pm2 monit

# Ver errores
pm2 logs adornos-cbk --err
```

### 12.2. Verificar Métricas

- Tiempo de respuesta de la aplicación
- Uso de memoria y CPU
- Errores en logs
- Tasa de éxito de pagos
- Tasa de éxito de OTP

### 12.3. Alertas

Configura alertas para:
- Errores críticos en logs
- Alto uso de memoria/CPU
- Aplicación no responde
- Errores de Stripe
- Errores de Supabase

---

## 13. Comandos Rápidos de Referencia

### Actualización Rápida (Sin Backup)

```bash
cd /home/usuario/domains/tu-dominio.com/public_html
git pull && npm install --production && npm run build && pm2 restart adornos-cbk
```

### Ver Estado Actual

```bash
pm2 status
pm2 logs adornos-cbk --lines 20
curl http://localhost:3000
```

### Reiniciar Todo

```bash
pm2 restart adornos-cbk
sudo systemctl reload nginx
```

### Ver Últimos Backups

```bash
ls -lth /home/usuario/domains/tu-dominio.com/backups/ | head -10
```

---

## 14. Mejores Prácticas

### 14.1. Horarios de Actualización

- ✅ Actualiza en horarios de bajo tráfico
- ✅ Avisa a usuarios si es una actualización mayor
- ✅ Considera usar ventanas de mantenimiento

### 14.2. Testing

- ✅ Prueba en staging primero (si tienes)
- ✅ Prueba funcionalidades críticas después de actualizar
- ✅ Monitorea por al menos 1 hora después de actualizar

### 14.3. Documentación

- ✅ Documenta los cambios en cada actualización
- ✅ Mantén un changelog
- ✅ Anota problemas encontrados y soluciones

### 14.4. Comunicación

- ✅ Notifica al equipo sobre actualizaciones importantes
- ✅ Documenta cambios en variables de entorno
- ✅ Comparte cambios en configuración

---

## 15. Solución de Problemas Comunes

### 15.1. Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install --production
npm run build
pm2 restart adornos-cbk
```

### 15.2. Error: "Port 3000 already in use"

```bash
# Ver qué está usando el puerto
sudo lsof -i :3000

# Matar proceso si es necesario
kill -9 PID

# O cambiar puerto en ecosystem.config.js
```

### 15.3. Error: "Build failed"

```bash
# Ver errores de build
npm run build 2>&1 | tee build-errors.log

# Revisar errores y corregir
# Luego reconstruir
```

### 15.4. La Aplicación No Responde

```bash
# Verificar que PM2 está corriendo
pm2 status

# Ver logs de errores
pm2 logs adornos-cbk --err --lines 50

# Verificar que el puerto está abierto
curl http://localhost:3000

# Reiniciar si es necesario
pm2 restart adornos-cbk
```

### 15.5. Variables de Entorno No Se Aplican

```bash
# Verificar que .env.local existe
ls -la .env.local

# Verificar contenido
cat .env.local

# Reiniciar PM2 para que tome cambios
pm2 restart adornos-cbk --update-env
```

---

## 16. Script de Actualización Completo

Aquí está un script completo y robusto:

```bash
#!/bin/bash
# update-project.sh - Script de Actualización Completa

set -e  # Salir en caso de error

# Configuración
DOMAIN_DIR="/home/usuario/domains/tu-dominio.com"
APP_DIR="${DOMAIN_DIR}/public_html"
BACKUP_DIR="${DOMAIN_DIR}/backups"
LOG_FILE="${DOMAIN_DIR}/update.log"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a ${LOG_FILE}
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a ${LOG_FILE}
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a ${LOG_FILE}
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a ${LOG_FILE}
}

# Verificar que estamos en el directorio correcto
if [ ! -d "${APP_DIR}" ]; then
    log_error "Directorio de aplicación no encontrado: ${APP_DIR}"
    exit 1
fi

cd ${APP_DIR}

# Confirmación
log "🔄 Iniciando actualización del proyecto..."
read -p "¿Continuar con la actualización? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    log "Actualización cancelada por el usuario"
    exit 0
fi

# 1. Crear backup
log "📦 Creando backup..."
mkdir -p ${BACKUP_DIR}
BACKUP_FILE="${BACKUP_DIR}/backup-${TIMESTAMP}.tar.gz"
tar -czf ${BACKUP_FILE} \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='*.log' \
    . > /dev/null 2>&1

if [ -f "${BACKUP_FILE}" ]; then
    log_success "Backup creado: ${BACKUP_FILE}"
else
    log_error "Error al crear backup"
    exit 1
fi

# 2. Backup de .env.local
if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup-${TIMESTAMP}
    log_success ".env.local respaldado"
else
    log_warning ".env.local no encontrado"
fi

# 3. Actualizar código
if [ -d ".git" ]; then
    log "📥 Actualizando desde Git..."
    git stash > /dev/null 2>&1 || true
    if git pull origin main; then
        log_success "Código actualizado desde Git"
    else
        log_error "Error al actualizar desde Git"
        log "🔄 Restaurando desde backup..."
        tar -xzf ${BACKUP_FILE} > /dev/null 2>&1
        exit 1
    fi
else
    log_warning "No se detectó Git. Actualiza los archivos manualmente."
    read -p "¿Continuar con la instalación de dependencias? (yes/no): " continue
    if [ "$continue" != "yes" ]; then
        exit 0
    fi
fi

# 4. Verificar .env.local
if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.backup-${TIMESTAMP}" ]; then
        log_warning "Restaurando .env.local desde backup"
        cp .env.local.backup-${TIMESTAMP} .env.local
    else
        log_error ".env.local no encontrado y no hay backup"
        exit 1
    fi
fi

# 5. Instalar dependencias
log "📦 Instalando dependencias..."
if npm install --production; then
    log_success "Dependencias instaladas"
else
    log_error "Error al instalar dependencias"
    log "🔄 Restaurando desde backup..."
    tar -xzf ${BACKUP_FILE} > /dev/null 2>&1
    npm install --production
    exit 1
fi

# 6. Reconstruir
log "🔨 Construyendo aplicación..."
if npm run build; then
    log_success "Aplicación construida exitosamente"
else
    log_error "Error al construir la aplicación"
    log "🔄 Restaurando desde backup..."
    tar -xzf ${BACKUP_FILE} > /dev/null 2>&1
    npm run build
    exit 1
fi

# 7. Reiniciar aplicación
log "🔄 Reiniciando aplicación..."
pm2 restart adornos-cbk || pm2 start ecosystem.config.js
sleep 5

# 8. Verificar estado
log "✅ Verificando estado..."
if pm2 status | grep -q "adornos-cbk.*online"; then
    log_success "PM2: Aplicación online"
else
    log_error "PM2: Aplicación no está online"
    log "🔄 Restaurando desde backup..."
    tar -xzf ${BACKUP_FILE} > /dev/null 2>&1
    npm run build
    pm2 restart adornos-cbk
    exit 1
fi

# 9. Verificar que responde
log "🌐 Verificando respuesta HTTP..."
sleep 3
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log_success "Aplicación respondiendo correctamente"
else
    log_error "Aplicación no responde"
    log "🔄 Considera hacer rollback manual"
    exit 1
fi

# 10. Resumen
log_success "🎉 Actualización completada exitosamente!"
log "📦 Backup guardado en: ${BACKUP_FILE}"
log "📝 Logs guardados en: ${LOG_FILE}"
log "🕐 Timestamp: ${TIMESTAMP}"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ ACTUALIZACIÓN COMPLETADA"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Verifica la aplicación en: https://tu-dominio.com"
echo "   2. Prueba funcionalidades críticas"
echo "   3. Monitorea logs: pm2 logs adornos-cbk"
echo "   4. Si hay problemas, restaura desde: ${BACKUP_FILE}"
echo ""
```

Guardar como `update-project.sh` y hacer ejecutable:

```bash
chmod +x update-project.sh
./update-project.sh
```

---

## 17. Resumen de Comandos Rápidos

### Actualización Rápida (Con Git)

```bash
cd /home/usuario/domains/tu-dominio.com/public_html
git pull && npm install --production && npm run build && pm2 restart adornos-cbk
```

### Actualización con Backup

```bash
./update-project.sh  # Si tienes el script
# O seguir pasos manuales de esta guía
```

### Rollback Rápido

```bash
cd /home/usuario/domains/tu-dominio.com/public_html
pm2 stop adornos-cbk
tar -xzf ../backups/backup-YYYYMMDD-HHMMSS.tar.gz
npm run build
pm2 restart adornos-cbk
```

---

**¡Actualización completada! 🎉**

Sigue esta guía cada vez que necesites actualizar el proyecto en producción.


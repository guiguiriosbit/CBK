# Configuración Rápida para Subdominio

## Resumen de Cambios Necesarios

Si quieres desplegar en un subdominio (ej: `tienda.tu-dominio.com`), necesitas cambiar:

### 1. En Virtualmin
- Crear subdominio: `tienda.tu-dominio.com` (o el nombre que prefieras)
- Ruta será: `/home/usuario/domains/tienda.tu-dominio.com/public_html`

### 2. En Variables de Entorno (.env.local en servidor)
```env
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://tienda.tu-dominio.com
```

### 3. En Nginx
- Archivo: `/etc/nginx/sites-available/tienda.tu-dominio.com`
- `server_name tienda.tu-dominio.com;`

### 4. En PM2 (ecosystem.config.js)
- Ajustar rutas: `/home/usuario/domains/tienda.tu-dominio.com/...`

### 5. En DNS
- Crear registro A o CNAME: `tienda` → IP del servidor

### 6. En Stripe Webhook
- URL: `https://tienda.tu-dominio.com/api/webhooks/stripe`

## Ejemplos de Subdominios

- `tienda.tu-dominio.com`
- `adornos.tu-dominio.com`
- `shop.tu-dominio.com`
- `app.tu-dominio.com`
- `store.tu-dominio.com`

## Verificación Rápida

```bash
# Verificar DNS
nslookup tienda.tu-dominio.com

# Verificar que PM2 está corriendo
pm2 status

# Verificar que Nginx está configurado
sudo nginx -t

# Ver logs
pm2 logs adornos-cbk
```





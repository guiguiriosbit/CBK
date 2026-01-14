# Resumen Rápido de Despliegue

## Checklist Pre-Despliegue

- [ ] Aplicación funciona en desarrollo (`npm run build` sin errores)
- [ ] Variables de entorno de producción listas
- [ ] Claves de Stripe LIVE configuradas
- [ ] URL de Supabase de producción configurada
- [ ] Dominio apuntando al servidor

## Pasos Rápidos

1. **Preparar servidor**: Instalar Node.js y PM2
2. **Subir archivos**: SCP, Git o FTP
3. **Instalar dependencias**: `npm install --production`
4. **Configurar .env.local**: Variables de producción
5. **Construir**: `npm run build`
6. **Configurar Nginx**: Proxy a puerto 3000
7. **Iniciar con PM2**: `pm2 start ecosystem.config.js`
8. **Configurar SSL**: Let's Encrypt en Virtualmin
9. **Configurar Webhook Stripe**: URL de producción

## Archivos Importantes

- `ecosystem.config.js` - Configuración de PM2
- `nginx.conf.example` - Ejemplo de configuración Nginx
- `GUIA-DESPLIEGUE-UBUNTU.md` - Guía completa paso a paso

## Comandos Esenciales

```bash
# En el servidor
pm2 status                    # Ver estado
pm2 logs adornos-cbk          # Ver logs
pm2 restart adornos-cbk       # Reiniciar
pm2 stop adornos-cbk          # Detener
```





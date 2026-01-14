# Verificación Rápida: Configuración de Stripe

## ✅ Checklist de Configuración

### 1. Variables de Entorno
Asegúrate de tener estas variables en tu archivo `.env.local`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_tu_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
```

### 2. Verificar que las Variables Estén Cargadas

Ejecuta este comando para verificar:
```bash
# En desarrollo, las variables deberían estar disponibles
# Si no ves las variables, reinicia el servidor:
npm run dev
```

### 3. Obtener las Claves de Stripe

1. Ve a https://dashboard.stripe.com/test/apikeys
2. Copia tu **Publishable key** (empieza con `pk_test_`)
3. Copia tu **Secret key** (empieza con `sk_test_`)

### 4. Configurar Webhook (Opcional para desarrollo local)

Para desarrollo local, usa Stripe CLI:
```bash
# Instala Stripe CLI si no lo tienes
# macOS: brew install stripe/stripe-cli/stripe
# Luego ejecuta:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Esto te dará un `whsec_...` que puedes usar como `STRIPE_WEBHOOK_SECRET`.

### 5. Probar el Flujo de Pago

1. Agrega productos al carrito
2. Ve a `/checkout`
3. Completa la dirección de envío
4. Haz clic en "Continuar con el Pago"
5. Deberías ver el formulario de Stripe

### 6. Tarjetas de Prueba

Usa estas tarjetas para probar:

- **Pago exitoso**: `4242 4242 4242 4242`
- **Pago rechazado**: `4000 0000 0000 0002`
- **Requiere autenticación**: `4000 0025 0000 3155`

Usa cualquier fecha futura, cualquier CVC de 3 dígitos, y cualquier código postal.

## 🔍 Solución de Problemas

### Error: "Stripe no está configurado"
- Verifica que `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` esté en `.env.local`
- Reinicia el servidor de desarrollo
- Verifica que el archivo `.env.local` esté en la raíz del proyecto

### Error: "Error creando intención de pago"
- Verifica que `STRIPE_SECRET_KEY` esté configurada
- Verifica que la clave sea válida (no esté expirada)
- Revisa la consola del servidor para más detalles

### El formulario de pago no aparece
- Verifica la consola del navegador (F12) para errores
- Asegúrate de que el pedido se haya creado correctamente
- Verifica que `currentOrderId` no sea null

### Error 401: No autorizado
- Asegúrate de estar autenticado
- Verifica que la sesión de Supabase esté activa
- Intenta cerrar sesión y volver a iniciar sesión






# Configuración de Stripe

## Variables de Entorno Necesarias

Asegúrate de tener las siguientes variables de entorno configuradas en tu archivo `.env.local`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (si no están ya configuradas)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## Pasos de Configuración

1. **Crea una cuenta en Stripe** (https://stripe.com) si aún no tienes una
2. **Obtén tus API Keys** desde el Dashboard de Stripe:
   - Ve a Developers > API keys
   - Copia tu `Publishable key` (empieza con `pk_test_` o `pk_live_`)
   - Copia tu `Secret key` (empieza con `sk_test_` o `sk_live_`)

3. **Configura el Webhook**:
   - Ve a Developers > Webhooks en el Dashboard de Stripe
   - Haz clic en "Add endpoint"
   - URL del endpoint: `https://tu-dominio.com/api/webhooks/stripe`
   - Selecciona los siguientes eventos:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
   - Copia el "Signing secret" (empieza con `whsec_`)

4. **Ejecuta el script SQL** para crear la tabla de transacciones:
   - Ejecuta el archivo `scripts/005-create-transactions-table.sql` en tu base de datos Supabase

## Flujo de Pago

El flujo de pago funciona de la siguiente manera:

1. Usuario completa la dirección de envío
2. Se crea un pedido (order) en estado "pending"
3. Se muestra el formulario de pago de Stripe
4. Usuario ingresa los datos de su tarjeta
5. Al completar el pago exitosamente:
   - Se actualiza el pedido a "paid" y estado "processing"
   - Se actualiza el stock de productos
   - Se limpia el carrito
   - Se envía una confirmación

## Moneda

La aplicación está configurada para usar MXN (Pesos Mexicanos) por defecto. Si necesitas cambiar la moneda, actualiza el valor de `currency` en:

- `app/checkout/page.tsx` (línea 419)
- `app/api/payments/create-intent/route.ts` (línea 24)
- `components/checkout/checkout-wrapper.tsx` (línea 24)
- `components/checkout/payment-form.tsx` (línea 19)

## Pruebas

Para probar con tarjetas de prueba de Stripe:

- **Tarjeta exitosa**: 4242 4242 4242 4242
- **Tarjeta rechazada**: 4000 0000 0000 0002
- **Requiere autenticación**: 4000 0025 0000 3155

Usa cualquier fecha futura como fecha de expiración, cualquier CVC de 3 dígitos, y cualquier código postal.



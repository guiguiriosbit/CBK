# Instrucciones para Configurar Supabase

## Paso 1: Crear o Acceder a tu Proyecto de Supabase

1. Ve a https://supabase.com/dashboard
2. Inicia sesión o crea una cuenta
3. Si no tienes proyecto:
   - Haz clic en "New Project"
   - Nombre: "Adornos CBK"
   - Contraseña de base de datos: Crea una contraseña segura (guárdala)
   - Región: Elige la más cercana a ti
   - Espera 1-2 minutos a que se cree

## Paso 2: Obtener las Credenciales

1. En el dashboard de tu proyecto, ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** key (empieza con `eyJ...`)
   - **service_role** key (empieza con `eyJ...`)

## Paso 3: Actualizar Variables de Entorno

Abre tu archivo `.env.local` y actualiza:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

## Paso 4: Ejecutar el Script SQL

**Si ya tienes tablas creadas (como muestra el diagrama ERD):**
1. En el dashboard de Supabase, ve a **SQL Editor** (icono de base de datos en el menú lateral)
2. Haz clic en **"New query"**
3. Abre el archivo `scripts/001-VERIFICAR-Y-COMPLETAR.sql` en tu editor
4. Copia TODO el contenido del archivo
5. Pégalo en el SQL Editor de Supabase
6. Haz clic en **"Run"** o presiona `Ctrl+Enter` (o `Cmd+Enter` en Mac)
7. Este script verifica qué existe y solo crea/actualiza lo necesario

**Si NO tienes tablas creadas:**
1. Usa el archivo `scripts/000-SETUP-COMPLETO.sql` en su lugar
2. Sigue los mismos pasos anteriores

## Paso 5: Convertirte en Administrador

1. Ve a **Authentication** → **Users** en el dashboard
2. Encuentra tu usuario y copia tu **email**
3. Ve de nuevo al **SQL Editor**
4. Ejecuta este comando (reemplaza `TU_EMAIL_AQUI` con tu email real):

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'TU_EMAIL_AQUI';
```

5. Haz clic en **"Run"**

## Paso 6: Verificar que Todo Funciona

1. Reinicia tu servidor de desarrollo:
```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciarlo
npm run dev
```

2. Abre http://localhost:3000
3. Deberías ver la página de inicio sin errores
4. Si te registras o inicias sesión, deberías tener acceso al panel de administración

## Verificación Rápida

Para verificar que las tablas se crearon correctamente:

1. Ve a **Table Editor** en el dashboard de Supabase
2. Deberías ver estas tablas:
   - profiles
   - categories
   - products
   - orders
   - order_items
   - cart_items
   - shipping_addresses
   - transactions

## Solución de Problemas

### Error: "relation already exists"
- Esto significa que algunas tablas ya existen. El script usa `CREATE TABLE IF NOT EXISTS`, así que es seguro ejecutarlo de nuevo.

### Error: "permission denied"
- Asegúrate de estar ejecutando el script en el SQL Editor, no en otro lugar.

### No puedo ver productos en la página
- Verifica que ejecutaste la parte de "DATOS DE PRUEBA" del script
- O agrega productos manualmente desde el panel de administración

### No tengo acceso de administrador
- Asegúrate de haber ejecutado el paso 5 correctamente
- Verifica que el email en el UPDATE coincide exactamente con tu email de usuario


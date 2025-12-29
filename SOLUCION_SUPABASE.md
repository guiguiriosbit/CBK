# Solución: Error de Conexión con Supabase

## Problema
El dominio `iklscqudhhjvrlttqbrx.supabase.co` no existe. Esto significa que:
- El proyecto de Supabase fue eliminado o pausado
- La URL está incorrecta
- El proyecto nunca existió con ese ID

## Soluciones

### Opción 1: Verificar tu proyecto de Supabase existente

1. Ve a https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Si tienes un proyecto existente:
   - Haz clic en el proyecto
   - Ve a Settings > API
   - Copia la **Project URL** (debe ser algo como `https://xxxxx.supabase.co`)
   - Copia la **anon public** key

4. Actualiza tu archivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO_REAL.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_real
```

### Opción 2: Crear un nuevo proyecto de Supabase

1. Ve a https://supabase.com/dashboard
2. Haz clic en "New Project"
3. Completa el formulario:
   - **Name**: Adornos CBK (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala)
   - **Region**: Elige la región más cercana a ti
   - **Pricing Plan**: Free tier está bien para empezar

4. Espera a que se cree el proyecto (puede tardar 1-2 minutos)

5. Una vez creado:
   - Ve a Settings > API
   - Copia la **Project URL**
   - Copia la **anon public** key
   - Copia la **service_role** key (para webhooks)

6. Actualiza tu archivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_NUEVO_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_nueva_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### Opción 3: Reactivar un proyecto pausado

Si tu proyecto fue pausado (proyectos gratuitos se pausan después de inactividad):

1. Ve a https://supabase.com/dashboard
2. Busca tu proyecto en la lista
3. Si está pausado, haz clic en "Restore" o "Resume"
4. Espera a que se reactive

## Después de actualizar las variables de entorno

1. **Ejecuta los scripts SQL** en tu proyecto de Supabase:
   - Ve a SQL Editor en el dashboard de Supabase
   - Ejecuta en este orden:
     1. `scripts/001-create-tables.sql`
     2. `scripts/002-row-level-security.sql`
     3. `scripts/003-seed-data.sql` (opcional, para datos de prueba)
     4. `scripts/005-create-transactions-table.sql` (para Stripe)

2. **Reinicia el servidor de desarrollo**:
```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciarlo
npm run dev
```

3. **Verifica la conexión**:
   - Abre http://localhost:3000
   - Deberías ver la página de inicio sin errores

## Verificar que todo funciona

1. La página de inicio debería cargar sin el error de conexión
2. Si no hay productos o categorías, verás mensajes informativos
3. Puedes agregar productos desde el panel de administración

## Nota sobre el Service Role Key

El `SUPABASE_SERVICE_ROLE_KEY` en tu `.env.local` tiene un formato incorrecto (tiene `<` y `>` alrededor). Debería ser solo la clave sin esos caracteres:

```env
# ❌ Incorrecto
SUPABASE_SERVICE_ROLE_KEY=<eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...>

# ✅ Correcto
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```




import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { CategoryCard } from "@/components/category-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Snowflake, Gift, Truck, Shield, Search, LayoutDashboard } from "lucide-react"
import Link from "next/link"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; buscar?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // 1. Lógica de verificación de Rol (Admin)
  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    
    isAdmin = profile?.role === "admin"
  }

  // Obtener categorías
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  // Obtener productos
  let query = supabase.from("products").select("*, categories(name)").eq("is_active", true)

  if (params.categoria) {
    const { data: category } = await supabase.from("categories").select("id").eq("name", params.categoria).single()
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  if (params.buscar) {
    query = query.ilike("name", `%${params.buscar}%`)
  }

  const { data: products, error: productsError } = await query
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })

  // Error de Conexión - solo mostrar si es un error crítico de conexión
  // Si hay errores menores o las tablas están vacías, continuar normalmente
  const hasError = categoriesError || productsError
  const errorMessage = categoriesError?.message || productsError?.message || ''
  const errorCode = categoriesError?.code || productsError?.code || ''
  const errorDetails = categoriesError?.details || productsError?.details || ''
  
  // Detectar diferentes tipos de errores
  const isDomainNotFound = errorDetails.includes('ENOTFOUND') || errorMessage.includes('ENOTFOUND')
  const isServerDown = errorMessage.includes('521') || errorMessage.includes('Web server is down') || errorMessage.includes('Error code 521')
  const isCloudflareError = errorMessage.includes('Cloudflare') && (errorMessage.includes('521') || errorMessage.includes('Web server is down'))
  
  // Solo mostrar error si es un problema crítico de conexión o tabla no encontrada
  const isCriticalError = hasError && (
    errorCode === 'PGRST116' || // Tabla no encontrada
    isDomainNotFound || // Dominio de Supabase no existe
    isServerDown || // Servidor caído (error 521)
    isCloudflareError || // Error de Cloudflare
    errorMessage.toLowerCase().includes('connection') ||
    errorMessage.toLowerCase().includes('timeout') ||
    errorMessage.toLowerCase().includes('network') ||
    errorMessage.toLowerCase().includes('fetch failed') ||
    errorMessage.toLowerCase().includes('failed to fetch')
  )
  
  if (isCriticalError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative flex items-center justify-center">
                {/* Cuadrado exterior rotado con borde rojo */}
                <div className="absolute h-32 w-32 rounded-lg border-[3px] border-red-600 rotate-45"></div>
                {/* Escudo interior con borde rojo */}
                <Shield className="h-24 w-24 text-red-600 relative z-10" strokeWidth={2.5} fill="none" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {isServerDown || isCloudflareError 
                ? 'Servidor de Supabase No Disponible' 
                : isDomainNotFound 
                ? 'Proyecto de Supabase No Encontrado' 
                : 'Error de Conexión Temporal'}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isServerDown || isCloudflareError ? (
                <>
                  El proyecto de Supabase está <strong>pausado, eliminado o el servidor está caído</strong> (Error 521). 
                  Necesitas reactivarlo o crear un nuevo proyecto en{' '}
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    supabase.com/dashboard
                  </a>
                </>
              ) : isDomainNotFound ? (
                <>
                  El proyecto de Supabase configurado no existe o fue eliminado. 
                  Necesitas crear un nuevo proyecto o actualizar la URL en tu archivo <code className="bg-muted px-1 rounded">.env.local</code>
                </>
              ) : (
                'No se pudo conectar con la base de datos. Por favor, verifica tu conexión a internet e intenta nuevamente.'
              )}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-muted rounded-lg text-left max-w-md mx-auto text-sm space-y-2">
                <p className="font-semibold mb-2">Detalles del error (solo desarrollo):</p>
                {categoriesError && (
                  <div>
                    <p className="font-medium text-destructive">Error en Categorías:</p>
                    <p className="text-xs text-muted-foreground">Código: {categoriesError.code || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">Mensaje: {categoriesError.message || 'Sin mensaje'}</p>
                    <p className="text-xs text-muted-foreground">Detalles: {JSON.stringify(categoriesError, null, 2)}</p>
                  </div>
                )}
                {productsError && (
                  <div>
                    <p className="font-medium text-destructive">Error en Productos:</p>
                    <p className="text-xs text-muted-foreground">Código: {productsError.code || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">Mensaje: {productsError.message || 'Sin mensaje'}</p>
                    <p className="text-xs text-muted-foreground">Detalles: {JSON.stringify(productsError, null, 2)}</p>
                  </div>
                )}
                <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs font-medium text-yellow-800">
                    {(isServerDown || isCloudflareError || isDomainNotFound) ? 'Pasos para solucionar:' : 'Sugerencias:'}
                  </p>
                  {(isServerDown || isCloudflareError) ? (
                    <ol className="text-xs text-yellow-700 mt-1 list-decimal list-inside space-y-2">
                      <li>Ve a <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium">https://supabase.com/dashboard</a> e inicia sesión</li>
                      <li>Busca tu proyecto <code className="bg-yellow-100 px-1 rounded">iklscqudhhjvrlttqbrx</code> en la lista</li>
                      <li>Si está <strong>pausado</strong>, haz clic en "Restore" o "Resume" para reactivarlo</li>
                      <li>Si el proyecto fue <strong>eliminado</strong>, necesitas crear uno nuevo:
                        <ul className="ml-4 mt-1 list-disc space-y-1">
                          <li>Haz clic en "New Project"</li>
                          <li>Completa el formulario y espera 1-2 minutos</li>
                          <li>Copia la nueva URL y keys desde Settings → API</li>
                          <li>Actualiza tu archivo <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
                        </ul>
                      </li>
                      <li>Ejecuta los scripts SQL en el SQL Editor de Supabase</li>
                      <li>Reinicia el servidor de desarrollo</li>
                    </ol>
                  ) : isDomainNotFound ? (
                    <ol className="text-xs text-yellow-700 mt-1 list-decimal list-inside space-y-2">
                      <li>Ve a <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium">https://supabase.com/dashboard</a> e inicia sesión</li>
                      <li>Crea un nuevo proyecto o selecciona uno existente</li>
                      <li>Ve a Settings → API y copia la <strong>Project URL</strong> y la <strong>anon public key</strong></li>
                      <li>Actualiza tu archivo <code className="bg-yellow-100 px-1 rounded">.env.local</code> con las nuevas credenciales:
                        <pre className="mt-1 p-2 bg-yellow-100 rounded text-[10px] overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui`}
                        </pre>
                      </li>
                      <li>Ejecuta los scripts SQL en el SQL Editor de Supabase (ver archivo SOLUCION_SUPABASE.md)</li>
                      <li>Reinicia el servidor de desarrollo</li>
                    </ol>
                  ) : (
                    <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside space-y-1">
                      <li>Verifica que las tablas 'categories' y 'products' existan en Supabase</li>
                      <li>Verifica las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                      <li>Ejecuta los scripts SQL en el orden: 001-create-tables.sql, 002-row-level-security.sql</li>
                      <li>Verifica que las políticas RLS permitan lectura pública de categorías y productos</li>
                    </ul>
                  )}
                </div>
              </div>
            )}
            <Button 
              className="mt-6 bg-red-600 hover:bg-red-700 text-white rounded-lg px-8 py-6 text-base font-medium" 
              asChild
            >
              <Link href="/">Reintentar</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Asegurar que products y categories sean arrays, incluso si son null/undefined
  const safeProducts = products || []
  const safeCategories = categories || []
  const featuredProducts = safeProducts.filter((p) => p?.featured).slice(0, 3) || []

  return (
    <div className="min-h-screen">
      <Header />

      {/* Barra de acceso rápido exclusiva para Admin */}
      {isAdmin && (
        <div className="bg-red-900 text-white py-2 px-4 flex justify-center items-center gap-4 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <span className="flex items-center gap-1 uppercase tracking-wider">
            <Shield className="h-3 w-3" /> Panel Administrativo
          </span>
          <Link href="/admin/dashboard" className="bg-white text-red-900 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1">
            <LayoutDashboard className="h-3 w-3" /> Entrar al Dashboard
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 bg-[url('/hero-bg.png')] bg-cover bg-center bg-no-repeat">
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600 shadow-lg">
                <Snowflake className="h-12 w-12 text-white animate-spin-slow" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl drop-shadow-lg [text-shadow:_2px_2px_4px_rgba(0,0,0,0.8)]">
              Haz de esta Navidad algo especial
            </h1>
            <p className="mb-8 text-lg text-white md:text-xl [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">
              Encuentra los mejores adornos navideños para decorar tu hogar.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-red-600 hover:bg-red-700" asChild>
                <Link href="#productos">Ver Productos</Link>
              </Button>
              
              {/* Botón condicional según el Rol */}
              {isAdmin ? (
                <Button size="lg" variant="secondary" className="bg-green-600 text-white hover:bg-green-700" asChild>
                  <Link href="/admin/dashboard">
                    <LayoutDashboard className="mr-2 h-5 w-5" /> Administrar Tienda
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="outline" className="bg-white/90" asChild>
                  <Link href="#categorias">Explorar Categorías</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="border-b bg-muted/50 py-12">
        <div className="container mx-auto px-4 grid gap-8 md:grid-cols-3">
          <div className="flex items-start gap-4">
            <Truck className="h-10 w-10 text-red-600" />
            <div><h3 className="font-semibold">Envío a Domicilio</h3><p className="text-sm text-muted-foreground">Toda la república mexicana</p></div>
          </div>
          <div className="flex items-start gap-4">
            <Shield className="h-10 w-10 text-red-600" />
            <div><h3 className="font-semibold">Compra Segura</h3><p className="text-sm text-muted-foreground">Tus datos están protegidos</p></div>
          </div>
          <div className="flex items-start gap-4">
            <Gift className="h-10 w-10 text-red-600" />
            <div><h3 className="font-semibold">Calidad Premium</h3><p className="text-sm text-muted-foreground">Garantía en cada adorno</p></div>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-2 text-3xl font-bold">Productos Destacados</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} price={Number(product.price)} imageUrl={product.image_url || "/placeholder.svg"} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categorías */}
      <section id="categorias" className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-8 text-3xl font-bold">Categorías</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {safeCategories.length > 0 ? (
              safeCategories.map((cat) => (
                <CategoryCard key={cat.id} {...cat} imageUrl={cat.image_url || "/placeholder.svg"} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No hay categorías disponibles</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Catálogo Completo */}
      <section id="productos" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-3xl font-bold">Todos los Productos</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {safeProducts.length > 0 ? (
              safeProducts.map((product) => (
                <ProductCard key={product.id} {...product} price={Number(product.price)} imageUrl={product.image_url || "/placeholder.svg"} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No hay productos disponibles</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer con enlace seguro */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container mx-auto px-4 grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Snowflake className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold">Adornos CBK</span>
            </div>
            <p className="text-sm text-muted-foreground">Haciendo tu Navidad especial desde el primer adorno.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Enlaces</h4>
            <ul className="text-sm space-y-2">
              <li><Link href="/" className="hover:text-red-600">Inicio</Link></li>
              {isAdmin && (
                <li><Link href="/admin/dashboard" className="text-red-600 font-bold">Admin</Link></li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Cuenta</h4>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li><Link href="/auth/login" className="hover:text-foreground">Iniciar Sesión</Link></li>
              <li><Link href="/cliente/dashboard" className="hover:text-foreground">Mi Perfil</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
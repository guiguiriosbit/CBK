import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { CategoryCard } from "@/components/category-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Snowflake, Gift, Truck, Shield, Search } from "lucide-react"
import Link from "next/link"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; buscar?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Obtener categorías con manejo de errores
  const { data: categories, error: categoriesError } = await supabase.from("categories").select("*").order("name")

  if (categoriesError) {
    console.log("[v0] Error fetching categories:", categoriesError)
  }

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

  if (productsError) {
    console.log("[v0] Error fetching products:", productsError)
  }

  // Mostrar mensaje de error si hay problemas de conexión
  if (categoriesError || productsError) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
            <div className="mb-4 flex justify-center">
              <Shield className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Error de Conexión Temporal</h2>
            <p className="mb-4 text-muted-foreground">
              Lo sentimos, estamos experimentando problemas técnicos temporales con la base de datos. Por favor, intenta
              de nuevo en unos minutos.
            </p>
            <p className="text-sm text-muted-foreground">
              Si el problema persiste, contacta al administrador del sitio.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/">Reintentar</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Productos destacados
  const featuredProducts = products?.filter((p) => p.featured).slice(0, 3) || []

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-0">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 
             bg-[url('/hero-bg.png')] bg-cover bg-center bg-no-repeat">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg">
                  <Snowflake className="h-12 w-12 animate-spin-slow text-primary-foreground" />
                </div>
              </div>
              <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-white md:text-6xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)]
             [text-shadow:_2px_2px_4px_rgba(0,0,0,0.8)]
             [text-stroke:_2px_black]">
                Haz de esta Navidad algo especial
              </h1>
              <p className="mb-8 text-pretty text-lg text-white md:text-xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)]
             [text-shadow:_2px_2px_4px_rgba(0,0,0,0.8)]
             [text-stroke:_2px_black]">
                Encuentra los mejores adornos navideños para decorar tu hogar. Árboles, luces, ornamentos y mucho más.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                  <Link href="#productos">Ver Productos</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#categorias">Explorar Categorías</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="pointer-events-none absolute left-10 top-20 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-20 right-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
          </div>
      </section>

      {/* Features */}
      <section className="border-b border-border bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Envío a Domicilio</h3>
                <p className="text-sm text-muted-foreground">Entrega en toda la república mexicana</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Compra Segura</h3>
                <p className="text-sm text-muted-foreground">Tus datos están protegidos</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Productos de Calidad</h3>
                <p className="text-sm text-muted-foreground">Garantía en todos nuestros productos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold text-foreground">Productos Destacados</h2>
              <p className="text-muted-foreground">Los favoritos de la temporada</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description || ""}
                  price={Number(product.price)}
                  imageUrl={product.image_url || "/placeholder.svg"}
                  stock={product.stock}
                  featured={product.featured}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section id="categorias" className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-foreground">Categorías</h2>
            <p className="text-muted-foreground">Explora nuestra variedad de adornos</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories?.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                description={category.description || ""}
                imageUrl={category.image_url || "/placeholder.svg"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Products Catalog */}
      <section id="productos" className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="mb-6 text-3xl font-bold text-foreground">Todos los Productos</h2>

            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar productos..." className="pl-10" />
              </div>
              <Select defaultValue={params.categoria}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {products && products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description || ""}
                  price={Number(product.price)}
                  imageUrl={product.image_url || "/placeholder.svg"}
                  stock={product.stock}
                  featured={product.featured}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No se encontraron productos</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <Snowflake className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-primary">Adornos CBK</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Tu tienda de confianza para decoraciones navideñas. Hacemos que cada Navidad sea especial.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Enlaces</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/#productos" className="hover:text-foreground">
                    Productos
                  </Link>
                </li>
                <li>
                  <Link href="/#categorias" className="hover:text-foreground">
                    Categorías
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Cuenta</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/auth/login" className="hover:text-foreground">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link href="/auth/registro" className="hover:text-foreground">
                    Registrarse
                  </Link>
                </li>
                <li>
                  <Link href="/cliente/dashboard" className="hover:text-foreground">
                    Mi Cuenta
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Adornos Navideños. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

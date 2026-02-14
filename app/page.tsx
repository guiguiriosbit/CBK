import { prisma } from "@/lib/db/prisma"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { getProductImageUrl } from "@/lib/product-images"
import { Snowflake, Gift, Truck, Shield, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { HomeCategorySelect } from "@/components/home-category-select"

// Evitar caché: al marcar un producto como destacado en admin, debe verse al instante en inicio
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; buscar?: string }>
}) {
  const params = await searchParams
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role ?? "cliente"
  const isAdmin = role === "admin"

  // Filtros para productos (categoría + búsqueda) usando Prisma
  const where: any = { isActive: true }

  if (params.categoria) {
    // Filtrar por nombre de categoría
    where.category = { name: params.categoria }
  }

  if (params.buscar) {
    where.name = { contains: params.buscar, mode: "insensitive" }
  }

  const [categoriesRaw, productsRaw] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
  ])

  // Adaptar nombres de campos para que el resto del componente no cambie
  const categories = categoriesRaw.map((cat) => ({
    ...cat,
    image_url: cat.imageUrl,
  }))

  const products = productsRaw.map((product) => ({
    ...product,
    image_url: product.imageUrl,
    categories: product.category ? { name: product.category.name } : null,
    isNew: product.isNew || false,
  }))

  // Asegurar que products y categories sean arrays, incluso si son null/undefined
  const safeProducts = products || []
  const safeCategories = categories || []
  const featuredProducts = safeProducts.filter((p) => p?.featured) || []

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
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-6 text-3xl font-bold">Productos Destacados</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} {...product} price={Number(product.price)} imageUrl={getProductImageUrl(product.image_url, product.name, product.categories?.name)} isNew={product.isNew} priority={i < 3} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categorías - filtro simple sin imágenes */}
      <section id="categorias" className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          {safeCategories.length > 0 ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground shrink-0">
                Filtrar por:
              </span>
              <div className="w-full max-w-xs">
                <HomeCategorySelect
                  categories={safeCategories.map((cat) => cat.name)}
                  selectedCategory={params.categoria}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay categorías disponibles</p>
            </div>
          )}
        </div>
      </section>

      {/* Catálogo Completo */}
      <section id="productos" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-3xl font-bold">
            {params.categoria ? params.categoria : "Todos los Productos"}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {safeProducts.length > 0 ? (
              safeProducts.map((product) => (
                <ProductCard key={product.id} {...product} price={Number(product.price)} imageUrl={getProductImageUrl(product.image_url, product.name, product.categories?.name)} isNew={product.isNew} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No hay productos disponibles</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer isAdmin={isAdmin} />
    </div>
  )
}
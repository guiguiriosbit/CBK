import { notFound } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Truck, Shield, ArrowLeft, Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { getProductImageUrl } from "@/lib/product-images"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!product || !product.isActive) {
    notFound()
  }

  const price = Number(product.price)
  const discountPercent = product.discountPercent ? Number(product.discountPercent) : null
  const finalPrice = discountPercent ? price * (1 - discountPercent / 100) : price

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Imagen del producto */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  <Image
                    src={getProductImageUrl(product.imageUrl, product.name, product.category?.name) || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                {product.featured && (
                  <Badge className="bg-secondary text-secondary-foreground">Destacado</Badge>
                )}
                {product.isNew && (
                  <Badge className="bg-green-600 text-white">Nuevo</Badge>
                )}
                {product.category && (
                  <Badge variant="outline">{product.category.name}</Badge>
                )}
              </div>
              <h1 className="mb-4 text-4xl font-bold">{product.name}</h1>
              {product.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Precio */}
            <div className="rounded-lg border bg-muted/50 p-6">
              <div className="mb-4">
                {discountPercent && discountPercent > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm text-muted-foreground line-through">
                        ${price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-4xl font-bold text-green-600">
                        ${finalPrice.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Badge className="bg-green-600 text-white">
                      {discountPercent.toFixed(0)}% de descuento
                    </Badge>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-primary">
                    ${price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="mb-6 flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      {product.stock} unidades disponibles
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-destructive">Agotado</span>
                  </>
                )}
              </div>

              {/* Botón agregar al carrito */}
              <AddToCartButton
                productId={product.id}
                disabled={product.stock === 0}
                className="w-full"
                size="lg"
              />
            </div>

            {/* Características */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Características</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Envío a Domicilio</p>
                      <p className="text-sm text-muted-foreground">Toda la república mexicana</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Compra Segura</p>
                      <p className="text-sm text-muted-foreground">Tus datos están protegidos</p>
                    </div>
                  </div>
                  {product.category && (
                    <div className="flex items-start gap-3">
                      <span className="text-red-600 shrink-0 mt-0.5">🏷️</span>
                      <div>
                        <p className="font-medium">Categoría</p>
                        <p className="text-sm text-muted-foreground">{product.category.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

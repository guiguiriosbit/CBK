"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getProductImageUrl } from "@/lib/product-images"

interface CartItem {
  id: string
  quantity: number
  product_id: string
  products: {
    id: string
    name: string
    price: number
    image_url: string
    stock: number
  }
}

export default function CarritoPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/cart")

      if (res.status === 401) {
        router.push("/auth/login")
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.error || "Error al cargar el carrito"
        throw new Error(message)
      }

      const data = await res.json()
      setCartItems(data.items as CartItem[])
    } catch (error) {
      console.error("Error loading cart:", error)
      toast.error("Error al cargar el carrito")
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1) return
    if (newQuantity > maxStock) {
      toast.error("No hay suficiente stock disponible")
      return
    }

    setIsUpdating(itemId)

    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      })

      if (res.status === 401) {
        router.push("/auth/login")
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.error || "Error al actualizar cantidad"
        throw new Error(message)
      }

      setCartItems((items) => items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
      window.dispatchEvent(new CustomEvent("cart-updated"))
      toast.success("Cantidad actualizada")
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast.error("Error al actualizar cantidad")
    } finally {
      setIsUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    setIsUpdating(itemId)

    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })

      if (res.status === 401) {
        router.push("/auth/login")
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.error || "Error al eliminar producto"
        throw new Error(message)
      }

      setCartItems((items) => items.filter((item) => item.id !== itemId))
      window.dispatchEvent(new CustomEvent("cart-updated"))
      toast.success("Producto eliminado del carrito")
      router.refresh()
    } catch (error) {
      console.error("Error removing item:", error)
      toast.error("Error al eliminar producto")
    } finally {
      setIsUpdating(null)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const shipping = subtotal > 1000 ? 0 : 150
    return subtotal + shipping
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
          <div className="text-center">
            <p className="text-muted-foreground">Cargando carrito...</p>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="text-center">Tu carrito está vacío</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">Agrega productos para comenzar tu compra navideña</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                <Link href="/">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Ver Productos
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Carrito de Compras</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Productos ({cartItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={getProductImageUrl(item.products.image_url, item.products.name)}
                        alt={item.products.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-semibold">{item.products.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${item.products.price.toLocaleString("es-MX")} c/u
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.products.stock)}
                            disabled={isUpdating === item.id || item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={item.products.stock}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, Number.parseInt(e.target.value) || 1, item.products.stock)
                            }
                            className="h-8 w-16 text-center"
                            disabled={isUpdating === item.id}
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.products.stock)}
                            disabled={isUpdating === item.id || item.quantity >= item.products.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          <p className="text-lg font-bold">
                            ${(item.products.price * item.quantity).toLocaleString("es-MX")}
                          </p>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                            disabled={isUpdating === item.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${calculateSubtotal().toLocaleString("es-MX")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="font-medium">
                    {calculateSubtotal() > 1000 ? (
                      <span className="text-secondary">Gratis</span>
                    ) : (
                      `$${(150).toLocaleString("es-MX")}`
                    )}
                  </span>
                </div>
                {calculateSubtotal() <= 1000 && (
                  <p className="text-xs text-muted-foreground">
                    Agrega ${(1000 - calculateSubtotal()).toLocaleString("es-MX")} más para envío gratis
                  </p>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">${calculateTotal().toLocaleString("es-MX")}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button className="w-full bg-primary hover:bg-primary/90" size="lg" asChild>
                  <Link href="/checkout">
                    Proceder al Pago
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/">Seguir Comprando</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

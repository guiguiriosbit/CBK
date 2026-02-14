"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Minus, Plus } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ProductCardProps {
  id: string
  name: string
  description?: string | null
  price: number
  imageUrl: string
  stock: number
  featured?: boolean
  isNew?: boolean
  /** Prioridad LCP: usar en los primeros 3 productos visibles */
  priority?: boolean
}

export function ProductCard({ id, name, description = "", price, imageUrl, stock, featured, isNew, priority }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const router = useRouter()

  const maxQty = Math.max(0, stock)
  const qty = Math.min(Math.max(1, quantity), maxQty || 1)

  const handleCardClick = () => {
    router.push(`/productos/${id}`)
  }

  const addToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAdding(true)

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity: qty }),
      })

      if (res.status === 401) {
        router.push("/auth/login")
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Error al agregar al carrito")
      }

      toast.success(qty > 1 ? `${qty} productos agregados` : "Producto agregado al carrito")
      window.dispatchEvent(new CustomEvent("cart-updated"))
      router.refresh()
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Error al agregar al carrito")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card 
      className="group relative overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
        {featured && (
          <Badge className="bg-secondary text-secondary-foreground">Destacado</Badge>
        )}
        {isNew && (
          <Badge className="bg-green-600 text-white">Nuevo</Badge>
        )}
      </div>
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            fill
            priority={priority}
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 p-3">
        <div className="w-full space-y-1">
          <h3 className="line-clamp-1 font-semibold text-sm text-foreground">{name}</h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">${price.toLocaleString("es-MX")}</span>
              <span className="text-[10px] text-muted-foreground">{stock > 0 ? `${stock} disponibles` : "Agotado"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center rounded-md border border-input bg-background">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 rounded-l-md rounded-r-none"
                disabled={qty <= 1 || isAdding || stock === 0}
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="min-w-[24px] px-1 text-center text-xs font-medium">{qty}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 rounded-l-none rounded-r-md"
                disabled={qty >= maxQty || isAdding || stock === 0}
                onClick={() => setQuantity((prev) => Math.min(maxQty || 1, prev + 1))}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Button
              onClick={addToCart}
              disabled={isAdding || stock === 0}
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90 text-xs h-7 px-2"
            >
              <ShoppingCart className="mr-1 h-3 w-3" />
              {isAdding ? "..." : "Agregar"}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

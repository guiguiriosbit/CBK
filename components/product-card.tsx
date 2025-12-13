"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  stock: number
  featured?: boolean
}

export function ProductCard({ id, name, description, price, imageUrl, stock, featured }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()

  const addToCart = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsAdding(true)

    try {
      // Verificar si ya existe en el carrito
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", id)
        .single()

      if (existingItem) {
        // Actualizar cantidad
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id)

        if (error) throw error
      } else {
        // Crear nuevo item
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: id,
          quantity: 1,
        })

        if (error) throw error
      }

      toast.success("Producto agregado al carrito")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error adding to cart:", error)
      toast.error("Error al agregar al carrito")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      {featured && (
        <Badge className="absolute left-3 top-3 z-10 bg-secondary text-secondary-foreground">Destacado</Badge>
      )}
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 p-4">
        <div className="w-full space-y-1">
          <h3 className="line-clamp-1 font-semibold text-foreground">{name}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary">${price.toLocaleString("es-MX")}</span>
            <span className="text-xs text-muted-foreground">{stock > 0 ? `${stock} disponibles` : "Agotado"}</span>
          </div>
          <Button
            onClick={addToCart}
            disabled={isAdding || stock === 0}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isAdding ? "Agregando..." : "Agregar"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

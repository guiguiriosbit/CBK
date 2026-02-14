"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface AddToCartButtonProps {
  productId: string
  stock?: number
  disabled?: boolean
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
}

export function AddToCartButton({ productId, stock = 999, disabled, className, size = "default" }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const router = useRouter()

  const maxQty = Math.max(0, stock)
  const qty = Math.min(Math.max(1, quantity), maxQty || 1)

  const handleAddToCart = async () => {
    setIsAdding(true)

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      })

      if (res.status === 401) {
        router.push("/auth/login")
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Error al agregar al carrito")
      }

      toast.success(qty > 1 ? `${qty} productos agregados al carrito` : "Producto agregado al carrito")
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
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center rounded-md border border-input bg-background">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-l-md rounded-r-none"
          disabled={qty <= 1 || isAdding || disabled}
          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-[36px] px-2 text-center text-sm font-medium tabular-nums">{qty}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-l-none rounded-r-md"
          disabled={qty >= maxQty || isAdding || disabled}
          onClick={() => setQuantity((prev) => Math.min(maxQty || 1, prev + 1))}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button
        onClick={handleAddToCart}
        disabled={isAdding || disabled}
        size={size}
        className="flex-1 bg-red-600 hover:bg-red-700"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isAdding ? "Agregando..." : "Agregar al Carrito"}
      </Button>
    </div>
  )
}

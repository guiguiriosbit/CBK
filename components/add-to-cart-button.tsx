"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface AddToCartButtonProps {
  productId: string
  disabled?: boolean
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
}

export function AddToCartButton({ productId, disabled, className, size = "default" }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()

  const handleAddToCart = async () => {
    setIsAdding(true)

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      })

      if (res.status === 401) {
        router.push("/auth/login")
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.error || "Error al agregar al carrito"
        throw new Error(message)
      }

      toast.success("Producto agregado al carrito")
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
    <Button
      onClick={handleAddToCart}
      disabled={isAdding || disabled}
      size={size}
      className={cn("bg-red-600 hover:bg-red-700", className)}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isAdding ? "Agregando..." : "Agregar al Carrito"}
    </Button>
  )
}

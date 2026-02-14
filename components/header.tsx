"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Snowflake, ShoppingCart, User, LogOut, LayoutDashboard, Gift, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

async function fetchCartCount(): Promise<number> {
  const res = await fetch("/api/cart")
  if (!res.ok) return 0
  const data = await res.json()
  const items = data?.items ?? []
  return items.reduce((sum: number, item: { quantity: number }) => sum + (item.quantity || 0), 0)
}

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)

  const user = session?.user ?? null
  const role = (session?.user as any)?.role ?? "cliente"

  const refreshCartCount = () => {
    if (user) fetchCartCount().then(setCartCount)
    else setCartCount(0)
  }

  useEffect(() => {
    refreshCartCount()
  }, [user])

  useEffect(() => {
    const handler = () => refreshCartCount()
    window.addEventListener("cart-updated", handler)
    return () => window.removeEventListener("cart-updated", handler)
  }, [user])

  const handleSignOut = async () => {
    try {
      // Cerrar sesión con NextAuth
      await signOut({ 
        redirect: true,
        callbackUrl: "/"
      })
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Si falla, forzar redirección manual
      router.push("/")
      // Forzar recarga completa para limpiar el estado
      setTimeout(() => {
        window.location.href = "/"
      }, 100)
    }
  }

  // Determinar la ruta del dashboard dinámicamente según el rol
  const dashboardHref = role === "admin" ? "/admin/dashboard" : "/cliente/dashboard"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-red-900/30 bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white shadow-lg backdrop-blur supports-[backdrop-filter]:bg-red-900/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40">
            <Snowflake className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white [text-shadow:_0_2px_4px_rgba(0,0,0,0.4)]">Adornos CBK</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-amber-300 transition-colors hover:text-amber-100 [text-shadow:_0_1px_3px_rgba(0,0,0,0.4)]">
            Inicio
          </Link>
          <Link href="/#productos" className="text-sm font-medium text-amber-300 transition-colors hover:text-amber-100 [text-shadow:_0_1px_3px_rgba(0,0,0,0.4)]">
            Productos
          </Link>
          <Link href="/#categorias" className="text-sm font-medium text-amber-300 transition-colors hover:text-amber-100 [text-shadow:_0_1px_3px_rgba(0,0,0,0.4)]">
            Categorías
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20 hover:text-white" asChild>
            <Link href="/carrito">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center" variant="destructive">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs font-semibold">Mi Cuenta</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="flex flex-col px-2 py-2">
                  <span className="text-sm font-bold truncate">{user.email}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    {role === "admin" ? (
                      <><ShieldCheck className="h-3 w-3 text-red-600" /> Administrador</>
                    ) : (
                      "Cliente"
                    )}
                  </span>
                </div>
                <DropdownMenuSeparator />
                
                {/* Enlace dinámico al dashboard correcto */}
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref} className="flex items-center cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Mi Dashboard</span>
                  </Link>
                </DropdownMenuItem>

                {/* Enlace directo al panel admin si es administrador */}
                {role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center cursor-pointer">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Panel Administrativo</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/cliente/pedidos" className="flex items-center cursor-pointer">
                    <Gift className="mr-2 h-4 w-4" />
                    <span>Mis Pedidos</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault()
                    handleSignOut()
                  }}
                  className="text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white" asChild>
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button size="sm" className="bg-white text-red-800 hover:bg-red-50" asChild>
                <Link href="/auth/registro">Registro</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
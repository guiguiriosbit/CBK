"use client"

import { createClient } from "@/lib/supabase/client"
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
import { useEffect, useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [role, setRole] = useState<string | null>(null) // Nuevo estado para el rol
  const [cartCount, setCartCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // 1. Obtener el rol del perfil
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
        
        setRole(profile?.role || "cliente")

        // 2. Obtener cantidad de items en el carrito
        const { count } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
        setCartCount(count || 0)
      }
    }

    fetchData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (!session) {
        setRole(null)
        setCartCount(0)
      } else {
        fetchData() // Recargar datos si el estado cambia
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  // Determinar la ruta del dashboard dinámicamente
  const dashboardHref = role === "admin" ? "/admin/dashboard" : "/cliente/dashboard"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Snowflake className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">Adornos CBK</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Inicio
          </Link>
          <Link href="/#productos" className="text-sm font-medium transition-colors hover:text-primary">
            Productos
          </Link>
          <Link href="/#categorias" className="text-sm font-medium transition-colors hover:text-primary">
            Categorías
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative" asChild>
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
                <Button variant="outline" size="sm" className="gap-2 border-primary/20">
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

                <DropdownMenuItem asChild>
                  <Link href="/cliente/pedidos" className="flex items-center cursor-pointer">
                    <Gift className="mr-2 h-4 w-4" />
                    <span>Mis Pedidos</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                <Link href="/auth/registro">Registro</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
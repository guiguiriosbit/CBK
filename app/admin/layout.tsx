import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // TODO: En producción, agregar verificación de rol de administrador
  // Por ahora, cualquier usuario autenticado puede acceder

  return (
    <div className="min-h-screen">
      <Header />
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="h-12 w-full justify-start rounded-none border-b-0 bg-transparent p-0">
              <Link href="/admin/dashboard">
                <TabsTrigger
                  value="dashboard"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Dashboard
                </TabsTrigger>
              </Link>
              <Link href="/admin/productos">
                <TabsTrigger
                  value="productos"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Productos
                </TabsTrigger>
              </Link>
              <Link href="/admin/pedidos">
                <TabsTrigger
                  value="pedidos"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Pedidos
                </TabsTrigger>
              </Link>
              <Link href="/admin/categorias">
                <TabsTrigger
                  value="categorias"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Categorías
                </TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>
        </div>
      </div>
      {children}
    </div>
  )
}

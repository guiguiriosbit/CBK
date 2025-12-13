import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"
import { User, MapPin, Package, ShoppingBag, Edit } from "lucide-react"
import Link from "next/link"

export default async function ClienteDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Obtener estadísticas
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["pending", "processing"])

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Obtener dirección por defecto
  const { data: defaultAddress } = await supabase
    .from("shipping_addresses")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .single()

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pendiente", variant: "outline" },
      processing: { label: "Procesando", variant: "secondary" },
      shipped: { label: "Enviado", variant: "default" },
      delivered: { label: "Entregado", variant: "default" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    }
    return statusMap[status] || { label: status, variant: "outline" }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mi Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido, {profile?.full_name || user.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Pedidos realizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Activos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">En proceso o pendientes</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
              <Link href="/cliente/perfil">
                <User className="mr-2 h-4 w-4" />
                Perfil
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
              <Link href="/cliente/direcciones">
                <MapPin className="mr-2 h-4 w-4" />
                Direcciones
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Profile Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Tu perfil y datos de contacto</CardDescription>
            </div>
            <Button variant="outline" size="icon" asChild className="bg-transparent">
              <Link href="/cliente/perfil">
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p className="text-base">{profile?.full_name || "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Correo</p>
              <p className="text-base">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
              <p className="text-base">{profile?.phone || "No especificado"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Default Address */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Dirección Principal</CardTitle>
              <CardDescription>Dirección de envío predeterminada</CardDescription>
            </div>
            <Button variant="outline" size="icon" asChild className="bg-transparent">
              <Link href="/cliente/direcciones">
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {defaultAddress ? (
              <div className="space-y-1">
                <p className="text-base">{defaultAddress.address_line1}</p>
                {defaultAddress.address_line2 && (
                  <p className="text-sm text-muted-foreground">{defaultAddress.address_line2}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postal_code}
                </p>
                <p className="text-sm text-muted-foreground">{defaultAddress.country}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">No tienes una dirección registrada</p>
                <Button variant="outline" size="sm" asChild className="bg-transparent">
                  <Link href="/cliente/direcciones">Agregar Dirección</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>Tus últimos 5 pedidos</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="bg-transparent">
            <Link href="/cliente/pedidos">Ver Todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const statusInfo = getStatusBadge(order.status)
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Pedido #{order.id.slice(0, 8)}</p>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${Number(order.total_amount).toLocaleString("es-MX")}</p>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/cliente/pedidos/${order.id}`}>Ver Detalles</Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No tienes pedidos aún</p>
              <Button variant="outline" size="sm" className="mt-4 bg-transparent" asChild>
                <Link href="/">Comenzar a Comprar</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

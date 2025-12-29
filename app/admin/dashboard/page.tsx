import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  PlusCircle, 
  Tags, 
  LayoutDashboard,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // --- Consultas a la Base de Datos ---
  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "processing"])

  const { count: totalCustomers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { data: orders } = await supabase.from("orders").select("total_amount").eq("payment_status", "paid")
  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

  const { data: lowStockProducts } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("is_active", true)
    .lte("stock", 10)
    .order("stock", { ascending: true })
    .limit(5)

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header con Navegación Rápida */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-red-900">
            <LayoutDashboard className="h-8 w-8" /> Panel de Control
          </h1>
          <p className="text-muted-foreground">Gestiona tus productos, categorías y ventas</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/productos">
            <Button className="bg-red-600 hover:bg-red-700">
              <Package className="mr-2 h-4 w-4" /> Productos
            </Button>
          </Link>
          <Link href="/admin/categorias">
            <Button variant="outline" className="border-red-200 hover:bg-red-50">
              <Tags className="mr-2 h-4 w-4" /> Categorías
            </Button>
          </Link>
          <Link href="/admin/pedidos">
            <Button variant="outline">
              <ShoppingCart className="mr-2 h-4 w-4" /> Pedidos
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString("es-MX")}</div>
            <p className="text-xs text-muted-foreground">Ventas liquidadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Histórico general</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Por procesar</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">En catálogo activo</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">Registrados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Alerta de Stock Bajo</CardTitle>
            <Link href="/admin/productos" className="text-xs text-red-600 hover:underline flex items-center">
              Ver todos <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {lowStockProducts && lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.categories?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${product.stock <= 5 ? "text-destructive" : "text-orange-600"}`}>
                        {product.stock} unid.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Inventario saludable
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Últimos Pedidos</CardTitle>
            <Link href="/admin/pedidos" className="text-xs text-red-600 hover:underline flex items-center">
              Ver historial <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{order.profiles?.full_name || order.profiles?.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">${Number(order.total_amount).toLocaleString("es-MX")}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                        order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No hay pedidos recientes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"

export default async function PedidosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

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

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pendiente", variant: "outline" },
      paid: { label: "Pagado", variant: "default" },
      failed: { label: "Fallido", variant: "destructive" },
      refunded: { label: "Reembolsado", variant: "secondary" },
    }
    return statusMap[status] || { label: status, variant: "outline" }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/cliente/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mis Pedidos</h1>
        <p className="text-muted-foreground">Historial completo de tus pedidos</p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusBadge(order.status)
            const paymentInfo = getPaymentStatusBadge(order.payment_status)
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <span>Pedido #{order.id.slice(0, 8)}</span>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        <Badge variant={paymentInfo.variant}>{paymentInfo.label}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {new Date(order.created_at).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold text-primary">
                          ${Number(order.total_amount).toLocaleString("es-MX")}
                        </p>
                      </div>
                      <Button variant="outline" asChild className="bg-transparent">
                        <Link href={`/cliente/pedidos/${order.id}`}>Ver Detalles</Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {order.notes && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      <strong>Notas:</strong> {order.notes}
                    </p>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center py-16">
            <Package className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">No tienes pedidos aún</p>
            <p className="mb-6 text-sm text-muted-foreground">Comienza a comprar decoraciones navideñas</p>
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link href="/">Ver Productos</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

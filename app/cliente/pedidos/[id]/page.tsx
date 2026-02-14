import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { redirect } from "next/navigation"
import { ArrowLeft, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getProductImageUrl } from "@/lib/product-images"

export default async function PedidoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*, shipping_addresses(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    redirect("/cliente/pedidos")
  }

  const { data: orderItems } = await supabase.from("order_items").select("*, products(*)").eq("order_id", id)

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

  const statusInfo = getStatusBadge(order.status)
  const paymentInfo = getPaymentStatusBadge(order.payment_status)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/cliente/pedidos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Pedidos
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Pedido #{order.id.slice(0, 8)}</h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          <Badge variant={paymentInfo.variant}>{paymentInfo.label}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderItems?.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={getProductImageUrl(item.products.image_url, item.products.name)}
                      alt={item.products.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-semibold">{item.products.name}</h3>
                      <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">
                        ${Number(item.unit_price).toLocaleString("es-MX")} c/u
                      </p>
                      <p className="font-semibold">${Number(item.subtotal).toLocaleString("es-MX")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {order.notes && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Notas del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${Number(order.total_amount).toLocaleString("es-MX")}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">
                      ${Number(order.total_amount).toLocaleString("es-MX")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.shipping_addresses ? (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{order.shipping_addresses.address_line1}</p>
                    {order.shipping_addresses.address_line2 && (
                      <p className="text-muted-foreground">{order.shipping_addresses.address_line2}</p>
                    )}
                    <p className="text-muted-foreground">
                      {order.shipping_addresses.city}, {order.shipping_addresses.state}{" "}
                      {order.shipping_addresses.postal_code}
                    </p>
                    <p className="text-muted-foreground">{order.shipping_addresses.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay dirección registrada</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Fecha de Pedido</p>
                  <p className="font-medium">
                    {new Date(order.created_at).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última Actualización</p>
                  <p className="font-medium">
                    {new Date(order.updated_at).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

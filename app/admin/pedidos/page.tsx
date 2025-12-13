"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Package, Eye } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  user_id: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  profiles?: { full_name: string | null; email: string }
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    loadOrders()
  }, [filterStatus])

  const loadOrders = async () => {
    setIsLoading(true)
    const supabase = createClient()

    let query = supabase
      .from("orders")
      .select("*, profiles(full_name, email)")
      .order("created_at", { ascending: false })

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error loading orders:", error)
      toast.error("Error al cargar los pedidos")
    } else {
      setOrders(data || [])
    }
    setIsLoading(false)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

    if (error) {
      console.error("[v0] Error updating order:", error)
      toast.error("Error al actualizar el pedido")
    } else {
      toast.success("Estado del pedido actualizado")
      loadOrders()
    }
  }

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("orders").update({ payment_status: newStatus }).eq("id", orderId)

    if (error) {
      console.error("[v0] Error updating payment:", error)
      toast.error("Error al actualizar el pago")
    } else {
      toast.success("Estado de pago actualizado")
      loadOrders()
    }
  }

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

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <p className="text-muted-foreground">Cargando pedidos...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
          <p className="text-muted-foreground">{orders.length} pedidos en total</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los pedidos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="processing">Procesando</SelectItem>
            <SelectItem value="shipped">Enviados</SelectItem>
            <SelectItem value="delivered">Entregados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusBadge(order.status)
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex flex-wrap items-center gap-2">
                        <span>Pedido #{order.id.slice(0, 8)}</span>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </CardTitle>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <p>Cliente: {order.profiles?.full_name || order.profiles?.email}</p>
                        <p>
                          Fecha:{" "}
                          {new Date(order.created_at).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold text-primary">
                          ${Number(order.total_amount).toLocaleString("es-MX")}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild className="bg-transparent">
                        <Link href={`/cliente/pedidos/${order.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Estado del Pedido</p>
                      <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="processing">Procesando</SelectItem>
                          <SelectItem value="shipped">Enviado</SelectItem>
                          <SelectItem value="delivered">Entregado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Estado de Pago</p>
                      <Select
                        value={order.payment_status}
                        onValueChange={(value) => updatePaymentStatus(order.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="paid">Pagado</SelectItem>
                          <SelectItem value="failed">Fallido</SelectItem>
                          <SelectItem value="refunded">Reembolsado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center py-16">
            <Package className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">No hay pedidos</p>
            <p className="text-sm text-muted-foreground">
              {filterStatus === "all" ? "Aún no se han realizado pedidos" : "No hay pedidos con este estado"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

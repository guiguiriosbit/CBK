"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { MapPin, CreditCard, CheckCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckoutWrapper } from "@/components/checkout/checkout-wrapper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COUNTRIES } from "@/lib/countries"

interface CartItem {
  id: string
  quantity: number
  product_id: string
  products: {
    id: string
    name: string
    price: number
    image_url: string
    stock: number
  }
}

interface ShippingAddress {
  id?: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [paymentStep, setPaymentStep] = useState<'address' | 'payment'>('address')
  const router = useRouter()

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  })

  const [notes, setNotes] = useState("")

  useEffect(() => {
    loadCheckoutData()
  }, [])

  const loadCheckoutData = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsLoading(true)

    // Cargar items del carrito
    const { data: cart, error: cartError } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("user_id", user.id)

    if (cartError) {
      console.error("[v0] Error loading cart:", cartError)
      toast.error("Error al cargar el carrito")
      router.push("/carrito")
      return
    }

    if (!cart || cart.length === 0) {
      toast.error("Tu carrito está vacío")
      router.push("/carrito")
      return
    }

    setCartItems(cart as CartItem[])

    // Cargar dirección por defecto si existe
    const { data: addresses } = await supabase
      .from("shipping_addresses")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .single()

    if (addresses) {
      setShippingAddress({
        ...addresses,
        country: addresses.country || ""
      })
    } else {
      // Si no hay dirección por defecto, establecer México como predeterminado
      setShippingAddress(prev => ({
        ...prev,
        country: prev.country || "México"
      }))
    }

    setIsLoading(false)
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0)
  }

  const calculateShipping = () => {
    return calculateSubtotal() > 1000 ? 0 : 150
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping()
  }

  const handleContinueToPayment = async () => {
    if (
      !shippingAddress.address_line1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postal_code ||
      !shippingAddress.country
    ) {
      toast.error("Por favor completa todos los campos de dirección")
      return
    }

    setIsProcessing(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    try {
      // Guardar dirección de envío
      let shippingAddressId = shippingAddress.id

      if (!shippingAddressId) {
        const { data: newAddress, error: addressError } = await supabase
          .from("shipping_addresses")
          .insert({
            user_id: user.id,
            ...shippingAddress,
            is_default: true,
          })
          .select()
          .single()

        if (addressError) throw addressError
        shippingAddressId = newAddress.id
      }

      // Crear pedido
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          shipping_address_id: shippingAddressId,
          total_amount: calculateTotal(),
          status: "pending",
          payment_status: "pending",
          notes: notes || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Crear items del pedido
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.products.price,
        subtotal: item.products.price * item.quantity,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      setCurrentOrderId(order.id)
      setPaymentStep('payment')
      toast.success("Dirección guardada. Procede con el pago")
    } catch (error: any) {
      console.error("[v0] Error creating order:", error)
      const errorMessage = error?.message || error?.error || "Error al procesar el pedido"
      toast.error(errorMessage)
      
      // Mostrar detalles del error en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.error("Detalles del error:", {
          error,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!currentOrderId) return

    setIsProcessing(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    try {
      // Actualizar transacción en la base de datos
      const { error: transactionError } = await supabase
        .from("transactions")
        .update({
          status: "succeeded",
          completed_at: new Date().toISOString(),
        })
        .eq("stripe_payment_intent_id", paymentIntentId)
        .eq("user_id", user.id)

      if (transactionError) {
        console.error("Error actualizando transacción:", transactionError)
      }

      // Actualizar pedido a pagado
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "processing",
        })
        .eq("id", currentOrderId)

      if (orderError) throw orderError

      // Actualizar stock de productos
      for (const item of cartItems) {
        const { error: stockError } = await supabase.rpc("decrement_product_stock", {
          product_id: item.product_id,
          quantity: item.quantity,
        })
        // Si no existe la función, actualizar manualmente
        if (stockError) {
          const { error: updateError } = await supabase
            .from("products")
            .update({ stock: item.products.stock - item.quantity })
            .eq("id", item.product_id)
          
          if (updateError) {
            console.error(`Error actualizando stock del producto ${item.product_id}:`, updateError)
          }
        }
      }

      // Limpiar carrito
      const { error: cartError } = await supabase.from("cart_items").delete().eq("user_id", user.id)
      
      if (cartError) {
        console.error("Error limpiando carrito:", cartError)
      }

      setOrderId(currentOrderId)
      setOrderComplete(true)
      toast.success("¡Pago procesado exitosamente!")
    } catch (error) {
      console.error("[v0] Error completing order:", error)
      toast.error("Error al completar el pedido. Por favor, contacta con soporte.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentError = (error: string) => {
    toast.error(error || "Error al procesar el pago")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
          <div className="text-center">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                  <CheckCircle className="h-10 w-10 text-secondary-foreground" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Pedido Realizado con Éxito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted p-6 text-center">
                <p className="mb-2 text-sm text-muted-foreground">Número de Pedido</p>
                <p className="font-mono text-lg font-semibold">{orderId}</p>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Gracias por tu compra. Hemos recibido tu pedido y lo estamos procesando.</p>
                <p>
                  Te enviaremos un correo electrónico con los detalles de seguimiento una vez que tu pedido sea enviado.
                </p>
              </div>

              <Separator />

              <div className="flex flex-col gap-3">
                <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                  <Link href="/cliente/pedidos">Ver Mis Pedidos</Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/">Seguir Comprando</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Finalizar Compra</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Dirección de Envío
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="address1">Dirección *</Label>
                      <Input
                        id="address1"
                        placeholder="Calle y número"
                        value={shippingAddress.address_line1}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address_line1: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address2">Dirección 2 (opcional)</Label>
                      <Input
                        id="address2"
                        placeholder="Colonia, departamento, etc."
                        value={shippingAddress.address_line2}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address_line2: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="city">Ciudad *</Label>
                        <Input
                          id="city"
                          placeholder="Ciudad"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="state">Estado *</Label>
                        <Input
                          id="state"
                          placeholder="Estado"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="postal">Código Postal *</Label>
                        <Input
                          id="postal"
                          placeholder="12345"
                          value={shippingAddress.postal_code}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="country">País *</Label>
                        <Select
                          value={shippingAddress.country}
                          onValueChange={(value) => setShippingAddress({ ...shippingAddress, country: value })}
                        >
                          <SelectTrigger id="country">
                            <SelectValue placeholder="Selecciona un país" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country.code} value={country.name}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              {paymentStep === 'payment' && currentOrderId && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Método de Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CheckoutWrapper
                      amount={calculateTotal()}
                      currency="mxn"
                      description={`Pedido #${currentOrderId.slice(0, 8)}`}
                      metadata={{
                        orderId: currentOrderId,
                      }}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </CardContent>
                </Card>
              )}

              {paymentStep === 'address' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Método de Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-sm text-muted-foreground">
                        Completa la dirección de envío para continuar con el pago
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Notas del Pedido (Opcional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Instrucciones especiales para la entrega..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={item.products.image_url || "/placeholder.svg"}
                          alt={item.products.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.products.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x ${item.products.price.toLocaleString("es-MX")}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        ${(item.products.price * item.quantity).toLocaleString("es-MX")}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${calculateSubtotal().toLocaleString("es-MX")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-medium">
                      {calculateShipping() === 0 ? (
                        <span className="text-secondary">Gratis</span>
                      ) : (
                        `$${calculateShipping().toLocaleString("es-MX")}`
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">${calculateTotal().toLocaleString("es-MX")}</span>
                  </div>
                </div>

                {paymentStep === 'address' ? (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                    onClick={handleContinueToPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Procesando..." : "Continuar con el Pago"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    size="lg"
                    onClick={() => setPaymentStep('address')}
                    disabled={isProcessing}
                  >
                    Volver a Dirección
                  </Button>
                )}

                <p className="text-center text-xs text-muted-foreground">
                  Al realizar el pedido, aceptas nuestros términos y condiciones
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

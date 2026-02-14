"use client"

import { useEffect, useState } from "react"
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
import { COUNTRIES, getCountryCode } from "@/lib/countries"
import { getStatesByCountryCode } from "@/lib/states"
import { PHONE_CODES, getDialCodeByCountryCode } from "@/lib/phone-codes"
import { getProductImageUrl } from "@/lib/product-images"

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
  full_name?: string
  email?: string
  phone_country_code?: string
  phone?: string
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
  const [paymentStep, setPaymentStep] = useState<"address" | "payment">("address")
  const router = useRouter()

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    full_name: "",
    email: "",
    phone_country_code: "+52",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "México",
  })

  const [notes, setNotes] = useState("")

  useEffect(() => {
    loadCheckoutData()
  }, [])

  const loadCheckoutData = async () => {
    setIsLoading(true)
    try {
      // Cargar items del carrito desde Prisma vía API
      const cartRes = await fetch("/api/cart")

      if (cartRes.status === 401) {
        router.push("/auth/login")
        return
      }

      if (!cartRes.ok) {
        const data = await cartRes.json().catch(() => null)
        const message = data?.error || "Error al cargar el carrito"
        throw new Error(message)
      }

      const cartData = await cartRes.json()
      const items = cartData.items as CartItem[]

      if (!items || items.length === 0) {
        toast.error("Tu carrito está vacío")
        router.push("/carrito")
        return
      }

      setCartItems(items)

      // Cargar dirección de envío por defecto si existe
      const addrRes = await fetch("/api/shipping-address/default")

      if (addrRes.status === 401) {
        router.push("/auth/login")
        return
      }

      if (addrRes.ok) {
        const addrData = await addrRes.json()
        if (addrData.address) {
          setShippingAddress({
            ...addrData.address,
            full_name: addrData.address.full_name ?? "",
            email: addrData.address.email ?? "",
            phone_country_code: addrData.address.phone_country_code ?? "+52",
            phone: addrData.address.phone ?? "",
          } as ShippingAddress)
        } else {
          const profileRes = await fetch("/api/profile")
          const profile = profileRes.ok ? await profileRes.json() : null
          setShippingAddress((prev) => ({
            ...prev,
            full_name: profile?.name ?? prev.full_name ?? "",
            email: profile?.email ?? prev.email ?? "",
            phone: profile?.phone ?? prev.phone ?? "",
            country: prev.country || "México",
            phone_country_code: prev.phone_country_code || getDialCodeByCountryCode(getCountryCode(prev.country || "México")),
          }))
        }
      } else {
        // Si falla la carga de dirección, al menos establecer país por defecto
        setShippingAddress((prev) => ({
          ...prev,
          country: prev.country || "México",
          phone_country_code: prev.phone_country_code || getDialCodeByCountryCode(getCountryCode(prev.country || "México")),
        }))
      }
    } catch (error) {
      console.error("Error loading checkout data:", error)
      toast.error("Error al cargar los datos de checkout")
      router.push("/carrito")
    } finally {
      setIsLoading(false)
    }
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
    const isNewAddress = !shippingAddress.id
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
    if (isNewAddress && (!shippingAddress.full_name || !shippingAddress.email || !shippingAddress.phone)) {
      toast.error("Por favor completa nombre, email y celular")
      return
    }

    setIsProcessing(true)

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress,
          notes,
        }),
      })

      if (res.status === 401) {
        router.push("/auth/login")
        return
      }

      const data = await res.json()

      if (!res.ok) {
        const message = data?.error || "Error al procesar el pedido"
        throw new Error(message)
      }

      setCurrentOrderId(data.orderId)
      setPaymentStep("payment")
      toast.success("Dirección guardada. Procede con el pago")
    } catch (error: any) {
      console.error("[v0] Error creating order:", error)
      const errorMessage = error?.message || error?.error || "Error al procesar el pedido"
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!currentOrderId) return

    setIsProcessing(true)

    try {
      const res = await fetch("/api/orders/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: currentOrderId,
          paymentIntentId,
        }),
      })

      if (res.status === 401) {
        router.push("/auth/login")
        return
      }

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const message = data?.error || "Error al completar el pedido"
        throw new Error(message)
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
                      <Label htmlFor="full_name">Nombre completo *</Label>
                      <Input
                        id="full_name"
                        placeholder="Nombre y apellidos"
                        value={shippingAddress.full_name ?? ""}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, full_name: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={shippingAddress.email ?? ""}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Celular *</Label>
                      <div className="flex gap-2">
                        <Select
                          value={shippingAddress.phone_country_code ?? "+52"}
                          onValueChange={(value) => setShippingAddress({ ...shippingAddress, phone_country_code: value })}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PHONE_CODES.map((p) => (
                              <SelectItem key={p.code} value={p.dialCode}>
                                {p.dialCode} {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="55 1234 5678"
                          value={shippingAddress.phone ?? ""}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                          required
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="country">País *</Label>
                      <Select
                        value={shippingAddress.country}
                        onValueChange={(value) => {
                          const states = getStatesByCountryCode(getCountryCode(value))
                          const currentStateValid = states.length > 0
                            ? states.some((s) => s.name === shippingAddress.state)
                            : true
                          setShippingAddress({
                            ...shippingAddress,
                            country: value,
                            state: currentStateValid ? shippingAddress.state : "",
                            phone_country_code: getDialCodeByCountryCode(getCountryCode(value)),
                          })
                        }}
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
                    <div className="grid gap-2">
                      <Label htmlFor="state">Estado / Provincia *</Label>
                      {(() => {
                        const countryCode = getCountryCode(shippingAddress.country)
                        const states = getStatesByCountryCode(countryCode)
                        if (states.length > 0) {
                          return (
                            <Select
                              value={shippingAddress.state}
                              onValueChange={(value) => setShippingAddress({ ...shippingAddress, state: value })}
                            >
                              <SelectTrigger id="state">
                                <SelectValue placeholder="Selecciona estado o provincia" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[250px]">
                                {states.map((s) => (
                                  <SelectItem key={s.code} value={s.name}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )
                        }
                        return (
                          <Input
                            id="state"
                            placeholder="Estado, provincia o región"
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value.toUpperCase() })}
                            required
                          />
                        )
                      })()}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        placeholder="Ciudad"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="postal">Código Postal *</Label>
                      <Input
                        id="postal"
                        placeholder="12345"
                        value={shippingAddress.postal_code}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address1">Dirección *</Label>
                      <Input
                        id="address1"
                        placeholder="Calle y número"
                        value={shippingAddress.address_line1}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address_line1: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address2">Dirección 2 (opcional)</Label>
                      <Input
                        id="address2"
                        placeholder="Colonia, departamento, etc."
                        value={shippingAddress.address_line2}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address_line2: e.target.value.toUpperCase() })}
                      />
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
                          src={getProductImageUrl(item.products.image_url, item.products.name)}
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

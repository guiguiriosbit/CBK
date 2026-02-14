"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, MapPin, Plus, Trash2, Star } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COUNTRIES, getCountryCode } from "@/lib/countries"
import { getStatesByCountryCode } from "@/lib/states"
import { PHONE_CODES, getDialCodeByCountryCode } from "@/lib/phone-codes"

interface Address {
  id: string
  full_name?: string | null
  email?: string | null
  phone_country_code?: string | null
  phone?: string | null
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

export default function DireccionesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const [newAddress, setNewAddress] = useState({
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

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    setIsLoading(true)
    const res = await fetch("/api/shipping-address")
    if (res.status === 401) {
      router.push("/auth/login")
      return
    }
    if (!res.ok) {
      toast.error("Error al cargar las direcciones")
      setIsLoading(false)
      return
    }
    const data = await res.json()
    setAddresses(data.addresses ?? [])
    setIsLoading(false)
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !newAddress.full_name ||
      !newAddress.email ||
      !newAddress.phone ||
      !newAddress.address_line1 ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.postal_code ||
      !newAddress.country
    ) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    setIsSaving(true)
    const res = await fetch("/api/shipping-address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress),
    })

    if (res.status === 401) {
      router.push("/auth/login")
      return
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || "Error al agregar la dirección")
    } else {
      toast.success("Dirección agregada exitosamente")
      setIsDialogOpen(false)
      setNewAddress({
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
      loadAddresses()
    }
    setIsSaving(false)
  }

  const setAsDefault = async (addressId: string) => {
    const res = await fetch("/api/shipping-address/default", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId }),
    })
    if (res.status === 401) {
      router.push("/auth/login")
      return
    }
    if (!res.ok) {
      toast.error("Error al establecer dirección por defecto")
    } else {
      toast.success("Dirección establecida como predeterminada")
      loadAddresses()
    }
  }

  const deleteAddress = async (addressId: string) => {
    const res = await fetch("/api/shipping-address", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId }),
    })
    if (res.status === 401) {
      router.push("/auth/login")
      return
    }
    if (!res.ok) {
      toast.error("Error al eliminar la dirección")
    } else {
      toast.success("Dirección eliminada")
      loadAddresses()
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <p className="text-muted-foreground">Cargando direcciones...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cliente/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Direcciones</h1>
          <p className="text-muted-foreground">Gestiona tus direcciones de envío</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Dirección
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Dirección</DialogTitle>
              <DialogDescription>Agrega una nueva dirección de envío</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Nombre completo *</Label>
                <Input
                  id="full_name"
                  placeholder="Nombre y apellidos"
                  value={newAddress.full_name}
                  onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={newAddress.email}
                  onChange={(e) => setNewAddress({ ...newAddress, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Celular *</Label>
                <div className="flex gap-2">
                  <Select
                    value={newAddress.phone_country_code}
                    onValueChange={(value) => setNewAddress({ ...newAddress, phone_country_code: value })}
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
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    required
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">País *</Label>
                <Select
                  value={newAddress.country}
                  onValueChange={(value) => {
                    const states = getStatesByCountryCode(getCountryCode(value))
                    const currentValid = states.length > 0 ? states.some((s) => s.name === newAddress.state) : true
                    setNewAddress({
                      ...newAddress,
                      country: value,
                      state: currentValid ? newAddress.state : "",
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
                  const states = getStatesByCountryCode(getCountryCode(newAddress.country))
                  if (states.length > 0) {
                    return (
                      <Select
                        value={newAddress.state}
                        onValueChange={(value) => setNewAddress({ ...newAddress, state: value })}
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
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value.toUpperCase() })}
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
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="postal">Código Postal *</Label>
                <Input
                  id="postal"
                  placeholder="12345"
                  value={newAddress.postal_code}
                  onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address1">Dirección *</Label>
                <Input
                  id="address1"
                  placeholder="Calle y número"
                  value={newAddress.address_line1}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address2">Dirección 2 (opcional)</Label>
                <Input
                  id="address2"
                  placeholder="Colonia, departamento, etc."
                  value={newAddress.address_line2}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value.toUpperCase() })}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar Dirección"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <Card key={address.id} className={address.is_default ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    {address.is_default && <Badge variant="secondary">Predeterminada</Badge>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => deleteAddress(address.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 text-sm">
                  {address.full_name && <p className="font-medium">{address.full_name}</p>}
                  {address.email && <p className="text-muted-foreground">{address.email}</p>}
                  {(address.phone_country_code || address.phone) && (
                    <p className="text-muted-foreground">
                      {[address.phone_country_code, address.phone].filter(Boolean).join(" ")}
                    </p>
                  )}
                  <p className="font-medium">{address.address_line1}</p>
                  {address.address_line2 && <p className="text-muted-foreground">{address.address_line2}</p>}
                  <p className="text-muted-foreground">
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p className="text-muted-foreground">{address.country}</p>
                </div>
                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => setAsDefault(address.id)}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Establecer como Predeterminada
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-16">
            <MapPin className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">No tienes direcciones guardadas</p>
            <p className="mb-6 text-sm text-muted-foreground">Agrega una dirección para facilitar tus compras</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

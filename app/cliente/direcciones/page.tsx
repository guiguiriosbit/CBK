"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
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

interface Address {
  id: string
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
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsLoading(true)
    const { data, error } = await supabase
      .from("shipping_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error loading addresses:", error)
      toast.error("Error al cargar las direcciones")
    } else {
      setAddresses(data)
    }
    setIsLoading(false)
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.postal_code) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    setIsSaving(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    const { error } = await supabase.from("shipping_addresses").insert({
      user_id: user.id,
      ...newAddress,
      is_default: addresses.length === 0, // Primera dirección es por defecto
    })

    if (error) {
      console.error("[v0] Error adding address:", error)
      toast.error("Error al agregar la dirección")
    } else {
      toast.success("Dirección agregada exitosamente")
      setIsDialogOpen(false)
      setNewAddress({
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
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Quitar default de todas
    await supabase.from("shipping_addresses").update({ is_default: false }).eq("user_id", user.id)

    // Establecer la nueva por defecto
    const { error } = await supabase.from("shipping_addresses").update({ is_default: true }).eq("id", addressId)

    if (error) {
      console.error("[v0] Error setting default:", error)
      toast.error("Error al establecer dirección por defecto")
    } else {
      toast.success("Dirección establecida como predeterminada")
      loadAddresses()
    }
  }

  const deleteAddress = async (addressId: string) => {
    const supabase = createClient()

    const { error } = await supabase.from("shipping_addresses").delete().eq("id", addressId)

    if (error) {
      console.error("[v0] Error deleting address:", error)
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nueva Dirección</DialogTitle>
              <DialogDescription>Agrega una nueva dirección de envío</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="address1">Dirección *</Label>
                <Input
                  id="address1"
                  placeholder="Calle y número"
                  value={newAddress.address_line1}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address2">Dirección 2 (opcional)</Label>
                <Input
                  id="address2"
                  placeholder="Colonia, departamento, etc."
                  value={newAddress.address_line2}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    placeholder="Ciudad"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    placeholder="Estado"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
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
                    value={newAddress.postal_code}
                    onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">País</Label>
                  <Input id="country" value={newAddress.country} disabled />
                </div>
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

"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Profile {
  id: string
  email: string
  name: string | null
  phone: string | null
}

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (status === "authenticated" && session?.user) {
      loadProfile()
    }
  }, [session, status, router])

  const loadProfile = async () => {
    if (!session?.user) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/profile")
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login")
          return
        }
        throw new Error("Error al cargar el perfil")
      }
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Error al cargar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar el perfil")
      }

      toast.success("Perfil actualizado exitosamente")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast.error(error.message || "Error al actualizar el perfil")
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    )
  }

  if (!profile || !session) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <p className="text-muted-foreground">No se pudo cargar el perfil</p>
      </div>
    )
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

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
          <CardDescription>Actualiza tu información personal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" value={profile.email} disabled />
              <p className="text-xs text-muted-foreground">El correo no se puede modificar</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                type="text"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+52 123 456 7890"
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

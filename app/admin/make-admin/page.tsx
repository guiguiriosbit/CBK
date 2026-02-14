"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MakeAdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState(session?.user?.email || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleMakeAdmin = async () => {
    if (!email.trim()) {
      toast.error("Ingresa un email")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/set-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al asignar rol de admin")
      }

      toast.success(data.message || "Rol de administrador asignado correctamente")
      
      // Si es el mismo usuario, redirigir al dashboard admin
      if (session?.user?.email?.toLowerCase() === email.toLowerCase().trim()) {
        setTimeout(() => {
          router.push("/admin/dashboard")
          router.refresh()
          // Forzar recarga para actualizar la sesión
          window.location.href = "/admin/dashboard"
        }, 1000)
      }
    } catch (error: any) {
      console.error("Error making admin:", error)
      toast.error(error.message || "Error al asignar rol de admin")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Asignar Rol de Administrador
          </CardTitle>
          <CardDescription>
            Convierte un usuario en administrador. Después de asignar el rol, cierra sesión y vuelve a iniciar sesión para que los cambios surtan efecto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email del Usuario</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
            />
            <p className="text-xs text-muted-foreground">
              Si es tu propio email, después de asignar el rol, cierra sesión y vuelve a iniciar sesión.
            </p>
          </div>
          <Button 
            onClick={handleMakeAdmin} 
            disabled={isLoading || !email.trim()}
            className="w-full"
          >
            {isLoading ? "Asignando..." : "Asignar Rol de Administrador"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

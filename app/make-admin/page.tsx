"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ShieldCheck, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"

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
      
      // Si es el mismo usuario, mostrar instrucciones
      if (session?.user?.email?.toLowerCase() === email.toLowerCase().trim()) {
        toast.info("Cierra sesión y vuelve a iniciar sesión para que los cambios surtan efecto", {
          duration: 5000,
        })
      }
    } catch (error: any) {
      console.error("Error making admin:", error)
      toast.error(error.message || "Error al asignar rol de admin")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-red-600" />
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
                Ingresa el email del usuario que quieres convertir en administrador.
              </p>
            </div>
            <Button 
              onClick={handleMakeAdmin} 
              disabled={isLoading || !email.trim()}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Asignando..." : "Asignar Rol de Administrador"}
            </Button>
            
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900 mb-2">⚠️ Pasos importantes:</p>
              <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                <li>Asigna el rol de administrador a tu email</li>
                <li>Cierra sesión haciendo clic en "Mi Cuenta" → "Cerrar Sesión"</li>
                <li>Vuelve a iniciar sesión con tus credenciales</li>
                <li>Ahora verás "Panel Administrativo" en el menú de "Mi Cuenta"</li>
              </ol>
            </div>

            {session?.user && (
              <div className="mt-4 text-center">
                <Link 
                  href="/admin/dashboard" 
                  className="inline-flex items-center gap-2 text-sm text-red-600 hover:underline"
                >
                  Ir al Panel Administrativo <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

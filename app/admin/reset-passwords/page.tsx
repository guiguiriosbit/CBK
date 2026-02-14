"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function ResetPasswordsPage() {
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  const handleCheckUser = async () => {
    if (!email.trim()) {
      toast.error("Ingresa un email")
      return
    }

    setIsChecking(true)
    try {
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al verificar usuario")
      }

      setUserInfo(data)
      
      if (!data.exists) {
        toast.error("Usuario no encontrado")
      } else if (!data.isBcryptHash) {
        toast.warning("Este usuario necesita restablecer su contraseña")
      } else {
        toast.success("Usuario encontrado con contraseña válida")
      }
    } catch (error: any) {
      console.error("Error checking user:", error)
      toast.error(error.message || "Error al verificar usuario")
    } finally {
      setIsChecking(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email.trim() || !newPassword.trim()) {
      toast.error("Email y nueva contraseña son requeridos")
      return
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsResetting(true)
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          newPassword,
          adminOverride: true // Permitir desde esta página de admin
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al restablecer contraseña")
      }

      toast.success("Contraseña restablecida correctamente. Ahora puedes iniciar sesión.")
      setNewPassword("")
      setUserInfo(null)
    } catch (error: any) {
      console.error("Error resetting password:", error)
      toast.error(error.message || "Error al restablecer contraseña")
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Restablecer Contraseñas</CardTitle>
          <CardDescription>
            Utilidad para verificar y restablecer contraseñas de usuarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email del Usuario</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                />
                <Button onClick={handleCheckUser} disabled={isChecking}>
                  {isChecking ? "Verificando..." : "Verificar"}
                </Button>
              </div>
            </div>

            {userInfo && userInfo.exists && (
              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                <p className="font-semibold">Información del Usuario:</p>
                <p className="text-sm">
                  <strong>Email:</strong> {userInfo.user.email}
                </p>
                <p className="text-sm">
                  <strong>Nombre:</strong> {userInfo.user.name || "N/A"}
                </p>
                <p className="text-sm">
                  <strong>Rol:</strong> {userInfo.user.role}
                </p>
                <p className="text-sm">
                  <strong>¿Tiene contraseña?</strong> {userInfo.hasPassword ? "Sí" : "No"}
                </p>
                <p className="text-sm">
                  <strong>¿Formato bcrypt válido?</strong>{" "}
                  <span className={userInfo.isBcryptHash ? "text-green-600" : "text-red-600"}>
                    {userInfo.isBcryptHash ? "Sí" : "No"}
                  </span>
                </p>
                {userInfo.passwordInfo && (
                  <p className="text-xs text-muted-foreground">
                    Hash: {userInfo.passwordInfo.hashPrefix}... (longitud: {userInfo.passwordInfo.hashLength})
                  </p>
                )}
              </div>
            )}

            {userInfo && userInfo.exists && (
              <div className="grid gap-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
                <Button 
                  onClick={handleResetPassword} 
                  disabled={isResetting || !newPassword.trim()}
                  className="w-full"
                >
                  {isResetting ? "Restableciendo..." : "Restablecer Contraseña"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

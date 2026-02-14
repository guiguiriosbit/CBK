"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Snowflake } from "lucide-react"
import { toast } from "sonner"
import { signIn } from "next-auth/react"

export default function RegistroPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!password || password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres")
      }

      const response = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, phone }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al registrar")
      }

      // Intentar enviar código OTP de verificación al correo
      try {
        await fetch("/api/auth/send-verification-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
      } catch (e) {
        console.error("Error enviando OTP de verificación:", e)
      }

      toast.success("Cuenta creada correctamente. Te enviamos un código para verificar tu correo.")
      router.push(`/auth/verificar-otp?email=${encodeURIComponent(email)}&method=email`)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-green-50 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
              <Snowflake className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-red-900">Adornos CBK</h1>
          <p className="text-muted-foreground">Crea tu cuenta y empieza a decorar</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Registro</CardTitle>
            <CardDescription>Completa el formulario para crear tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Juan Pérez"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+52 123 456 7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
                </div>
                {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                  {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-red-600 underline underline-offset-4 hover:text-red-700"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

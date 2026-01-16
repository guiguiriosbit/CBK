"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Snowflake, Mail, MessageCircle } from "lucide-react"
import { toast } from "sonner"

export default function RegistroPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [useOTP, setUseOTP] = useState(false)
  const [otpMethod, setOtpMethod] = useState<"email" | "whatsapp">("email")
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      if (useOTP && otpMethod === "email") {
        // Registro con OTP por email
        if (!email) {
          throw new Error("Por favor ingresa tu correo electrónico")
        }

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            },
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/cliente/dashboard`,
            shouldCreateUser: true,
          },
        })

        if (error) throw error

        toast.success("Código OTP enviado. Revisa tu correo.")
        router.push(`/auth/verificar-otp?email=${encodeURIComponent(email)}`)
      } else {
        // Registro tradicional con contraseña
        if (!password || password.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres")
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            },
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/cliente/dashboard`,
          },
        })
        
        if (error) throw error
        
        toast.success("Cuenta creada. Revisa tu correo para verificar tu email.")
        router.push("/auth/verificacion-email")
      }
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
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="use-otp"
                      checked={useOTP}
                      onChange={(e) => setUseOTP(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="use-otp" className="text-sm font-normal cursor-pointer">
                      Usar código OTP en lugar de contraseña
                    </Label>
                  </div>
                </div>
                {!useOTP && (
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
                  </div>
                )}
                {useOTP && (
                  <div className="grid gap-2">
                    <Label>Método de envío</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={otpMethod === "email" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setOtpMethod("email")}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                      <Button
                        type="button"
                        variant={otpMethod === "whatsapp" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => {
                          setOtpMethod("whatsapp")
                          toast.info("WhatsApp próximamente. Usando Email por ahora.")
                          setOtpMethod("email")
                        }}
                        disabled
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        WhatsApp
                        <span className="ml-1 text-xs">(Próximamente)</span>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Te enviaremos un código de 6 dígitos por {otpMethod === "email" ? "correo" : "WhatsApp"}
                    </p>
                  </div>
                )}
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

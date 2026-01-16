"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Snowflake, Mail, MessageCircle, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function VerificarOTPPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [otpCode, setOtpCode] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [method, setMethod] = useState<"email" | "whatsapp">("email")
  const [canResend, setCanResend] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    // Obtener email de los parámetros de la URL si existe
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  useEffect(() => {
    // Contador para reenvío
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendCountdown])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      if (method === "email") {
        if (!email || !otpCode) {
          throw new Error("Por favor ingresa tu correo y el código OTP")
        }

        // Verificar el código OTP
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: "email",
        })

        if (error) throw error

        if (data.user) {
          // Consultar el perfil para redirección
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single()

          toast.success("¡Código verificado exitosamente!")
          
          // Redirección condicional
          if (profile?.role === "admin") {
            router.push("/admin/dashboard")
          } else {
            router.push("/cliente/dashboard")
          }
          router.refresh()
        }
      } else {
        // WhatsApp - placeholder para futuro
        toast.error("El envío por WhatsApp aún no está disponible. Por favor usa Email.")
        setMethod("email")
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Código inválido o expirado"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      if (method === "email") {
        if (!email) {
          throw new Error("Por favor ingresa tu correo electrónico")
        }

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
              `${window.location.origin}/cliente/dashboard`,
          },
        })

        if (error) throw error

        toast.success("Código OTP reenviado. Revisa tu correo.")
        setCanResend(false)
        setResendCountdown(60) // 60 segundos antes de poder reenviar
      } else {
        toast.error("El envío por WhatsApp aún no está disponible.")
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al reenviar código"
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
          <p className="text-muted-foreground">Verifica tu código OTP</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Verificar Código OTP</CardTitle>
            <CardDescription>Ingresa el código que recibiste</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={method} onValueChange={(v) => setMethod(v as "email" | "whatsapp")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="flex items-center gap-2" disabled>
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                  <span className="ml-1 text-xs">(Próximamente)</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <form onSubmit={handleVerifyOTP}>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@correo.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!!searchParams.get("email")}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="otp">Código OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Ingresa el código de 6 dígitos que recibiste por correo
                      </p>
                    </div>
                    {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                      {isLoading ? "Verificando..." : "Verificar Código"}
                    </Button>
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleResendOTP}
                        disabled={!canResend || isLoading}
                        className="text-sm"
                      >
                        {resendCountdown > 0
                          ? `Reenviar código en ${resendCountdown}s`
                          : "Reenviar código OTP"}
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="whatsapp">
                <div className="rounded-md bg-yellow-50 p-4 text-center">
                  <MessageCircle className="mx-auto mb-2 h-8 w-8 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-800">WhatsApp próximamente</p>
                  <p className="mt-2 text-xs text-yellow-700">
                    El envío de códigos OTP por WhatsApp estará disponible pronto. Por ahora, usa Email.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm">
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 font-medium text-red-600 underline underline-offset-4 hover:text-red-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a Iniciar Sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


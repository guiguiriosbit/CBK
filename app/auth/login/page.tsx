"use client"

import type React from "react"
import { getUserProfile } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Snowflake, Mail, MessageCircle } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otpEmail, setOtpEmail] = useState("")
  const [otpPhone, setOtpPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpMethod, setOtpMethod] = useState<"email" | "whatsapp">("email")
  const router = useRouter()

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
  
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
  
      // CONSULTA EL PERFIL DESPUÉS DEL LOGIN
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()
  
      // REDIRECCIÓN CONDICIONAL
      if (profile?.role === 'admin') {
        router.push("/admin/dashboard")
      } else {
        router.push("/cliente/dashboard")
      }
      
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      if (otpMethod === "email") {
        if (!otpEmail) {
          throw new Error("Por favor ingresa tu correo electrónico")
        }

        const { error } = await supabase.auth.signInWithOtp({
          email: otpEmail,
          options: {
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/cliente/dashboard`,
            shouldCreateUser: true, // Permitir crear usuario si no existe
          },
        })
        
        if (error) throw error
        
        toast.success("Código OTP enviado. Revisa tu correo.")
        // Redirigir a la página de verificación OTP
        router.push(`/auth/verificar-otp?email=${encodeURIComponent(otpEmail)}`)
      } else {
        // WhatsApp - placeholder
        toast.error("El envío por WhatsApp aún no está disponible. Por favor usa Email.")
        setOtpMethod("email")
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al enviar código"
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
          <p className="text-muted-foreground">Bienvenido de vuelta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>Accede con tu contraseña o código OTP</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">Contraseña</TabsTrigger>
                <TabsTrigger value="otp">Código OTP</TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                <form onSubmit={handlePasswordLogin}>
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
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                      {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="otp">
                <form onSubmit={handleOTPRequest}>
                  <div className="flex flex-col gap-4">
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
                    </div>
                    {otpMethod === "email" ? (
                      <div className="grid gap-2">
                        <Label htmlFor="otp-email">Correo Electrónico</Label>
                        <Input
                          id="otp-email"
                          type="email"
                          placeholder="tu@correo.com"
                          required
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Te enviaremos un código de 6 dígitos por correo
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        <Label htmlFor="otp-phone">Número de WhatsApp</Label>
                        <Input
                          id="otp-phone"
                          type="tel"
                          placeholder="+52 123 456 7890"
                          value={otpPhone}
                          onChange={(e) => setOtpPhone(e.target.value)}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">
                          El envío por WhatsApp estará disponible pronto
                        </p>
                      </div>
                    )}
                    {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                      {otpMethod === "email" ? (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          {isLoading ? "Enviando..." : "Enviar Código OTP"}
                        </>
                      ) : (
                        <>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          {isLoading ? "Enviando..." : "Enviar por WhatsApp"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm">
              ¿No tienes cuenta?{" "}
              <Link
                href="/auth/registro"
                className="font-medium text-red-600 underline underline-offset-4 hover:text-red-700"
              >
                Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

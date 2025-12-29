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
import { Snowflake, Mail } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otpEmail, setOtpEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
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
      const { error } = await supabase.auth.signInWithOtp({
        email: otpEmail,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/cliente/dashboard`,
        },
      })
      if (error) throw error
      setOtpSent(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al enviar código")
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
                {!otpSent ? (
                  <form onSubmit={handleOTPRequest}>
                    <div className="flex flex-col gap-4">
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
                        <p className="text-xs text-muted-foreground">Te enviaremos un código de acceso único</p>
                      </div>
                      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                        <Mail className="mr-2 h-4 w-4" />
                        {isLoading ? "Enviando..." : "Enviar Código OTP"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-md bg-green-50 p-4 text-center">
                      <Mail className="mx-auto mb-2 h-8 w-8 text-green-600" />
                      <p className="text-sm font-medium text-green-800">Código OTP Enviado</p>
                      <p className="mt-2 text-xs text-green-700">
                        Revisa tu correo <strong>{otpEmail}</strong> y haz clic en el enlace para iniciar sesión
                      </p>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent" onClick={() => setOtpSent(false)}>
                      Intentar con otro correo
                    </Button>
                  </div>
                )}
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

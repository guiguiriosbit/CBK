"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Shield, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

function Login2FAContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [canResend, setCanResend] = useState(true)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [emailCodeSent, setEmailCodeSent] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get("email")
    const passwordParam = searchParams.get("password")
    if (emailParam) setEmail(decodeURIComponent(emailParam))
    if (passwordParam) setPassword(decodeURIComponent(passwordParam))
  }, [searchParams])

  useEffect(() => {
    if (resendCountdown > 0) {
      const t = setTimeout(() => setResendCountdown((v) => v - 1), 1000)
      return () => clearTimeout(t)
    }
    setCanResend(true)
  }, [resendCountdown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (token.length !== 6) {
      toast.error("Ingresa un código de 6 dígitos")
      return
    }

    if (!email || !password) {
      toast.error("Faltan credenciales")
      return
    }

    setIsLoading(true)

    try {
      // Primero verificar el código TOTP
      const verifyResponse = await fetch("/api/auth/2fa/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || "Código inválido")
      }

      // Si el código es válido, completar el login con NextAuth
      // Usamos un flag especial en la contraseña para indicar que 2FA ya fue validado
      const result = await signIn("credentials", {
        email,
        password: `${password}::2FA_VALIDATED`,
        redirect: false,
      })

      if (result?.error) {
        throw new Error("Error al completar el inicio de sesión")
      }

      if (result?.ok) {
        toast.success("Inicio de sesión exitoso")
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Error verificando 2FA:", error)
      toast.error(error instanceof Error ? error.message : "Código inválido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendEmailCode = async () => {
    if (!email || !canResend || isResending) return
    setIsResending(true)
    try {
      const res = await fetch("/api/auth/send-verification-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "No se pudo enviar el código")
      toast.success("Código enviado a tu correo. Revisa tu bandeja de entrada.")
      setEmailCodeSent(true)
      setCanResend(false)
      setResendCountdown(60)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al enviar el código")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-green-50 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-red-900">Adornos CBK</h1>
          <p className="text-muted-foreground">Verificación de dos factores</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Código de verificación
            </CardTitle>
            <CardDescription>
              Ingresa el código de 6 dígitos de tu app autenticadora o el que te enviamos por correo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <Label>Código de 6 dígitos</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={token}
                    onChange={setToken}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Usa el código de tu app (Google Authenticator, Authy) o el que te enviamos por correo
                </p>
              </div>

              <div className="rounded-lg border border-red-100 bg-red-50/50 p-3">
                <p className="mb-2 text-xs font-medium text-red-900">¿Prefieres recibir el código por correo?</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
                  onClick={handleSendEmailCode}
                  disabled={!canResend || isResending || !email}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
                  {canResend
                    ? isResending
                      ? "Enviando..."
                      : "Enviar código a mi correo"
                    : `Reenviar en ${resendCountdown}s`}
                </Button>
                {emailCodeSent && (
                  <p className="mt-2 text-xs text-green-700">Revisa tu correo e ingresa el código arriba.</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isLoading || token.length !== 6}
              >
                {isLoading ? "Verificando..." : "Verificar y continuar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Login2FAPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando...</div>}>
      <Login2FAContent />
    </Suspense>
  )
}

/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Snowflake, Mail, ArrowLeft, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function VerificarOTPPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((v) => v - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendCountdown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setError(null)

    try {
      if (!email || !otpCode) {
        throw new Error("Por favor ingresa tu correo y el código OTP")
      }

      const response = await fetch("/api/auth/verify-verification-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Código inválido o expirado")
      }

      toast.success("Correo verificado correctamente. Ahora puedes iniciar sesión.")
      router.push("/auth/login")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Código inválido o expirado"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend || !email) return

    setIsResending(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/send-verification-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "No se pudo reenviar el código")
      }

      toast.success("Código reenviado. Revisa tu correo (o la consola del servidor en desarrollo).")
      setCanResend(false)
      setResendCountdown(60)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "No se pudo reenviar el código"
      setError(errorMessage)
      toast.error(errorMessage)
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
              <Snowflake className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-red-900">Adornos CBK</h1>
          <p className="text-muted-foreground">Verifica tu correo con un código OTP</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Verificar código</CardTitle>
            <CardDescription>Ingresa el código de 6 dígitos que te enviamos al correo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-red-600" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="otp">Código OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  required
                  className="text-center text-2xl tracking-[0.4em] font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  El código es válido por 10 minutos. Si no lo ves, revisa tu carpeta de spam.
                </p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verificando..." : "Verificar código"}
              </Button>

              <div className="mt-4 rounded-lg border border-red-100 bg-red-50/50 p-3">
                <p className="mb-2 text-xs font-medium text-red-900">¿No recibiste el código?</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
                  onClick={handleResend}
                  disabled={!canResend || isResending || !email}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
                  {canResend
                    ? isResending
                      ? "Reenviando..."
                      : "Reenviar código al correo"
                    : `Reenviar en ${resendCountdown}s`}
                </Button>
              </div>

              <div className="mt-4 flex items-center justify-center text-sm">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-red-700 hover:underline"
                  onClick={() => router.push("/auth/login")}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a iniciar sesión
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/registro" className="font-medium text-red-700 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function VerificarOTPPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerificarOTPPageContent />
    </Suspense>
  )
}


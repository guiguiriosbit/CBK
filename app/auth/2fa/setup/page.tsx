"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Snowflake, Shield, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { QRCodeSVG } from "react-qr-code"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

export default function Setup2FAPage() {
  const router = useRouter()
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Generar secreto al montar
    const generateSecret = async () => {
      try {
        const response = await fetch("/api/auth/2fa/setup", {
          method: "POST",
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Error al generar secreto")
        }

        setOtpauthUrl(data.otpauthUrl)
        setSecret(data.secret)
        setIsGenerating(false)
      } catch (error) {
        console.error("Error generando secreto:", error)
        toast.error(error instanceof Error ? error.message : "Error al generar secreto")
        setIsGenerating(false)
      }
    }

    generateSecret()
  }, [])

  const handleCopySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret)
      setCopied(true)
      toast.success("Secreto copiado al portapapeles")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (token.length !== 6) {
      toast.error("Ingresa un código de 6 dígitos")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/2fa/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Código inválido")
      }

      toast.success("Autenticación de dos factores activada correctamente")
      router.push("/cliente/dashboard")
    } catch (error) {
      console.error("Error verificando código:", error)
      toast.error(error instanceof Error ? error.message : "Código inválido")
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
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-red-900">Adornos CBK</h1>
          <p className="text-muted-foreground">Configurar autenticación de dos factores</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configurar 2FA
            </CardTitle>
            <CardDescription>
              Escanea el código QR con tu app autenticadora (Google Authenticator, Authy, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Generando código QR...</p>
              </div>
            ) : otpauthUrl && secret ? (
              <div className="space-y-6">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-lg border-2 border-red-200 p-4 bg-white">
                    <QRCodeSVG value={otpauthUrl} size={200} level="M" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Escanea este código con tu app autenticadora
                  </p>
                </div>

                {/* Secret Key */}
                <div className="space-y-2">
                  <Label>Clave secreta (si no puedes escanear el QR)</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono break-all">
                      {secret}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopySecret}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Verification Form */}
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ingresa el código de 6 dígitos de tu app</Label>
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
                      Ingresa el código que aparece en tu app autenticadora
                    </p>
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading || token.length !== 6}>
                    {isLoading ? "Verificando..." : "Verificar y activar 2FA"}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-600">Error al generar código QR</p>
                <Button
                  onClick={() => router.push("/cliente/dashboard")}
                  variant="outline"
                  className="mt-4"
                >
                  Volver al dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

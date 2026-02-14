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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
  
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const errorMessage = result.error === "CredentialsSignin" 
          ? "Correo o contraseña incorrectos" 
          : result.error
        setError(errorMessage)
        toast.error(errorMessage)
        return
      }

      if (result?.ok) {
        toast.success("Sesión iniciada correctamente")
        router.push("/")
        router.refresh()
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al iniciar sesión")
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
            <CardDescription>Accede con tu correo y contraseña</CardDescription>
          </CardHeader>
          <CardContent>
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
                    autoComplete="off"
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
                    autoComplete="off"
                  />
                </div>
                {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                  {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                </Button>
              </div>
            </form>

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

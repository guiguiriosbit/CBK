import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { getAuthErrorMessage } from "@/lib/auth/errors"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  const params = await searchParams

  const friendlyMessage = params?.error
    ? getAuthErrorMessage(params.error)
    : params?.error_description ?? "Ocurrió un error inesperado. Por favor intenta nuevamente."

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-green-50 p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Error de autenticación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800"
              role="alert"
            >
              <p className="text-sm font-medium">{friendlyMessage}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/auth/login" className="block">
                <Button className="w-full bg-red-600 hover:bg-red-700">Intentar de nuevo</Button>
              </Link>
              <Link href="/auth/registro" className="block text-center text-sm text-red-700 hover:underline">
                ¿No tienes cuenta? Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

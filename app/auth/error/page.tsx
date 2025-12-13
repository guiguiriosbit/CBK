import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  const params = await searchParams

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
            <CardTitle className="text-center text-2xl">Algo salió mal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {params?.error_description ? (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{params.error_description}</p>
              </div>
            ) : params?.error ? (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">Código de error: {params.error}</p>
              </div>
            ) : (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">Ocurrió un error inesperado. Por favor intenta nuevamente.</p>
              </div>
            )}
            <Link href="/auth/login" className="block">
              <Button className="w-full bg-red-600 hover:bg-red-700">Volver a Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

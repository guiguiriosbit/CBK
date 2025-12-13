import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, Snowflake } from "lucide-react"

export default function VerificacionEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-green-50 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
              <Snowflake className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Verifica tu Correo</CardTitle>
            <CardDescription className="text-center">Te hemos enviado un enlace de verificación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">
                Hemos enviado un correo electrónico con un enlace de verificación. Por favor revisa tu bandeja de
                entrada y haz clic en el enlace para activar tu cuenta.
              </p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Si no ves el correo:</p>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>Revisa tu carpeta de spam</li>
                <li>Verifica que escribiste correctamente tu correo</li>
                <li>Espera unos minutos, a veces puede tardar</li>
              </ul>
            </div>
            <div className="pt-4">
              <Link href="/auth/login" className="w-full">
                <Button className="w-full bg-red-600 hover:bg-red-700">Ir a Iniciar Sesión</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

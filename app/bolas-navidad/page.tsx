import { ChristmasBallsGallery } from "@/components/christmas-balls-gallery"
import { Header } from "@/components/header"

export default function BolasNavidadPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Galería de Bolas de Navidad</h1>
        <p className="text-center text-muted-foreground mb-8">
          Explora nuestra colección de diferentes tipos de bolas de navidad
        </p>
        <ChristmasBallsGallery />
      </div>
    </div>
  )
}













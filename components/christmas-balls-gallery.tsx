"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { christmasBallImages, getAllTypes, getChristmasBallsByType } from "@/lib/christmas-ball-images"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ChristmasBallsGallery() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const types = getAllTypes()
  
  const displayedImages = selectedType 
    ? getChristmasBallsByType(selectedType as any)
    : christmasBallImages

  const handleImageError = (ballId: string) => {
    setImageErrors(prev => ({ ...prev, [ballId]: true }))
  }

  return (
    <div className="space-y-6">
      {/* Filtros por tipo */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedType(null)}
        >
          Todas
        </Button>
        {types.map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {/* Galería de imágenes */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedImages.map((ball) => (
          <Card key={ball.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative aspect-square overflow-hidden bg-muted">
                {imageErrors[ball.id] ? (
                  <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                    <div className="text-center p-4">
                      <p className="text-sm">Imagen no disponible</p>
                      <p className="text-xs mt-2">{ball.url}</p>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={ball.url}
                    alt={ball.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={() => handleImageError(ball.id)}
                    unoptimized
                  />
                )}
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary" className="text-xs">
                    {ball.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-1">{ball.name}</CardTitle>
              <CardDescription className="text-sm">{ball.description}</CardDescription>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {ball.source}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


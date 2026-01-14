# Imágenes de Bolas de Navidad

Este archivo contiene una colección de imágenes gratuitas de diferentes tipos de bolas de navidad que puedes usar en tu proyecto.

## Ubicación

Las imágenes están definidas en `/lib/christmas-ball-images.ts`

## Tipos de Bolas Disponibles

- **Rojas**: Bolas rojas clásicas, con estrellas, y con acabado mate
- **Doradas**: Bolas doradas brillantes, antiguas, y con patrones
- **Plateadas**: Bolas plateadas con acabado espejo, modernas, y con copos de nieve
- **Azules**: Bolas azules claras, oscuras, y con estrellas
- **Multicolor**: Bolas con colores del arcoíris, patrones festivos, y decoraciones
- **Vintage**: Bolas con diseño vintage, retro, y clásico
- **Brillantes**: Bolas con lentejuelas, acabado espejo, y cristales
- **Clásicas**: Bolas tradicionales con combinaciones roja/dorada y diseños elegantes

## Cómo Usar

### Importar las imágenes

```typescript
import { 
  christmasBallImages, 
  getChristmasBallsByType, 
  getRandomChristmasBall,
  getChristmasBallById 
} from "@/lib/christmas-ball-images"
```

### Ejemplos de Uso

#### Obtener todas las imágenes
```typescript
import { christmasBallImages } from "@/lib/christmas-ball-images"

// Todas las imágenes disponibles
const allBalls = christmasBallImages
```

#### Obtener imágenes por tipo
```typescript
import { getChristmasBallsByType } from "@/lib/christmas-ball-images"

// Solo bolas rojas
const redBalls = getChristmasBallsByType('roja')

// Solo bolas doradas
const goldBalls = getChristmasBallsByType('dorada')
```

#### Obtener una imagen aleatoria
```typescript
import { getRandomChristmasBall } from "@/lib/christmas-ball-images"

const randomBall = getRandomChristmasBall()
```

#### Obtener una imagen específica por ID
```typescript
import { getChristmasBallById } from "@/lib/christmas-ball-images"

const specificBall = getChristmasBallById('red-1')
```

### Usar en Componentes

```typescript
import Image from "next/image"
import { christmasBallImages } from "@/lib/christmas-ball-images"

export function MyComponent() {
  const ball = christmasBallImages[0]
  
  return (
    <Image
      src={ball.url}
      alt={ball.name}
      width={400}
      height={400}
    />
  )
}
```

### Usar el Componente de Galería

Ya existe un componente de galería listo para usar:

```typescript
import { ChristmasBallsGallery } from "@/components/christmas-balls-gallery"

export default function Page() {
  return (
    <div>
      <h1>Galería de Bolas de Navidad</h1>
      <ChristmasBallsGallery />
    </div>
  )
}
```

## Fuentes de las Imágenes

Todas las imágenes provienen de:
- **Unsplash**: Licencia gratuita para uso comercial y personal
- **Pexels**: Licencia gratuita para uso comercial y personal

## Nota Importante

Las URLs de las imágenes apuntan a servicios externos (Unsplash y Pexels). Asegúrate de tener conexión a internet para que las imágenes se carguen correctamente.

Si prefieres usar imágenes locales, puedes:
1. Descargar las imágenes desde Unsplash o Pexels
2. Guardarlas en la carpeta `/public/christmas-balls/`
3. Actualizar las URLs en `christmas-ball-images.ts` para apuntar a `/christmas-balls/nombre-imagen.jpg`

## Estructura de Datos

Cada imagen tiene la siguiente estructura:

```typescript
interface ChristmasBallImage {
  id: string              // Identificador único
  name: string            // Nombre de la bola
  description: string     // Descripción
  url: string            // URL de la imagen
  type: string           // Tipo de bola (roja, dorada, etc.)
  source: 'unsplash' | 'pexels'  // Fuente de la imagen
}
```










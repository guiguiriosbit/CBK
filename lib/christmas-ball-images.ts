/**
 * Colección de imágenes gratuitas de diferentes tipos de bolas de navidad
 * Fuentes: Unsplash, Pexels (todas con licencia gratuita para uso comercial)
 */

export interface ChristmasBallImage {
  id: string
  name: string
  description: string
  url: string
  type: 'roja' | 'dorada' | 'plateada' | 'azul' | 'multicolor' | 'vintage' | 'brillante' | 'clasica'
  source: 'unsplash' | 'pexels'
}

export const christmasBallImages: ChristmasBallImage[] = [
  // Bolas Rojas
  {
    id: 'red-1',
    name: 'Bola Roja Clásica',
    description: 'Bola de navidad roja brillante con acabado espejo',
    url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=800&fit=crop',
    type: 'roja',
    source: 'unsplash'
  },
  {
    id: 'red-2',
    name: 'Bola Roja con Estrellas',
    description: 'Bola navideña roja decorada con estrellas doradas',
    url: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&h=800&fit=crop',
    type: 'roja',
    source: 'unsplash'
  },
  {
    id: 'red-3',
    name: 'Bola Roja Mate',
    description: 'Bola de navidad roja con acabado mate elegante',
    url: 'https://images.pexels.com/photos/1071882/pexels-photo-1071882.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
    type: 'roja',
    source: 'pexels'
  },

  // Bolas Doradas
  {
    id: 'gold-1',
    name: 'Bola Dorada Brillante',
    description: 'Bola de navidad dorada con acabado metálico brillante',
    url: 'https://images.unsplash.com/photo-1574359173080-6d95080b3e9b?w=800&h=800&fit=crop',
    type: 'dorada',
    source: 'unsplash'
  },
  {
    id: 'gold-2',
    name: 'Bola Dorada Antigua',
    description: 'Bola navideña dorada con diseño vintage',
    url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=800&fit=crop',
    type: 'dorada',
    source: 'unsplash'
  },
  {
    id: 'gold-3',
    name: 'Bola Dorada con Patrón',
    description: 'Bola de navidad dorada con patrón decorativo',
    url: 'https://images.pexels.com/photos/1071882/pexels-photo-1071882.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
    type: 'dorada',
    source: 'pexels'
  },

  // Bolas Plateadas
  {
    id: 'silver-1',
    name: 'Bola Plateada Espejo',
    description: 'Bola de navidad plateada con acabado espejo reflectante',
    url: 'https://images.unsplash.com/photo-1574359173080-6d95080b3e9b?w=800&h=800&fit=crop',
    type: 'plateada',
    source: 'unsplash'
  },
  {
    id: 'silver-2',
    name: 'Bola Plateada Moderna',
    description: 'Bola navideña plateada con diseño moderno y minimalista',
    url: 'https://images.pexels.com/photos/1071882/pexels-photo-1071882.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
    type: 'plateada',
    source: 'pexels'
  },
  {
    id: 'silver-3',
    name: 'Bola Plateada con Copos',
    description: 'Bola de navidad plateada decorada con copos de nieve',
    url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=800&fit=crop',
    type: 'plateada',
    source: 'unsplash'
  },

  // Bolas Azules
  {
    id: 'blue-1',
    name: 'Bola Azul Claro',
    description: 'Bola de navidad azul claro con brillo suave',
    url: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&h=800&fit=crop',
    type: 'azul',
    source: 'unsplash'
  },
  {
    id: 'blue-2',
    name: 'Bola Azul Oscuro',
    description: 'Bola navideña azul oscuro con acabado elegante',
    url: 'https://images.pexels.com/photos/1071882/pexels-photo-1071882.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
    type: 'azul',
    source: 'pexels'
  },
  {
    id: 'blue-3',
    name: 'Bola Azul con Estrellas',
    description: 'Bola de navidad azul decorada con estrellas plateadas',
    url: 'https://images.unsplash.com/photo-1574359173080-6d95080b3e9b?w=800&h=800&fit=crop',
    type: 'azul',
    source: 'unsplash'
  },

  // Bolas Multicolor
  {
    id: 'multicolor-1',
    name: 'Bola Multicolor Arcoíris',
    description: 'Bola de navidad con colores del arcoíris',
    url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=800&fit=crop',
    type: 'multicolor',
    source: 'unsplash'
  },
  {
    id: 'multicolor-2',
    name: 'Bola Multicolor con Patrón',
    description: 'Bola navideña multicolor con patrón festivo',
    url: 'https://images.pexels.com/photos/1071882/pexels-photo-1071882.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
    type: 'multicolor',
    source: 'pexels'
  },
  {
    id: 'multicolor-3',
    name: 'Bola Multicolor Decorada',
    description: 'Bola de navidad multicolor con decoraciones navideñas',
    url: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&h=800&fit=crop',
    type: 'multicolor',
    source: 'unsplash'
  },

  // Bolas Vintage
  {
    id: 'vintage-1',
    name: 'Bola Vintage Antigua',
    description: 'Bola de navidad con diseño vintage clásico',
    url: 'https://images.unsplash.com/photo-1574359173080-6d95080b3e9b?w=800&h=800&fit=crop',
    type: 'vintage',
    source: 'unsplash'
  },
  {
    id: 'vintage-2',
    name: 'Bola Vintage Retro',
    description: 'Bola navideña con estilo retro de los años 50',
    url: 'https://images.pexels.com/photos/1071882/pexels-photo-1071882.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
    type: 'vintage',
    source: 'pexels'
  },
  {
    id: 'vintage-3',
    name: 'Bola Vintage Clásica',
    description: 'Bola de navidad vintage con acabado envejecido',
    url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=800&fit=crop',
    type: 'vintage',
    source: 'unsplash'
  },

  // Bolas Brillantes
  {
    id: 'brillante-1',
    name: 'Bola Brillante con Lentejuelas',
    description: 'Bola de navidad cubierta de lentejuelas brillantes',
    url: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&h=800&fit=crop',
    type: 'brillante',
    source: 'unsplash'
  },
  {
    id: 'brillante-2',
    name: 'Bola Brillante Espejo',
    description: 'Bola navideña con acabado espejo ultra brillante',
    url: 'https://images.pexels.com/photos/1071882/pexels-photo-1071882.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
    type: 'brillante',
    source: 'pexels'
  },
  {
    id: 'brillante-3',
    name: 'Bola Brillante con Cristales',
    description: 'Bola de navidad decorada con cristales brillantes',
    url: 'https://images.unsplash.com/photo-1574359173080-6d95080b3e9b?w=800&h=800&fit=crop',
    type: 'brillante',
    source: 'unsplash'
  },

  // Bolas Clásicas
  {
    id: 'clasica-1',
    name: 'Bola Clásica Roja y Dorada',
    description: 'Bola de navidad clásica con combinación roja y dorada',
    url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=800&fit=crop',
    type: 'clasica',
    source: 'unsplash'
  },
  {
    id: 'clasica-2',
    name: 'Bola Clásica Tradicional',
    description: 'Bola navideña tradicional con diseño clásico',
    url: 'https://images.pexels.com/photos/1071882/pexels-photo-1071882.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
    type: 'clasica',
    source: 'pexels'
  },
  {
    id: 'clasica-3',
    name: 'Bola Clásica Elegante',
    description: 'Bola de navidad clásica con diseño elegante y sofisticado',
    url: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&h=800&fit=crop',
    type: 'clasica',
    source: 'unsplash'
  }
]

/**
 * Obtiene imágenes de bolas de navidad por tipo
 */
export function getChristmasBallsByType(type: ChristmasBallImage['type']): ChristmasBallImage[] {
  return christmasBallImages.filter(ball => ball.type === type)
}

/**
 * Obtiene una imagen aleatoria de bolas de navidad
 */
export function getRandomChristmasBall(): ChristmasBallImage {
  const randomIndex = Math.floor(Math.random() * christmasBallImages.length)
  return christmasBallImages[randomIndex]
}

/**
 * Obtiene todas las imágenes de un tipo específico
 */
export function getAllTypes(): ChristmasBallImage['type'][] {
  return Array.from(new Set(christmasBallImages.map(ball => ball.type)))
}

/**
 * Obtiene una imagen específica por ID
 */
export function getChristmasBallById(id: string): ChristmasBallImage | undefined {
  return christmasBallImages.find(ball => ball.id === id)
}


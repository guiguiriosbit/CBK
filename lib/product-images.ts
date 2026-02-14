/**
 * URLs de imágenes de respaldo por categoría/producto.
 * Se usan cuando image_url en la base de datos está vacío o es placeholder.
 * Fuente: Picsum (picsum.photos) - imágenes deterministas por seed.
 */

const PICSUM_BASE = "https://picsum.photos"

/** Imagen por seed: misma semilla = misma imagen siempre */
const img = (seed: string, w = 600, h = 600) => `${PICSUM_BASE}/seed/${seed}/${w}/${h}`

const CATEGORY_IMAGES: Record<string, string> = {
  "Árboles de Navidad": img("arbol-navidad"),
  "Luces Navideñas": img("luces-navidad"),
  "Bolas y Ornamentos": img("bolas-navidad"),
  "Coronas": img("corona-navidad"),
  "Belenes y Figuras": img("belen-navidad"),
  "Decoración de Mesa": img("mesa-navidad"),
}

// Imágenes por palabra clave en el nombre del producto (orden matters: más específico primero)
const PRODUCT_KEYWORDS: [string[], string][] = [
  [["árbol", "tree", "compacto"], img("arbol-compacto")],
  [["árbol", "tree", "premium"], img("arbol-premium")],
  [["árbol", "tree"], img("arbol-navidad")],
  [["luces", "led", "multicolor"], img("luces-multicolor")],
  [["luces", "blancas"], img("luces-blancas")],
  [["luces", "lights"], img("luces-navidad")],
  [["bolas", "ornamentos", "rojas", "doradas"], img("bolas-doradas")],
  [["bolas", "ornamentos", "ornament"], img("bolas-navidad")],
  [["corona", "natural"], img("corona-natural")],
  [["corona", "led"], img("corona-led")],
  [["corona", "wreath"], img("corona-navidad")],
  [["nacimiento", "belén", "belen"], img("belen-navidad")],
  [["estrella"], img("estrella-navidad")],
  [["centro de mesa", "velas"], img("velas-mesa")],
  [["mantel"], img("mantel-navidad")],
]

function isPlaceholderOrEmpty(url: string | null | undefined): boolean {
  if (!url || url.trim() === "") return true
  return url.includes("placeholder") || url === "/placeholder.svg"
}

/**
 * Obtiene la URL de imagen para un producto.
 * Si image_url es válida, la devuelve. Si no, busca por categoría o palabras clave.
 */
export function getProductImageUrl(
  imageUrl: string | null | undefined,
  productName: string,
  categoryName?: string | null
): string {
  if (!isPlaceholderOrEmpty(imageUrl)) return imageUrl!.trim()

  const nameLower = productName.toLowerCase()

  for (const [keywords, url] of PRODUCT_KEYWORDS) {
    if (keywords.some((k) => nameLower.includes(k))) return url
  }

  if (categoryName && CATEGORY_IMAGES[categoryName]) {
    return CATEGORY_IMAGES[categoryName]
  }

  return CATEGORY_IMAGES["Bolas y Ornamentos"] ?? img("default-navidad")
}

/**
 * Obtiene la URL de imagen para una categoría.
 */
export function getCategoryImageUrl(
  imageUrl: string | null | undefined,
  categoryName: string
): string {
  if (!isPlaceholderOrEmpty(imageUrl)) return imageUrl!.trim()
  return CATEGORY_IMAGES[categoryName] ?? CATEGORY_IMAGES["Bolas y Ornamentos"] ?? img("default-navidad", 600, 400)
}

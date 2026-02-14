import Link from "next/link"
import { Snowflake, ShoppingCart, Instagram, Facebook, MessageCircle, Send } from "lucide-react"

/**
 * Icono de TikTok (Lucide no incluye TikTok).
 * SVG basado en el logo oficial simplificado.
 */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  )
}

const redesSocialesConfig = [
  {
    id: "instagram",
    label: "Instagram",
    url: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL,
    fallback: "https://instagram.com",
    icon: Instagram,
    brandColor: "bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500",
    iconColor: "text-white",
  },
  {
    id: "facebook",
    label: "Facebook",
    url: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL,
    fallback: "https://facebook.com",
    icon: Facebook,
    brandColor: "bg-[#1877F2]",
    iconColor: "text-white",
  },
  {
    id: "tiktok",
    label: "TikTok",
    url: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK_URL,
    fallback: "https://tiktok.com",
    icon: TikTokIcon,
    brandColor: "bg-black",
    iconColor: "text-white",
  },
] as const

const comunicacionConfig = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    url: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP_NUMBER
      ? `https://wa.me/${process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP_NUMBER.replace(/\D/g, "")}`
      : undefined,
    fallback: "https://wa.me",
    icon: MessageCircle,
    brandColor: "bg-[#25D366]",
    iconColor: "text-white",
  },
  {
    id: "telegram",
    label: "Telegram",
    url: process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM_URL,
    fallback: "https://t.me",
    icon: Send,
    brandColor: "bg-[#0088CC]",
    iconColor: "text-white",
  },
] as const

interface FooterProps {
  isAdmin?: boolean
}

function SocialButton({
  id,
  label,
  href,
  icon: Icon,
  isPlaceholder,
  brandColor,
  iconColor,
}: {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  isPlaceholder: boolean
  brandColor: string
  iconColor: string
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex h-10 w-10 items-center justify-center rounded-full ${brandColor} ${iconColor} hover:scale-110 hover:shadow-lg transition-all ${isPlaceholder ? "opacity-70" : ""}`}
      aria-label={isPlaceholder ? `${label} (configura en .env.local)` : label}
      title={isPlaceholder ? `Configura la URL en .env.local (ver REDES-SOCIALES.md)` : label}
    >
      <Icon className="h-5 w-5" />
    </Link>
  )
}

export function Footer({ isAdmin = false }: FooterProps) {
  const redesSociales = redesSocialesConfig.map((link) => ({
    ...link,
    href: link.url || link.fallback,
    isPlaceholder: !link.url,
  }))
  const comunicacion = comunicacionConfig.map((link) => ({
    ...link,
    href: link.url || link.fallback,
    isPlaceholder: !link.url,
  }))

  const linkClass = "text-sm text-amber-100/90 hover:text-white transition-colors [text-shadow:_0_1px_3px_rgba(0,0,0,0.4)]"
  const titleClass = "text-xs font-semibold uppercase tracking-wider text-amber-300 mb-4 pb-2 border-b border-amber-400/30 [text-shadow:_0_2px_4px_rgba(0,0,0,0.5)]"

  return (
    <footer className="border-t border-red-900/40 bg-red-700 shadow-inner py-12">
      <div className="container mx-auto px-4 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
        {/* Col 1: Marca */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Snowflake className="h-8 w-8 text-amber-300" />
            <span className="text-xl font-bold text-white [text-shadow:_0_2px_4px_rgba(0,0,0,0.5)]">Adornos CBK</span>
          </div>
          <p className="text-sm text-amber-50/90 mb-4 [text-shadow:_0_1px_2px_rgba(0,0,0,0.3)]">
            Haciendo tu Navidad especial desde el primer adorno.
          </p>
          <Link href="/carrito" className={`inline-flex items-center gap-2 ${linkClass}`}>
            <ShoppingCart className="h-4 w-4" />
            Carrito de compras
          </Link>
        </div>

        {/* Col 2: Tienda */}
        <div>
          <h4 className={titleClass}>Tienda</h4>
          <ul className="space-y-2">
            <li><Link href="/" className={linkClass}>Inicio</Link></li>
            <li><Link href="/#productos" className={linkClass}>Productos</Link></li>
            <li><Link href="/#categorias" className={linkClass}>Categorías</Link></li>
            <li><Link href="/bolas-navidad" className={linkClass}>Bolas de Navidad</Link></li>
            {isAdmin && (
              <li>
                <Link href="/admin/dashboard" className="text-sm text-amber-300 font-semibold hover:text-white [text-shadow:_0_1px_3px_rgba(0,0,0,0.4)]">
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Col 3: Cuenta */}
        <div>
          <h4 className={titleClass}>Mi Cuenta</h4>
          <ul className="space-y-2">
            <li><Link href="/auth/login" className={linkClass}>Iniciar Sesión</Link></li>
            <li><Link href="/auth/registro" className={linkClass}>Registro</Link></li>
            <li><Link href="/cliente/dashboard" className={linkClass}>Mi Perfil</Link></li>
            <li><Link href="/cliente/pedidos" className={linkClass}>Mis Pedidos</Link></li>
          </ul>
        </div>

        {/* Col 4: Redes Sociales */}
        <div>
          <h4 className={titleClass}>Nuestras Redes</h4>
          <div className="flex flex-wrap gap-2">
            {redesSociales.map((link) => (
              <SocialButton key={link.id} {...link} />
            ))}
          </div>
        </div>

        {/* Col 5: Comunícate vía */}
        <div>
          <h4 className={titleClass}>Comunícate vía</h4>
          <div className="flex flex-wrap gap-2">
            {comunicacion.map((link) => (
              <SocialButton key={link.id} {...link} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

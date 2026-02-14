import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

interface CategoryCardProps {
  name: string
  description: string
  imageUrl: string
  productCount?: number
}

export function CategoryCard({ name, description, imageUrl, productCount }: CategoryCardProps) {
  return (
    <Link href={`/?categoria=${encodeURIComponent(name)}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
              <h3 className="text-sm font-bold leading-tight line-clamp-1">{name}</h3>
              {description && <p className="text-xs text-white/80 line-clamp-1">{description}</p>}
              {productCount !== undefined && <p className="mt-0.5 text-[10px] text-white/60">{productCount} productos</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

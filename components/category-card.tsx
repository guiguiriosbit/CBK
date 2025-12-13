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
          <div className="relative aspect-video overflow-hidden bg-muted">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <h3 className="text-lg font-bold">{name}</h3>
              <p className="text-sm text-white/80">{description}</p>
              {productCount !== undefined && <p className="mt-1 text-xs text-white/60">{productCount} productos</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

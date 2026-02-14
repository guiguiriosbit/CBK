"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ALL_CATEGORIES_VALUE = "__all__"

interface HomeCategorySelectProps {
  categories: string[]
  selectedCategory?: string
}

export function HomeCategorySelect({ categories, selectedCategory }: HomeCategorySelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const value = selectedCategory && categories.includes(selectedCategory) ? selectedCategory : ALL_CATEGORIES_VALUE

  const handleChange = (newValue: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newValue === ALL_CATEGORIES_VALUE) {
      params.delete("categoria")
    } else {
      params.set("categoria", newValue)
    }

    const query = params.toString()
    const url = query ? `/?${query}` : "/"
    router.push(url)
  }

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full justify-between">
        <SelectValue placeholder="Selecciona una categoría" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_CATEGORIES_VALUE}>Todas las categorías</SelectItem>
        {categories.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}


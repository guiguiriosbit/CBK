"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react"
import Image from "next/image"

interface Category {
  id: string
  name: string
  description: string | null
  image_url: string | null
}

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("[v0] Error loading categories:", error)
      toast.error("Error al cargar las categorías")
    } else {
      setCategories(data || [])
    }
    setIsLoading(false)
  }

  const openAddDialog = () => {
    setEditingCategory(null)
    setFormData({ name: "", description: "", image_url: "" })
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      image_url: category.image_url || "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error("El nombre es requerido")
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    const categoryData = {
      name: formData.name,
      description: formData.description || null,
      image_url: formData.image_url || null,
    }

    let error
    if (editingCategory) {
      const result = await supabase.from("categories").update(categoryData).eq("id", editingCategory.id)
      error = result.error
    } else {
      const result = await supabase.from("categories").insert(categoryData)
      error = result.error
    }

    if (error) {
      console.error("[v0] Error saving category:", error)
      toast.error("Error al guardar la categoría")
    } else {
      toast.success(editingCategory ? "Categoría actualizada" : "Categoría creada")
      setIsDialogOpen(false)
      loadCategories()
    }
    setIsSaving(false)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría? Los productos asociados quedarán sin categoría.")) return

    const supabase = createClient()
    const { error } = await supabase.from("categories").delete().eq("id", categoryId)

    if (error) {
      console.error("[v0] Error deleting category:", error)
      toast.error("Error al eliminar la categoría")
    } else {
      toast.success("Categoría eliminada")
      loadCategories()
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <p className="text-muted-foreground">Cargando categorías...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
          <p className="text-muted-foreground">{categories.length} categorías en total</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90" onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Actualiza la información de la categoría" : "Agrega una nueva categoría"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">URL de Imagen</Label>
                <Input
                  id="image"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/placeholder.svg?height=300&width=300"
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSaving}>
                {isSaving ? "Guardando..." : editingCategory ? "Actualizar Categoría" : "Crear Categoría"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="p-0">
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                  <Image
                    src={category.image_url || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="mb-2">{category.name}</CardTitle>
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => openEditDialog(category)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center py-16">
            <FolderOpen className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">No hay categorías</p>
            <p className="mb-6 text-sm text-muted-foreground">Comienza agregando tu primera categoría</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

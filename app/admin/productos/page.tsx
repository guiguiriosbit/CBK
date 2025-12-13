"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Package } from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category_id: string | null
  image_url: string | null
  is_active: boolean
  featured: boolean
  categories?: { name: string }
}

interface Category {
  id: string
  name: string
}

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image_url: "",
    is_active: true,
    featured: false,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
      supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ])

    setProducts(productsData || [])
    setCategories(categoriesData || [])
    setIsLoading(false)
  }

  const openAddDialog = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category_id: "",
      image_url: "",
      is_active: true,
      featured: false,
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id || "",
      image_url: product.image_url || "",
      is_active: product.is_active,
      featured: product.featured,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: Number.parseFloat(formData.price),
      stock: Number.parseInt(formData.stock),
      category_id: formData.category_id || null,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
      featured: formData.featured,
    }

    let error
    if (editingProduct) {
      const result = await supabase.from("products").update(productData).eq("id", editingProduct.id)
      error = result.error
    } else {
      const result = await supabase.from("products").insert(productData)
      error = result.error
    }

    if (error) {
      console.error("[v0] Error saving product:", error)
      toast.error("Error al guardar el producto")
    } else {
      toast.success(editingProduct ? "Producto actualizado" : "Producto creado")
      setIsDialogOpen(false)
      loadData()
    }
    setIsSaving(false)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return

    const supabase = createClient()
    const { error } = await supabase.from("products").delete().eq("id", productId)

    if (error) {
      console.error("[v0] Error deleting product:", error)
      toast.error("Error al eliminar el producto")
    } else {
      toast.success("Producto eliminado")
      loadData()
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <p className="text-muted-foreground">Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <p className="text-muted-foreground">{products.length} productos en total</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90" onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Actualiza la información del producto" : "Agrega un nuevo producto al catálogo"}
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">URL de Imagen</Label>
                <Input
                  id="image"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/placeholder.svg?height=400&width=400"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Producto Activo</Label>
                  <p className="text-sm text-muted-foreground">Visible en la tienda</p>
                </div>
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="featured">Producto Destacado</Label>
                  <p className="text-sm text-muted-foreground">Aparece en la sección destacada</p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSaving}>
                {isSaving ? "Guardando..." : editingProduct ? "Actualizar Producto" : "Crear Producto"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {products.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader className="p-0">
                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute right-2 top-2 flex gap-2">
                    {product.featured && <Badge className="bg-secondary text-secondary-foreground">Destacado</Badge>}
                    {!product.is_active && <Badge variant="destructive">Inactivo</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="mb-2 line-clamp-1 text-lg">{product.name}</CardTitle>
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-primary">${Number(product.price).toLocaleString("es-MX")}</p>
                    <p className="text-xs text-muted-foreground">{product.categories?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${product.stock <= 5 ? "text-destructive" : "text-foreground"}`}>
                      {product.stock} unidades
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
                    onClick={() => handleDelete(product.id)}
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
            <Package className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">No hay productos</p>
            <p className="mb-6 text-sm text-muted-foreground">Comienza agregando tu primer producto</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

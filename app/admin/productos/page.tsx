"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
  discountPercent: number | null
  finalPrice: number
  stock: number
  categoryId: string | null
  imageUrl: string | null
  isActive: boolean
  featured: boolean
  isNew: boolean
  category?: { id: string; name: string } | null
}

interface Category {
  id: string
  name: string
}

const NO_CATEGORY_VALUE = "__none__"

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
    discountPercent: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
    isActive: true,
    featured: false,
    isNew: false,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ])

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error("Error al cargar datos")
      }

      const [productsData, categoriesData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
      ])

      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  const openAddDialog = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      discountPercent: "",
      stock: "",
      categoryId: "",
    imageUrl: "",
    isActive: true,
    featured: false,
    isNew: false,
  })
    setIsDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      discountPercent: product.discountPercent?.toString() || "",
      stock: product.stock.toString(),
      categoryId: product.categoryId || "",
      imageUrl: product.imageUrl || "",
      isActive: product.isActive,
      featured: product.featured,
      isNew: product.isNew,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.price || !formData.stock) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    setIsSaving(true)
    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products"
      const method = editingProduct ? "PATCH" : "POST"

      const productData: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId || null,
        imageUrl: formData.imageUrl.trim() || null,
        isActive: formData.isActive,
        featured: formData.featured,
        isNew: formData.isNew,
      }

      // Solo incluir discountPercent si tiene valor
      if (formData.discountPercent && formData.discountPercent.trim() !== "") {
        const discount = parseFloat(formData.discountPercent)
        if (discount < 0 || discount > 100) {
          toast.error("El descuento debe estar entre 0 y 100%")
          setIsSaving(false)
          return
        }
        productData.discountPercent = discount
      } else {
        productData.discountPercent = null
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al guardar el producto")
      }

      toast.success(editingProduct ? "Producto actualizado" : "Producto creado")
      setIsDialogOpen(false)
      loadData()
    } catch (error: any) {
      console.error("Error saving product:", error)
      toast.error(error.message || "Error al guardar el producto")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar el producto")
      }

      toast.success("Producto eliminado")
      loadData()
    } catch (error: any) {
      console.error("Error deleting product:", error)
      toast.error(error.message || "Error al eliminar el producto")
    }
  }

  const calculateFinalPrice = () => {
    const price = parseFloat(formData.price) || 0
    const discount = parseFloat(formData.discountPercent) || 0
    if (discount > 0 && discount <= 100) {
      return price * (1 - discount / 100)
    }
    return price
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                  required
                  className="uppercase"
                  style={{ textTransform: "uppercase" }}
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
                  <Label htmlFor="discountPercent">Descuento (%)</Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    placeholder="0-100"
                  />
                  {formData.discountPercent && parseFloat(formData.discountPercent) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Precio final: ${calculateFinalPrice().toFixed(2)}
                    </p>
                  )}
                </div>
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
              <div className="grid gap-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.categoryId || NO_CATEGORY_VALUE}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      categoryId: value === NO_CATEGORY_VALUE ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CATEGORY_VALUE}>Sin categoría</SelectItem>
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
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Producto Activo</Label>
                  <p className="text-sm text-muted-foreground">Visible en la tienda</p>
                </div>
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
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
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isNew">Producto Nuevo</Label>
                  <p className="text-sm text-muted-foreground">Muestra badge "Nuevo" en la tarjeta</p>
                </div>
                <Switch
                  id="isNew"
                  checked={formData.isNew}
                  onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
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
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                      Sin imagen
                    </div>
                  )}
                  <div className="absolute right-2 top-2 flex flex-col gap-2">
                    {product.featured && <Badge className="bg-secondary text-secondary-foreground">Destacado</Badge>}
                    {product.isNew && <Badge className="bg-green-600 text-white">Nuevo</Badge>}
                    {!product.isActive && <Badge variant="destructive">Inactivo</Badge>}
                    {product.discountPercent && product.discountPercent > 0 && (
                      <Badge className="bg-orange-600 text-white">
                        -{product.discountPercent.toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="mb-2 line-clamp-1 text-lg">{product.name}</CardTitle>
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    {product.discountPercent && product.discountPercent > 0 ? (
                      <div>
                        <p className="text-sm text-muted-foreground line-through">
                          ${product.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          ${product.finalPrice.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-primary">
                        ${product.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{product.category?.name || "Sin categoría"}</p>
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

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Upload, X } from "lucide-react"
import Image from "next/image"

export default function NewProductPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [category, setCategory] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isFeatured, setIsFeatured] = useState(false)
  const [isNewArrival, setIsNewArrival] = useState(false)
  const [isBestSeller, setIsBestSeller] = useState(false)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages((prevImages) => [...prevImages, ...files])

    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index))
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (images.length === 0) {
        throw new Error("At least one image is required")
      }

      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const fileName = `${Date.now()}-${image.name}`
          const { data, error } = await supabase.storage.from("product-images").upload(fileName, image)

          if (error) throw error

          return fileName // Store only the file name, not the full URL
        }),
      )

      const { data, error } = await supabase.from("products").insert([
        {
          name,
          description,
          price: Number.parseFloat(price),
          stock: Number.parseInt(stock),
          category,
          image_url: imageUrls[0], // Main image
          additional_image_urls: imageUrls.slice(1), // Additional images
          is_featured: isFeatured,
          is_new_arrival: isNewArrival,
          is_best_seller: isBestSeller,
        },
      ])

      if (error) throw error

      toast({
        title: "Product created",
        description: "The product has been successfully added.",
      })

      router.push("/admin/products")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
        <h1 className="text-3xl font-bold">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="h-32"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skincare">Skincare</SelectItem>
                  <SelectItem value="makeup">Makeup</SelectItem>
                  <SelectItem value="haircare">Haircare</SelectItem>
                  <SelectItem value="fragrance">Fragrance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="images">Product Images</Label>
              <div className="mt-2 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md bg-gray-50 transition-all duration-300 ease-in-out hover:bg-gray-100">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload images</span>
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <Image
                    src={preview || "/placeholder.svg"}
                    alt={`Product preview ${index + 1}`}
                    width={200}
                    height={200}
                    className="rounded-md object-cover w-full h-40"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newArrival"
                  checked={isNewArrival}
                  onCheckedChange={(checked) => setIsNewArrival(checked as boolean)}
                />
                <Label htmlFor="newArrival">New Arrival</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bestSeller"
                  checked={isBestSeller}
                  onCheckedChange={(checked) => setIsBestSeller(checked as boolean)}
                />
                <Label htmlFor="bestSeller">Best Seller</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="w-full md:w-auto" disabled={loading}>
            {loading ? "Adding Product..." : "Add Product"}
          </Button>
        </div>
      </form>
    </div>
  )
}


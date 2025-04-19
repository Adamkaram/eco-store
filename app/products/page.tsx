"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { ShoppingCart, Filter, Loader2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Product = {
  id: string
  name: string
  category: string
  price: number
  image_url: string
  description: string
  stock: number
  categories: {
    name: string
  }
  is_featured?: boolean
  is_new_arrival?: boolean
  is_best_seller?: boolean
}

const categories = ["Skincare", "Makeup", "Fragrances", "Hair Care", "Body Care"]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 500])
  const [showFeatured, setShowFeatured] = useState(false)
  const [showNewArrivals, setShowNewArrivals] = useState(false)
  const [showBestSellers, setShowBestSellers] = useState(false)
  const { t, locale } = useTranslations()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const category = searchParams.get("category")
    if (category && !selectedCategories.includes(category)) {
      setSelectedCategories([category])
    }
  }, [searchParams, selectedCategories])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategories, searchQuery, priceRange, showFeatured, showNewArrivals, showBestSellers])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      let query = supabase
        .from("products")
        .select(`
          *,
          categories(name)
        `)
        .gte("price", priceRange[0])
        .lte("price", priceRange[1])

      if (selectedCategories.length > 0) {
        query = query.in("categories.name", selectedCategories)
      }

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`)
      }

      if (showFeatured) {
        query = query.eq("is_featured", true)
      }

      if (showNewArrivals) {
        query = query.eq("is_new_arrival", true)
      }

      if (showBestSellers) {
        query = query.eq("is_best_seller", true)
      }

      const { data, error } = await query

      if (error) throw error
      setProducts(
        data.map((product) => ({
          ...product,
          category: product.categories?.name,
        })) || [],
      )
    } catch (error: any) {
      console.error("Error fetching products:", error)
      setError(error.message || "An error occurred while fetching products.")
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: productId,
        quantity: 1,
      })

      if (error) throw error

      toast({
        title: "Added to cart",
        description: "Product has been added to your cart.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="sticky top-4 space-y-6 bg-card p-6 rounded-lg border">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{t("categories")}</h3>
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategories([...selectedCategories, category])
                      } else {
                        setSelectedCategories(selectedCategories.filter((c) => c !== category))
                      }
                    }}
                  />
                  <label htmlFor={category} className="text-sm font-medium leading-none cursor-pointer">
                    {t(category.toLowerCase())}
                  </label>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{t("priceRange")}</h3>
              <Slider
                defaultValue={[0, 500]}
                max={500}
                step={10}
                value={priceRange}
                onValueChange={setPriceRange}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{t("productStatus")}</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={showFeatured}
                  onCheckedChange={(checked) => setShowFeatured(checked as boolean)}
                />
                <label htmlFor="featured" className="text-sm font-medium leading-none cursor-pointer">
                  {t("featured")}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newArrivals"
                  checked={showNewArrivals}
                  onCheckedChange={(checked) => setShowNewArrivals(checked as boolean)}
                />
                <label htmlFor="newArrivals" className="text-sm font-medium leading-none cursor-pointer">
                  {t("newArrivals")}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bestSellers"
                  checked={showBestSellers}
                  onCheckedChange={(checked) => setShowBestSellers(checked as boolean)}
                />
                <label htmlFor="bestSellers" className="text-sm font-medium leading-none cursor-pointer">
                  {t("bestSellers")}
                </label>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSelectedCategories([])
                setPriceRange([0, 500])
                setSearchQuery("")
                setShowFeatured(false)
                setShowNewArrivals(false)
                setShowBestSellers(false)
              }}
            >
              {t("clearFilters")}
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-6">
            <Input
              type="search"
              placeholder={t("searchProducts")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">{t("noProducts")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden group">
                  <div className="relative">
                    <AspectRatio ratio={1}>
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </AspectRatio>
                    {product.is_new_arrival && (
                      <span className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                        {t("new")}
                      </span>
                    )}
                    {product.is_best_seller && (
                      <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                        {t("bestSeller")}
                      </span>
                    )}
                    {product.stock < 5 && (
                      <span className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        {t("lowStock")}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{product.category}</p>
                    <p className="text-sm line-clamp-2 mb-4">{product.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
                      <Button size="sm" disabled={product.stock === 0} onClick={() => addToCart(product.id)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {t(product.stock === 0 ? "outOfStock" : "addToCart")}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


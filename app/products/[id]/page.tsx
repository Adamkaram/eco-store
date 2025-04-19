// old file
"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from "@/lib/supabase/client"
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddToCartButton } from '@/components/add-to-cart-button'

type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category_id: string
  main_image_url: string
  additional_image_urls: string[]
}

export default function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { id } = useParams()
  const { toast } = useToast()

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setProduct(data)
      setSelectedImage(data.main_image_url)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (!product) return <div>Loading...</div>

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <img 
              src={selectedImage || product.main_image_url} 
              alt={product.name} 
              className="w-full h-96 object-cover rounded"
            />
            <div className="flex mt-4 gap-2 overflow-x-auto">
              <img
                src={product.main_image_url || "/placeholder.svg"}
                alt={`${product.name} main`}
                className="w-20 h-20 object-cover cursor-pointer"
                onClick={() => setSelectedImage(product.main_image_url)}
              />
              {product.additional_image_urls.map((url, index) => (
                <img
                  key={index}
                  src={url || "/placeholder.svg"}
                  alt={`${product.name} ${index + 1}`}
                  className="w-20 h-20 object-cover cursor-pointer"
                  onClick={() => setSelectedImage(url)}
                />
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <p className="text-lg mb-4">{product.description}</p>
            <p className="text-xl font-bold mb-2">Price: ${product.price.toFixed(2)}</p>
            <p className="mb-4">Stock: {product.stock}</p>
            <AddToCartButton productId={product.id} productName={product.name} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


// new file

"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useTranslations } from "@/hooks/use-translations";
import { ShoppingCart, Filter, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  description: string;
  stock: number;
};

const categories = ["Skincare", "Makeup", "Fragrances", "Hair Care", "Body Care"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const { t, locale } = useTranslations();
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategories, searchQuery, priceRange]);

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .gte('price', priceRange[0])
        .lte('price', priceRange[1]);

      if (selectedCategories.length > 0) {
        query = query.in('category', selectedCategories);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1
        });

      if (error) throw error;

      toast({
        title: "Added to cart",
        description: "Product has been added to your cart.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
                        setSelectedCategories([...selectedCategories, category]);
                      } else {
                        setSelectedCategories(selectedCategories.filter(c => c !== category));
                      }
                    }}
                  />
                  <label
                    htmlFor={category}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
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

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSelectedCategories([]);
                setPriceRange([0, 500]);
                setSearchQuery("");
              }}
            >
              {t("clearFilters")}
            </Button>
          </div>
        </div>

        {/* Products Grid */}
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
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </AspectRatio>
                    {product.stock < 5 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
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
                      <Button 
                        size="sm" 
                        disabled={product.stock === 0}
                        onClick={() => addToCart(product.id)}
                      >
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
  );
}


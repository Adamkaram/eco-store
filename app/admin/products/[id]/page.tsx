"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url: string
  additional_image_urls: string[] | null
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { id } = useParams()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

      if (error) throw error

      setProduct(data)
      setSelectedImage(data.image_url)
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
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${selectedImage}`}
              alt={product.name}
              className="w-full h-96 object-cover rounded"
              width={500}
              height={500}
            />
            <div className="flex mt-4 gap-2 overflow-x-auto">
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.image_url}`}
                alt={`${product.name} main`}
                width={100}
                height={100}
                className="w-20 h-20 object-cover cursor-pointer rounded"
                onClick={() => setSelectedImage(product.image_url)}
              />
              {product.additional_image_urls && product.additional_image_urls.length > 0
                ? product.additional_image_urls.map((url, index) => (
                    <Image
                      key={index}
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${url}`}
                      alt={`${product.name} ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-20 h-20 object-cover cursor-pointer rounded"
                      onClick={() => setSelectedImage(url)}
                    />
                  ))
                : null}
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <p className="text-lg mb-4">{product.description}</p>
            <p className="text-xl font-bold mb-2">Price: ${product.price.toFixed(2)}</p>
            <p className="mb-2">Stock: {product.stock}</p>
            <p className="mb-4">Category: {product.category}</p>
            <Button>Add to Cart</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


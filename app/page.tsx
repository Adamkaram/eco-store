import { Card } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/client"
import { AddToCartButton } from "@/components/add-to-cart-button"

const supabase = createServerSupabaseClient()

export default async function Home() {
  const { data: categories } = await supabase.from("categories").select("*")
  const { data: featuredProducts } = await supabase.from("products").select("*").eq("is_featured", true).limit(4)
  const { data: newArrivals } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(4)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative h-[600px] rounded-lg overflow-hidden mb-12">
        <Image
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80"
          alt="Beauty Products"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-2xl px-4 ml-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Discover Your Natural Beauty</h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">Premium cosmetics for the modern beauty enthusiast</p>
            <Link href="/products">
              <Button size="lg" className="bg-white text-black hover:bg-white/90">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories?.map((category) => (
            <Link href={`/products?category=${category.name}`} key={category.id}>
              <Card className="group cursor-pointer overflow-hidden">
                <AspectRatio ratio={1}>
                  <Image
                    src={category.image_url || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                  </div>
                </AspectRatio>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {featuredProducts?.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <Link href={`/products/${product.id}`}>
                <AspectRatio ratio={1}>
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </AspectRatio>
              </Link>
              <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                </Link>
                <p className="text-muted-foreground mb-2">{product.category}</p>
                <p className="font-bold mb-2">${product.price.toFixed(2)}</p>
                <div className="flex justify-between items-center">
                  <AddToCartButton productId={product.id} productName={product.name} />
                  {product.is_new_arrival && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">New</span>
                  )}
                  {product.is_best_seller && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">Best Seller</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8">New Arrivals</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {newArrivals?.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <Link href={`/products/${product.id}`}>
                <AspectRatio ratio={1}>
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </AspectRatio>
              </Link>
              <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                </Link>
                <p className="text-muted-foreground mb-2">{product.category}</p>
                <p className="font-bold mb-2">${product.price.toFixed(2)}</p>
                <AddToCartButton productId={product.id} productName={product.name} />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-primary text-primary-foreground rounded-lg p-8 mb-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="mb-6">Subscribe to our newsletter for exclusive offers and beauty tips.</p>
          <form className="flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-grow bg-primary-foreground text-primary px-3 py-2 rounded-md"
            />
            <Button variant="secondary">Subscribe</Button>
          </form>
        </div>
      </section>
    </div>
  )
}


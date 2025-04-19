import Link from "next/link"
import { usePathname } from "next/navigation"

interface FooterProps {
  showInDashboard?: boolean
}

export default function Footer({ showInDashboard = true }: FooterProps) {
  const pathname = usePathname()

  if (pathname.startsWith("/admin")) {
    return null
  }

  if (!showInDashboard) {
    return null
  }

  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">About Us</h3>
            <p className="text-sm text-muted-foreground">
              Glow Beauty offers premium cosmetics and skincare products for the modern beauty enthusiast.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact-us">Contact Us</Link>
              </li>
              <li>
                <Link href="/shipping-information">Shipping Information</Link>
              </li>
              <li>
                <Link href="/returns-and-exchanges">Returns & Exchanges</Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products">Shop All</Link>
              </li>
              <li>
                <Link href="/products?category=New%20Arrivals">New Arrivals</Link>
              </li>
              <li>
                <Link href="/products?category=Best%20Sellers">Best Sellers</Link>
              </li>
              <li>
                <Link href="/products?category=Special%20Offers">Special Offers</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <input type="email" placeholder="Enter your email" className="w-full px-3 py-2 border rounded-md text-sm" />
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Glow Beauty. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}


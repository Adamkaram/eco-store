"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart, User, Search, ShoppingBag } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { LanguageToggle } from "./language-toggle"
import { useTranslations } from "@/hooks/use-translations"
import { UserDropdown } from "./user-dropdown"
import { useAuth } from "@/lib/auth/AuthContext"
import { useCart } from "@/hooks/use-cart"
import { motion, AnimatePresence } from "framer-motion"
import { MiniCart } from "./mini-cart"

export default function Header() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")
  const { t } = useTranslations()
  const { user } = useAuth()
  const { getCartCount } = useCart()
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart") {
        // Trigger cart icon animation
        const iconElement = document.querySelector(".cart-icon") as HTMLElement
        if (iconElement) {
          iconElement.classList.add("animate-cart-bump")
          setTimeout(() => {
            iconElement.classList.remove("animate-cart-bump")
          }, 300)
        }
        // Force a re-render to update cart count
        getCartCount()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [getCartCount])

  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      setCartCount(event.detail.count)
    }

    window.addEventListener("cartUpdated", handleCartUpdate as EventListener)

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate as EventListener)
    }
  }, [])

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Glow Beauty
          </Link>

          {!isAdmin && (
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("searchProducts")} className="pl-8" />
              </div>
            </div>
          )}

          <nav className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageToggle />

            {isAdmin ? (
              <Link href="/">
                <Button variant="outline">{t("backToStore")}</Button>
              </Link>
            ) : (
              <>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMiniCartOpen(!isMiniCartOpen)}
                    className="cart-icon"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <AnimatePresence>
                      {cartCount > 0 && (
                        <motion.span
                          key="cart-count"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                        >
                          {cartCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                  <AnimatePresence>
                    {isMiniCartOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 z-50"
                      >
                        <MiniCart onClose={() => setIsMiniCartOpen(false)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {user ? (
                  <UserDropdown />
                ) : (
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}


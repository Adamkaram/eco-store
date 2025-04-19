"use client";

import Link from "next/link";
import { ShoppingCart, User, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { useTranslations } from "@/hooks/use-translations";

export default function Header() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const { t } = useTranslations();

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
                <Input
                  placeholder={t("searchProducts")}
                  className="pl-8"
                />
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
                <Link href="/cart">
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/account">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}


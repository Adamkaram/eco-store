import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Glow Beauty - Premium Cosmetics Store",
  description: "Discover our premium collection of beauty and skincare products.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer showInDashboard={!pathname.startsWith("/admin")} />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


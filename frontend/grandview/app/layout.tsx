import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { TopBar } from "@/components/layout/topbar"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "sonner"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "GrandView - Shop, Advertise and Earn",
  description: "Amazing neon dashboard with bright colors and animations",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Suspense fallback={null}>
              <TopBar />
              <main className="min-h-[calc(100vh-4rem)]">{children}</main>
              <Toaster
                position="top-center"
                richColors
                expand
                closeButton
                duration={3500}
                toastOptions={{
                  classNames: {
                    toast: "rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-white shadow-lg",
                    title: "font-semibold text-sm sm:text-base",
                    description: "text-xs sm:text-sm text-neutral-200",
                    closeButton: "text-white hover:text-red-400",
                  },
                  style: {
                    padding: "12px 16px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    fontSize: "14px",
                  },
                }}
              />
            </Suspense>
          </AuthProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

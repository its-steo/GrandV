import type { ReactNode } from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TopBar } from "@/components/layout/topbar";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "sonner";
import { Suspense } from "react";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Grandview-shop - Professional WhatsApp Advertising Platform",
  description:
    "Professional advertising platform for WhatsApp marketing campaigns with advanced analytics and user management",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/images/grandvlogo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/grandvlogo-512.png", sizes: "512x512", type: "image/png" },
      { url: "/images/grandvlogo-maskable-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/grandvlogo-maskable-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/images/grandvlogo-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3d3d3d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <AuthProvider>
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen bg-black">
                  <img
                    src="/images/grandvlogo.png"
                    alt="Grandview Logo"
                    className="w-48 h-auto"
                  />
                </div>
              }
            >
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
                    toast:
                      "rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-white shadow-lg",
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
  );
}
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { AppSessionProvider } from "@/components/session-provider"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], display: "swap" })
const _geistMono = Geist_Mono({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "Adornos CBK",
  description:
    "Encuentra los mejores adornos navideños: árboles, luces, bolas, coronas y más. Entrega a domicilio en toda la república.",
  generator: "v0.app",
  keywords: ["adornos navideños", "decoración navidad", "árboles de navidad", "luces navideñas", "tienda navidad"],
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        {/* Script para forzar la eliminación de botones de feedback de v0/Vercel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const observer = new MutationObserver(() => {
                const selectors = [
                  '#__next-v0-container',
                  '.v0-feedback-button',
                  '#vercel-live-feedback',
                  '[data-nextjs-toast]',
                  '[data-vercel-feedback-button]'
                ];
                selectors.forEach(selector => {
                  const el = document.querySelector(selector);
                  if (el) el.remove();
                });
              });
              observer.observe(document.body, { childList: true, subtree: true });
            `,
          }}
        />
        <AppSessionProvider>{children}</AppSessionProvider>
        <SonnerToaster />
      </body>
    </html>
  )
}
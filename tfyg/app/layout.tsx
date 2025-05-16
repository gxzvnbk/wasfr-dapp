import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { AppHeader } from "@/components/app-header"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/context/wallet-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Eth_dev's DApp - Cross-DEX Arbitrage Platform",
  description: "Maximize profits with cross-DEX arbitrage using flash loans",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <WalletProvider>
            <div className="flex flex-col min-h-screen">
              <AppHeader />
              <main className="flex-1">{children}</main>
              <footer className="py-6 border-t border-zinc-800">
                <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                      <p className="text-sm text-zinc-500">
                        &copy; {new Date().getFullYear()} Eth_dev's DApp. All rights reserved.
                      </p>
                    </div>
                    <div className="flex space-x-6">
                      <a href="#" className="text-sm text-zinc-500 hover:text-white">
                        Terms of Service
                      </a>
                      <a href="#" className="text-sm text-zinc-500 hover:text-white">
                        Privacy Policy
                      </a>
                      <a href="#" className="text-sm text-zinc-500 hover:text-white">
                        Contact
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

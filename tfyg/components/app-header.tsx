"use client"

import Link from "next/link"
import { useState } from "react"
import { MultiWalletConnect } from "@/components/multi-wallet-connect"
import { NetworkSwitcher } from "@/components/network-switcher"
import { Menu, X, BarChart2, Zap, GitCompare, DollarSign } from "lucide-react"

export function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Zap className="h-6 w-6 text-blue-500 mr-2" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                Eth_dev's DApp
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/dashboard" className="px-3 py-2 text-sm rounded-md hover:bg-zinc-800">
              Dashboard
            </Link>
            <Link href="/arbitrage" className="px-3 py-2 text-sm rounded-md hover:bg-zinc-800">
              Arbitrage Bot
            </Link>
            <Link href="/prices" className="px-3 py-2 text-sm rounded-md hover:bg-zinc-800">
              Live Prices
            </Link>
            <Link href="/contracts" className="px-3 py-2 text-sm rounded-md hover:bg-zinc-800">
              Contracts
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            <NetworkSwitcher />
            <MultiWalletConnect />
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-md hover:bg-zinc-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-black">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-2 rounded-md hover:bg-zinc-800"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart2 className="h-5 w-5 mr-3 text-zinc-400" />
                Dashboard
              </Link>
              <Link
                href="/arbitrage"
                className="flex items-center px-3 py-2 rounded-md hover:bg-zinc-800"
                onClick={() => setIsMenuOpen(false)}
              >
                <Zap className="h-5 w-5 mr-3 text-zinc-400" />
                Arbitrage Bot
              </Link>
              <Link
                href="/prices"
                className="flex items-center px-3 py-2 rounded-md hover:bg-zinc-800"
                onClick={() => setIsMenuOpen(false)}
              >
                <DollarSign className="h-5 w-5 mr-3 text-zinc-400" />
                Live Prices
              </Link>
              <Link
                href="/contracts"
                className="flex items-center px-3 py-2 rounded-md hover:bg-zinc-800"
                onClick={() => setIsMenuOpen(false)}
              >
                <GitCompare className="h-5 w-5 mr-3 text-zinc-400" />
                Contracts
              </Link>
            </nav>
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <NetworkSwitcher />
              <MultiWalletConnect />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

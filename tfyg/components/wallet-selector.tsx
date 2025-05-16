"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wallet, WalletIcon as WalletConnect, Coins } from "lucide-react"
import Image from "next/image"
import { useWallet } from "@/context/wallet-context"

// Supported wallet types
const WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "/wallets/metamask.png",
    description: "Connect to your MetaMask Wallet",
    isPopular: true,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: Wallet,
    description: "Scan with WalletConnect to connect",
    isPopular: true,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: Coins,
    description: "Connect to your Coinbase Wallet",
    isPopular: true,
  },
  {
    id: "trust",
    name: "Trust Wallet",
    icon: WalletConnect,
    description: "Connect to your Trust Wallet",
    isPopular: false,
  },
  {
    id: "brave",
    name: "Brave Wallet",
    icon: Wallet,
    description: "Connect to your Brave Wallet",
    isPopular: false,
  },
]

interface WalletSelectorProps {
  isOpen: boolean
  onClose: () => void
}

export default function WalletSelector({ isOpen, onClose }: WalletSelectorProps) {
  const { connect, isConnected } = useWallet()
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected) {
      onClose()
    }
  }, [isConnected, onClose])

  const handleConnect = async (walletId: string) => {
    setSelectedWallet(walletId)
    setIsConnecting(true)
    setError(null)

    try {
      await connect(walletId)
      onClose()
    } catch (err) {
      console.error("Failed to connect wallet:", err)
      setError(err instanceof Error ? err.message : "Failed to connect wallet. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>Choose your preferred wallet to connect to our platform</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Popular</h3>
            <div className="grid gap-2">
              {WALLETS.filter((w) => w.isPopular).map((wallet) => (
                <Button
                  key={wallet.id}
                  variant="outline"
                  className="justify-start h-16 px-4 py-3 w-full"
                  onClick={() => handleConnect(wallet.id)}
                  disabled={isConnecting}
                >
                  <div className="flex items-center gap-3 w-full">
                    {typeof wallet.icon === "string" ? (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <Image src={wallet.icon || "/placeholder.svg"} alt={wallet.name} width={32} height={32} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <wallet.icon className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{wallet.name}</span>
                      <span className="text-xs text-muted-foreground">{wallet.description}</span>
                    </div>
                    {isConnecting && selectedWallet === wallet.id && (
                      <div className="ml-auto animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Other Wallets</h3>
            <div className="grid gap-2">
              {WALLETS.filter((w) => !w.isPopular).map((wallet) => (
                <Button
                  key={wallet.id}
                  variant="outline"
                  className="justify-start h-16 px-4 py-3 w-full"
                  onClick={() => handleConnect(wallet.id)}
                  disabled={isConnecting}
                >
                  <div className="flex items-center gap-3 w-full">
                    {typeof wallet.icon === "string" ? (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <Image src={wallet.icon || "/placeholder.svg"} alt={wallet.name} width={32} height={32} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <wallet.icon className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{wallet.name}</span>
                      <span className="text-xs text-muted-foreground">{wallet.description}</span>
                    </div>
                    {isConnecting && selectedWallet === wallet.id && (
                      <div className="ml-auto animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={onClose} className="mt-2 sm:mt-0">
            Cancel
          </Button>
          <div className="text-xs text-muted-foreground mt-4 sm:mt-0">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

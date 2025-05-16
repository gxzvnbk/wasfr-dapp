"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import WalletSelector from "./wallet-selector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatAddress } from "@/utils/format-address"

export function MultiWalletConnect() {
  const { address, isConnected, disconnect } = useWallet()
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false)

  const handleOpenWalletSelector = () => {
    setIsWalletSelectorOpen(true)
  }

  const handleCloseWalletSelector = () => {
    setIsWalletSelectorOpen(false)
  }

  if (isConnected && address) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="hidden sm:inline">Connected:</span> {formatAddress(address)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Wallet Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(address)}>Copy Address</DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenWalletSelector}>Switch Wallet</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={disconnect} className="text-destructive">
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <WalletSelector isOpen={isWalletSelectorOpen} onClose={handleCloseWalletSelector} />
      </>
    )
  }

  return (
    <>
      <Button onClick={handleOpenWalletSelector} className="gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>

      <WalletSelector isOpen={isWalletSelectorOpen} onClose={handleCloseWalletSelector} />
    </>
  )
}

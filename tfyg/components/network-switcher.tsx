"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWallet } from "@/context/wallet-context"
import { Globe, ChevronDown } from "lucide-react"

// Network configurations
const NETWORKS = {
  MAINNETS: [
    { id: "1", name: "Ethereum", icon: "🔷" },
    { id: "56", name: "BSC", icon: "🟡" },
    { id: "137", name: "Polygon", icon: "🟣" },
    { id: "43114", name: "Avalanche", icon: "🔺" },
    { id: "250", name: "Fantom", icon: "🔵" },
  ],
  TESTNETS: [
    { id: "5", name: "Goerli", icon: "🔷" },
    { id: "11155111", name: "Sepolia", icon: "🔷" },
    { id: "80001", name: "Mumbai", icon: "🟣" },
    { id: "97", name: "BSC Testnet", icon: "🟡" },
    { id: "43113", name: "Fuji", icon: "🔺" },
  ],
}

export function NetworkSwitcher() {
  const { chainId, switchNetwork, isConnected } = useWallet()
  const [currentNetwork, setCurrentNetwork] = useState<string>("Not Connected")

  useEffect(() => {
    if (!chainId) {
      setCurrentNetwork("Not Connected")
      return
    }

    // Find the network in our configurations
    const allNetworks = [...NETWORKS.MAINNETS, ...NETWORKS.TESTNETS]
    const network = allNetworks.find((n) => n.id === chainId.toString())

    if (network) {
      setCurrentNetwork(`${network.icon} ${network.name}`)
    } else {
      setCurrentNetwork(`Chain ID: ${chainId}`)
    }
  }, [chainId])

  const handleNetworkSwitch = async (networkId: string) => {
    try {
      await switchNetwork(Number.parseInt(networkId))
    } catch (error) {
      console.error("Failed to switch network:", error)
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1 border-zinc-700">
          <Globe className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">{currentNetwork}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-zinc-500 pl-2">Mainnets</DropdownMenuLabel>
          {NETWORKS.MAINNETS.map((network) => (
            <DropdownMenuItem
              key={network.id}
              onClick={() => handleNetworkSwitch(network.id)}
              className="cursor-pointer"
            >
              <span className="mr-2">{network.icon}</span>
              {network.name}
              {chainId?.toString() === network.id && (
                <span className="ml-auto text-xs bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-zinc-500 pl-2">Testnets</DropdownMenuLabel>
          {NETWORKS.TESTNETS.map((network) => (
            <DropdownMenuItem
              key={network.id}
              onClick={() => handleNetworkSwitch(network.id)}
              className="cursor-pointer"
            >
              <span className="mr-2">{network.icon}</span>
              {network.name}
              {chainId?.toString() === network.id && (
                <span className="ml-auto text-xs bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"

interface WalletContextType {
  provider: ethers.providers.Web3Provider | null
  signer: ethers.Signer | null
  address: string
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  connect: (walletType: string) => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>
}

const WalletContext = createContext<WalletContextType>({
  provider: null,
  signer: null,
  address: "",
  chainId: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
})

export const useWallet = () => useContext(WalletContext)

interface WalletProviderProps {
  children: React.ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [address, setAddress] = useState<string>("")
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [walletType, setWalletType] = useState<string | null>(null)

  // Initialize from localStorage on component mount
  useEffect(() => {
    const savedWalletType = localStorage.getItem("walletType")
    if (savedWalletType) {
      setWalletType(savedWalletType)
      connect(savedWalletType).catch(console.error)
    }
  }, [])

  // Handle account changes
  const handleAccountsChanged = useCallback(
    async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnect()
      } else {
        // Account changed, update state
        const newAddress = accounts[0]
        setAddress(newAddress)

        if (provider) {
          const signer = provider.getSigner()
          setSigner(signer)
        }
      }
    },
    [provider],
  )

  // Handle chain changes
  const handleChainChanged = useCallback((chainIdHex: string) => {
    const newChainId = Number.parseInt(chainIdHex, 16)
    setChainId(newChainId)

    // Refresh provider and signer on chain change
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)
      const signer = provider.getSigner()
      setSigner(signer)
    }
  }, [])

  // Setup event listeners
  useEffect(() => {
    if (window.ethereum && isConnected) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      // Cleanup
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [isConnected, handleAccountsChanged, handleChainChanged])

  // Connect wallet function
  const connect = async (selectedWalletType: string) => {
    setIsConnecting(true)
    setError(null)

    try {
      // Store wallet type preference
      localStorage.setItem("walletType", selectedWalletType)
      setWalletType(selectedWalletType)

      if (!window.ethereum) {
        throw new Error(`Please install a wallet extension or app to connect with ${selectedWalletType}`)
      }

      // Initialize provider
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      // Request accounts
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please check your wallet and try again.")
      }

      // Get network
      const network = await provider.getNetwork()
      setChainId(network.chainId)

      // Set signer and address
      const signer = provider.getSigner()
      setSigner(signer)
      setAddress(accounts[0])

      setIsConnected(true)
    } catch (err) {
      console.error("Wallet connection error:", err)
      setError(err instanceof Error ? err.message : "Failed to connect wallet")

      // Clear stored wallet type on error
      localStorage.removeItem("walletType")
      setWalletType(null)
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet function
  const disconnect = () => {
    setProvider(null)
    setSigner(null)
    setAddress("")
    setChainId(null)
    setIsConnected(false)
    setError(null)

    // Clear stored wallet type
    localStorage.removeItem("walletType")
    setWalletType(null)
  }

  // Switch network function
  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) {
      throw new Error("No Ethereum provider found. Please install a wallet extension.")
    }

    const hexChainId = `0x${targetChainId.toString(16)}`

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      })
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        // Add the network
        try {
          await addNetwork(targetChainId)
        } catch (addError) {
          throw new Error(`Failed to add network: ${addError instanceof Error ? addError.message : "Unknown error"}`)
        }
      } else {
        throw new Error(`Failed to switch network: ${error.message}`)
      }
    }
  }

  // Helper function to add a network
  const addNetwork = async (chainId: number) => {
    // Network configurations
    const networks: Record<number, any> = {
      1: {
        chainId: "0x1",
        chainName: "Ethereum Mainnet",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://mainnet.infura.io/v3/"],
        blockExplorerUrls: ["https://etherscan.io"],
      },
      137: {
        chainId: "0x89",
        chainName: "Polygon Mainnet",
        nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
        rpcUrls: ["https://polygon-rpc.com/"],
        blockExplorerUrls: ["https://polygonscan.com"],
      },
      56: {
        chainId: "0x38",
        chainName: "Binance Smart Chain",
        nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
        rpcUrls: ["https://bsc-dataseed.binance.org/"],
        blockExplorerUrls: ["https://bscscan.com"],
      },
      // Add more networks as needed
    }

    const networkConfig = networks[chainId]

    if (!networkConfig) {
      throw new Error(`Network configuration not found for chain ID ${chainId}`)
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [networkConfig],
    })
  }

  const value = {
    provider,
    signer,
    address,
    chainId,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

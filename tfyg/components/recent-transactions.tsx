"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/context/wallet-context"
import { ExternalLink, History, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react"

// Mock transaction data
const MOCK_TRANSACTIONS = [
  {
    id: "tx1",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    tokenSymbol: "ETH",
    tokenName: "Ethereum",
    sourceDex: "Uniswap",
    targetDex: "SushiSwap",
    amount: 0.5,
    profit: 12.5,
    status: "completed",
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    id: "tx2",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    tokenSymbol: "LINK",
    tokenName: "Chainlink",
    sourceDex: "PancakeSwap",
    targetDex: "Uniswap",
    amount: 25,
    profit: 8.75,
    status: "completed",
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: "tx3",
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    tokenSymbol: "UNI",
    tokenName: "Uniswap",
    sourceDex: "SushiSwap",
    targetDex: "Curve",
    amount: 15,
    profit: 5.25,
    status: "failed",
    txHash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
    error: "Slippage tolerance exceeded",
  },
  {
    id: "tx4",
    timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
    tokenSymbol: "WBTC",
    tokenName: "Wrapped Bitcoin",
    sourceDex: "Balancer",
    targetDex: "Uniswap",
    amount: 0.02,
    profit: 18.5,
    status: "completed",
    txHash: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
  },
  {
    id: "tx5",
    timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    tokenSymbol: "USDC",
    tokenName: "USD Coin",
    sourceDex: "Curve",
    targetDex: "PancakeSwap",
    amount: 1000,
    profit: 0,
    status: "pending",
    txHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
  },
]

export function RecentTransactions() {
  const { account, chainId } = useWallet()
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS)

  // In a real app, you would fetch actual transactions from your backend
  useEffect(() => {
    // Simulate API call
    const fetchTransactions = async () => {
      // In a real app, you would fetch data from your API
      // const response = await fetch('/api/transactions')
      // const data = await response.json()
      // setTransactions(data)

      // For now, we'll just use mock data
      setTransactions(MOCK_TRANSACTIONS)
    }

    if (account) {
      fetchTransactions()
    }
  }, [account])

  const getExplorerUrl = (txHash: string) => {
    if (!chainId) return "#"

    let baseUrl = ""
    switch (chainId) {
      case 1:
        baseUrl = "https://etherscan.io/tx/"
        break
      case 5:
        baseUrl = "https://goerli.etherscan.io/tx/"
        break
      case 11155111:
        baseUrl = "https://sepolia.etherscan.io/tx/"
        break
      case 137:
        baseUrl = "https://polygonscan.com/tx/"
        break
      case 80001:
        baseUrl = "https://mumbai.polygonscan.com/tx/"
        break
      case 56:
        baseUrl = "https://bscscan.com/tx/"
        break
      case 97:
        baseUrl = "https://testnet.bscscan.com/tx/"
        break
      default:
        baseUrl = "https://etherscan.io/tx/"
    }

    return `${baseUrl}${txHash}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20">
            Unknown
          </Badge>
        )
    }
  }

  if (!account) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="bg-zinc-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <History className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
            <p className="text-zinc-500 max-w-md mx-auto">
              Connect your wallet to view your transaction history and track your arbitrage trades
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="h-5 w-5 mr-2 text-blue-500" />
          Recent Transactions
        </CardTitle>
        <CardDescription>History of your recent arbitrage trades</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-zinc-500" />
            <h3 className="text-lg font-medium mb-2">No Transactions Found</h3>
            <p className="text-zinc-500 max-w-md mx-auto">
              You haven't executed any arbitrage trades yet. Start by finding opportunities in the Opportunities tab.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Time</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Route</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-zinc-800/50">
                  <TableCell className="font-medium">
                    {tx.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    <div className="text-xs text-zinc-500">{tx.timestamp.toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{tx.tokenSymbol}</div>
                    <div className="text-xs text-zinc-500">{tx.tokenName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-zinc-400">{tx.sourceDex}</span>
                      <span className="text-zinc-600">→</span>
                      <span className="text-zinc-400">{tx.targetDex}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.amount} {tx.tokenSymbol}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {tx.status === "completed" ? (
                      <span className="text-green-500">+${tx.profit.toFixed(2)}</span>
                    ) : tx.status === "pending" ? (
                      <span className="text-zinc-500">Pending</span>
                    ) : (
                      <span className="text-red-500">Failed</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700 hover:bg-zinc-800"
                      onClick={() => window.open(getExplorerUrl(tx.txHash), "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

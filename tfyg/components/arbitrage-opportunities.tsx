"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, Zap, TrendingUp, AlertCircle } from "lucide-react"
import { calculateArbitrageProfit } from "@/utils/price-feed"
import type { TokenWithDexPrices } from "@/utils/price-feed"
import { useWallet } from "@/context/wallet-context"
import { useRouter } from "next/navigation"

interface ArbitrageOpportunitiesProps {
  opportunities: TokenWithDexPrices[]
  isLoading: boolean
  lastUpdated: Date
}

export function ArbitrageOpportunities({ opportunities, isLoading, lastUpdated }: ArbitrageOpportunitiesProps) {
  const { account } = useWallet()
  const router = useRouter()
  const [investmentAmount, setInvestmentAmount] = useState(1000)

  const handleExecute = (tokenId: string) => {
    router.push(`/arbitrage?token=${tokenId}`)
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="border-b border-zinc-800">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-amber-500" />
              Arbitrage Opportunities
            </CardTitle>
            <CardDescription>
              Potential profit opportunities across different DEXes (Last updated: {lastUpdated.toLocaleTimeString()})
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Investment:</span>
            <select
              className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
            >
              <option value={100}>$100</option>
              <option value={500}>$500</option>
              <option value={1000}>$1,000</option>
              <option value={5000}>$5,000</option>
              <option value={10000}>$10,000</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-zinc-500" />
            <h3 className="text-lg font-medium mb-2">No Opportunities Found</h3>
            <p className="text-zinc-500 max-w-md mx-auto">
              We couldn't find any arbitrage opportunities at the moment. This could be due to low price differences
              between DEXes or API limitations.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Token</TableHead>
                <TableHead>Buy On</TableHead>
                <TableHead>Sell On</TableHead>
                <TableHead className="text-right">Price Diff</TableHead>
                <TableHead className="text-right">Potential Profit</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((token) => {
                const arbitrage = calculateArbitrageProfit(token.dexPrices, investmentAmount)
                if (!arbitrage) return null

                return (
                  <TableRow key={token.id} className="hover:bg-zinc-800/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <img
                          src={token.image || "/placeholder.svg"}
                          alt={token.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <div>
                          <div>{token.symbol}</div>
                          <div className="text-xs text-zinc-500">{token.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        {arbitrage.sourceDex}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        {arbitrage.targetDex}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 text-green-500">
                        <TrendingUp className="h-4 w-4" />
                        {arbitrage.profitPercentage.toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">${arbitrage.profitUsd.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleExecute(token.id)}
                        disabled={!account}
                      >
                        Execute
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpIcon, ArrowDownIcon, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type TokenInfo, popularTokens } from "@/utils/token-list"
import { fetchDexPrices, type TokenPriceData } from "@/utils/price-feed"
import { cn } from "@/lib/utils"

export function PriceComparisonTable() {
  const [selectedToken, setSelectedToken] = useState<TokenInfo>(popularTokens[0])
  const [dexPrices, setDexPrices] = useState<TokenPriceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchPrices = async (token: TokenInfo) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch real DEX prices
      const prices = await fetchDexPrices(token)

      setDexPrices(prices)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching DEX prices:", err)
      setError("Failed to fetch DEX prices")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices(selectedToken)

    // Set up interval to refresh prices
    const intervalId = setInterval(() => {
      fetchPrices(selectedToken)
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(intervalId)
  }, [selectedToken])

  const handleTokenChange = (token: TokenInfo) => {
    setSelectedToken(token)
    fetchPrices(token)
  }

  const handleRefresh = () => {
    fetchPrices(selectedToken)
  }

  // Find the best price (lowest)
  const bestBuyPrice =
    dexPrices.length > 0 ? dexPrices.reduce((prev, current) => (prev.price < current.price ? prev : current)) : null

  // Find the best selling price (highest)
  const bestSellPrice =
    dexPrices.length > 0 ? dexPrices.reduce((prev, current) => (prev.price > current.price ? prev : current)) : null

  // Calculate potential arbitrage
  const arbitragePercent =
    bestBuyPrice && bestSellPrice ? ((bestSellPrice.price - bestBuyPrice.price) / bestBuyPrice.price) * 100 : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">DEX Price Comparison</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {popularTokens.map((token) => (
            <Badge
              key={token.symbol}
              variant={selectedToken.symbol === token.symbol ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleTokenChange(token)}
            >
              {token.symbol}
            </Badge>
          ))}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exchange</TableHead>
              <TableHead className="text-right">Price (USD)</TableHead>
              <TableHead className="text-right">24h Change</TableHead>
              <TableHead className="text-right">24h Volume</TableHead>
              <TableHead className="text-right">Best Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  <div className="flex justify-center">
                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : dexPrices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No price data available
                </TableCell>
              </TableRow>
            ) : (
              dexPrices.map((data, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{data.source}</TableCell>
                  <TableCell className="text-right">
                    ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={data.priceChange24h >= 0 ? "text-green-500" : "text-red-500"}>
                      {data.priceChange24h >= 0 ? (
                        <ArrowUpIcon className="inline h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownIcon className="inline h-3 w-3 mr-1" />
                      )}
                      {Math.abs(data.priceChange24h).toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">${(data.volume24h / 1000000).toFixed(2)}M</TableCell>
                  <TableCell className="text-right">
                    {bestBuyPrice && data.source === bestBuyPrice.source && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Best Buy
                      </Badge>
                    )}
                    {bestSellPrice && data.source === bestSellPrice.source && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        Best Sell
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {arbitragePercent > 0.5 && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Potential arbitrage opportunity: {arbitragePercent.toFixed(2)}% profit
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Buy on {bestBuyPrice?.source} at ${bestBuyPrice?.price.toFixed(2)} and sell on {bestSellPrice?.source} at
              ${bestSellPrice?.price.toFixed(2)}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
          {error && <span className="text-red-500 ml-2">{error}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

export default PriceComparisonTable

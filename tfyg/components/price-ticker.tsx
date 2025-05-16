"use client"

import { useState, useEffect } from "react"
import { fetchTokenPrices, type TokenPriceData } from "@/utils/price-feed"
import { popularTokens } from "@/utils/token-list"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function PriceTicker() {
  const [prices, setPrices] = useState<TokenPriceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const maxRetries = 3

    const fetchPrices = async () => {
      try {
        setLoading(true)
        setError(null)

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Fetch real prices from CoinGecko
        const tokenPrices = await fetchTokenPrices(popularTokens)

        if (isMounted) {
          setPrices(tokenPrices)
          setLoading(false)
        }
      } catch (err) {
        console.error("Error fetching prices:", err)

        if (isMounted) {
          if (retryCount < maxRetries) {
            retryCount++
            // Exponential backoff for retries
            setTimeout(fetchPrices, 1000 * Math.pow(2, retryCount))
          } else {
            setError("Using fallback price data.")
            // Use fallback data
            const fallbackPrices = popularTokens.map((token) => ({
              token,
              price:
                token.symbol === "ETH"
                  ? 2300
                  : token.symbol === "BTC"
                    ? 43000
                    : token.symbol === "USDC" || token.symbol === "USDT" || token.symbol === "DAI"
                      ? 1
                      : 10,
              priceChange24h: Math.random() * 10 - 5,
              volume24h: 1000000,
              source: "CoinGecko" as const,
              timestamp: Date.now(),
            }))
            setPrices(fallbackPrices)
            setLoading(false)
          }
        }
      }
    }

    fetchPrices()

    // Set up interval to refresh prices
    const intervalId = setInterval(fetchPrices, 60000) // Refresh every minute

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [])

  if (loading) {
    return (
      <div className="w-full overflow-hidden bg-black/5 dark:bg-white/5 rounded-md p-2">
        <div className="flex animate-pulse space-x-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden bg-black/5 dark:bg-white/5 rounded-md">
      <div className="flex animate-marquee whitespace-nowrap py-2 px-4">
        {prices.map((data, index) => (
          <PriceItem key={index} data={data} />
        ))}
        {/* Duplicate items to create continuous scroll effect */}
        {prices.map((data, index) => (
          <PriceItem key={`dup-${index}`} data={data} />
        ))}
      </div>

      {error && <div className="text-xs text-amber-500 px-4 pb-1">{error}</div>}
    </div>
  )
}

interface PriceItemProps {
  data: TokenPriceData
}

function PriceItem({ data }: PriceItemProps) {
  const { token, price, priceChange24h } = data
  const isPositive = priceChange24h >= 0

  return (
    <div className="flex items-center space-x-2 mr-8 flex-shrink-0">
      <span className="font-medium">{token.symbol}</span>
      <span>${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      <span className={cn("flex items-center text-xs", isPositive ? "text-green-500" : "text-red-500")}>
        {isPositive ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
        {Math.abs(priceChange24h).toFixed(2)}%
      </span>
    </div>
  )
}

export default PriceTicker

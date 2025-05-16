"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PriceTicker } from "@/components/price-ticker"
import { getTopTokens, getTokenDexPrices } from "@/utils/price-feed"
import type { TokenData, DexPriceData } from "@/utils/price-feed"
import { Search, RefreshCw, ArrowUpDown, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

// Add import for toast
import { toast } from "@/components/ui/use-toast"
// Add import for fallback data
import { getFallbackTokenData } from "@/utils/price-feed"

export default function PricesPage() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [filteredTokens, setFilteredTokens] = useState<TokenData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "market_cap",
    direction: "desc",
  })
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null)
  const [dexPrices, setDexPrices] = useState<DexPriceData[]>([])
  const [isDexPricesLoading, setIsDexPricesLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch top tokens
  const fetchTokens = async () => {
    setIsLoading(true)
    try {
      const data = await getTopTokens(50)
      setTokens(data)
      setFilteredTokens(data)
      setLastUpdated(new Date())

      // Select first token by default
      if (data.length > 0 && !selectedToken) {
        setSelectedToken(data[0])
        fetchDexPrices(data[0].id)
      }
    } catch (error) {
      console.error("Error fetching tokens:", error)
      // Show error toast
      toast({
        variant: "destructive",
        title: "Error fetching token data",
        description: "Using fallback data instead. Please try again later.",
      })

      // Use fallback data
      const fallbackData = getFallbackTokenData(50)
      setTokens(fallbackData)
      setFilteredTokens(fallbackData)

      // Select first token by default
      if (fallbackData.length > 0 && !selectedToken) {
        setSelectedToken(fallbackData[0])
        fetchDexPrices(fallbackData[0].id)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch DEX prices for a token
  const fetchDexPrices = async (tokenId: string) => {
    setIsDexPricesLoading(true)
    try {
      const data = await getTokenDexPrices(tokenId)
      setDexPrices(data)
    } catch (error) {
      console.error("Error fetching DEX prices:", error)
    } finally {
      setIsDexPricesLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    const fetchPriceData = async () => {
      setIsLoading(true)
      try {
        console.log("Fetching token price data...")
        const data = await getTopTokens(50)
        console.log(`Fetched ${data.length} tokens`)
        setTokens(data)
        setFilteredTokens(data)
        setLastUpdated(new Date())

        // Select first token by default
        if (data.length > 0 && !selectedToken) {
          setSelectedToken(data[0])
          fetchDexPrices(data[0].id)
        }
      } catch (error) {
        console.error("Error fetching token price data:", error)
        // Use fallback data if there's an error
        const fallbackData = getFallbackTokenData(50)
        setTokens(fallbackData)
        setFilteredTokens(fallbackData)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch token price data. Using fallback data.",
        })

        // Select first token by default
        if (fallbackData.length > 0 && !selectedToken) {
          setSelectedToken(fallbackData[0])
          fetchDexPrices(fallbackData[0].id)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchPriceData()

    // Set up interval to refresh data
    const intervalId = setInterval(fetchTokens, 60000) // Refresh every minute
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  // Filter tokens based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTokens(tokens)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = tokens.filter(
        (token) =>
          token.name.toLowerCase().includes(query) ||
          token.symbol.toLowerCase().includes(query) ||
          token.id.toLowerCase().includes(query),
      )
      setFilteredTokens(filtered)
    }
  }, [searchQuery, tokens])

  // Sort tokens
  const sortTokens = (key: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })

    const sortedTokens = [...filteredTokens].sort((a, b) => {
      if (a[key as keyof TokenData] < b[key as keyof TokenData]) {
        return direction === "asc" ? -1 : 1
      }
      if (a[key as keyof TokenData] > b[key as keyof TokenData]) {
        return direction === "asc" ? 1 : -1
      }
      return 0
    })
    setFilteredTokens(sortedTokens)
  }

  // Handle token selection
  const handleTokenSelect = (token: TokenData) => {
    setSelectedToken(token)
    fetchDexPrices(token.id)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Token Prices</h1>
          <p className="text-zinc-400 mt-1">Real-time prices across different DEXes</p>
        </div>
        <Button onClick={fetchTokens} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Refreshing..." : "Refresh Prices"}
        </Button>
      </div>

      <div className="mb-8">
        <PriceTicker />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Token List */}
        <Card className="border-zinc-800 bg-zinc-900/50 lg:col-span-2">
          <CardHeader className="border-b border-zinc-800">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Token List</CardTitle>
                <CardDescription>
                  Last updated: {lastUpdated.toLocaleTimeString()} {lastUpdated.toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-zinc-800 border-zinc-700 w-full md:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="p-0 font-semibold hover:bg-transparent hover:text-white flex items-center"
                        onClick={() => sortTokens("name")}
                      >
                        Token
                        {sortConfig.key === "name" && (
                          <ArrowUpDown
                            className={`ml-1 h-4 w-4 ${sortConfig.direction === "asc" ? "rotate-180" : ""}`}
                          />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="p-0 font-semibold hover:bg-transparent hover:text-white flex items-center ml-auto"
                        onClick={() => sortTokens("current_price")}
                      >
                        Price
                        {sortConfig.key === "current_price" && (
                          <ArrowUpDown
                            className={`ml-1 h-4 w-4 ${sortConfig.direction === "asc" ? "rotate-180" : ""}`}
                          />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="p-0 font-semibold hover:bg-transparent hover:text-white flex items-center ml-auto"
                        onClick={() => sortTokens("price_change_percentage_24h")}
                      >
                        24h %
                        {sortConfig.key === "price_change_percentage_24h" && (
                          <ArrowUpDown
                            className={`ml-1 h-4 w-4 ${sortConfig.direction === "asc" ? "rotate-180" : ""}`}
                          />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="p-0 font-semibold hover:bg-transparent hover:text-white flex items-center ml-auto"
                        onClick={() => sortTokens("market_cap")}
                      >
                        Market Cap
                        {sortConfig.key === "market_cap" && (
                          <ArrowUpDown
                            className={`ml-1 h-4 w-4 ${sortConfig.direction === "asc" ? "rotate-180" : ""}`}
                          />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="p-0 font-semibold hover:bg-transparent hover:text-white flex items-center ml-auto"
                        onClick={() => sortTokens("total_volume")}
                      >
                        Volume (24h)
                        {sortConfig.key === "total_volume" && (
                          <ArrowUpDown
                            className={`ml-1 h-4 w-4 ${sortConfig.direction === "asc" ? "rotate-180" : ""}`}
                          />
                        )}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <TableRow key={index} className="hover:bg-zinc-800/50">
                        <TableCell className="py-3">
                          <div className="w-6 h-4 bg-zinc-800 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-zinc-800 rounded-full animate-pulse"></div>
                            <div className="w-24 h-4 bg-zinc-800 rounded animate-pulse"></div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="w-16 h-4 bg-zinc-800 rounded animate-pulse ml-auto"></div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="w-12 h-4 bg-zinc-800 rounded animate-pulse ml-auto"></div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="w-20 h-4 bg-zinc-800 rounded animate-pulse ml-auto"></div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="w-20 h-4 bg-zinc-800 rounded animate-pulse ml-auto"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredTokens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-zinc-500">No tokens found matching your search criteria</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTokens.map((token, index) => (
                      <TableRow
                        key={token.id}
                        className={`hover:bg-zinc-800/50 cursor-pointer ${
                          selectedToken?.id === token.id ? "bg-zinc-800/50" : ""
                        }`}
                        onClick={() => handleTokenSelect(token)}
                      >
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img
                              src={token.image || "/placeholder.svg"}
                              alt={token.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <div>
                              <div className="font-medium">{token.symbol.toUpperCase()}</div>
                              <div className="text-xs text-zinc-500">{token.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          $
                          {token.current_price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className={`flex items-center justify-end gap-1 ${
                              token.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {token.price_change_percentage_24h >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {Math.abs(token.price_change_percentage_24h).toFixed(2)}%
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${(token.market_cap / 1000000).toFixed(0)}M</TableCell>
                        <TableCell className="text-right">${(token.total_volume / 1000000).toFixed(0)}M</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* DEX Prices */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="border-b border-zinc-800">
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
              DEX Prices
            </CardTitle>
            <CardDescription>
              {selectedToken ? `${selectedToken.name} (${selectedToken.symbol.toUpperCase()})` : "Select a token"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!selectedToken ? (
              <div className="text-center py-12">
                <p className="text-zinc-500">Select a token to view DEX prices</p>
              </div>
            ) : isDexPricesLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="w-24 h-4 bg-zinc-800 rounded animate-pulse"></div>
                    <div className="w-20 h-4 bg-zinc-800 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : dexPrices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-500">No DEX price data available for this token</p>
              </div>
            ) : (
              <div className="p-4">
                <Tabs defaultValue="price">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="price">Price</TabsTrigger>
                    <TabsTrigger value="volume">Volume</TabsTrigger>
                  </TabsList>

                  <TabsContent value="price">
                    <div className="space-y-3">
                      {dexPrices.map((dex, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded hover:bg-zinc-800/50">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              {dex.dex}
                            </Badge>
                          </div>
                          <div className="font-medium">
                            $
                            {dex.price.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="volume">
                    <div className="space-y-3">
                      {dexPrices.map((dex, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded hover:bg-zinc-800/50">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                              {dex.dex}
                            </Badge>
                          </div>
                          <div className="font-medium">${(dex.volume24h / 1000000).toFixed(2)}M</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Price Difference Analysis */}
                {dexPrices.length >= 2 && (
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <h3 className="text-sm font-medium mb-3">Price Difference Analysis</h3>

                    {(() => {
                      // Sort prices from lowest to highest
                      const sortedPrices = [...dexPrices].sort((a, b) => a.price - b.price)
                      const lowestPrice = sortedPrices[0]
                      const highestPrice = sortedPrices[sortedPrices.length - 1]
                      const priceDiff = ((highestPrice.price - lowestPrice.price) / lowestPrice.price) * 100

                      return (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Lowest Price:</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                {lowestPrice.dex}
                              </Badge>
                              <span className="font-medium">
                                $
                                {lowestPrice.price.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 6,
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Highest Price:</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                {highestPrice.dex}
                              </Badge>
                              <span className="font-medium">
                                $
                                {highestPrice.price.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 6,
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Price Difference:</span>
                            <span className={`font-medium ${priceDiff > 0.5 ? "text-green-500" : "text-zinc-400"}`}>
                              {priceDiff.toFixed(2)}%
                            </span>
                          </div>

                          {priceDiff > 0.5 && (
                            <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                              <p className="text-sm text-green-500 font-medium">Potential arbitrage opportunity!</p>
                              <p className="text-xs text-zinc-400 mt-1">
                                Buy on {lowestPrice.dex} and sell on {highestPrice.dex} for a {priceDiff.toFixed(2)}%
                                profit (before fees).
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

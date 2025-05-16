"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/context/wallet-context"
import { PriceTicker } from "@/components/price-ticker"
import { ArbitrageOpportunities } from "@/components/arbitrage-opportunities"
import { TradingStats } from "@/components/trading-stats"
import { RecentTransactions } from "@/components/recent-transactions"
import { BarChart3, Zap, History, Settings, RefreshCw } from "lucide-react"
import { getArbitrageOpportunities } from "@/utils/price-feed"
import type { TokenWithDexPrices } from "@/utils/price-feed"

export default function DashboardPage() {
  const { account } = useWallet()
  const [opportunities, setOpportunities] = useState<TokenWithDexPrices[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchOpportunities = async () => {
    setIsLoading(true)
    try {
      const data = await getArbitrageOpportunities(10)
      setOpportunities(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching arbitrage opportunities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOpportunities()

    // Set up interval to refresh data
    const intervalId = setInterval(fetchOpportunities, 60000) // Refresh every minute
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Monitor arbitrage opportunities and trading performance</p>
        </div>
        <Button onClick={fetchOpportunities} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      <div className="mb-8">
        <PriceTicker />
      </div>

      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="grid grid-cols-3 md:w-[400px] mb-8">
          <TabsTrigger value="opportunities" className="flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Opportunities</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <History className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-8">
          <ArbitrageOpportunities opportunities={opportunities} isLoading={isLoading} lastUpdated={lastUpdated} />
        </TabsContent>

        <TabsContent value="stats" className="space-y-8">
          <TradingStats />
        </TabsContent>

        <TabsContent value="history" className="space-y-8">
          <RecentTransactions />
        </TabsContent>
      </Tabs>

      {!account && (
        <Card className="mt-8 border-amber-800/30 bg-amber-900/10">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-amber-500/20 p-3 rounded-full">
                <Settings className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-medium mb-1">Connect Your Wallet</h3>
                <p className="text-zinc-400 text-sm">
                  Connect your wallet to view your trading history and execute arbitrage trades
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => window.scrollTo(0, 0)}>
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

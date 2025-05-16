"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/context/wallet-context"
import { BarChart, LineChart, PieChart } from "lucide-react"

// Mock data for trading stats
const MOCK_STATS = {
  totalTrades: 28,
  successfulTrades: 25,
  failedTrades: 3,
  totalVolume: 15750,
  totalProfit: 842.5,
  averageProfit: 33.7,
  profitByDex: [
    { name: "Uniswap", value: 320.5 },
    { name: "SushiSwap", value: 210.8 },
    { name: "PancakeSwap", value: 180.2 },
    { name: "Curve", value: 85.5 },
    { name: "Balancer", value: 45.5 },
  ],
  profitByToken: [
    { name: "ETH", value: 280.5 },
    { name: "USDC", value: 175.2 },
    { name: "WBTC", value: 150.8 },
    { name: "LINK", value: 120.5 },
    { name: "UNI", value: 115.5 },
  ],
  dailyProfits: [
    { date: "2023-05-10", profit: 45.2 },
    { date: "2023-05-11", profit: 62.8 },
    { date: "2023-05-12", profit: 38.5 },
    { date: "2023-05-13", profit: 75.3 },
    { date: "2023-05-14", profit: 55.7 },
    { date: "2023-05-15", profit: 90.2 },
    { date: "2023-05-16", profit: 65.8 },
  ],
}

export function TradingStats() {
  const { account } = useWallet()
  const [stats, setStats] = useState(MOCK_STATS)

  // In a real app, you would fetch actual stats from your backend
  useEffect(() => {
    // Simulate API call
    const fetchStats = async () => {
      // In a real app, you would fetch data from your API
      // const response = await fetch('/api/stats')
      // const data = await response.json()
      // setStats(data)

      // For now, we'll just use mock data
      setStats(MOCK_STATS)
    }

    if (account) {
      fetchStats()
    }
  }, [account])

  if (!account) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="bg-zinc-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <BarChart className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
            <p className="text-zinc-500 max-w-md mx-auto">
              Connect your wallet to view your trading statistics and performance metrics
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Summary Cards */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-lg">Total Profit</CardTitle>
          <CardDescription>Cumulative profit from all trades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-500">${stats.totalProfit.toFixed(2)}</div>
          <div className="text-sm text-zinc-500 mt-1">From {stats.totalTrades} trades</div>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-lg">Success Rate</CardTitle>
          <CardDescription>Percentage of successful trades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-500">
            {((stats.successfulTrades / stats.totalTrades) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-zinc-500 mt-1">
            {stats.successfulTrades} successful / {stats.failedTrades} failed
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-lg">Average Profit</CardTitle>
          <CardDescription>Average profit per successful trade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-500">${stats.averageProfit.toFixed(2)}</div>
          <div className="text-sm text-zinc-500 mt-1">Total volume: ${stats.totalVolume.toFixed(2)}</div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <Card className="border-zinc-800 bg-zinc-900/50 md:col-span-3">
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
          <CardDescription>Detailed breakdown of your trading performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="daily" className="flex items-center">
                <LineChart className="h-4 w-4 mr-2" />
                Daily Profit
              </TabsTrigger>
              <TabsTrigger value="dex" className="flex items-center">
                <BarChart className="h-4 w-4 mr-2" />
                Profit by DEX
              </TabsTrigger>
              <TabsTrigger value="token" className="flex items-center">
                <PieChart className="h-4 w-4 mr-2" />
                Profit by Token
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily">
              <div className="h-80 flex items-center justify-center bg-zinc-800/30 rounded-lg">
                <div className="text-center">
                  <p className="text-zinc-400">Daily profit chart would be displayed here</p>
                  <p className="text-zinc-500 text-sm mt-2">
                    In a real app, this would be a line chart showing daily profits
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dex">
              <div className="h-80 flex items-center justify-center bg-zinc-800/30 rounded-lg">
                <div className="text-center">
                  <p className="text-zinc-400">Profit by DEX chart would be displayed here</p>
                  <p className="text-zinc-500 text-sm mt-2">
                    In a real app, this would be a bar chart showing profit by DEX
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="token">
              <div className="h-80 flex items-center justify-center bg-zinc-800/30 rounded-lg">
                <div className="text-center">
                  <p className="text-zinc-400">Profit by token chart would be displayed here</p>
                  <p className="text-zinc-500 text-sm mt-2">
                    In a real app, this would be a pie chart showing profit by token
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

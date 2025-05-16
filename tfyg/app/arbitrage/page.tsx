"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/context/wallet-context"
import { useToast } from "@/components/ui/use-toast"
import { getArbitrageOpportunities, calculateArbitrageProfit } from "@/utils/price-feed"
import type { TokenWithDexPrices } from "@/utils/price-feed"
import { ArrowRight, Zap, AlertCircle, Loader2, CheckCircle, Wallet, BarChart3, RefreshCw, Info } from "lucide-react"
import Link from "next/link"

// Mock data generator for fallback
const generateFallbackArbitrageOpportunities = (count: number): TokenWithDexPrices[] => {
  const fallbackData: TokenWithDexPrices[] = []
  for (let i = 0; i < count; i++) {
    fallbackData.push({
      id: `fallback-${i}`,
      name: `Fallback Token ${i}`,
      symbol: `FLB${i}`,
      image: "/placeholder.svg",
      dexPrices: {
        dex1: { dexName: "FallbackDex1", price: 100 + i },
        dex2: { dexName: "FallbackDex2", price: 105 + i },
      },
    })
  }
  return fallbackData
}

export default function ArbitragePage() {
  const searchParams = useSearchParams()
  const tokenId = searchParams.get("token")
  const { account, chainId, balance } = useWallet()
  const { toast } = useToast()

  const [selectedToken, setSelectedToken] = useState<TokenWithDexPrices | null>(null)
  const [amount, setAmount] = useState<string>("0.1")
  const [slippage, setSlippage] = useState<number>(0.5)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isExecuting, setIsExecuting] = useState<boolean>(false)
  const [executionSuccess, setExecutionSuccess] = useState<boolean>(false)
  const [executionHash, setExecutionHash] = useState<string>("")
  const [opportunities, setOpportunities] = useState<TokenWithDexPrices[]>([])

  // Fetch arbitrage opportunities
  useEffect(() => {
    const fetchOpportunities = async () => {
      setIsLoading(true)
      try {
        console.log("Fetching arbitrage opportunities...")
        const data = await getArbitrageOpportunities(10)
        console.log(`Fetched ${data.length} arbitrage opportunities`)

        if (data.length === 0) {
          toast({
            variant: "destructive",
            title: "No opportunities found",
            description: "No arbitrage opportunities are currently available. Using fallback data.",
          })
          // Use fallback data if no opportunities are found
          const fallbackData = generateFallbackArbitrageOpportunities(10)
          setOpportunities(fallbackData)

          // If tokenId is provided in URL, select that token
          if (tokenId) {
            const token = fallbackData.find((t) => t.id === tokenId)
            if (token) {
              setSelectedToken(token)
            } else if (fallbackData.length > 0) {
              setSelectedToken(fallbackData[0])
            }
          } else if (fallbackData.length > 0) {
            setSelectedToken(fallbackData[0])
          }
        } else {
          setOpportunities(data)

          // If tokenId is provided in URL, select that token
          if (tokenId) {
            const token = data.find((t) => t.id === tokenId)
            if (token) {
              setSelectedToken(token)
            } else if (data.length > 0) {
              setSelectedToken(data[0])
            }
          } else if (data.length > 0) {
            // Otherwise select the first token
            setSelectedToken(data[0])
          }
        }
      } catch (error) {
        console.error("Error fetching arbitrage opportunities:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch arbitrage opportunities. Using fallback data.",
        })

        // Use fallback data if there's an error
        const fallbackData = generateFallbackArbitrageOpportunities(10)
        setOpportunities(fallbackData)

        if (fallbackData.length > 0) {
          setSelectedToken(fallbackData[0])
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchOpportunities()
  }, [tokenId, toast])

  // Calculate arbitrage details
  const arbitrageDetails = selectedToken
    ? calculateArbitrageProfit(selectedToken.dexPrices, Number.parseFloat(amount) * 1000)
    : null

  // Execute arbitrage
  const executeArbitrage = async () => {
    if (!account || !selectedToken || !arbitrageDetails) return

    setIsExecuting(true)
    setExecutionSuccess(false)
    setExecutionHash("")

    try {
      // In a real app, you would call your smart contract here
      // For demo purposes, we'll simulate a successful transaction after a delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Simulate a transaction hash
      const hash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
      setExecutionHash(hash)
      setExecutionSuccess(true)

      toast({
        title: "Arbitrage Executed",
        description: "Your arbitrage trade was successful!",
      })
    } catch (error) {
      console.error("Error executing arbitrage:", error)
      toast({
        variant: "destructive",
        title: "Execution Failed",
        description: "Failed to execute arbitrage trade",
      })
    } finally {
      setIsExecuting(false)
    }
  }

  // Get explorer URL for transaction
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Arbitrage Executor</h1>
          <p className="text-zinc-400 mt-1">Execute cross-DEX arbitrage trades to capture price differences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-700" asChild>
            <Link href="/dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Execution Card */}
        <Card className="lg:col-span-2 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-500" />
              Execute Arbitrage
            </CardTitle>
            <CardDescription>Configure and execute your arbitrage trade</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!account ? (
              <Alert className="bg-amber-900/10 border-amber-800/30">
                <Wallet className="h-4 w-4" />
                <AlertTitle>Wallet Not Connected</AlertTitle>
                <AlertDescription>Please connect your wallet to execute arbitrage trades</AlertDescription>
              </Alert>
            ) : isLoading ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                  <p className="text-zinc-400">Loading arbitrage opportunities...</p>
                </div>
              </div>
            ) : executionSuccess ? (
              <Alert className="bg-green-900/10 border-green-800/30">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Arbitrage Executed Successfully</AlertTitle>
                <AlertDescription>
                  Your arbitrage trade has been executed successfully.{" "}
                  <a
                    href={getExplorerUrl(executionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View transaction
                  </a>
                </AlertDescription>
              </Alert>
            ) : !selectedToken ? (
              <Alert className="bg-amber-900/10 border-amber-800/30">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Opportunities Available</AlertTitle>
                <AlertDescription>
                  No arbitrage opportunities are currently available. Please try again later or adjust your parameters.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Token Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Token</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {opportunities.slice(0, 8).map((token) => (
                      <Button
                        key={token.id}
                        variant={selectedToken?.id === token.id ? "default" : "outline"}
                        className={
                          selectedToken?.id === token.id
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "border-zinc-700 hover:bg-zinc-800"
                        }
                        onClick={() => setSelectedToken(token)}
                      >
                        <img src={token.image || "/placeholder.svg"} alt={token.name} className="w-5 h-5 mr-2" />
                        {token.symbol}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* DEX Route */}
                {arbitrageDetails && (
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <h3 className="text-sm font-medium mb-3">Arbitrage Route</h3>
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="bg-green-500/10 text-green-500 px-3 py-2 rounded-lg font-medium">
                          {arbitrageDetails.sourceDex}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">Buy at lower price</div>
                      </div>

                      <div className="flex-1 px-4">
                        <div className="relative">
                          <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-700 -translate-y-1/2"></div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="bg-blue-600 text-white p-2 rounded-full">
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="bg-blue-500/10 text-blue-500 px-3 py-2 rounded-lg font-medium">
                          {arbitrageDetails.targetDex}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">Sell at higher price</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Investment Amount (ETH)</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className="bg-zinc-800 border-zinc-700"
                  />
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Min: 0.01 ETH</span>
                    <span>Balance: {balance} ETH</span>
                  </div>
                </div>

                {/* Slippage Tolerance */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Slippage Tolerance</label>
                    <span className="text-sm font-medium">{slippage}%</span>
                  </div>
                  <Slider
                    value={[slippage]}
                    min={0.1}
                    max={5}
                    step={0.1}
                    onValueChange={(value) => setSlippage(value[0])}
                  />
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>0.1%</span>
                    <span>5%</span>
                  </div>
                </div>

                {/* Profit Calculation */}
                {arbitrageDetails && (
                  <div className="p-4 bg-green-900/10 border border-green-800/20 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-zinc-400">Estimated Profit:</span>
                      <span className="font-medium text-green-500">
                        ${arbitrageDetails.profitUsd.toFixed(2)} ({arbitrageDetails.profitPercentage.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Gas Cost (est.):</span>
                      <span className="text-zinc-400">~$5.00</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              onClick={executeArbitrage}
              disabled={!account || isLoading || isExecuting || executionSuccess || !selectedToken || !arbitrageDetails}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing Arbitrage...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Execute Arbitrage
                </>
              )}
            </Button>

            {executionSuccess && (
              <Button
                variant="outline"
                className="w-full border-zinc-700"
                onClick={() => {
                  setExecutionSuccess(false)
                  setExecutionHash("")
                }}
              >
                Execute Another Trade
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* How It Works */}
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Select Token</h3>
                  <p className="text-xs text-zinc-500">Choose a token with arbitrage opportunity</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Set Amount</h3>
                  <p className="text-xs text-zinc-500">Enter the amount you want to invest</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Adjust Slippage</h3>
                  <p className="text-xs text-zinc-500">Set your slippage tolerance for the trade</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Execute Trade</h3>
                  <p className="text-xs text-zinc-500">
                    Our smart contract will execute the trade across DEXes to capture the profit
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Warning */}
          <Card className="border-amber-800/30 bg-amber-900/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                Risk Warning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Arbitrage trading involves risks including but not limited to price slippage, failed transactions, and
                gas costs.
              </p>
              <p>
                Always ensure you understand the risks before executing trades. Past performance is not indicative of
                future results.
              </p>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg">Advanced Options</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="standard">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="standard">Standard</TabsTrigger>
                  <TabsTrigger value="flash">Flash Loan</TabsTrigger>
                </TabsList>
                <TabsContent value="standard" className="pt-4">
                  <p className="text-sm text-zinc-400 mb-4">
                    Standard mode uses your own funds to execute the arbitrage trade.
                  </p>
                  <Alert className="bg-zinc-800/50 border-zinc-700">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      This mode requires you to have sufficient funds in your wallet.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
                <TabsContent value="flash" className="pt-4">
                  <p className="text-sm text-zinc-400 mb-4">
                    Flash loan mode uses borrowed funds that are repaid in the same transaction.
                  </p>
                  <Alert className="bg-zinc-800/50 border-zinc-700">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      This mode has higher gas costs but allows for larger trade sizes.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

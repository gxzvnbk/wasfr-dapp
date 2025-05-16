import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, BarChart3, Coins, GitCompare, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-black to-zinc-900">
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
              Maximize Profits with Cross-DEX Arbitrage
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 mb-10 leading-relaxed">
              Automated arbitrage trading bot leveraging Aave flash loans to execute profitable cross-exchange
              opportunities with zero upfront capital
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/arbitrage" className="flex items-center">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Link href="/dashboard" className="flex items-center">
                  View Dashboard <BarChart3 className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Key Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <Card className="bg-zinc-800 border-zinc-700 hover:border-blue-500 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-xl">Flash Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400">
                  Leverage Aave's flash loan protocol for arbitrage without requiring upfront capital
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-zinc-800 border-zinc-700 hover:border-purple-500 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <GitCompare className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-xl">Smart Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400">
                  Secure and efficient arbitrage contracts that execute trades across multiple DEXes
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-zinc-800 border-zinc-700 hover:border-green-500 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-xl">Profit Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400">
                  Maximize returns with intelligent algorithms that identify the most profitable opportunities
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-zinc-800 border-zinc-700 hover:border-amber-500 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-amber-500" />
                </div>
                <CardTitle className="text-xl">Token Swaps</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400">
                  Execute trades across multiple DEXes to capitalize on price differences
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute top-0 left-6 bottom-0 w-1 bg-blue-600 hidden md:block"></div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl z-10">
                  1
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-3">Scan for Opportunities</h3>
                  <p className="text-zinc-400">
                    Our system continuously monitors price differences across major DEXes to identify profitable
                    arbitrage opportunities.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute top-0 left-6 bottom-0 w-1 bg-blue-600 hidden md:block"></div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl z-10">
                  2
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-3">Execute Flash Loan</h3>
                  <p className="text-zinc-400">
                    When an opportunity is found, our smart contract borrows funds via Aave flash loans with zero
                    upfront capital.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl z-10">
                  3
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-3">Capture Profit</h3>
                  <p className="text-zinc-400">
                    The contract executes trades across DEXes, repays the flash loan, and captures the profit difference
                    automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-zinc-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Earning?</h2>
            <p className="text-xl text-zinc-300 mb-10">
              Connect your wallet and start capturing arbitrage opportunities today.
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/arbitrage" className="flex items-center">
                Launch App <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

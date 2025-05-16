"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useWallet } from "@/context/wallet-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { type TokenInfo, popularTokens } from "@/utils/token-list"
import { CONTRACT_ADDRESSES } from "@/utils/contract-deployment"
import { toast } from "@/components/ui/use-toast"

// Define the supported DEXes
const SUPPORTED_DEXES = ["Uniswap", "SushiSwap", "PancakeSwap", "QuickSwap"]

// ABI for ERC20 token
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
]

// ABI for ArbitrageExecutor contract (simplified)
const ARBITRAGE_EXECUTOR_ABI = [
  "function executeArbitrage(string memory sourceDex, string memory targetDex, address tokenA, address tokenB, uint256 amountIn, uint256 minAmountOut, uint256 deadline) external",
  "function dexRouters(string memory) view returns (address)",
]

export function ArbitrageExecutor() {
  const { account, chainId, provider, signer } = useWallet()

  const [tokenA, setTokenA] = useState<TokenInfo>(popularTokens[0])
  const [tokenB, setTokenB] = useState<TokenInfo>(popularTokens[1])
  const [sourceDex, setSourceDex] = useState<string>(SUPPORTED_DEXES[0])
  const [targetDex, setTargetDex] = useState<string>(SUPPORTED_DEXES[1])
  const [amount, setAmount] = useState<string>("0.1")
  const [slippage, setSlippage] = useState<string>("0.5")

  const [isApproving, setIsApproving] = useState<boolean>(false)
  const [isExecuting, setIsExecuting] = useState<boolean>(false)
  const [isApproved, setIsApproved] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Get contract address based on chain ID
  const getContractAddress = () => {
    if (!chainId) return null

    const networkAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
    if (!networkAddresses) return null

    return networkAddresses.ARBITRAGE_EXECUTOR
  }

  // Check if the contract is deployed on the current network
  const isContractDeployed = !!getContractAddress()

  // Reset states when account or chain changes
  useEffect(() => {
    setIsApproved(false)
    setError(null)
    setSuccess(null)
  }, [account, chainId])

  // Function to approve token spending
  const approveToken = async () => {
    if (!account || !provider || !signer || !chainId) {
      setError("Wallet not connected")
      return
    }

    const contractAddress = getContractAddress()
    if (!contractAddress) {
      setError("Contract not deployed on this network")
      return
    }

    try {
      setIsApproving(true)
      setError(null)

      // Get token contract
      const tokenContract = new ethers.Contract(tokenA.address, ERC20_ABI, signer)

      // Calculate amount in wei
      const decimals = await tokenContract.decimals()
      const amountWei = ethers.utils.parseUnits(amount, decimals)

      // Approve the contract to spend tokens
      const tx = await tokenContract.approve(contractAddress, amountWei)

      // Wait for transaction to be mined
      await tx.wait()

      setIsApproved(true)
      toast({
        title: "Approval successful",
        description: `Approved ${amount} ${tokenA.symbol} for arbitrage`,
      })
    } catch (err: any) {
      console.error("Error approving token:", err)
      setError(err.message || "Failed to approve token")
    } finally {
      setIsApproving(false)
    }
  }

  // Function to execute arbitrage
  const executeArbitrage = async () => {
    if (!account || !provider || !signer || !chainId) {
      setError("Wallet not connected")
      return
    }

    const contractAddress = getContractAddress()
    if (!contractAddress) {
      setError("Contract not deployed on this network")
      return
    }

    try {
      setIsExecuting(true)
      setError(null)
      setSuccess(null)

      // Get token contract for decimals
      const tokenContract = new ethers.Contract(tokenA.address, ERC20_ABI, signer)
      const decimals = await tokenContract.decimals()

      // Calculate amount in wei
      const amountWei = ethers.utils.parseUnits(amount, decimals)

      // Calculate minimum amount out based on slippage
      const slippagePercent = Number.parseFloat(slippage) / 100
      const minAmountOut = amountWei.mul(Math.floor((1 - slippagePercent) * 10000)).div(10000)

      // Set deadline to 20 minutes from now
      const deadline = Math.floor(Date.now() / 1000) + 20 * 60

      // Get contract instance
      const contract = new ethers.Contract(contractAddress, ARBITRAGE_EXECUTOR_ABI, signer)

      // Execute arbitrage
      const tx = await contract.executeArbitrage(
        sourceDex,
        targetDex,
        tokenA.address,
        tokenB.address,
        amountWei,
        minAmountOut,
        deadline,
      )

      // Wait for transaction to be mined
      const receipt = await tx.wait()

      setSuccess(`Arbitrage executed successfully! Transaction hash: ${receipt.transactionHash}`)
      setIsApproved(false) // Reset approval state

      toast({
        title: "Arbitrage executed",
        description: "Your arbitrage transaction was successful",
      })
    } catch (err: any) {
      console.error("Error executing arbitrage:", err)
      setError(err.message || "Failed to execute arbitrage")
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Execute Arbitrage</CardTitle>
        <CardDescription>
          Execute arbitrage trades between different DEXes to profit from price differences
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isContractDeployed && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Contract Not Deployed</AlertTitle>
            <AlertDescription>
              The arbitrage executor contract is not deployed on this network. Please switch to a supported network or
              deploy the contract first.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tokenA">Source Token</Label>
            <Select
              value={tokenA.symbol}
              onValueChange={(value) => {
                const token = popularTokens.find((t) => t.symbol === value)
                if (token) setTokenA(token)
              }}
              disabled={!account || isApproving || isExecuting}
            >
              <SelectTrigger id="tokenA">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {popularTokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenB">Target Token</Label>
            <Select
              value={tokenB.symbol}
              onValueChange={(value) => {
                const token = popularTokens.find((t) => t.symbol === value)
                if (token) setTokenB(token)
              }}
              disabled={!account || isApproving || isExecuting}
            >
              <SelectTrigger id="tokenB">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {popularTokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceDex">Source DEX</Label>
            <Select value={sourceDex} onValueChange={setSourceDex} disabled={!account || isApproving || isExecuting}>
              <SelectTrigger id="sourceDex">
                <SelectValue placeholder="Select DEX" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_DEXES.map((dex) => (
                  <SelectItem key={dex} value={dex}>
                    {dex}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDex">Target DEX</Label>
            <Select value={targetDex} onValueChange={setTargetDex} disabled={!account || isApproving || isExecuting}>
              <SelectTrigger id="targetDex">
                <SelectValue placeholder="Select DEX" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_DEXES.map((dex) => (
                  <SelectItem key={dex} value={dex}>
                    {dex}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            disabled={!account || isApproving || isExecuting}
          />
          <p className="text-xs text-muted-foreground">Enter the amount of {tokenA.symbol} to use for arbitrage</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="slippage">Slippage Tolerance (%)</Label>
          <Input
            id="slippage"
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            placeholder="0.5"
            disabled={!account || isApproving || isExecuting}
          />
          <p className="text-xs text-muted-foreground">Maximum acceptable slippage percentage</p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        {!isApproved ? (
          <Button
            onClick={approveToken}
            disabled={!account || !isContractDeployed || isApproving || isExecuting}
            className="w-full"
          >
            {isApproving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              `Approve ${tokenA.symbol}`
            )}
          </Button>
        ) : (
          <Button
            onClick={executeArbitrage}
            disabled={!account || !isContractDeployed || isExecuting}
            className="w-full"
          >
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              "Execute Arbitrage"
            )}
          </Button>
        )}

        <p className="text-xs text-center text-muted-foreground">
          {isContractDeployed
            ? `Contract deployed at: ${getContractAddress()?.substring(0, 6)}...${getContractAddress()?.substring(38)}`
            : "Contract not deployed on this network"}
        </p>
      </CardFooter>
    </Card>
  )
}

export default ArbitrageExecutor

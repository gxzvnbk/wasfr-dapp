import { ethers } from "ethers"
import type { TokenInfo } from "./token-list"
import { fetchDexPrices, findArbitrageOpportunities } from "./price-feed"
import { CONTRACT_ADDRESSES, getArbitrageExecutorContract } from "./contract-deployment"

// Interface for arbitrage test results
interface ArbitrageTestResult {
  token: TokenInfo
  buyDex: string
  sellDex: string
  profitPercent: number
  estimatedProfit: string
  gasCost: string
  netProfit: string
  profitable: boolean
}

// Function to test arbitrage opportunities
export async function testArbitrageOpportunities(
  tokens: TokenInfo[],
  provider: ethers.providers.Provider,
  chainId: number,
): Promise<ArbitrageTestResult[]> {
  try {
    // Fetch prices from different DEXes for each token
    const allDexPrices = await Promise.all(tokens.map((token) => fetchDexPrices(token)))

    // Find arbitrage opportunities
    const opportunities = findArbitrageOpportunities(allDexPrices)

    // Estimate gas costs and profits for each opportunity
    const results = await Promise.all(
      opportunities.map(async (opportunity) => {
        // Get current gas price
        const gasPrice = await provider.getGasPrice()

        // Estimate gas usage for arbitrage transaction (approximate)
        const gasLimit = ethers.BigNumber.from(300000) // Approximate gas limit

        // Calculate gas cost
        const gasCost = gasPrice.mul(gasLimit)
        const gasCostEth = ethers.utils.formatEther(gasCost)

        // Calculate estimated profit
        // Assuming we're trading 1 unit of the token
        const tokenPrice =
          allDexPrices.find((prices) => prices[0].token.symbol === opportunity.token.symbol)?.[0].price || 0

        const tradeAmount = 1 // 1 unit of token
        const profitUsd = (tokenPrice * tradeAmount * opportunity.profitPercent) / 100

        // Convert USD profit to ETH (approximate)
        const ethPrice = 3500 // Approximate ETH price in USD
        const profitEth = profitUsd / ethPrice

        // Calculate net profit
        const netProfitEth = profitEth - Number.parseFloat(gasCostEth)

        return {
          ...opportunity,
          estimatedProfit: `${profitEth.toFixed(6)} ETH ($${profitUsd.toFixed(2)})`,
          gasCost: `${gasCostEth} ETH`,
          netProfit: `${netProfitEth.toFixed(6)} ETH`,
          profitable: netProfitEth > 0,
        }
      }),
    )

    // Sort by net profit (highest first)
    return results.sort((a, b) => {
      const netProfitA = Number.parseFloat(a.netProfit.split(" ")[0])
      const netProfitB = Number.parseFloat(b.netProfit.split(" ")[0])
      return netProfitB - netProfitA
    })
  } catch (error) {
    console.error("Error testing arbitrage opportunities:", error)
    return []
  }
}

// Function to execute the most profitable arbitrage opportunity
export async function executeArbitrage(
  opportunity: ArbitrageTestResult,
  signer: ethers.Signer,
  amount: string,
): Promise<string> {
  try {
    // Get chain ID
    const network = await signer.provider?.getNetwork()
    if (!network) {
      throw new Error("Unable to get network information")
    }

    const chainId = network.chainId

    // Get contract address
    const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.ARBITRAGE_EXECUTOR
    if (!contractAddress) {
      throw new Error(`Contract not deployed on chain ID ${chainId}`)
    }

    // Get contract instance
    const contract = getArbitrageExecutorContract(signer.provider!, contractAddress).connect(signer)

    // Get token contract for decimals
    const tokenContract = new ethers.Contract(
      opportunity.token.address,
      ["function decimals() view returns (uint8)"],
      signer,
    )

    // Get token decimals
    const decimals = await tokenContract.decimals()

    // Parse amount to wei
    const amountWei = ethers.utils.parseUnits(amount, decimals)

    // Calculate minimum amount out with 1% slippage
    const minAmountOut = amountWei.mul(99).div(100)

    // Set deadline to 20 minutes from now
    const deadline = Math.floor(Date.now() / 1000) + 20 * 60

    // Execute arbitrage
    const tx = await contract.executeArbitrage(
      opportunity.buyDex,
      opportunity.sellDex,
      opportunity.token.address,
      opportunity.token.address, // Using same token for simplicity
      amountWei,
      minAmountOut,
      deadline,
      { gasLimit: 500000 }, // Set gas limit
    )

    // Wait for transaction to be mined
    const receipt = await tx.wait()

    return receipt.transactionHash
  } catch (error: any) {
    console.error("Error executing arbitrage:", error)
    throw new Error(error.message || "Failed to execute arbitrage")
  }
}

import { ethers } from "ethers"
import { deployArbitrageExecutor, setupArbitrageExecutor } from "./contract-deployment"

// This script is meant to be run from a Node.js environment, not in the browser

async function main() {
  try {
    // Check for environment variables
    const rpcUrl = process.env.RPC_URL
    const privateKey = process.env.PRIVATE_KEY

    if (!rpcUrl) {
      throw new Error("RPC_URL environment variable is not set")
    }

    if (!privateKey) {
      throw new Error("PRIVATE_KEY environment variable is not set")
    }

    // Connect to the network
    console.log(`Connecting to network: ${rpcUrl}`)
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey, provider)
    const address = await wallet.getAddress()
    console.log(`Using wallet address: ${address}`)

    // Get network information
    const network = await provider.getNetwork()
    console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`)

    // Check wallet balance
    const balance = await provider.getBalance(address)
    const balanceEth = ethers.utils.formatEther(balance)
    console.log(`Wallet balance: ${balanceEth} ETH`)

    if (balance.eq(0)) {
      throw new Error("Wallet has no ETH for gas fees")
    }

    // Deploy the contract
    const contractAddress = await deployArbitrageExecutor(provider, wallet)
    console.log(`Contract deployed at: ${contractAddress}`)

    // Get contract instance
    const contract = new ethers.Contract(
      contractAddress,
      [
        "function setDexRouter(string memory name, address routerAddress)",
        "function setAaveLendingPool(address lendingPoolAddress)",
      ],
      wallet,
    )

    // Set up the contract
    await setupArbitrageExecutor(contract, network.chainId)

    console.log("Deployment and setup complete!")
    console.log("-----------------------------------")
    console.log(`Contract Address: ${contractAddress}`)
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`)
    console.log("-----------------------------------")
    console.log("Next steps:")
    console.log("1. Update the CONTRACT_ADDRESSES in contract-deployment.ts with this address")
    console.log("2. Test the contract with small amounts before using larger amounts")
  } catch (error) {
    console.error("Deployment failed:", error)
    process.exit(1)
  }
}

// Run the script
main()

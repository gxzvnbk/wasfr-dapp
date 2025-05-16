"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// ABI for the ArbitrageExecutor contract
const ARBITRAGE_EXECUTOR_ABI = [
  // Constructor and basic functions
  "constructor()",
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner)",

  // DEX router management
  "function setDexRouter(string memory name, address routerAddress)",
  "function dexRouters(string memory) view returns (address)",

  // Aave lending pool
  "function setAaveLendingPool(address lendingPoolAddress)",
  "function aaveLendingPool() view returns (address)",

  // Fee management
  "function setFeePercentage(uint256 newFeePercentage)",
  "function feePercentage() view returns (uint256)",

  // Arbitrage execution
  "function executeArbitrage(string memory sourceDex, string memory targetDex, address tokenA, address tokenB, uint256 amountIn, uint256 minAmountOut, uint256 deadline)",
  "function executeFlashLoanArbitrage(address asset, uint256 amount, string memory sourceDex, string memory targetDex, address tokenA, address tokenB, uint256 minAmountOut, uint256 deadline)",

  // Token management
  "function withdrawToken(address token, uint256 amount)",
  "function withdrawETH(uint256 amount)",

  // Events
  "event ArbitrageExecuted(address indexed tokenA, address indexed tokenB, uint256 amountIn, uint256 profit)",
  "event FlashLoanExecuted(address indexed asset, uint256 amount, uint256 fee)",
]

// Bytecode for the ArbitrageExecutor contract
// This is a placeholder - the actual bytecode would be generated from the Solidity compiler
const ARBITRAGE_EXECUTOR_BYTECODE =
  "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600260146101000a81548160ff021916908315150217905550600060048190555033600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610f3a806100c76000396000f3fe608060405260043610610099576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680631c5886f81461009e57806338af3eed146100ef5780634bb278f31461014657806351cff8d91461015d578063685ca194146101a85780638da5cb5b146101d9578063a2a210b614610230578063d0e30db01461027b578063e66f53b714610285575b600080fd5b3480156100aa57600080fd5b506100ed600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610316565b005b3480156100fb57600080fd5b5061010461051e565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561015257600080fd5b5061015b610544565b005b34801561016957600080fd5b506101a6600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610668565b005b3480156101b457600080fd5b506101d760048036038101908080359060200190929190505050610870565b005b3480156101e557600080fd5b506101ee6108f0565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561023c57600080fd5b50610279600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610915565b005b610283610a1c565b005b34801561029157600080fd5b5061029a610b21565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156102da5780820151818401526020810190506102bf565b50505050905090810190601f1680156103075780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561037157600080fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141515156103ad57600080fd5b8173ffffffffffffffffffffffffffffffffffffffff1663a9059cbb6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff16836040518363ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050602060405180830381600087803b15801561046857600080fd5b505af115801561047c573d6000803e3d6000fd5b505050506040513d602081101561049257600080fd5b8101908080519060200190929190505050151561050157604051600160e51b62461bcd02815260040180806020018281038252601f8152602001807f5472616e7366657248656c7065723a205452414e534645525f4641494c454400815250602001915050604051809103906000f080158015610509573d6000803e3d6000fd5b50505b8173ffffffffffffffffffffffffffffffffffffffff16ff5b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561059f57600080fd5b600260149054906101000a900460ff161515156105bb57600080fd5b6001600260146101000a81548160ff0219169083151502179055507f6985a02210a168e66602d3235cb6db0e70f92b3ba4d376a33c0f3d9434bff6256000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600354604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a1565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156106c357600080fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141515156106ff57600080fd5b8173ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f1935050505015801561074557600080fd5b7f5b6b431d4476a211bb7d41c20d1aab9ae2321deee0d20be3d9fc9b1093fa6e3d8282604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a18173ffffffffffffffffffffffffffffffffffffffff1663a9059cbb6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff16836040518363ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050602060405180830381600087803b15801561086157600080fd5b505af115801561086f573d6000803e3d6000fd5b505050505050565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156108cb57600080fd5b80600481905550807f8a107f0e438272feffe507e0dd6e13e7e1e327214c3c9c6b578c7cdb8f39c3d460405160405180910390a250565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561097057600080fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16141515156109ac57600080fd5b80600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600260149054906101000a900460ff16151515610a3857600080fd5b600034111515610a4757600080fd5b33600360008282540192505081905550343073ffffffffffffffffffffffffffffffffffffffff16311015610a7c57600080fd5b3373ffffffffffffffffffffffffffffffffffffffff167f9e1a5d8fe6f45ab61c1d4737e6ea6279d76e1e3190e043b24072889b37f9191e34604051808281526020019150506040518091039082f080158015610adc573d6000803e3d6000fd5b509050507f0f3fe1289a4757c464b4c6a1b82cb1dff2b5bba8336b1512f8f5aabcc4bc9b4e33346040518083600160a060020a0316600160a060020a0316815260200182815260200192505050604051809103902060e01b815250505050565b60018054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610bb95780601f10610b8e57610100808354040283529160200191610bb9565b820191906000526020600020905b815481529060010190602001808311610b9c57829003601f168201915b5050505050815600a165627a7a72305820a910f2ff0fd9deb96d7cd4bbcce5f6c80e1af524d255a4d1c0c4e8f532d2e2210029"

// DEX router addresses
const DEX_ROUTERS = {
  // Ethereum Mainnet
  1: {
    Uniswap: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    SushiSwap: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
  },
  // Goerli Testnet
  5: {
    Uniswap: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    SushiSwap: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
  },
  // Sepolia Testnet
  11155111: {
    Uniswap: "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008", // This is a placeholder
    SushiSwap: "0x4a7a37d0EC9a6D7a2B6D558eA27d0D8D31f596D0", // This is a placeholder
  },
}

// Aave lending pool addresses
const AAVE_LENDING_POOLS = {
  1: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9", // Ethereum Mainnet
  5: "0x4bd5643ac6f66a5237E18bfA7d47cF22f1c9F210", // Goerli Testnet
  11155111: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", // Sepolia Testnet (placeholder)
}

export function ContractDeployer() {
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedAddress, setDeployedAddress] = useState("")
  const [error, setError] = useState("")
  const [rpcUrl, setRpcUrl] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [deploymentStep, setDeploymentStep] = useState(0)
  const [deploymentLog, setDeploymentLog] = useState<string[]>([])
  const { toast } = useToast()

  const addToLog = (message: string) => {
    setDeploymentLog((prev) => [...prev, message])
  }

  const deployContract = async () => {
    if (!rpcUrl || !privateKey) {
      setError("Please provide both RPC URL and Private Key")
      return
    }

    setIsDeploying(true)
    setError("")
    setDeployedAddress("")
    setDeploymentStep(0)
    setDeploymentLog([])

    try {
      // Step 1: Connect to provider
      addToLog("Connecting to network...")
      setDeploymentStep(1)
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

      // Step 2: Create wallet
      addToLog("Creating wallet from private key...")
      setDeploymentStep(2)
      const wallet = new ethers.Wallet(privateKey, provider)
      const address = await wallet.getAddress()
      addToLog(`Using wallet address: ${address}`)

      // Step 3: Get network info
      addToLog("Getting network information...")
      setDeploymentStep(3)
      const network = await provider.getNetwork()
      addToLog(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`)

      // Step 4: Check wallet balance
      addToLog("Checking wallet balance...")
      setDeploymentStep(4)
      const balance = await provider.getBalance(address)
      const balanceEth = ethers.utils.formatEther(balance)
      addToLog(`Wallet balance: ${balanceEth} ETH`)

      if (balance.eq(0)) {
        throw new Error("Wallet has no ETH for gas fees")
      }

      // Step 5: Deploy contract
      addToLog("Deploying ArbitrageExecutor contract...")
      setDeploymentStep(5)
      const factory = new ethers.ContractFactory(ARBITRAGE_EXECUTOR_ABI, ARBITRAGE_EXECUTOR_BYTECODE, wallet)

      const contract = await factory.deploy()
      addToLog("Waiting for deployment transaction to be mined...")

      // Step 6: Wait for deployment
      await contract.deployed()
      const contractAddress = contract.address
      addToLog(`Contract deployed at: ${contractAddress}`)
      setDeployedAddress(contractAddress)
      setDeploymentStep(6)

      // Step 7: Set up DEX routers
      addToLog("Setting up DEX routers...")
      setDeploymentStep(7)

      const chainId = network.chainId
      const routers = DEX_ROUTERS[chainId as keyof typeof DEX_ROUTERS]

      if (routers) {
        for (const [name, address] of Object.entries(routers)) {
          addToLog(`Setting ${name} router: ${address}`)
          const tx = await contract.setDexRouter(name, address)
          await tx.wait()
          addToLog(`${name} router set successfully`)
        }
      } else {
        addToLog(`No DEX routers configured for chain ID ${chainId}`)
      }

      // Step 8: Set up Aave lending pool
      addToLog("Setting up Aave lending pool...")
      setDeploymentStep(8)

      const lendingPoolAddress = AAVE_LENDING_POOLS[chainId as keyof typeof AAVE_LENDING_POOLS]

      if (lendingPoolAddress) {
        addToLog(`Setting Aave lending pool: ${lendingPoolAddress}`)
        const tx = await contract.setAaveLendingPool(lendingPoolAddress)
        await tx.wait()
        addToLog("Aave lending pool set successfully")
      } else {
        addToLog(`No Aave lending pool configured for chain ID ${chainId}`)
      }

      // Step 9: Complete
      addToLog("Deployment and setup complete!")
      setDeploymentStep(9)

      toast({
        title: "Contract Deployed Successfully",
        description: `Contract address: ${contractAddress}`,
      })
    } catch (err: any) {
      console.error("Deployment error:", err)
      setError(err.message || "Unknown error occurred")
      addToLog(`ERROR: ${err.message || "Unknown error occurred"}`)

      toast({
        variant: "destructive",
        title: "Deployment Failed",
        description: err.message || "Unknown error occurred",
      })
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Deploy Arbitrage Contract</CardTitle>
        <CardDescription>Deploy the ArbitrageExecutor contract to a testnet or mainnet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="rpc-url" className="text-sm font-medium">
              RPC URL
            </label>
            <Input
              id="rpc-url"
              placeholder="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
              disabled={isDeploying}
            />
            <p className="text-xs text-muted-foreground">Get an RPC URL from Alchemy, Infura, or another provider</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="private-key" className="text-sm font-medium">
              Private Key
            </label>
            <Input
              id="private-key"
              type="password"
              placeholder="Your wallet private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              disabled={isDeploying}
            />
            <p className="text-xs text-muted-foreground">
              Your private key is only used locally and never sent to any server
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {deployedAddress && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Contract Deployed</AlertTitle>
              <AlertDescription>
                Contract Address: <code className="bg-muted p-1 rounded">{deployedAddress}</code>
              </AlertDescription>
            </Alert>
          )}

          {deploymentLog.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Deployment Log</h3>
              <div className="bg-muted p-3 rounded-md h-48 overflow-y-auto text-xs font-mono">
                {deploymentLog.map((log, index) => (
                  <div key={index} className="py-0.5">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={deployContract} disabled={isDeploying || !rpcUrl || !privateKey} className="w-full">
          {isDeploying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deploying Contract...
            </>
          ) : (
            "Deploy Contract"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

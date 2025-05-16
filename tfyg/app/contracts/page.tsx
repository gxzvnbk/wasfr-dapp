"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, Copy, ExternalLink, Github } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Contract data
const contracts = [
  {
    id: "arbitrage-executor",
    name: "Arbitrage Executor",
    description: "Smart contract for executing arbitrage opportunities across multiple DEXes",
    status: "verified",
    address: "0x1234567890123456789012345678901234567890",
    network: "Ethereum",
    deployedAt: "2023-05-15",
    sourceCode: "https://github.com/gxzvnbk/ethdev.git",
    abi: [
      { inputs: [], stateMutability: "nonpayable", type: "constructor" },
      {
        inputs: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "executeArbitrage",
        outputs: [{ internalType: "uint256", name: "profit", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
  },
  {
    id: "flash-arbitrage",
    name: "Flash Arbitrage",
    description: "Flash loan arbitrage contract for executing trades with borrowed liquidity",
    status: "verified",
    address: "0x0987654321098765432109876543210987654321",
    network: "Ethereum",
    deployedAt: "2023-06-20",
    sourceCode: "https://github.com/gxzvnbk/quiet-frost-a94b.git",
    abi: [
      { inputs: [], stateMutability: "nonpayable", type: "constructor" },
      {
        inputs: [
          { internalType: "address", name: "lendingPool", type: "address" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "executeFlashLoan",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
  },
  {
    id: "multi-dex-router",
    name: "Multi-DEX Router",
    description: "Router contract for finding and executing the best trades across multiple DEXes",
    status: "unverified",
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    network: "Polygon",
    deployedAt: "2023-07-10",
    sourceCode: "",
    abi: [
      { inputs: [], stateMutability: "nonpayable", type: "constructor" },
      {
        inputs: [
          { internalType: "address", name: "tokenIn", type: "address" },
          { internalType: "address", name: "tokenOut", type: "address" },
          { internalType: "uint256", name: "amountIn", type: "uint256" },
        ],
        name: "findBestRoute",
        outputs: [
          { internalType: "address[]", name: "path", type: "address[]" },
          { internalType: "address[]", name: "dexes", type: "address[]" },
          { internalType: "uint256", name: "amountOut", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
  },
]

export default function ContractsPage() {
  const { toast } = useToast()
  const [selectedContract, setSelectedContract] = useState<any>(null)
  const [isSourceCodeOpen, setIsSourceCodeOpen] = useState(false)
  const [isAbiOpen, setIsAbiOpen] = useState(false)

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast({
      title: "Address Copied",
      description: "Contract address copied to clipboard",
    })
  }

  const handleViewSourceCode = (contract: any) => {
    if (contract.sourceCode) {
      window.open(contract.sourceCode, "_blank")
    } else {
      setSelectedContract(contract)
      setIsSourceCodeOpen(true)
    }
  }

  const handleViewAbi = (contract: any) => {
    setSelectedContract(contract)
    setIsAbiOpen(true)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Smart Contracts</h1>
          <p className="text-muted-foreground mt-2">View and interact with deployed arbitrage smart contracts</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Contracts</TabsTrigger>
            <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
            <TabsTrigger value="polygon">Polygon</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {contracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onCopyAddress={handleCopyAddress}
                onViewSourceCode={handleViewSourceCode}
                onViewAbi={handleViewAbi}
              />
            ))}
          </TabsContent>

          <TabsContent value="ethereum" className="space-y-4">
            {contracts
              .filter((contract) => contract.network === "Ethereum")
              .map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onCopyAddress={handleCopyAddress}
                  onViewSourceCode={handleViewSourceCode}
                  onViewAbi={handleViewAbi}
                />
              ))}
          </TabsContent>

          <TabsContent value="polygon" className="space-y-4">
            {contracts
              .filter((contract) => contract.network === "Polygon")
              .map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onCopyAddress={handleCopyAddress}
                  onViewSourceCode={handleViewSourceCode}
                  onViewAbi={handleViewAbi}
                />
              ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Source Code Dialog */}
      <Dialog open={isSourceCodeOpen} onOpenChange={setIsSourceCodeOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Source Code Not Available</DialogTitle>
            <DialogDescription>The source code for this contract is not publicly available.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsSourceCodeOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ABI Dialog */}
      <Dialog open={isAbiOpen} onOpenChange={setIsAbiOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Contract ABI</DialogTitle>
            <DialogDescription>{selectedContract?.name} ABI for integration</DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
            <pre className="text-xs">{selectedContract ? JSON.stringify(selectedContract.abi, null, 2) : ""}</pre>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="mr-2"
              onClick={() => {
                if (selectedContract) {
                  navigator.clipboard.writeText(JSON.stringify(selectedContract.abi))
                  toast({
                    title: "ABI Copied",
                    description: "Contract ABI copied to clipboard",
                  })
                }
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy ABI
            </Button>
            <Button variant="outline" onClick={() => setIsAbiOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ContractCard({
  contract,
  onCopyAddress,
  onViewSourceCode,
  onViewAbi,
}: {
  contract: any
  onCopyAddress: (address: string) => void
  onViewSourceCode: (contract: any) => void
  onViewAbi: (contract: any) => void
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{contract.name}</CardTitle>
            <CardDescription className="mt-1">{contract.description}</CardDescription>
          </div>
          <Badge
            variant={contract.status === "verified" ? "default" : "outline"}
            className={contract.status === "verified" ? "bg-green-500" : ""}
          >
            {contract.status === "verified" ? (
              <span className="flex items-center">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Verified
              </span>
            ) : (
              <span className="flex items-center">
                <AlertCircle className="mr-1 h-3 w-3" />
                Unverified
              </span>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <div className="flex items-center mt-1">
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {contract.address.substring(0, 8)}...{contract.address.substring(contract.address.length - 8)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1"
                  onClick={() => onCopyAddress(contract.address)}
                >
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy address</span>
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Network</p>
              <p className="mt-1">{contract.network}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Deployed</p>
            <p className="mt-1">{contract.deployedAt}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => onViewAbi(contract)}>
          View ABI
        </Button>
        <Button variant="default" size="sm" onClick={() => onViewSourceCode(contract)} className="flex items-center">
          <Github className="mr-2 h-4 w-4" />
          View Source Code
          <ExternalLink className="ml-2 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  )
}

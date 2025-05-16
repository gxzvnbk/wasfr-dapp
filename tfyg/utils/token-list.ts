// Define token information interface
export interface TokenInfo {
  id: string
  symbol: string
  name: string
  address: string
  decimals: number
  chainId: number
  logoURI?: string
}

// Popular tokens for price tracking and arbitrage
export const popularTokens: TokenInfo[] = [
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native ETH representation
    decimals: 18,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  },
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC on Ethereum
    decimals: 8,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  },
  {
    id: "usd-coin",
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
  },
  {
    id: "tether",
    symbol: "USDT",
    name: "Tether",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    name: "Binance Coin",
    address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
    decimals: 18,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    decimals: 18,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  },
  {
    id: "uniswap",
    symbol: "UNI",
    name: "Uniswap",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    decimals: 18,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
  },
  {
    id: "aave",
    symbol: "AAVE",
    name: "Aave",
    address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    decimals: 18,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
  },
  {
    id: "dai",
    symbol: "DAI",
    name: "Dai",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimals: 18,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/9956/small/4943.png",
  },
  {
    id: "matic-network",
    symbol: "MATIC",
    name: "Polygon",
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    decimals: 18,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    address: "0xD31a59c85aE9D8edEFeC411D448f90841571b89c", // Wrapped SOL on Ethereum
    decimals: 9,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  },
  {
    id: "avalanche-2",
    symbol: "AVAX",
    name: "Avalanche",
    address: "0x85f138bfEE4ef8e540890CFb48F620571d67Eda3", // Wrapped AVAX on Ethereum
    decimals: 18,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  },
]

// Token lists by chain ID
export const getTokensByChainId = (chainId: number): TokenInfo[] => {
  return popularTokens.filter((token) => token.chainId === chainId)
}

// Get token by symbol
export const getTokenBySymbol = (symbol: string): TokenInfo | undefined => {
  return popularTokens.find((token) => token.symbol.toLowerCase() === symbol.toLowerCase())
}

// Get token by address
export const getTokenByAddress = (address: string): TokenInfo | undefined => {
  return popularTokens.find((token) => token.address.toLowerCase() === address.toLowerCase())
}

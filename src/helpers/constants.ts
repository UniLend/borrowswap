// This file stores web3 related constants such as addresses, token definitions, ETH currency references and ABI's

import {  Token, SUPPORTED_CHAINS } from '@uniswap/sdk-core'

// Addresses

export const POOL_FACTORY_CONTRACT_ADDRESS =
  '0x1F98431c8aD98523631AE4a59f267346ea31F984'
export const QUOTER_CONTRACT_ADDRESS =
  '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'

// Currencies and Tokens

export const WETH_TOKEN = new Token(
  137,
  '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  18,
)
export const CURV_TOKEN = new Token(
    137,
    '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
    18,
  )

export const USDT_TOKEN = new Token(
  137,
  '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  6,
)


export const CompoundBaseTokens: any = [
  {
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    symbol: "USDC (PoS)",
    name: "USD Coin (PoS) ",
    decimals: 6,
    source: "Compound",
    compoundCollateralTokens: [{
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      symbol: "WETH",
      name: "Wrapped ETH",
      decimals: 18,
      source: "Compound",
      logo: "https://assets.coingecko.com/coins/images/17238/small/aWETH_2x.png?1626940782"
    },
    {
      address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      symbol: "WBTC",
      name: "Wrapped BTC",
      decimals: 8,
      source: "Compound",
      logo: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png?1548822744"
    },
      {
      address: "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4",
      symbol: "stMATIC",
      name: "Staked Matic",
      decimals: 18,
      source: "Compound",
      logo: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912"
    },
      {
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      symbol: "WMATIC",
      name: "Wrapped Matic",
      decimals: 18,
      source: "Compound",
      logo: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912"
    }]
  },
];

export const compoundCollateralTokens = [
  {
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    symbol: "WETH",
    name: "Wrapped ETH",
    decimals: 18,
    source: "Compound",
    logo: "https://assets.coingecko.com/coins/images/17238/small/aWETH_2x.png?1626940782"
  },
  {
    address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    symbol: "WBTC",
    name: "Wrapped BTC",
    decimals: 8,
    source: "Compound",
    logo: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png?1548822744"
  },
    {
    address: "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4",
    symbol: "stMATIC",
    name: "Staked Matic",
    decimals: 18,
    source: "Compound",
    logo: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912"
  },
    {
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    symbol: "WMATIC",
    name: "Wrapped Matic",
    decimals: 18,
    source: "Compound",
    logo: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912"
  },
];

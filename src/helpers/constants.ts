// This file stores web3 related constants such as addresses, token definitions, ETH currency references and ABI's

import { Token, SUPPORTED_CHAINS } from "@uniswap/sdk-core";

// Addresses
// mainnet = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
// polygon = "0x1F98431c8aD98523631AE4a59f267346ea31F984"
export const POOL_FACTORY_CONTRACT_ADDRESS =
  "0x1F98431c8aD98523631AE4a59f267346ea31F984";

// mainNet = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
// polygon = "0x7b2d9632A44cB0553BbCfCf89BdBc847Ab1f74d4"
export const QUOTER_CONTRACT_ADDRESS =
  "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

// Currencies and Tokens
export const WETH_TOKEN = new Token(
  137,
  "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  18,
  "WETH",
  "Wrapped Ether"
);
export const CURV_TOKEN = new Token(
  137,
  "0x172370d5Cd63279eFa6d502DAB29171933a610AF",
  18,
  "CRV",
  "CRV"
);

export const USDT_TOKEN = new Token(
  137,
  "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  6,
  "USDT",
  "USDT"
);

export const USDC_TOKEN = new Token(
  137,
  "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  6,
  "USDC",
  "USDC"
);

export const CompoundBaseTokens: any = [
  {
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    symbol: "USDC (PoS)",
    name: "USD Coin (PoS) ",
    decimals: 6,
    source: "Compound",
    logo: "https://assets.coingecko.com/coins/images/33000/standard/usdc.png?1700119918",
    compoundCollateralTokens: [
      {
        address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        symbol: "WETH",
        name: "Wrapped ETH",
        decimals: 18,
        source: "Compound",
        logo: "https://assets.coingecko.com/coins/images/17238/small/aWETH_2x.png?1626940782",
      },
      {
        address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
        symbol: "WBTC",
        name: "Wrapped BTC",
        decimals: 8,
        source: "Compound",
        logo: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png?1548822744",
      },
      {
        address: "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4",
        symbol: "stMATIC",
        name: "Staked Matic",
        decimals: 18,
        source: "Compound",
        logo: "https://app.compound.finance/images/assets/asset_STMATIC.svg",
      },
      {
        address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        symbol: "WMATIC",
        name: "Wrapped Matic",
        decimals: 18,
        source: "Compound",
        logo: "https://assets.coingecko.com/coins/images/14073/standard/matic.png?1696513797",
      },
    ],
  },
];

export const compoundCollateralTokens = [
  {
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    symbol: "WETH",
    name: "Wrapped ETH",
    decimals: 18,
    source: "Compound",
    logo: "https://assets.coingecko.com/coins/images/17238/small/aWETH_2x.png?1626940782",
  },
  {
    address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    symbol: "WBTC",
    name: "Wrapped BTC",
    decimals: 8,
    source: "Compound",
    logo: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png?1548822744",
  },
  {
    address: "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4",
    symbol: "stMATIC",
    name: "Staked Matic",
    decimals: 18,
    source: "Compound",
    logo: "https://app.compound.finance/images/assets/asset_STMATIC.svg",
  },
  {
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    symbol: "WMATIC",
    name: "Wrapped Matic",
    decimals: 18,
    source: "Compound",
    logo: "https://assets.coingecko.com/coins/images/14073/standard/matic.png?1696513797",
  },
];

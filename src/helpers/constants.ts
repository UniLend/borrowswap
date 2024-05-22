// This file stores web3 related constants such as addresses, token definitions, ETH currency references and ABI's

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

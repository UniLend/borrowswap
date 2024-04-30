import tokensbysymbol from "./tokensbysymbol.json";
import ETH from "../../assets/eth-new.svg"
import ARB from "../../assets/arbitrum-logo.svg"
import MATIC from "../../assets/matic.svg"
interface Token {
  address?: string;
  chainId?: number;
  name?: string;
  symbol: string;
  decimals?: number;
  logoURI?: string;
  logo: string;
}

export const tokensBYSymbol: { [key: string]: Token } = {
  ...tokensbysymbol,
  ETH: {
    address: "",
    symbol: "ETH",
    logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
  },
  LINK: {
    address: "0xa36085F69e2889c224210F603D836748e7dC0088",
    symbol: "LINK",
    logo: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png?1547034700",
  },
  DAI: {
    address: "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD",
    symbol: "DAI",
    logo: "https://assets.coingecko.com/coins/images/9956/small/4943.png?1636636734",
  },
  USDC: {
    address: "0x7079f3762805CFf9C979a5bDC6f5648bCFEE76C8",
    symbol: "USDC",
    logo: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389",
  },
  UFT: {
    address: "0x83Fb1c9f0774d13B1c11796137678338411240Bf",
    symbol: "UFT",
    logo: "https://assets.coingecko.com/coins/images/12819/small/UniLend_Finance_logo_PNG.png?1602748658",
  },
  OMATIC: {
    // "address": "0x99aA0f9e64bFb788201369dA3b1522E6026DCd4A",
    address: "0x5a6B05b85d5b859988f280E32ac5e79321B15779",
    symbol: "OMATIC",
    logo: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912",
  },
  OUNI: {
    address: "0xEBf5742313EeAcC07eC2E9B78630c26bADcE72D2",
    symbol: "OUNI",
    logo: "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png?1600306604",
  },
  OUSDC: {
    // "address": "0x89b1C1D707Fb7E20A6C0F65B488A8837fa488F9e",
    address: "0x6142E3D569B3821e7A5F45b49b0F85F58370a3dD",
    symbol: "OUSDC",
    logo: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389",
  },
  OBNB: {
    address: "0x5e92B7841C8803746149d86fcDd6DA6F7880a25a",
    symbol: "OBNB",
    logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png?1644979850",
  },
  WETH: {
    address: "0xeD43f81C17976372Fcb5786Dd214572e7dbB92c7",
    symbol: "WETH",
    logo: "https://assets.coingecko.com/coins/images/17238/small/aWETH_2x.png?1626940782",
  },
  WBTC: {
    address: "0xeD43f81C17976372Fcb5786Dd214572e7dbB92c7",
    symbol: "WBTC",
    logo: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png?1548822744",
  },
  USDT: {
    address: "0x6175a8471c2122f778445e7e07a164250a19e661",
    symbol: "USDT",
    logo: "https://assets.coingecko.com/coins/images/14243/small/aUSDT.78f5faae.png?1615528400",
  },
  WBNB: {
    address: "0x0bc8AEE2DbecfB45E1559BD7F81905156Cf64077",
    symbol: "WBNB",
    logo: "https://seeklogo.com/images/B/binance-coin-bnb-logo-CD94CC6D31-seeklogo.com.png",
  },
  BUSD: {
    address: "0x5fB282Df60a3264c06b2Cb36c74d0Fd23D727f82",
    symbol: "BUSD",
    logo: "https://assets.coingecko.com/coins/images/9576/thumb/BUSD.png?1568947766",
  },
  NED: {
    address: "0x5fB282Df60a3264c06b2Cb36c74d0Fd23D727f82",
    symbol: "BUSD",
    logo: "https://i.imgur.com/JqKNrg3.png",
  },
  ARG: {
    address: "0x5fB282Df60a3264c06b2Cb36c74d0Fd23D727f82",
    symbol: "ARG",
    logo: "https://i.imgur.com/QZxMU2H.png",
  },
  VATRENI: {
    address: "0x5fB282Df60a3264c06b2Cb36c74d0Fd23D727f82",
    symbol: "VATRENI",
    logo: "https://i.imgur.com/dhQeXfe.png",
  },
  BFT: {
    address: "0x5fB282Df60a3264c06b2Cb36c74d0Fd23D727f82",
    symbol: "BFT",
    logo: "https://i.imgur.com/d9x0GkT.png",
  },
  ENG: {
    address: "0x5fB282Df60a3264c06b2Cb36c74d0Fd23D727f82",
    symbol: "ENG",
    logo: "https://i.imgur.com/kDsnLdo.png",
  },
  FRA: {
    address: "0x5fB282Df60a3264c06b2Cb36c74d0Fd23D727f82",
    symbol: "FRA",
    logo: "https://i.imgur.com/V824oSR.png",
  },
  MAR: {
    address: "0x5fB282Df60a3264c06b2Cb36c74d0Fd23D727f82",
    symbol: "MAR",
    logo: "https://i.imgur.com/0lGiSbo.png",
  },
  POR: {
    address: "0x5fB282Df60a3264c06b2Cb36c74d0Fd23D727f82",
    symbol: "BUSD",
    logo: "https://i.imgur.com/owRvfOY.png",
  },
  SANTA: {
    logo: "https://i.imgur.com/70sMFN7.png",
    symbol: "SANTA",
  },
  GIFT: {
    logo: "https://i.imgur.com/tWu6HLM.png",
    symbol: "GIFT",
  },
  pBTC: {
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/5434.png",
    symbol: "pBTC",
  },
  MAI: {
    logo: "https://i.imgur.com/0uPSnqM_d.webp?maxwidth=760&fidelity=grand",
    symbol: "MAI",
  },
  LOVE: {
    logo: "https://i.imgur.com/fXBrprS.png",
    symbol: "LOVE",
  },
  ROSE: {
    logo: "https://i.imgur.com/tHj6Sfm.png",
    symbol: "ROSE",
  },
  EGG: {
    logo: "https://i.imgur.com/nxQ43qn.png",
    symbol: "EGG",
  },
  BUNNY: {
    logo: "https://i.imgur.com/KdK30Uo.png",
    symbol: "BUNNY",
  },
  FLOKI: {
    logo: "https://i.imgur.com/JYTPKWf.jpg",
    symbol: "FLOKI",
  },
  SUSHI: {
    address: "0xd4d42f0b6def4ce0383636770ef773390d85c61a",
    symbol: "SUSHI",
    logo: "https://assets.coingecko.com/coins/images/12271/large/512x512_Logo_no_chop.png?1606986688",
  },
  CRV: {
    address: "0x11cdb42b0eb46d95f990bedd4695a6e3fa034978",
    symbol: "CRV",
    logo: "https://assets.coingecko.com/coins/images/12124/large/Curve.png?1597369484",
  },
};


export const chainsBySymbol: { [key: number]: Token } = {
  1: {
    address: "",
    symbol: "ETH",
    logo: ETH,
  },
    42161: {
    address: "",
    symbol: "ARB",
    logo: ARB,
  },
    80001: {
    address: "",
    symbol: "MATIC",
    logo: MATIC,
  },
    137: {
    address: "",
    symbol: "MATIC",
    logo: MATIC,
  },
    16715: {
    address: "",
    symbol: "MATIC",
    logo: MATIC,
  },
}
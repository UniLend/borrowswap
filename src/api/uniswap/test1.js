import { ethers, providers } from "ethers";
import { Token } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";
// import { CurrentConfig } from "../config";
import { computePoolAddress } from "@uniswap/v3-sdk";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import {
  POOL_FACTORY_CONTRACT_ADDRESS,
  QUOTER_CONTRACT_ADDRESS,
  USDT_TOKEN,
  WETH_TOKEN,
  CURV_TOKEN,
  USDC_TOKEN,
} from "../../helpers/constants";
import { getEtherContract, getEthersProvider } from "../contracts/ethers";
// import { getProvider } from "../libs/providers";
// import { toReadableAmount, fromReadableAmount } from "../libs/conversion";
// import { getEtherContract } from "../contracts/ethers";

const READABLE_FORM_LEN = 8;

export function fromReadableAmount(amount, decimals) {
  return ethers.utils.parseUnits(amount.toString(), decimals);
}

export function toReadableAmount(rawAmount, decimals) {
  return ethers.utils
    .formatUnits(rawAmount, decimals)
    .slice(0, READABLE_FORM_LEN);
}

// Inputs that configure this example to run
// export interface ExampleConfig {
//   rpc: {
//     local: string
//     mainnet: string
//   }
//   tokens: {
//     in: Token
//     amountIn: number
//     out: Token
//     poolFee: number
//   }
// }

// Example Configuration
// export const CurrentConfig: ExampleConfig = {
// export const CurrentConfig = {
//   rpc: {
//     local: "http://localhost:5001",
//     // mainnet:
//     //   "https://polygon-mainnet.g.alchemy.com/v2/lGRIjTUZouUNPNZoyjSAFlVL0f-kvJRK",
//     mainnet: "https://polygon-rpc.com/",
//     // mainnet: "https://mainnet.infura.io/v3/0ac57a06f2994538829c14745750d721",
//   },
//   tokens: {
//     in: USDC_TOKEN,
//     amountIn: 1,
//     out: USDT_TOKEN,
//     poolFee: FeeAmount.LOWEST,
//   },
// };

export async function quoteWithSdk(tokenIn, tokenOut) {
  const TOKEN_IN = new Token(
    tokenIn.chainId,
    tokenIn.address,
    tokenIn.decimals,
    tokenIn.symbol,
    tokenIn.name
  );

  const TOKEN_OUT = new Token(
    tokenOut.chainId,
    tokenOut.address,
    tokenOut.decimals,
    tokenOut.symbol,
    tokenOut.name
  );
  const CurrentConfig = {
    rpc: {
      local: "http://localhost:5001",
      mainnet:
        "https://polygon-mainnet.g.alchemy.com/v2/lGRIjTUZouUNPNZoyjSAFlVL0f-kvJRK",
    },
    tokens: {
      in: TOKEN_IN,
      amountIn: 1,
      out: TOKEN_OUT,
      poolFee: FeeAmount.MEDIUM,
    },
  };
  console.log("CONFIG", CurrentConfig);

  const quoterContract = await getEtherContract(
    QUOTER_CONTRACT_ADDRESS,
    Quoter.abi
  );

  // const quoterContract = new ethers.Contract(
  //   QUOTER_CONTRACT_ADDRESS,
  //   Quoter.abi,
  //   getProvider()
  // );

  const poolConstants = await getPoolConstants(CurrentConfig);
  // const poolConstants1 = getPoolConstantsLowest(CurrentConfig);
  // const poolConstants2 = getPoolConstantsLow(CurrentConfig);
  // const poolConstants3 = getPoolConstantsMedium(CurrentConfig);
  // const poolConstants4 = getPoolConstantsHigh(CurrentConfig);
  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    CurrentConfig.tokens.in.address,
    CurrentConfig.tokens.out.address,
    Number(CurrentConfig.tokens.poolFee),
    fromReadableAmount(
      CurrentConfig.tokens.amountIn,
      CurrentConfig.tokens.in.decimals
    ).toString(),
    0
  );

  console.log(
    "PARAMS",
    CurrentConfig.tokens.in.address,
    CurrentConfig.tokens.out.address,
    poolConstants.fee,
    CurrentConfig.tokens.poolFee
  );
  // const quotedAmountOut1 =
  //   await quoterContract.callStatic.quoteExactInputSingle(
  //     poolConstants1.token0,
  //     poolConstants1.token1,
  //     poolConstants1.fee,
  //     fromReadableAmount(
  //       CurrentConfig.tokens.amountIn,
  //       CurrentConfig.tokens.in.decimals
  //     ).toString(),
  //     0
  //   );

  // const quotedAmountOut2 =
  //   await quoterContract.callStatic.quoteExactInputSingle(
  //     poolConstants2.token0,
  //     poolConstants2.token1,
  //     poolConstants2.fee,
  //     fromReadableAmount(
  //       CurrentConfig.tokens.amountIn,
  //       CurrentConfig.tokens.in.decimals
  //     ).toString(),
  //     0
  //   );

  // const quotedAmountOut3 =
  //   await quoterContract.callStatic.quoteExactInputSingle(
  //     poolConstants3.token0,
  //     poolConstants3.token1,
  //     poolConstants3.fee,
  //     fromReadableAmount(
  //       CurrentConfig.tokens.amountIn,
  //       CurrentConfig.tokens.in.decimals
  //     ).toString(),
  //     0
  //   );

  // const quotedAmountOut4 =
  //   await quoterContract.callStatic.quoteExactInputSingle(
  //     poolConstants4.token0,
  //     poolConstants4.token1,
  //     poolConstants4.fee,
  //     fromReadableAmount(
  //       CurrentConfig.tokens.amountIn,
  //       CurrentConfig.tokens.in.decimals
  //     ).toString(),
  //     0
  //   );

  // console.log(
  //   "QUOTE1",
  //   toReadableAmount(quotedAmountOut1, CurrentConfig.tokens.out.decimals)
  // );
  // console.log(
  //   "QUOTE2",
  //   toReadableAmount(quotedAmountOut2, CurrentConfig.tokens.out.decimals)
  // );
  // console.log(
  //   "QUOTE3",
  //   toReadableAmount(quotedAmountOut3, CurrentConfig.tokens.out.decimals)
  // );
  // console.log(
  //   "QUOTE4",
  //   toReadableAmount(quotedAmountOut4, CurrentConfig.tokens.out.decimals)
  // );

  return toReadableAmount(quotedAmountOut, CurrentConfig.tokens.out.decimals);
}

// export function getProvider() {
//   return new ethers.providers.JsonRpcProvider(CurrentConfig.rpc.mainnet);
// }

async function getPoolConstants(CurrentConfig) {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: CurrentConfig.tokens.in,
    tokenB: CurrentConfig.tokens.out,
    fee: CurrentConfig.tokens.poolFee,
  });

  const poolContract = await getEtherContract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi
  );
  // const provider = getEthersProvider({ chainId: 137 });
  // const poolContract = new ethers.Contract(
  //   currentPoolAddress,
  //   IUniswapV3PoolABI.abi,
  //   getProvider()
  // );
  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ]);
  console.log("POOL_CONSTANTS", token0, token1, fee);
  return {
    token0,
    token1,
    fee,
  };
}

async function getPoolConstantsLowest(CurrentConfig) {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: CurrentConfig.tokens.in,
    tokenB: CurrentConfig.tokens.out,
    fee: 100,
  });

  const poolContract = await getEtherContract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi
  );
  // const provider = getEthersProvider({ chainId: 137 });
  // const poolContract = new ethers.Contract(
  //   currentPoolAddress,
  //   IUniswapV3PoolABI.abi,
  //   getProvider()
  // );
  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ]);

  return {
    token0,
    token1,
    fee,
  };
}

async function getPoolConstantsLow(CurrentConfig) {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: CurrentConfig.tokens.in,
    tokenB: CurrentConfig.tokens.out,
    fee: 500,
  });

  const poolContract = await getEtherContract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi
  );
  // const provider = getEthersProvider({ chainId: 137 });
  // const poolContract = new ethers.Contract(
  //   currentPoolAddress,
  //   IUniswapV3PoolABI.abi,
  //   getProvider()
  // );
  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ]);

  return {
    token0,
    token1,
    fee,
  };
}

async function getPoolConstantsMedium(CurrentConfig) {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: CurrentConfig.tokens.in,
    tokenB: CurrentConfig.tokens.out,
    fee: 3000,
  });

  const poolContract = await getEtherContract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi
  );
  // const provider = getEthersProvider({ chainId: 137 });
  // const poolContract = new ethers.Contract(
  //   currentPoolAddress,
  //   IUniswapV3PoolABI.abi,
  //   getProvider()
  // );
  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ]);

  return {
    token0,
    token1,
    fee,
  };
}

async function getPoolConstantsHigh(CurrentConfig) {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: CurrentConfig.tokens.in,
    tokenB: CurrentConfig.tokens.out,
    fee: 10000,
  });

  const poolContract = await getEtherContract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi
  );
  // const provider = getEthersProvider({ chainId: 137 });
  // const poolContract = new ethers.Contract(
  //   currentPoolAddress,
  //   IUniswapV3PoolABI.abi,
  //   getProvider()
  // );
  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ]);

  return {
    token0,
    token1,
    fee,
  };
}

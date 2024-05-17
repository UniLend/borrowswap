import { ethers } from "ethers";
import { computePoolAddress } from "@uniswap/v3-sdk";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import {
  POOL_FACTORY_CONTRACT_ADDRESS,
  QUOTER_CONTRACT_ADDRESS,
  USDT_TOKEN,
  WETH_TOKEN,
  CURV_TOKEN,
} from "../../helpers/constants";

import {
  toReadableAmount,
  fromReadableAmount,
  fromBigNumber,
  fixed2Decimals,
} from "../../helpers";

import { Token } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";
import { getEtherContract, getEthersProvider } from "../contracts/ethers";

// Inputs that configure this example to run
export interface ExampleConfig {
  rpc: {
    local: string;
    mainnet: string;
  };
  tokens: {
    in: Token;
    amountIn: number;
    out: Token;
    poolFee: number;
  };
}

// Example Configuration

export const CurrentConfig: ExampleConfig = {
  rpc: {
    local: "http://localhost:8545",
    mainnet: "",
  },
  tokens: {
    in: WETH_TOKEN,
    amountIn: 1,
    out: USDT_TOKEN,
    poolFee: FeeAmount.MEDIUM,
  },
};

export async function quote(amountIn: number) {
  const quoterContract = await getEtherContract(
    QUOTER_CONTRACT_ADDRESS,
    Quoter.abi
  );

  const poolConstants = await getPoolConstants();

  //   const quotedAmountOut = await quoterContract?.callStatic.quoteExactInputSingle(
  //     poolConstants.token0,
  //     poolConstants.token1,
  //     poolConstants.fee,
  //     fromReadableAmount(
  //       amountIn,
  //       CurrentConfig.tokens.in.decimals
  //     ).toString(),
  //     0
  //   )
  //   console.log("quoterContract", quoterContract, fromBigNumber(quotedAmountOut),   fromReadableAmount(
  //     amountIn,
  //     CurrentConfig.tokens.in.decimals
  //   ).toString());
  //   return fixed2Decimals(quotedAmountOut, CurrentConfig.tokens.out.decimals).toString()
}

async function getPoolConstants() {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: CurrentConfig.tokens.in,
    tokenB: CurrentConfig.tokens.out,
    fee: CurrentConfig.tokens.poolFee,
  });

  // console.log("currentPoolAddress ", currentPoolAddress, {
  //   factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
  //   tokenA: CurrentConfig.tokens.in,
  //   tokenB: CurrentConfig.tokens.out,
  //   fee: CurrentConfig.tokens.poolFee,
  // });

  //   const poolContract = await getEtherContract(
  //     currentPoolAddress,
  //     IUniswapV3PoolABI.abi
  //   )

  // //   const token0 = await poolContract?.token0()
  //   const [token0, token1, fee] = await Promise.all([
  //     poolContract?.token0(),
  //     poolContract?.token1(),
  //     poolContract?.fee(),
  //   ])
  //   console.log("poolContract", poolContract, token0, token1, fee);
  //   return {
  //     token0,
  //     token1,
  //     fee,
  //   }
}

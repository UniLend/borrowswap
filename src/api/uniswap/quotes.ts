import { ethers, providers } from "ethers";
import { Token } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
// import { computePoolAddress } from "@uniswap/v3-sdk";
// import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { getEtherContract, getEthersProvider } from "../contracts/ethers";
import { supportedNetworks } from "../networks/networks";
import {
  decimal2Fixed,
  fixed2Decimals,
  fromBigNumber,
  fromReadableAmount,
  toReadableAmount,
} from "../../helpers";

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

export async function quoteWithSdk(tokenIn: any, tokenOut: any) {
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
  const WETH = supportedNetworks[tokenIn.chainId]?.weth;
  const isWeth = WETH === tokenIn.address || WETH === tokenOut.address;

  try {
    const quoterContract = await getEtherContract(
      supportedNetworks[tokenIn.chainId]?.quoterContractAddress,
      Quoter.abi
    );
    const FEE_TIERS = [500, 3000, 10000];

    if (isWeth) {
      const res = await Promise.any(
        FEE_TIERS.map((fee) =>
          quoteWithFee(
            CurrentConfig.tokens.in.address,
            CurrentConfig.tokens.out.address,
            fee,
            fromReadableAmount(
              CurrentConfig.tokens.amountIn,
              CurrentConfig.tokens.in.decimals
            ).toString(),
            quoterContract
          )
        )
      ).catch((err) => {
        console.error("Quote Error: ", err);
      });

      const quote = res.quote;
      const fee = res.fee;

      return {
        quoteValue: toReadableAmount(quote, CurrentConfig.tokens.out.decimals),
        quoteFee: fee,
        quotePath: [fee],
      };
    } else {
      let res1: any = await Promise.allSettled(
        FEE_TIERS.map((fee) =>
          quoteWithFee(
            CurrentConfig.tokens.in.address,
            WETH,
            fee,
            fromReadableAmount(
              CurrentConfig.tokens.amountIn,
              CurrentConfig.tokens.in.decimals
            ).toString(),
            quoterContract
          )
        )
      ).catch((err) => {
        console.error("Quote1 Error: ", err);
      });

      res1 = res1
        .map((res: any, i: any) => ({ ...res, fee: FEE_TIERS[i] }))
        .filter((res: any) => res.status == "fulfilled")
        .map((res: any) => ({
          fee: res.fee,
          quote: fromBigNumber(res.value),
        }));

      let quote1 = fromBigNumber(res1[0].quote).toString();
      let fee1 = res1[0].fee;

      for (const res of res1) {
        const currentquote = fromBigNumber(res.quote).toString();

        if (Number(quote1) < Number(currentquote)) {
          quote1 = currentquote;
          fee1 = res.fee;
        }
      }

      let res2: any = await Promise.allSettled(
        FEE_TIERS.map((fee) =>
          quoteWithFee(
            WETH,
            CurrentConfig.tokens.out.address,
            fee,
            quote1,
            quoterContract
          )
        )
      );

      res2 = res2
        .map((res: any, i: any) => ({ ...res, fee: FEE_TIERS[i] }))
        .filter((res: any) => res.status == "fulfilled")
        .map((res: any) => ({
          fee: res.fee,
          quote: fromBigNumber(res.value),
        }));

      let quote2 = fromBigNumber(res2[0].quote).toString();
      let fee2 = res2[0].fee;

      for (const res of res2) {
        const currentquote = fromBigNumber(res.quote).toString();

        if (Number(quote2) < Number(currentquote)) {
          quote2 = currentquote;
          fee2 = res.fee;
        }
      }

      return {
        quoteValue: fixed2Decimals(quote2, CurrentConfig.tokens.out.decimals),
        quoteFee: fee1 + fee2,
        quotePath: [fee1, fee2],
      };
    }
  } catch (error) {
    console.error("SDK_ERROR", error);
  }
}

function quoteWithFee(
  tokenIn: string,
  tokenOut: string,
  fee: number,
  amountIn: string,
  quoterContract: any
) {
  return quoterContract.callStatic.quoteExactInputSingle(
    tokenIn,
    tokenOut,
    fee,
    amountIn,
    0
  );
  // .then((quote: any) => ({ quote, fee }));
  // .catch((err: any) => {
  //   console.log("Quote Call", err, fee);

  // });
}

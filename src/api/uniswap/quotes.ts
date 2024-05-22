import { ethers, providers } from "ethers";
import { Token } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
// import { computePoolAddress } from "@uniswap/v3-sdk";
// import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { getEtherContract, getEthersProvider } from "../contracts/ethers";
import { supportedNetworks } from "../networks/networks";

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

export async function quoteWithSdk(tokenIn: any, tokenOut: any, chainId: any) {
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
      const quoteCalls1 = FEE_TIERS.map((fee) =>
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
      );

      const res = await Promise.any(quoteCalls1).catch((err) => {
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
      const quoteCalls1 = FEE_TIERS.map((fee) =>
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
      );

      const res1 = await Promise.any(quoteCalls1).catch((err) => {
        console.error("Quote1 Error: ", err);
      });
      const quote1 = res1.quote;
      const fee1 = res1.fee;

      const quoteCalls2 = FEE_TIERS.map((fee) =>
        quoteWithFee(
          WETH,
          CurrentConfig.tokens.out.address,
          fee,
          ethers.utils.formatUnits(quote1, 0).toString(),
          quoterContract
        )
      );

      const res2 = await Promise.any(quoteCalls2).catch((err) => {
        console.error("Quote2 Error: ", err);
      });
      const quote2 = res2?.quote;
      const fee2 = res2.fee;

      return {
        quoteValue: toReadableAmount(quote2, CurrentConfig.tokens.out.decimals),
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
  return quoterContract.callStatic
    .quoteExactInputSingle(tokenIn, tokenOut, fee, amountIn, 0)
    .then((quote: any) => ({ quote, fee }))
    .catch((err: any) => {
      console.log("Quote Call", err);
      return Promise.reject(err);
    });
}

const READABLE_FORM_LEN = 8;
function fromReadableAmount(amount: number, decimals: number) {
  return ethers.utils.parseUnits(amount.toString(), decimals);
}

function toReadableAmount(rawAmount: number, decimals: number) {
  return ethers.utils
    .formatUnits(rawAmount, decimals)
    .slice(0, READABLE_FORM_LEN);
}

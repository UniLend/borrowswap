import { Token, Percent } from "@uniswap/sdk-core";
//WETH, FeeAmount,
import { computePoolAddress } from "@uniswap/v3-sdk";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import { ethers } from "ethers";

import {
  POOL_FACTORY_CONTRACT_ADDRESS,
  QUOTER_CONTRACT_ADDRESS,
  USDT_TOKEN,
  WETH_TOKEN,
  CURV_TOKEN,
} from "../../helpers/constants";
import { getEtherContract, getEthersProvider } from "../contracts/ethers";

export async function checkQuote(
  amountIn,
  tokenIn = WETH_TOKEN,
  tokenOut = USDT_TOKEN
) {
  try {
    // Create an Ethereum provider (replace with your provider setup)
    // const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    // const provider = getEthersProvider({ 137 });

    // // Create a contract instance for the Quoter
    // const quoterContract = new ethers.Contract(
    //   QUOTER_CONTRACT_ADDRESS,
    //   Quoter.abi,
    //   provider
    // );

    const quoterContract = await getEtherContract(
      QUOTER_CONTRACT_ADDRESS,
      Quoter.abi
    );

    // Compute the pool address based on token pair and fee
    const poolAddress = computePoolAddress({
      factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
      tokenA: tokenIn,
      tokenB: tokenOut,
      fee: 3000,
    });
    console.log("POOL_ADDRESS", poolAddress);
    // // Create a WETH contract instance (assuming WETH is involved)
    // const wethContract = tokenIn.equals(WETH_TOKEN)
    //   ? new ethers.Contract(WETH_ADDRESS, WETH.abi, provider)
    //   : undefined;

    // // Convert amountIn to Wei (if WETH is involved)
    // const amountInWei = wethContract
    //   ? await wethContract.getQuoteCallData(amountIn)
    //   : ethers.utils.parseUnits(amountIn.toString(), tokenIn.decimals);

    // Convert amountIn to Wei (assuming tokenIn has decimals)
    const amountInWei = ethers.utils.parseUnits(
      amountIn.toString(),
      tokenIn.decimals
    );

    const slippageTolerance = new Percent(50, 100); // for 0.5%

    // Get the quote for exact input (amountIn)
    const quotedAmountOut =
      await quoterContract?.callStatic.quoteExactInputSingle(
        tokenIn.address,
        tokenOut.address,
        3000,
        amountInWei.toString(),
        0 // Slippage tolerance (adjust as needed)
      );

    console.log("CHECK_quotedAmountOut", quotedAmountOut);

    // Convert quoted amount to a readable format
    const amountOutReadable = fixed2Decimals(
      quotedAmountOut,
      tokenOut.decimals
    ).toString();
    console.log("CHECK_amountOutReadable", amountOutReadable);
    return amountOutReadable;
  } catch (error) {
    console.error("Error fetching quote:", error);
    throw error; // Re-throw for handling at the caller's level (optional)
  }
}

// // Helper function for fixed-point decimal formatting (optional)
function fixed2Decimals(amount, decimals) {
  return parseFloat(ethers.utils.formatUnits(amount, decimals)).toFixed(2);
}

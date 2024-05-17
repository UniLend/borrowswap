import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import { ethers } from "ethers";
import { getEtherContract, getEthersProvider } from "../contracts/ethers";

const WETH_ADD = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
const USDC_ADD = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
const USDT_ADD = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

// const WETH_ADD = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
// const USDC_ADD = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
// const USDT_ADD = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

// mainNet = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
// polygon = "0x7b2d9632A44cB0553BbCfCf89BdBc847Ab1f74d4"
export const QUOTER_CONTRACT_ADDRESS =
  "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

const tokenIn = USDC_ADD;
const tokenOut = USDT_ADD;
const fee = 3000;
const amountIn = "1000000";
const sqrtPriceLimitx96 = 0;

const READABLE_FORM_LEN = 4;
function toReadableAmount(rawAmount, decimals) {
  return ethers.utils
    .formatUnits(rawAmount, decimals)
    .slice(0, READABLE_FORM_LEN);
}

export async function quoteWithSdk2() {
  // const provider = getEthersProvider({ chainId: 137 });

  // const quoterContract = new ethers.Contract(
  //   QUOTER_CONTRACT_ADDRESS,
  //   Quoter.abi,
  //   provider
  // );

  const quoterContract = await getEtherContract(
    QUOTER_CONTRACT_ADDRESS,
    Quoter.abi
  );

  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    tokenIn,
    tokenOut,
    fee,
    amountIn,
    sqrtPriceLimitx96
  );

  return toReadableAmount(quotedAmountOut, CurrentConfig.tokens.out.decimals);
}

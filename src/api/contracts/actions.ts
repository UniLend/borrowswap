import { borrowswapABI, erc20Abi, helperAbi } from "./abi";
import { readContracts, writeContract } from "wagmi/actions";
import { getEtherContract } from "./ethers";
import { decimal2Fixed, fixed2Decimals, fromBigNumber } from "../../helpers";
import { readContract } from '@wagmi/core'
import { wagmiConfig } from "../../main";

export const contracts = {};

export const handleApproval = async (
  tokenAddress: string,
  user: `0x${string}` | undefined,
  amount: string
) => {
  var maxAllow =
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";
  const instance = await getEtherContract(tokenAddress, erc20Abi);

  const Amount =
    tokenAddress == "0x172370d5cd63279efa6d502dab29171933a610af"
      ? maxAllow
      : (Number(amount) * 10 ** 18).toString();

  const { hash } = await instance.approve(
    "0xD31F2869Fd5e4422c128064b2EaDa33C6390bf6E",
    Amount
  );

  return hash;
};


export const handleSwap = async (amount: any) => {
  const instance = await getEtherContract('0xD31F2869Fd5e4422c128064b2EaDa33C6390bf6E', borrowswapABI);

  const borrowAmount =   ((Number(decimal2Fixed(amount)) *2.6) *0.35 ).toString();

console.log(  amount , fixed2Decimals(borrowAmount),
decimal2Fixed(amount),
 borrowAmount );

  const {hash} = instance.InitBorrow(
    '0x784c4a12f82204e5fb713b055de5e8008d5916b6',
    '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a',
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    '0x172370d5cd63279efa6d502dab29171933a610af',
    decimal2Fixed(amount),
    borrowAmount
  )
  console.log(hash);
  
  return hash
}

export const getAllowance = async (
  address: string,
  user: `0x${string}` | undefined
) => {
  const instance = await getEtherContract(address, erc20Abi);

  const allowance = await instance.allowance(
    user,
    "0xD31F2869Fd5e4422c128064b2EaDa33C6390bf6E"
  );

  return fromBigNumber(allowance);
};


export const getPoolData = (poolAddress: string) => {

}


export const getPoolBasicData = async (
  helperContract: any,
  poolAddress: string,
  poolData: any,
  poolTokens: any,
) => {
  let pool;
  if (helperContract) {
    try {
      const instance = getEtherContract(helperContract, helperAbi )

      
      // const data = await instance.getPoolData(poolAddress);
      // pool = {
      //   ...poolData,
      //   _address: poolAddress,
      //   ltv: Number(Number(fromBigNumber(data.ltv)) - 0.01),
      //   lb: fromBigNumber(data.lb),
      //   rf: fromBigNumber(data.rf),
      //   token0: {
      //     _symbol: data._symbol0,
      //     _address: data._token0,
      //     _decimals: fromBigNumber(data._decimals0),
      //     liquidity: fromBigNumber(data._token0Liquidity),
      //     liquidityFixed: fixed2Decimals(
      //       data._token0Liquidity,
      //       data._decimals0,
      //     ),
      //     ...poolTokens.token0,
      //   },
      //   token1: {
      //     _symbol: data._symbol1,
      //     _address: data._token1,
      //     _decimals: fromBigNumber(data._decimals1),
      //     liquidity: fromBigNumber(data._token1Liquidity),
      //     liquidityFixed: fixed2Decimals(
      //       data._token1Liquidity,
      //       data._decimals1,
      //     ),
      //     ...poolTokens.token1,
      //   },
      // };
      return pool;
    } catch (error) {
      // console.error(error);
      throw error;
    }
  }
};
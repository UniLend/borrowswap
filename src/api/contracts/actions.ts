import { borrowswapABI, erc20Abi } from "./abi";
import { writeContract } from "wagmi/actions";
import { getEtherContract } from "./ethers";
import { decimal2Fixed, fixed2Decimals, fromBigNumber } from "../../helpers";

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

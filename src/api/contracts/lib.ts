import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
  getBlockNumber,
  getChainId,
} from "wagmi/actions";
import { wagmiConfig } from "../../main";

export const readContractLib = async (
  address: any,
  abi: any,
  functionName: string,
  args: Array<any>
) => {
  const result = await readContract(wagmiConfig, {
    abi,
    address: address,
    functionName: functionName,
    args: args,
  });
  return result;
};

export const writeContracts = async (
  address: any,
  abi: any,
  functionName: string,
  args: Array<any>
) => {
  const result = await writeContract(wagmiConfig, {
    abi,
    address: address,
    functionName: functionName,
    args: args,
  });
  return result;
};

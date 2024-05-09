import { readContract, writeContract } from "wagmi/actions";

export const readContractLib = async (props: any) => {
  const data = await readContract(props);
  return data;
};

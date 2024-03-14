// local imports
import {
  fromWei,
  removeFromSessionStorage,
  saveToSessionStorage,
} from "../utils";
import { networks } from "../../api/networks/networks";

import { useBalance } from "wagmi";

import useWalletHook from "../../api/hooks/useWallet";

export const connectWallet = async (wallet, ChangedAccount = null) => {
  console.log("click on connect button");
  try {
    const { address, isConnecting, isDisconnected, isConnected, chain } = useWalletHook();

    const { data: default_ } = useBalance({ address });
    const { data: account_ } = useBalance({ address });
    const obj = account_;
    let balance = "0";
    let symbol = "";
    if (obj && obj.value !== undefined && obj.symbol !== undefined) {
      balance = obj.value.toString(); // Convert BigInt to string
      symbol = obj.symbol;
      console.log("bal", obj.value);
      console.log("symbol", obj.symbol);
    } else {
      console.log("Object or value is undefined");
    }

    const userData = {
      address: address,
      balance: balance,
      symbol: symbol,
      network: { id: chain.id, name: chain.name },
      isConnected: isConnected,
    };
    console.log("userData", userData);
    saveToSessionStorage("user", userData);
    return userData;
  } catch (error) {
    throw error;
  }
};

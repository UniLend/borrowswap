// local imports
import {
  fromWei,
  removeFromSessionStorage,
  saveToSessionStorage,
} from '../utils';
import { networks } from '../../api/networks/networks';
import {
  getAccountLib,
  getNetworkLib,
  fetchBalanceLib,
  disconnectLib,
} from '../../api/lib/functions';

import {
  BaseError,
  useAccount,
  useAccountEffect,
  useBalance,
  useBlockNumber,
  useChainId,
  useConnect,
  useConnections,
  useConnectorClient,
  useDisconnect,
  useEnsName,
  useReadContract,
  useReadContracts,
  useSendTransaction,
  useSignMessage,
  useSwitchAccount,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

export const handleDisconnect = async () => {
  console.log("click on disconnect")
  await disconnectLib();
  removeFromSessionStorage('user');
  localStorage.clear();
  localStorage.removeItem('walletconnect');
  window.location.reload();
};

import useWalletHook from "../../api/hooks/useWallet"

export const connectWallet = async (wallet, ChangedAccount = null) => {
  console.log("click on connect button")
  try {
    const { address, isConnecting, isDisconnected, isConnected, chain } = useWalletHook();
    // const user = getAccountLib();
    // const { chain, chains } = getNetworkLib();
    // const chainId = chain.id;
    // const account = ChangedAccount || user.address;
    // const bal = await fetchBalanceLib({
    //   address: account,
    // });
    // // const balance = fromWei(web3, bal).slice(0, 6);
    // const networkByWeb3 = chain.name.toUpperCase();
    // const Currentnetwork = networks[chainId]
    //   ? networks[chainId].chainName
    //   : networkByWeb3;
    const { data: default_ } = useBalance({ address });
    const { data: account_ } = useBalance({ address });
    const obj = account_;
    let balance = '0';
    let symbol = '';
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
    console.log('userData',userData);
    saveToSessionStorage('user', userData);
    return userData;
  } catch (error) {
    throw error;
  }

};

// export const changeNetwork = async (networkId) => {
//   const provider = getEthersProvider();
//   try {
//     if (!provider) throw new Error("No Crypto Wallet Found");
//     const account = await provider.request({
//       method: "wallet_switchEthereumChain",
//       params: [
//         {
//           chainId: `0x${networkId.toString(16)}`,
//         },
//       ],
//     });
//     return account;
//   } catch (error) {
//     // This error code indicates that the chain has not been added to MetaMask.
//     if (error.code === 4902) {
//       try {
//         await provider.request({
//           method: "wallet_addEthereumChain",
//           params: [
//             {
//               ...networks[networkId],
//             },
//           ],
//         });
//         return true;
//       } catch (err) {

//         return false;
//       }
//     }
//   }
// };

// use in connect functions and dispatched on every event or can be used in useEffect;

import {
  // getContract,
  getAccount,
  // getNetwork,
  disconnect,
  getBalance,
  getWalletClient,
  getPublicClient,
  readContract,
  fetchToken,
  switchChain,
  waitForTransaction,
  fetchBlockNumber,
} from 'wagmi/actions';
// import { getEthersProvider } from "./wagmi";

export const getNetworkLib = (props) => {
  const network = getNetwork(props);
  return network;
};
export const fetchBalanceLib = async (props) => {
  const bal = await getBalance(props);
  return bal;
};

export const getAccountLib = (props) => {
  const account = getAccount(props);
  return account;
};

export const disconnectLib = async (props) => {
  try {
    disconnect(props);
  } catch (err) {
    throw err;
  }
};

export const getContractLib = async ({ address, abi }) => {
  const walletClient = await getWalletClient();
  const publicClient = getPublicClient();

  const contract = getContract({
    address: address || '',
    abi: abi,
    walletClient: walletClient,
    publicClient: publicClient,
  });

  return contract;
};

export const getPastEvents = async (contractInstance, event) => {
  // const contractInstance =  await getEtherContract(address, abi)

  try {
    const events = await contractInstance.queryFilter(event);

    return events;
  } catch (error) {
    throw error;
  }
};

export const readContractLib = async (props) => {
  const data = await readContract(props);
  return data;
};

export const fetchTokenLib = async (props) => {
  const token = await fetchToken(props);
  return token;
};

export const switchNetworkLib = async (props) => {
  try {
    const data = await switchChain(props);
    return data;
  } catch (error) {
    throw error;
  }
};

export const waitForTransactionLib = async (props) => {
  const txHash = await waitForTransaction(props);
  return txHash;
};

export const waitForBlockConfirmation = async (hash) => {
  try {
    return await Promise.all([
      waitForTransactionLib({
        hash: hash,
        confirmations: 2,
      }),
      fetchBlockNumber(),
    ]);
  } catch (error) {
    console.log(error);
  }
};

// import { getEthersProvider } from "../lib/fun/wagmi";
// import { tokensBYSymbol, tokensByAddress } from "./constants";
import { ethers } from "ethers";
// import { Avatar } from "antd";
// import { aggregatorV3InterfaceABI, priceABI } from "../core/contractData/abi";
// import {readContracts} from "../lib/fun/wagmi"
// import { contractAddress } from "../core/contractData/contracts";



export const fromWei = (web3, val) => {
  const result = web3.utils.fromWei(val, 'ether');
  return result;
};



export const shortenAddress = (address) =>
  address && `${address.slice(0, 5)}....${address.slice(address.length - 4)}`;

export const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getFromLocalStorage = (key) => {
  return JSON.parse(localStorage.getItem(key));
};

export const removeFromLocalStorage = (key) => {
  localStorage.removeItem(key);
};

export const saveToSessionStorage = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const getFromSessionStorage = (key) => {
  return JSON.parse(sessionStorage.getItem(key));
};

export const removeFromSessionStorage = (key) => {
  sessionStorage.removeItem(key);
};
//'https://assets.coingecko.com/coins/images/12591/large/binance-coin-logo.png'
export function imgError(source) {
  source.target.src =
    'https://e7.pngegg.com/pngimages/407/710/png-clipart-ethereum-cryptocurrency-bitcoin-cash-smart-contract-bitcoin-blue-angle-thumbnail.png';
  source.onerror = null;
  return true;
}

export function fixFormatNumber(number) {
  // Convert the number to a string representation with three decimals
  const numberString = Number(number).toFixed(3);

  // Check if the string representation contains any non-zero digits after the decimal point
  const hasNonZeroDigits = /\.\d*[1-9]/.test(numberString);

  // Return the formatted number with 6 decimals if true, otherwise with 3 decimals
  return hasNonZeroDigits
    ? Number(number).toFixed(3)
    : Number(number).toFixed(6);
}

export const fetchEthRateForAddresses = async (addresses, chainId) => {
  const assetAddresses = addresses.map(item => item.asset);
  const provider = getEthersProvider(chainId);
  try {
    const tokensObject = await Promise.all(
      addresses?.map(async (addr) => {
        const priceFeed = new ethers.Contract(
          addr.source,
          aggregatorV3InterfaceABI,
          provider,
        );

        try {
          const roundData = await priceFeed.latestRoundData();
          // return ETH price of each token
          return {
            [addr.id]: roundData.answer.toString(),
          };
        } catch (error) {
          console.error(
            `Error fetching round data for address ${addr}: ${error.message}`,
          );
          return null;
        }
      }),
    );

    // Use reduce to filter out null results and create the final object
    return tokensObject.reduce(
      (acc, obj) => (obj ? { ...acc, ...obj } : acc),
      {},
    );
  } catch (error) {
    console.error('Error fetching round data:', error.message);
    throw error;
  }
};



export const fetchUserBalance = async (addresses, chainId, address) => {
  const user_address = [address];
  const assetAddresses = addresses.map(item => item.asset);
  const { aavePriceContract } = contractAddress[chainId];
  let balance = {};
  
  try {
    const balances = await readContracts(aavePriceContract, priceABI, "batchBalanceOf", [
      user_address,
      assetAddresses
    ]);
    balance = Object.fromEntries(assetAddresses.map((address, index) => [address, Number(balances[index])]));

  } catch (error) {
    console.error('Error:', error);
  }
  
  return balance;
};


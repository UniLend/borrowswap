import { abiEncode } from "./../../helpers/index";
import axios from "axios";
import { ethers } from "ethers";
import { aggregatorV3InterfaceABI } from "../contracts/abi";
import { getEthersProvider } from "../contracts/ethers";
import { fixed2Decimals } from "../../helpers/index";
export const fetchGraphQlData = async (chainId: number, FILMS_QUERY: any) => {
  const graphURL: any = {
    80001: "https://api.thegraph.com/subgraphs/name/shubham-rathod1/my_unilend",
    // 137: 'https://api.thegraph.com/subgraphs/name/shubham-rathod1/unilend-polygon',
    137: "https://api.studio.thegraph.com/query/78424/unilend-polygon/version/latest",
    // 137: "https://api.thegraph.com/subgraphs/name/shubham-rathod1/unilend-polygon-2",
    1442: "https://api.thegraph.com/subgraphs/name/shubham-rathod1/unilend-zkevm",
    // 1: 'https://api.thegraph.com/subgraphs/name/shubham-rathod1/mainnet-1',
    // 1: 'https://api.studio.thegraph.com/query/78424/mainnet-1/version/latest',
    1: "https://gateway-arbitrum.network.thegraph.com/api/e0902970e4a444dc4b0ae6c08b7ff802/subgraphs/id/FGE3FvB4dzGN2yFgUpVCSCYDwBCn74XLSwgs7mkajAhW",
    // 42161:'https://api.thegraph.com/subgraphs/name/shubham-rathod1/unilend-arbritrum',
    42161:
      "https://api.studio.thegraph.com/query/78424/unilend-arbritrum/version/latest",
  };

  const fallbackURL: any = {
    1: "https://api.studio.thegraph.com/query/78424/mainnet-1/version/latest",
  };

  const fetchData = async (url: string) => {
    try {
      const response = await axios.post(url, { query: FILMS_QUERY });
      return response.data.data;
    } catch (error) {
      console.error(`Request to ${url} failed`, error);
      return undefined;
    }
  };

  if (!Object.keys(graphURL).includes(String(chainId))) {
    throw new Error("Invalid chainId provided");
  }

  const primaryURL = graphURL[chainId] || 1;
  const data = await fetchData(primaryURL);

  if (data === undefined) {
    const fallbackURLLink: any = fallbackURL[chainId] || 1;
    const fallbackData = await fetchData(fallbackURLLink);
    if (fallbackData === undefined) {
      throw new Error(
        "Failed to fetch data from both primary and fallback URLs"
      );
    }
    return fallbackData;
  }

  return data;
};

export const getEthToUsd = async () => {
  const url = "https://api.coinbase.com/v2/exchange-rates?currency=ETH";

  try {
    const response = await axios.get(url);
    return response.data.data.rates.USD;
  } catch (error) {
    console.error(`Failed to retrieve USD data.`);
  }
};

export const fetchEthRateForAddresses = async (
  addresses: Array<any>,
  chainId?: any
) => {
  const provider = getEthersProvider();
  try {
    const tokensObject = await Promise.all(
      addresses?.map(async (addr: any, i: any) => {
        const priceFeed = new ethers.Contract(
          addr.source,
          aggregatorV3InterfaceABI,
          provider
        );

        try {
          const roundData = await priceFeed.latestRoundData();
          // return ETH price of each token
          return {
            [addr?.id ?? i]: roundData.answer.toString(),
          };
        } catch (error) {
          console.error(`Error fetching round data for address ${addr}: `);
          return null;
        }
      })
    );

    // Use reduce to filter out null results and create the final object
    return tokensObject.reduce(
      (acc, obj) => (obj ? { ...acc, ...obj } : acc),
      {}
    );
  } catch (error) {
    console.error("Error fetching round data:");
    throw error;
  }
};

export const getTokenPrice = async (data: any, chain: any) => {
  const usdPrice = await getEthToUsd();
  console.log("getTokenPrice", data?.assetOracles);

  const temp: any = await fetchEthRateForAddresses(
    data?.assetOracles,
    chain?.id
  );
  type tplotOptions = {
    [key: string]: any;
  };
  const result: tplotOptions = {};

  for (const key in temp) {
    if (temp.hasOwnProperty(key)) {
      result[key] = (temp[key] / 10 ** 18) * usdPrice;
      // if (supportedNetworks[chain?.id]?.baseCurrency === 'USD') {
      //   result[key] = temp[key] / 10 ** 8;
      // } else {
      //   result[key] = (temp[key] / 10 ** 18) * usdPrice;
      //   result['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'] = usdPrice;
      // }
    }
  }

  return result;
};

const CancelToken = axios.CancelToken;
let cancelPreviousRequest: any;

const findQuoteAmount = (
  quote: any
): {
  quoteValue: string;
  quoteDecimals: number;
  totalFee: number;
  decode: any;
} => {
  let quoteValue = quote.quoteGasAndPortionAdjusted;
  let quoteDecimals = quote.quoteGasAndPortionAdjustedDecimals;
  let totalFee = 0;

  const route = quote?.route?.[quote?.route?.length - 1];
  const decode = [];
  if (route?.length > 0) {
    totalFee = route.reduce((acc: any, pool: any) => {
      const fee = Number(pool.fee);
      acc += fee;
      return acc;
    }, 0);

    // const { amountOut, tokenOut: { decimals } } = route[route.length - 1];
    // if (amountOut && decimals) {
    //   const scaledAmountOut = fixed2Decimals(amountOut, Number(decimals));
    //   quoteValue = amountOut.toString();
    //   quoteDecimals = scaledAmountOut;
    // }

    for (const path of route) {
      decode.push(path.fee);
    }
  }

  console.log("decode", decode);

  return { quoteValue, quoteDecimals, totalFee, decode };
};

export const getQuote = async (
  amountIn: string,
  user: any,
  tokenIn: any,
  tokenOut: any,
  chainId = 1
) => {
  // Cancel the previous request if it exists
  // if (cancelPreviousRequest) {
  //   cancelPreviousRequest();
  // }

  console.log("QuoteData", { amountIn, user, tokenIn, tokenOut, chainId });
  try {
    const response = await axios({
      method: "post",
      url: "https://interface.gateway.uniswap.org/v2/quote",
      data: {
        amount: amountIn,
        configs: [
          {
            recipient: user,
            routingType: "DUTCH_LIMIT",
            swapper: user,
            useSyntheticQuotes: false,
          },
          {
            enableFeeOnTransferFeeFetching: true,
            protocols: ["V3"],
            enableUniversalRouter: true,
            recipient: user,
            routingType: "CLASSIC",
          },
        ],
        intent: "quote",
        sendPortionEnabled: true,
        tokenIn: tokenIn,
        tokenInChainId: chainId,
        tokenOut: tokenOut,
        tokenOutChainId: chainId,
        type: "EXACT_INPUT",
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
      },
      cancelToken: new CancelToken(function executor(c) {
        cancelPreviousRequest = c;
      }),
    });
    console.log("QUOTE_API_DATA", response.data.quote);
    const { quoteValue, quoteDecimals, totalFee, decode } = findQuoteAmount(
      response.data.quote
    );
    return {
      quoteDecimals: quoteDecimals,
      quote: quoteValue,
      slippage: response.data.quote.slippage,
      fee: totalFee,
      path: decode,
    };
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Previous request cancelled", error);
    } else {
      console.log("quote", { error });
      throw error;
    }
  }
};

export const uniswapTokensData = async (chainId: number = 1) => {
  const graphURL: Record<number, string> = {
    1: "https://tokens.coingecko.com/uniswap/all.json",
    137: "https://tokens.coingecko.com/polygon-pos/all.json",
    56: "https://tokens.coingecko.com/binance-smart-chain/all.json",
    1285: "https://tokens.coingecko.com/moonriver/all.json",
    17970: "https://tokens.coingecko.com/polygon-pos/all.json",
  };

  const url = graphURL[chainId]; // Default to chainId 1 if not found

  try {
    const response = await axios.get(url);
    return response.data.tokens;
  } catch (error) {
    console.error("Error fetching tokens data:", error);
    return null;
  }
};

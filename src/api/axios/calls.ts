import { abiEncode } from "./../../helpers/index";
import axios from "axios";
import { ethers } from "ethers";
import { aggregatorV3InterfaceABI } from "../contracts/abi";
import { getEthersProvider } from "../contracts/ethers";
import { fixed2Decimals } from "../../helpers/index";
export const fetchGraphQlData = async (chainId: number, FILMS_QUERY: any) => {
  const graphURL = {
    80001: "https://api.thegraph.com/subgraphs/name/shubham-rathod1/my_unilend",
    137: "https://api.studio.thegraph.com/query/78424/unilend-polygon/version/latest",
    // 137: "https://api.thegraph.com/subgraphs/name/shubham-rathod1/unilend-polygon-2",
    1442: "https://api.thegraph.com/subgraphs/name/shubham-rathod1/unilend-zkevm",
    1: "https://api.thegraph.com/subgraphs/name/shubham-rathod1/mainnet-1",
    42161:
      "https://api.thegraph.com/subgraphs/name/shubham-rathod1/unilend-arbritrum",
    18401:
      "https://api.studio.thegraph.com/query/78424/unilend-polygon/version/latest",
  };

  if (Object.keys(graphURL).includes(String(chainId))) {
    try {
      const data = await axios({
        url: graphURL[(chainId as keyof typeof graphURL) || 1],
        method: "POST",
        data: {
          query: FILMS_QUERY,
        },
      });

      return data.data.data;
    } catch (err) {
      console.log("Graph Error:", err);
    }
  }
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
    18401: "https://tokens.coingecko.com/polygon-pos/all.json",
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

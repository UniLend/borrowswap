import { ethers, BigNumber as bigNumber } from "ethers";
import BigNumber from "bignumber.js";
import { getTokenPrice } from "../api/axios/calls";
import { store } from "../states/store";
import { setPools, setTokens } from "../states/unilendV2Reducer";
import { getTokenSymbol } from "../utils";

const READABLE_FORM_LEN = 4;

export function fromReadableAmount(
  amount: number,
  decimals: number
): bigNumber {
  return ethers.utils.parseUnits(amount.toString(), decimals);
}

export function toReadableAmount(rawAmount: number, decimals: number): string {
  return ethers.utils
    .formatUnits(rawAmount, decimals)
    .slice(0, READABLE_FORM_LEN);
}

export function fromBigNumber(bignumber: any) {
  return ethers.BigNumber.from(bignumber).toString();
}

export function decimal2Fixed(amount: any, decimals = 18) {
  let newNum = (Number(amount) * 10 ** decimals).toFixed();

  if (newNum.indexOf(".") > -1) {
    newNum = newNum.split(".")[0];
  }

  return newNum.toString();
}

export function fixed2Decimals(amount: any, decimals = 18) {
  const amt = amount?._hex ? amount?._hex : amount;
  const dec = fromBigNumber(decimals);

  return Number(amt) / 10 ** Number(decimals);
}

export function truncateToDecimals(number: number, decimal: number) {
  const powerOf10 = Math.pow(10, decimal);
  const truncatedNumber = Math.floor(number * powerOf10) / powerOf10;
  return truncatedNumber;
}

export const checkOpenPosition = (position: any) => {
  if (
    (Number(position.lendBalance0) > 0 || Number(position.lendBalance1)) > 0
  ) {
    return true;
  }
  return false;
};

export const loadPoolsWithGraph = async (data: any, chain: any) => {
  if (data) {



    const allPositions = data?.positions;
    const poolData: any = {};
    const tokenList: any = {};
    const poolsData = Array.isArray(data.pools) && data.pools;
    const tokenPrice = await getTokenPrice(data, chain);
   

    for (const pool of poolsData) {
      const openPosiions = allPositions.filter(
        (el: any) => el?.pool?.pool == pool.pool
      );
      const poolInfo = {
        ...pool,
        poolAddress: pool?.pool,

        totalLiquidity:
          fixed2Decimals(pool.liquidity0, pool.token0.decimals) *
            tokenPrice[pool?.token0?.id] +
          fixed2Decimals(pool.liquidity1, pool.token1.decimals) *
            tokenPrice[pool?.token1?.id] +
          (fixed2Decimals(pool.totalBorrow0, pool.token0.decimals) *
            tokenPrice[pool?.token0?.id] +
            fixed2Decimals(pool.totalBorrow1, pool.token1.decimals) *
              tokenPrice[pool?.token1?.id]),

        totalBorrowed:
          fixed2Decimals(pool.totalBorrow0, pool.token0.decimals) *
            tokenPrice[pool?.token0?.id] +
          fixed2Decimals(pool.totalBorrow1, pool.token1.decimals) *
            tokenPrice[pool?.token1?.id],

        openPosition:
          openPosiions.length > 0 && checkOpenPosition(openPosiions[0]),
        token0: {
          ...pool.token0,
          address: pool?.token0?.id,
          logo: getTokenSymbol(pool.token0.symbol),
          priceUSD: tokenPrice[pool?.token0?.id] * pool.token0.decimals,
          pricePerToken: tokenPrice[pool?.token0?.id],
        },
        token1: {
          ...pool.token1,
          address: pool?.token1?.id,
          logo: getTokenSymbol(pool.token1.symbol),
          priceUSD: tokenPrice[pool?.token1?.id] * pool.token1.decimals,
          pricePerToken: tokenPrice[pool?.token1?.id],
        },
      };
      tokenList[String(pool.token0.id).toUpperCase()] = {
        ...pool.token0,
        address: pool?.token0?.id,
        logo: getTokenSymbol(pool.token0.symbol),
        priceUSD: tokenPrice[pool?.token0?.id] * pool.token0.decimals,
        pricePerToken: tokenPrice[pool?.token0?.id],
      };
      tokenList[String(pool.token1.id).toUpperCase()] = {
        ...pool.token1,
        address: pool?.token1?.id,
        logo: getTokenSymbol(pool.token1.symbol),
        priceUSD: tokenPrice[pool?.token1?.id] * pool.token1.decimals,
        pricePerToken: tokenPrice[pool?.token1?.id],
      };
      poolData[pool?.pool as keyof typeof poolData] = poolInfo;
    }
    store.dispatch(setPools(poolData));
    store.dispatch(setTokens(tokenList));
    console.log({ poolData, tokenList , allPositions});
  }
};

export function add(amount: any, amount1: any) {
  return new BigNumber(amount).plus(amount1).toFixed();
}

export function sub(amount: any, amount1: any) {
  return new BigNumber(amount).minus(amount1).toFixed();
}

export function div(amount: any, amount1: any) {
  return new BigNumber(amount).dividedBy(amount1).toFixed();
}

export function mul(amount: any, amount1: any) {
  return new BigNumber(amount).multipliedBy(amount1).toFixed();
}

export function greaterThan(amount: any, amount1: any) {
  return new BigNumber(amount).isGreaterThan(amount1);
}

export function toAPY(n: any) {
  return numberFormat(mul(n, 4 * 60 * 24 * 365), 2);
}

export function count_leading_zeros(x: any) {
  let splitted = x.split("");
  let i = 0;
  while (splitted.shift() == 0) {
    i += 1;
  }
  return i;
}
export function numberFormat(x: any, po: any) {
  var parts = x.toString().split(".");
  if (parts.length > 1) {
    if (parseInt(parts[0]) > 1000) {
      parts[1] = parts[1].substring(0, 0);
    } else if (parseInt(parts[0]) > 100) {
      parts[1] = parts[1].substring(0, 2);
    } else if (parseInt(parts[0]) > 10) {
      parts[1] = parts[1].substring(0, 3);
    } else if (parseInt(parts[0]) > 0) {
      parts[1] = parts[1].substring(0, 4);
    } else {
      var startingZeros = count_leading_zeros(parts[1]);
      parts[1] = parts[1].substring(0, startingZeros + 5);
    }
  }

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (parts[1]) {
    if (po > 0) {
      parts[1] = parts[1].substring(0, po);
    } else if (parts[1].length == 1) {
      parts[1] = parts[1] + "0";
    }
    return parts.join(".");
  } else {
    parts[1] = "00";
    return parts.join(".");
  }
}

export function getCurrentLTV(selectedToken: any, collateralToken: any) {
  const prevLTV =
    Number(selectedToken.borrowBalanceFixed) > 0
      ? Number(selectedToken.borrowBalanceFixed) /
        (Number(collateralToken.lendBalanceFixed) *
          Number(collateralToken.priceRatio))
      : 0;

  return (Number(prevLTV.toFixed(4)) * 100).toFixed(2);
}

export const getBorrowAmount = (
  amount: any,
  ltv: any,
  collateralToken: any,
  selectedToken: any
) => {
  const borrowed =
    Number(amount) *
    Number(Number(getCurrentLTV(selectedToken, collateralToken)) / 100);

  const borrowAmount =
    (Number(amount) + Number(collateralToken.lendBalanceFixed) ) * Number(collateralToken.priceRatio) * (ltv / 100) -  Number(selectedToken.borrowBalanceFixed);

    console.log("borrowed", borrowed);
    

  return borrowAmount > 0 ?borrowAmount: 0;
};

export const tokensURLs = {
  1: [
    { url: "https://tokens.coingecko.com/uniswap/all.json", isEnabled: true },
  ],
  137: [
    {
      url: "https://tokens.coingecko.com/polygon-pos/all.json",
      isEnabled: true,
    },
  ],
  56: [
    {
      url: "https://tokens.coingecko.com/binance-smart-chain/all.json",
      isEnabled: true,
    },
  ],
  1285: [
    {
      url: "https://tokens.coingecko.com/moonriver/all.json",
      isEnabled: true,
    },
  ],
};

// const checkAllowance = async () => {
//   const token1Allowance = await getAllowance(
//     "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
//     address
//   );
//   const token2Allowance = await getAllowance(
//     "0x172370d5cd63279efa6d502dab29171933a610af",
//     address
//   );

//   setTokenAllowance({
//     token1: fixed2Decimals(token1Allowance).toString(),
//     token2: String(token2Allowance),
//   });
// };

// const handleAllowance = async (tokenAddress: string) => {
//   const hash = await handleApproval(tokenAddress, address, lendAmount);
// };

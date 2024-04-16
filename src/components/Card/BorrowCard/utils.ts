import { getQuote } from "../../../api/axios/calls";
import {
  decimal2Fixed,
  fixed2Decimals,
  truncateToDecimals,
} from "../../../helpers";
import NotificationMessage from "../../Common/NotificationMessage";

export const checkLiquidity = (
  lendAmount: string,
  source: string,
  unilendPool: any,
  selectedTokens: any,
  borrowAmount: number,
  setIsLowLiquidity: (value: boolean) => void
) => {
  const lendAmountNumber = parseFloat(lendAmount);

  if (!isNaN(lendAmountNumber) && lendAmountNumber > 0) {
    if (source === "Unilend") {
      let liquidity = { value: "", decimals: "" };
      if (unilendPool?.token0?.address === selectedTokens?.borrow?.address) {
        liquidity.value = unilendPool?.liquidity0;
        liquidity.decimals = unilendPool?.token0?.decimals;
      } else {
        liquidity.value = unilendPool?.liquidity1;
        liquidity.decimals = unilendPool?.token1?.decimals;
      }
      let fixedLiquidity = fixed2Decimals(
        liquidity?.value,
        +liquidity?.decimals
      );
      if (borrowAmount > truncateToDecimals(Number(fixedLiquidity) || 0, 9)) {
        setIsLowLiquidity(true);
      } else {
        setIsLowLiquidity(false);
      }
    } else {
      // TODO: write liquidity for compound
    }
  }
};

export const handleLTVSlider = (
  value: number,
  lendAmount: string,
  selectedTokens: any,
  b2rRatio: number,
  setSelectedLTV: (value: number) => void, // Add setSelectedLTV parameter
  setBorrowAmount: (amount: number) => void,
  setReceiveAmount: (amount: string) => void,
  getBorrowAmount: Function, // Import getBorrowAmount function from its source
  getCompoundBorrowAmount: Function // Import getCompoundBorrowAmount function from its source
) => {
  setSelectedLTV(value);
  let borrowAmount = 0;
  if (selectedTokens.borrow.source === "Unilend") {
    borrowAmount = getBorrowAmount(
      lendAmount,
      value,
      selectedTokens.lend,
      selectedTokens.borrow
    );
  } else {
    borrowAmount = getCompoundBorrowAmount(
      lendAmount,
      value,
      selectedTokens.lend.collateralBalanceFixed,
      selectedTokens.borrow.BorrowBalanceFixed,
      selectedTokens.lend.price
    );
  }

  setBorrowAmount(borrowAmount);

  if (selectedTokens.receive) {
    let receiveVal = borrowAmount * b2rRatio;
    if (isNaN(receiveVal) || receiveVal < 0) {
      receiveVal = 0;
    }
    setReceiveAmount(receiveVal.toString());
  }
};

export const handleQuote = async (
  selectedTokensRef: any,
  address: string,
  chain: any,
  setb2rRatio: (value: number) => void,
  setSelectedLTV: (value: number) => void,
  setQuoteError: (value: boolean) => void,
  selectedTokens: any,
  isTokenLoading: any,
  setIsTokenLoading: (value: any) => void
) => {
  try {
    const value = await getQuote(
      decimal2Fixed(1, selectedTokensRef.current.borrow.decimals),
      address,
      selectedTokensRef.current.borrow.address,
      selectedTokensRef.current.receive.address,
      chain?.id == 16153 ? 137 : chain?.id
    );
    if (value?.quoteDecimals) {
      setb2rRatio(value?.quoteDecimals);
    }
    setQuoteError(false);
    setSelectedLTV(5); // TODO check
  } catch (error: any) {
    setQuoteError(true);
    NotificationMessage(
      "error",
      `Swap is not available for ${selectedTokens.receive.symbol}, please select different receive token.`
    );
  } finally {
    setIsTokenLoading({ ...isTokenLoading, rangeSlider: false });
  }
};

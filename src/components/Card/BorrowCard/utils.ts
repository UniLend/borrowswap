import { getQuote } from "../../../api/axios/calls";
import {
  getAllowance,
  getBorrowTokenData,
  getCollateralTokenData,
  getPoolBasicData,
  handleApproval,
  handleCompoundSwap,
  handleSwap,
} from "../../../api/contracts/actions";
import { contractAddresses } from "../../../api/contracts/address";
import {
  decimal2Fixed,
  fixed2Decimals,
  getBorrowAmount,
  getCompoundBorrowAmount,
  getCompoundCurrentLTV,
  getCurrentLTV,
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
  // receiveAmount: string,
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
  setSelectedLTV: (value: number) => void,
  setBorrowAmount: (amount: number) => void,
  setReceiveAmount: (amount: string) => void
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
      selectedTokens.borrow.borrowBalanceFixed,
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
  selectedTokens: any,
  isTokenLoading: any,
  setb2rRatio: (value: number) => void,
  setSelectedLTV: (value: number) => void,
  setQuoteError: (value: boolean) => void,
  setIsTokenLoading: (value: any) => void,
  setUniQuote: (quoteData: any) => void
) => {
  try {
    if (
      String(selectedTokensRef.current.borrow.address).toLowerCase() ===
      String(selectedTokensRef.current.receive.address).toLowerCase()
    ) {
      setb2rRatio(1);

      setQuoteError(false);
      setSelectedLTV(5);
    } else {
      const value = await getQuote(
        decimal2Fixed(1, selectedTokensRef.current.borrow.decimals),
        address,
        selectedTokensRef.current.borrow.address,
        selectedTokensRef.current.receive.address,
        chain?.id == 16715 ? 137 : chain?.id
      );
      console.log("quote", value);
      setSelectedLTV(5);

      if (value?.quoteDecimals) {
        setb2rRatio(value?.quoteDecimals);

        setUniQuote({
          totalFee: value?.fee,
          slippage: value?.slippage,
          path: value?.path,
        });
      }
      setQuoteError(false);
      // TODO check
    }
  } catch (error: any) {
    setQuoteError(true);
    NotificationMessage(
      "error",
      `Swap is not available for ${selectedTokensRef.current.receive.symbol}, please select different receive token.`
    );
  } finally {
    setIsTokenLoading({ ...isTokenLoading, rangeSlider: false });
  }
};

export const handleSwapTransaction = async (
  selectedTokens: any,
  address: any,
  lendAmount: string,
  unilendPool: any,
  borrowAmount: number,
  path: any,
  setIsBorrowProgressModal: (value: boolean) => void,
  setModalMsg: (value: string) => void,
  setOperationProgress: (value: number) => void,
  handleClear: () => void
) => {
  try {
    const lendToken = await getAllowance(selectedTokens?.lend, address);
    // const borrowToken = await getAllowance(selectedTokens?.borrow, address);
    setIsBorrowProgressModal(true);
    console.log(
      "approval",
      Number(lendAmount),
      Number(lendToken.allowanceFixed),
      Number(lendAmount) > Number(lendToken.allowanceFixed)
    );

    if (Number(lendAmount) > Number(lendToken.allowanceFixed)) {
      setModalMsg("Spend Aprroval for " + selectedTokens.lend.symbol);
      await handleApproval(selectedTokens?.lend.address, address, lendAmount);
      handleSwapTransaction(
        selectedTokens,
        address,
        lendAmount,
        unilendPool,
        borrowAmount,
        path,
        setIsBorrowProgressModal,
        setModalMsg,
        setOperationProgress,
        handleClear
      );
    } else {
      setOperationProgress(2);
      setModalMsg(
        selectedTokens.lend.symbol +
          "-" +
          selectedTokens.borrow.symbol +
          "-" +
          selectedTokens?.receive?.symbol
      );
      let hash;
      if (selectedTokens.borrow.source == "Unilend") {
        hash = await handleSwap(
          lendAmount,
          unilendPool,
          selectedTokens,
          address,
          borrowAmount,
          path
        );
        if (hash.error) {
          throw new Error(hash.error.data.message);
        }
      } else {
        hash = await handleCompoundSwap(
          selectedTokens.lend.address,
          selectedTokens.borrow.address,
          selectedTokens.receive.address,
          decimal2Fixed(lendAmount, selectedTokens.lend.decimals),
          decimal2Fixed(borrowAmount, selectedTokens.borrow.decimals),
          address,
          path
        );
      }

      console.log("hash", hash);

      if (hash) {
        setOperationProgress(3);
        setModalMsg("Transaction is Success!");
        handleClear();
        //TODO: check message
        NotificationMessage("success", `Swap and Borrow is successful`);
      }
    }
  } catch (error: any) {
    setIsBorrowProgressModal(false);
    handleClear();
    if (error.reason) {
      NotificationMessage("error", `${error.reason}`);
    } else {
      NotificationMessage("error", `${error}`);
    }
    console.log("Error1", { error });
  }
};

export const handleTokenSelection = async (
  token: any,
  selectedTokens: any,
  tokenListStatus: any,
  address: any,
  isTokenLoading: any,
  setSelectedTokens: (value: any) => void,
  setTokenListStatus: (value: any) => void,
  setReceiveAmount: (value: any) => void,
  setLendAmount: (value: any) => void,
  setIsTokenLoading: (value: any) => void,
  handleQuoteValue: () => void,
  handleSelectLendToken: (value: any) => void,
  handleSelectBorrowToken: (value: any) => void,
  setSelectedLTV: (value: any) => void
) => {
  setSelectedTokens({
    ...selectedTokens,
    [tokenListStatus.operation]: { ...token, map: true },
  });
  setTokenListStatus({ isOpen: false, operation: "" });
  const tokenBal = await getAllowance(token, address);
  if (tokenListStatus.operation == "lend") {
    handleSelectLendToken(token);
    setSelectedTokens({
      [tokenListStatus.operation]: { ...token, ...tokenBal },
      ["borrow"]: null,
      ["receive"]: null,
    });
    setReceiveAmount("");
    setLendAmount("");
    setSelectedLTV("");
  } else if (tokenListStatus.operation == "borrow") {
    console.log(token.address);
    handleSelectBorrowToken(token);
    setSelectedTokens({
      ...selectedTokens,
      [tokenListStatus.operation]: { ...token, ...tokenBal },
      ["receive"]: null,
    });
    setReceiveAmount("");
  } else if (tokenListStatus.operation == "receive") {
    setSelectedTokens({
      ...selectedTokens,
      [tokenListStatus.operation]: { ...token, ...tokenBal },
    });
    setIsTokenLoading({ ...isTokenLoading, rangeSlider: true });
    setReceiveAmount("");
    handleQuoteValue();
  }
};

export const getOprationToken = (
  tokenListStatus: any,
  lendingTokens: any,
  compoundCollateralTokens: any,
  selectedTokens: any,
  borrowingTokens: any,
  baseTokens: any,
  uniSwapTokens: any
) => {
  if (tokenListStatus.operation === "lend") {
    const common: any = {};
    const tokenArray = [...lendingTokens, ...compoundCollateralTokens];
    for (const token of tokenArray) {
      if (common[String(token.address).toLocaleUpperCase()]) {
        common[String(token.address).toLocaleUpperCase()] = {
          ...token,
          ...common[token.address],
          availableIn: ["unilend", "compound"],
        };
      } else if (token.source == "Unilend") {
        common[String(token.address).toLocaleUpperCase()] = {
          ...token,
          availableIn: ["unilend"],
        };
      } else if (token.source == "Compound") {
        common[String(token.address).toLocaleUpperCase()] = {
          ...token,
          availableIn: ["compound"],
        };
      }
    }

    return Object.values(common);
  } else if (tokenListStatus.operation === "borrow") {
    const tokensAvailableIn =
      Array.isArray(selectedTokens.lend.availableIn) &&
      selectedTokens.lend.availableIn;
    if (
      tokensAvailableIn.includes("unilend") &&
      tokensAvailableIn.includes("compound")
    ) {
      return [...borrowingTokens, ...baseTokens];
    } else if (tokensAvailableIn.includes("unilend")) {
      return [...borrowingTokens];
    } else if (tokensAvailableIn.includes("compound")) {
      return [...baseTokens];
    }
  } else if (tokenListStatus.operation === "receive") {
    return uniSwapTokens;
  } else {
    return [];
  }
};

export const handleSelectBorrowToken = async (
  token: any,
  isTokenLoading: any,
  poolList: any,
  selectedTokens: any,
  chain: any,
  address: any,
  selectedTokensRef: any,
  setIsTokenLoading: (value: any) => void,
  setSelectedTokens: (value: any) => void,
  setCurrentLTV: (value: string) => void,
  setSelectedLTV: (value: number) => void,
  setUnilendPool: (value: any) => void
) => {
  if (token.source == "Unilend") {
    setIsTokenLoading({ ...isTokenLoading, pools: true });
    const tokenPool: any = Object.values(poolList).find((pool: any) => {
      if (
        (pool.token1.address == token.address &&
          pool.token0.address == selectedTokens.lend?.address) ||
        (pool.token0.address == token.address &&
          pool.token1.address == selectedTokens.lend?.address)
      ) {
        return true;
      }
    });

    const contracts =
      contractAddresses[chain?.id as keyof typeof contractAddresses];
    const data = await getPoolBasicData(
      contracts,
      tokenPool.pool,
      tokenPool,
      address
    );

    if (data.token0.address == selectedTokens.lend.address) {
      setSelectedTokens({
        ...selectedTokens,
        ["lend"]: { ...selectedTokens.lend, ...data.token0 },
        ["borrow"]: data.token1,
      });
      const currentLtv = getCurrentLTV(data.token1, data.token0);

      setCurrentLTV(currentLtv);

      if (+currentLtv != 0) {
        setSelectedLTV(+currentLtv);
      }
    } else {
      setSelectedTokens({
        ...selectedTokens,
        ["lend"]: { ...selectedTokens.lend, ...data.token1 },
        ["borrow"]: data.token0,
      });
      const currentLtv = getCurrentLTV(data.token0, data.token1);
      setCurrentLTV(currentLtv);
      if (+currentLtv != 0) {
        setSelectedLTV(+currentLtv);
      }
    }
    setUnilendPool(data);
    setIsTokenLoading({ ...isTokenLoading, pools: false });
  } else {
    setIsTokenLoading({ ...isTokenLoading, pools: true });
    const collateralToken = await getCollateralTokenData(
      selectedTokensRef?.current?.lend,
      address
    );
    const borrowedToken = await getBorrowTokenData(token, address);
    setIsTokenLoading({ ...isTokenLoading, pools: false });
    const ltv = getCompoundCurrentLTV(
      borrowedToken?.borrowBalanceFixed,
      collateralToken?.collateralBalanceFixed,
      collateralToken?.price
    );
    console.log(
      "LTV",
      ltv,
      borrowedToken?.borrowBalanceFixed,
      collateralToken?.collateralBalanceFixed,
      collateralToken?.price
    );

    setCurrentLTV(ltv);
    setSelectedTokens({
      ...selectedTokens,
      ["lend"]: { ...selectedTokensRef?.current?.lend, ...collateralToken },
      ["borrow"]: { ...selectedTokens.borrow, ...borrowedToken },
    });
  }
};

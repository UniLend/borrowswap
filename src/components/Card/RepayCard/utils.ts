import { valueType } from "antd/es/statistic/utils";
import { getQuote } from "../../../api/axios/calls";
import {
  getAllowance,
  getBorrowTokenData,
  getCollateralTokenData,
  getPoolBasicData,
  handleApproval,
  handleCompoundRepay,
  handleRepay,
} from "../../../api/contracts/actions";
import { contractAddresses } from "../../../api/contracts/address";
import { decimal2Fixed } from "../../../helpers";
import NotificationMessage from "../../Common/NotificationMessage";

export const handleQuote = async (
  selectedData: any,
  chain: any,
  address: any,
  isTokenLoading: any,
  setb2rRatio: (value: number) => void,
  setLendAmount: (value: string) => void,
  setBorrowAmount: (value: string) => void,
  setReceiveAmount: (value: string) => void,
  setQuoteError: (value: boolean) => void,
  setIsTokenLoading: (value: any) => void
) => {
  try {
    const borrowDecimals = selectedData?.borrow?.decimals;
    const lendAddress = selectedData?.lend?.address;
    const borrowAddress = selectedData?.borrow?.address;
    const chainId = 16153 ? 137 : 16702 ? 42161 : chain?.id;

    const value = await getQuote(
      decimal2Fixed(1, borrowDecimals),
      address,
      borrowAddress,
      lendAddress,
      chainId
    );

    if (value?.quoteDecimals) {
      setb2rRatio(value.quoteDecimals);
      const payLendAmount =
        value.quoteDecimals * (selectedData?.borrow?.borrowBalanceFixed || 0);
      console.log("pay amount", payLendAmount);
      setLendAmount(payLendAmount.toString());
    }

    setBorrowAmount(selectedData?.borrow?.borrowBalanceFixed || 0);
    setReceiveAmount(
      (selectedData?.receive?.collateralBalanceFixed || 0) +
        (selectedData?.receive?.redeemBalanceFixed || 0)
    );
    setQuoteError(false);
  } catch (error: any) {
    console.error("Error in handleQuote:", error);
    NotificationMessage(
      "error",
      error?.message || "Error occurred in handleQuote"
    );
    setQuoteError(true);
  } finally {
    setIsTokenLoading({ ...isTokenLoading, quotation: false });
  }
};

export const handleSelectRepayToken = async (
  poolData: any,
  isTokenLoading: any,
  poolList: any,
  chain: any,
  address: any,
  selectedData: any,
  setIsTokenLoading: (value: any) => void,
  setSelectedData: (value: any) => void
) => {
  setIsTokenLoading({ ...isTokenLoading, pool: true });
  if (poolData.source === "Unilend") {
    const tokenPool: any = Object.values(poolList).find((pool: any) => {
      if (pool.pool == poolData.pool) {
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

    if (
      parseFloat(data.token0.borrowBalanceFixed) > 0 &&
      data.token0.address === poolData.borrowToken.id
    ) {
      setSelectedData({
        ...selectedData,
        ["pool"]: poolData,
        ["lend"]: null,
        ["receive"]: data.token1,
        ["borrow"]: data.token0,
      });
    }

    if (
      parseFloat(data.token1.borrowBalanceFixed) > 0 &&
      data.token1.address === poolData.borrowToken.id
    ) {
      setSelectedData({
        ...selectedData,
        ["pool"]: poolData,
        ["lend"]: null,
        ["receive"]: data.token0,
        ["borrow"]: data.token1,
      });
    }
  } else {
    const tokenBal = await getAllowance(poolData.otherToken, address);
    const collateralToken = await getCollateralTokenData(
      poolData.otherToken,
      address
    );
    const borrowedToken = await getBorrowTokenData(
      poolData.borrowToken,
      address
    );
    setSelectedData({
      ...selectedData,
      ["pool"]: poolData,
      ["lend"]: null,
      ["receive"]: {
        ...poolData.otherToken,
        ...collateralToken,
        ...tokenBal,
      },
      ["borrow"]: { ...poolData.borrowToken, ...borrowedToken },
    });
  }
  setIsTokenLoading({ ...isTokenLoading, pool: false });
};

//handle Repay transaction function
export const handleRepayTransaction = async (
  selectedData: any,
  address: any,
  lendAmount: any,
  borrowAmount: any,
  receiveAmount: any,
  unilendPool: any,
  setOperationProgress: (value: number) => void,
  setIsBorrowProgressModal: (value: boolean) => void,
  setModalMsg: (value: string) => void,
  handleClear: () => void
) => {
  setOperationProgress(0);
  try {
    const lendToken = await getAllowance(selectedData?.lend, address);
    const borrowToken = await getAllowance(selectedData?.borrow, address);
    setIsBorrowProgressModal(true);
    console.log("handleRepayTransaction", lendToken, borrowToken);

    if (Number(lendAmount) > Number(lendToken.allowanceFixed)) {
      setModalMsg("Spend Aprroval for " + selectedData.lend.symbol);
      await handleApproval(selectedData?.lend.address, address, lendAmount);
      setOperationProgress(1);

      handleRepayTransaction(
        selectedData,
        address,
        lendAmount,
        borrowAmount,
        receiveAmount,
        unilendPool,
        setOperationProgress,
        setIsBorrowProgressModal,
        setModalMsg,
        handleClear
      );
    } else if (Number(borrowAmount) > Number(borrowToken.allowanceFixed)) {
      setModalMsg("Spend Aprroval for " + selectedData.borrow.symbol);
      setOperationProgress(1);
      await handleApproval(selectedData?.borrow.address, address, borrowAmount);
      setOperationProgress(2);
      handleRepayTransaction(
        selectedData,
        address,
        lendAmount,
        borrowAmount,
        receiveAmount,
        unilendPool,
        setOperationProgress,
        setIsBorrowProgressModal,
        setModalMsg,
        handleClear
      );
    } else {
      setModalMsg(
        selectedData.lend.symbol +
          "-" +
          selectedData.borrow.symbol +
          "-" +
          selectedData.receive.symbol
      );
      setOperationProgress(2);
      let hash;
      if (selectedData.borrow.source == "Unilend") {
        hash = await handleRepay(
          lendAmount,
          unilendPool,
          selectedData,
          address,
          borrowAmount,
          receiveAmount
        );
      } else {
        hash = await handleCompoundRepay(
          lendAmount,
          address,
          selectedData,
          borrowAmount
        );
      }
      if (hash) {
        setOperationProgress(3);
        handleClear();
        setTimeout(() => {
          setIsBorrowProgressModal(false);
        }, 1000);
      }
    }
  } catch (error) {
    console.log("Error1", { error });
  }
};

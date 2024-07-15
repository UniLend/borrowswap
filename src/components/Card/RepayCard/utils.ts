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
  waitForTransaction,
  getCollateralValue,
  // checkTxnStatus,
} from "../../../api/contracts/actions";
import { contractAddresses } from "../../../api/contracts/address";
import { decimal2Fixed } from "../../../helpers";
import NotificationMessage from "../../Common/NotificationMessage";
import { quoteWithSdk } from "../../../api/uniswap/quotes";

export const handleQuote = async (
  selectedDataRef: any,
  selectedData: any,
  chain: any,
  address: any,
  isTokenLoading: any,
  setb2rRatio: (value: number) => void,
  setLendAmount: (value: string) => void,
  setReceiveAmount: (value: string) => void,
  setQuoteError: (value: boolean) => void,
  setIsTokenLoading: (value: any) => void,
  setUniQuote: (value: any) => void,
  setAccordionModal: (value: any) => void
) => {
  try {
    setAccordionModal(false);
    const borrowDecimals = selectedDataRef.current?.borrow?.decimals;
    const lendAddress = selectedDataRef.current?.lend?.address;
    const borrowAddress = selectedDataRef.current?.borrow?.address;
    const chainId = 18731 ? 137 : chain?.id;
    let flag = false;
    if (
      String(borrowAddress).toLowerCase() === String(lendAddress).toLowerCase()
    ) {
      setb2rRatio(1);
      setLendAmount(selectedDataRef.current?.borrow?.borrowBalanceFixed);
      flag = true;
    } else {
      const tokenIn = {
        chainId: chain?.id == 18731 ? 137 : chain?.id,
        address: selectedDataRef.current?.borrow?.address,
        decimals: selectedDataRef.current?.borrow?.decimals,
        symbol: selectedDataRef.current?.borrow?.symbol,
        name: selectedDataRef.current?.borrow?.name,
      };

      const tokenOut = {
        chainId: chain?.id == 18731 ? 137 : chain?.id,
        address: selectedDataRef.current?.lend?.address,
        decimals: selectedDataRef.current?.lend?.decimals,
        symbol: selectedDataRef.current?.lend?.symbol,
        name: selectedDataRef.current?.lend?.name,
      };
      // const value = await getQuote(
      //   decimal2Fixed(1, borrowDecimals),
      //   address,
      //   borrowAddress,
      //   lendAddress,
      //   chainId
      // );

      const { quoteValue, quoteFee, quotePath }: any = await quoteWithSdk(
        tokenIn,
        tokenOut
      );
      if (quoteValue) {
        const coveredValue = Number(quoteValue) + 0.05;
        setb2rRatio(Number(coveredValue));
        setUniQuote({
          totalFee: quoteFee,
          slippage: 0.5,
          path: quotePath,
        });
        const payLendAmount =
          coveredValue *
          (selectedDataRef.current?.borrow?.borrowBalanceFixed || 0);
        console.log(
          "pay amount",
          selectedData,
          payLendAmount.toFixed(selectedDataRef.current?.lend.decimals),
          selectedDataRef.current?.borrow?.borrowBalanceFixed,
          coveredValue,
          quoteValue
        );

        setLendAmount(
          payLendAmount.toFixed(selectedDataRef.current?.borrow.decimals)
        );
        // setReceiveAmount()
        flag = true;
        setAccordionModal(true);
      }
    }

    setReceiveAmount(
      (selectedDataRef.current?.receive?.collateralBalanceFixed || 0) +
        (selectedDataRef.current.currentctedData?.receive?.redeemBalanceFixed ||
          0)
    );
    setQuoteError(false);
    if (flag) setIsTokenLoading({ ...isTokenLoading, quotation: false });
  } catch (error: any) {
    setQuoteError(true);
    setIsTokenLoading({ ...isTokenLoading, quotation: false });
    NotificationMessage(
      "error",
      `Swap is not available for ${selectedDataRef.current.lend.symbol}, please select different Pay token.`
    );
  } finally {
    // setIsTokenLoading({ ...isTokenLoading, quotation: false });
    // console.log("finally", isTokenLoading)
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
    console.log("handleSelectRepayToken", data);

    if (
      // data.token0.borrowBalanceFixed > 0 &&
      data.token0.address === poolData.borrowToken.id
    ) {
      setSelectedData({
        ...selectedData,
        ["pool"]: poolData,
        ["lend"]: data.token1,
        ["receive"]: data.token1,
        ["borrow"]: data.token0,
      });
    }

    if (
      // data.token1.borrowBalanceFixed > 0 &&
      data.token1.address === poolData.borrowToken.id
    ) {
      setSelectedData({
        ...selectedData,
        ["pool"]: poolData,
        ["lend"]: data.token0,
        ["receive"]: data.token0,
        ["borrow"]: data.token1,
      });
    }
  } else {
    console.log("No Pool Data");

    const tokenData = await getBorrowTokenData(poolData.borrowToken, address);
    const { redeemBalanceInUSD, totalLendBalanceInUsd } =
      await getCollateralValue(address);
    setSelectedData({
      ...selectedData,
      ["pool"]: poolData,
      ["lend"]: { lendBalanceFixedUSD: totalLendBalanceInUsd },
      ["receive"]: tokenData,
      ["borrow"]: tokenData,
    });
  }
  setIsTokenLoading({ ...isTokenLoading, pool: false });
};

export const handleSelectReceiveToken = async (
  data: any,
  address: any,
  isTokenLoading: any,
  selectedData: any,
  setIsTokenLoading: (value: any) => void,
  setSelectedData: (value: any) => void
) => {
  const tokenBal = await getAllowance(data, address);
  const collateralToken = await getCollateralTokenData(data, address);
  const borrowedToken = await getBorrowTokenData(
    selectedData.pool.borrowToken,
    address
  );
  setSelectedData({
    ...selectedData,
    ["lend"]: null,
    ["receive"]: {
      ...data.otherToken,
      ...collateralToken,
      ...tokenBal,
    },
    ["borrow"]: { ...selectedData.pool.borrowToken, ...borrowedToken },
  });
  setIsTokenLoading({ ...isTokenLoading, borrow: false });
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
  handleClear: () => void,
  path: any
) => {
  // setOperationProgress(1);
  try {
    const lendToken = await getAllowance(selectedData?.lend, address);
    // const borrowToken = await getAllowance(selectedData?.borrow, address);
    setIsBorrowProgressModal(true);

    console.log(
      "repayapproval",
      lendToken,
      lendAmount,
      borrowAmount,
      receiveAmount,
      Number(lendAmount) > Number(lendToken.allowanceFixed)
    );

    if (Number(lendAmount) > Number(lendToken.allowanceFixed)) {
      setModalMsg("Spend Aprroval for " + selectedData.lend.symbol);
      await handleApproval(
        selectedData?.lend.address,
        selectedData?.lend.decimals,
        address,
        lendAmount
      );
      // setOperationProgress(1);
      setTimeout(async () => {
        await handleRepayTransaction(
          selectedData,
          address,
          lendAmount,
          borrowAmount,
          receiveAmount,
          unilendPool,
          setOperationProgress,
          setIsBorrowProgressModal,
          setModalMsg,
          handleClear,
          path
        );
      }, 3000);
    } else {
      setOperationProgress(1);
      setModalMsg(
        selectedData.lend.symbol +
          "-" +
          selectedData.borrow.symbol +
          "-" +
          selectedData.receive.symbol
      );

      let hash;
      if (selectedData.borrow.source == "Unilend") {
        hash = await handleRepay(lendAmount, selectedData, address, path);
        if (hash.error) {
          throw new Error(hash.error.data.message);
        }
      } else {
        hash = await handleCompoundRepay(
          lendAmount,
          address,
          selectedData,
          borrowAmount,
          path
        );
      }
      if (hash) {
        setOperationProgress(3);
        setModalMsg("Transaction is Success!");
        handleClear();
        NotificationMessage("success", `Repay is successful`);
        // checkTxnStatus(hash, txnData, setIsBorrowProgressModal)
        console.log("reciept", hash);
      }
    }
  } catch (error: any) {
    setIsBorrowProgressModal(false);
    handleClear();
    const msg =
      error?.code === "ACTION_REJECTED"
        ? "Transaction Denied"
        : "Something went wrong, Refresh and Try again";
    NotificationMessage("error", msg);
    console.log("Error1", { error });
  }
};

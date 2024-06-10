import {
  getCollateralValue,
  handleCompoundRedeem,
  handleRedeem,
  getBorrowTokenDataAave,
  getCollateralTokenDataAave,
} from "./../../../api/contracts/actions";
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
import {
  decimal2Fixed,
  fixed2Decimals,
  mul,
  truncateToDecimals,
} from "../../../helpers";
import NotificationMessage from "../../Common/NotificationMessage";
import { quoteWithSdk } from "../../../api/uniswap/quotes";

// export const checkLiquidity = (
//   lendAmount: string,
//   source: string,
//   unilendPool: any,
//   selectedData: any,
//   receiveAmount: any,
//   setIsLowLiquidity: (value: boolean) => void
// ) => {
//   const lendAmountNumber = parseFloat(lendAmount);

//   if (!isNaN(lendAmountNumber) && lendAmountNumber > 0) {
//     if (source === "Unilend") {
//       let liquidity = { value: "", decimals: "" };
//       if (unilendPool?.token0?.address === selectedData?.borrow?.address) {
//         liquidity.value = unilendPool?.liquidity0;
//         liquidity.decimals = unilendPool?.token0?.decimals;
//       } else {
//         liquidity.value = unilendPool?.liquidity1;
//         liquidity.decimals = unilendPool?.token1?.decimals;
//       }
//       let fixedLiquidity = fixed2Decimals(
//         liquidity?.value,
//         +liquidity?.decimals
//       );
//       console.log("fixed liquidity", fixedLiquidity )
//       if (receiveAmount > truncateToDecimals(Number(fixedLiquidity) || 0, 9)) {
//         setIsLowLiquidity(true);
//       } else {
//         setIsLowLiquidity(false);
//       }
//     } else {
//       // TODO: write liquidity for compound
//     }
//   }
// };

export const handleQuote = async (
  selectedDataRef: any,
  selectedData: any,
  chain: any,
  address: any,
  isTokenLoading: any,
  setb2rRatio: (value: number) => void,
  setLendAmount: (value: string) => void,
  setBorrowAmount: (value: string) => void,
  setReceiveAmount: (value: string) => void,
  setQuoteError: (value: boolean) => void,
  setIsTokenLoading: (value: any) => void,
  setUniQuote: (value: any) => void,
  setAccordionModal: (value: any) => void
) => {
  try {
    setAccordionModal(false);
    const lendAddress = selectedDataRef.current?.lend?.address;
    const borrowAddress = selectedDataRef.current?.receive?.address;
    let flag = false;
    if (
      String(borrowAddress).toLowerCase() === String(lendAddress).toLowerCase()
    ) {
      setb2rRatio(1);
      setReceiveAmount(
        truncateToDecimals(
          Number(selectedDataRef.current?.lend?.redeemBalanceFixed),
          selectedDataRef.current?.lend?.decimals
        ).toString()
      );
      flag = true;
    } else {
      const tokenIn = {
        chainId: chain?.id == 16715 ? 137 : chain?.id,
        address: selectedDataRef.current?.lend?.address,
        decimals: selectedDataRef.current?.lend?.decimals,
        symbol: selectedDataRef.current?.lend?.symbol,
        name: selectedDataRef.current?.lend?.name,
      };

      const tokenOut = {
        chainId: chain?.id == 16715 ? 137 : chain?.id,
        address: selectedDataRef.current?.receive?.address,
        decimals: selectedDataRef.current?.receive?.decimals,
        symbol: selectedDataRef.current?.receive?.symbol,
        name: selectedDataRef.current?.receive?.name,
      };

      const { quoteValue, quoteFee, quotePath }: any = await quoteWithSdk(
        tokenIn,
        tokenOut
      );

      if (quoteValue) {
        setb2rRatio(Number(quoteValue));
        setUniQuote({
          totalFee: quoteFee,
          slippage: 0.5,
          path: quotePath,
        });
        const payLendAmount = mul(
          quoteValue,
          selectedDataRef.current?.lend?.redeemBalanceFixed || 0
        );
        console.log(
          "pay amount",
          selectedDataRef.current,
          payLendAmount,
          selectedDataRef.current?.lend?.redeemBalanceFixed,
          quoteValue
        );

        setReceiveAmount(payLendAmount.toString());
        setLendAmount(selectedDataRef.current?.lend?.redeemBalanceFixed);
        flag = true;
        setAccordionModal(true);
      }
    }

    setQuoteError(false);
    if (flag) setIsTokenLoading({ ...isTokenLoading, quotation: false });
  } catch (error: any) {
    setQuoteError(true);
    setIsTokenLoading({ ...isTokenLoading, quotation: false });
    NotificationMessage(
      "error",
      `Swap is not available for ${selectedDataRef.current?.receive.symbol}, please select different receive token.`
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
  setSelectedData: (value: any) => void,
  setLendAmount: (value: any) => void
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

    console.log("data", data, poolData);

    if (data.token0.address === poolData.borrowToken.id) {
      setSelectedData({
        ...selectedData,
        ["pool"]: poolData,
        ["lend"]: data.token0,
        ["receive"]: null,
        ["borrow"]: data.token0,
      });

      setLendAmount(
        truncateToDecimals(
          data?.token0?.redeemBalanceFixed,
          data?.token0?.decimals
        )
      );
    } else if (data.token1.address === poolData.borrowToken.id) {
      setSelectedData({
        ...selectedData,
        ["pool"]: poolData,
        ["lend"]: data.token1,
        ["receive"]: null,
        ["borrow"]: data.token1,
      });
      console.log("else");

      setLendAmount(
        truncateToDecimals(
          data?.token1?.redeemBalanceFixed,
          data?.token1?.decimals
        )
      );
    }
  } else {
    const { redeemBalanceInUSD } = await getCollateralValue(address);
    const tokenData = await getCollateralTokenData(
      poolData.borrowToken,
      address
    );

    let minValue = Math.min(
      Number(tokenData?.collateralBalance),
      Number(
        decimal2Fixed(
          Number(redeemBalanceInUSD / tokenData.price),
          Number(tokenData.decimals)
        )
      )
    );
    if (minValue != Number(tokenData?.collateralBalance)) {
      minValue = minValue * (tokenData.ltv / 100);
    }

    setSelectedData({
      ...selectedData,
      ["pool"]: poolData,
      ["lend"]: {
        ...tokenData,
        redeemBalance: minValue,
        redeemBalanceFixed: fixed2Decimals(minValue, tokenData.decimals),
      },
      ["receive"]: null,
      ["borrow"]: tokenData,
    });
    setLendAmount(fixed2Decimals(minValue, tokenData.decimals));
  }
  setIsTokenLoading({ ...isTokenLoading, pool: false });
};

const getCompoundData = () => {};

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
  redeemAmount: any,
  borrowAmount: any,
  receiveAmount: any,
  unilendPool: any,
  isMax: boolean,
  setOperationProgress: (value: number) => void,
  setIsBorrowProgressModal: (value: boolean) => void,
  setModalMsg: (value: string) => void,
  handleClear: () => void,
  path: any
) => {
  setOperationProgress(0);
  try {
    // const lendToken = await getAllowance(selectedData?.lend, address);
    // const borrowToken = await getAllowance(selectedData?.borrow, address);
    setIsBorrowProgressModal(true);

    // if (Number(lendAmount) > Number(lendToken.allowanceFixed)) {
    //   setModalMsg("Spend Aprroval for " + selectedData.lend.symbol);
    //   await handleApproval(selectedData?.lend.address, selectedData?.lend.decimals, address, lendAmount);
    //   setOperationProgress(1);
    // setTimeout(async () => {
    //  await handleRepayTransaction(
    //     selectedData,
    //     address,
    //     lendAmount,
    //     borrowAmount,
    //     receiveAmount,
    //     unilendPool,
    //     setOperationProgress,
    //     setIsBorrowProgressModal,
    //     setModalMsg,
    //     handleClear
    //   );
    // }, 3000);

    // }  else

    // setModalMsg(
    //   selectedData.lend.symbol +
    //     "-" +
    //     selectedData.borrow.symbol +
    //     "-" +
    //     selectedData.receive.symbol
    // );
    setOperationProgress(1);
    let hash;
    if (selectedData.borrow.source == "Unilend") {
      hash = await handleRedeem(
        redeemAmount,
        selectedData,
        address,
        isMax,
        path
      );
      if (hash.error) {
        throw new Error(hash.error.data.message);
      }
    } else {
      hash = await handleCompoundRedeem(
        redeemAmount,
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
      NotificationMessage("success", `Redeem is Successful`);
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

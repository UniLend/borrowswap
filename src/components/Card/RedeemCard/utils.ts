import { handleRedeem } from './../../../api/contracts/actions';
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
  setIsTokenLoading: (value: any) => void,
  setUniQuote: (value: any) => void
) => {
  try {
    const borrowDecimals = selectedData?.lend?.decimals;
    const lendAddress = selectedData?.lend?.address;
    const borrowAddress = selectedData?.receive?.address;
    const chainId = 16715 ? 137 : chain?.id;
    let flag = false;
    if( String(borrowAddress).toLowerCase() === String(lendAddress).toLowerCase()){
      setb2rRatio(1)
      setReceiveAmount(selectedData?.lend?.redeemBalanceFixed)
      flag = true;
    } else {
      const value = await getQuote(
        decimal2Fixed(1, borrowDecimals),
        address,
        lendAddress,
        borrowAddress,
        chainId
      );
   
      if (value?.quoteDecimals) {
        setb2rRatio(value.quoteDecimals);
        setUniQuote({
          totalFee: value?.fee,
          slipage: value?.slippage,
          path: value?.path,
        })
        const payLendAmount =
        value.quoteDecimals * (selectedData?.lend?.redeemBalanceFixed  || 0);
      console.log("pay amount", selectedData, payLendAmount, selectedData?.lend?.redeemBalanceFixed , value.quoteDecimals);
      setReceiveAmount(payLendAmount.toString());
      flag = true;
      }
    }
  

    // setBorrowAmount(selectedData?.borrow?.borrowBalanceFixed || 0);
    // setReceiveAmount(
    //   (selectedData?.receive?.collateralBalanceFixed || 0) +
    //     (selectedData?.receive?.redeemBalanceFixed || 0)
    // );
    setQuoteError(false);
    if(flag)
      setIsTokenLoading({ ...isTokenLoading, quotation: false });
      
  } catch (error: any) {
    console.error("Error in handleQuote:", error);
    NotificationMessage(
      "error",
      error?.message || "Error occurred in handleQuote"
    );
    setQuoteError(true);
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

    if (
     
      data.token0.address === poolData.borrowToken.id
    ) {
      setSelectedData({
        ...selectedData,
        ["pool"]: poolData,
        ["lend"]:  data.token1,
        ["receive"]: null,
        ["borrow"]: data.token0,
      });
      setLendAmount(data.token1.redeemBalanceFixed)
    } else if (
     
      data.token1.address === poolData.borrowToken.id
    ) {
      setSelectedData({
        ...selectedData,
        ["pool"]: poolData,
        ["lend"]: data.token0,
        ["receive"]: null,
        ["borrow"]: data.token1,
      });
      setLendAmount(data.token0.redeemBalanceFixed)
    }
  } else{
     setSelectedData({
      ...selectedData,
      ["pool"]: poolData,
      ["lend"]: null,
      ["receive"]:null,
      ["borrow"]:null,
    });
    
  }
  setIsTokenLoading({ ...isTokenLoading, pool: false });
};

export const handleSelectReceiveToken = async (
  data:any,
  address:any,
  isTokenLoading:any,
  selectedData: any,
  setIsTokenLoading: (value: any) => void,
  setSelectedData: (value: any) => void
) =>{
     const tokenBal = await getAllowance(data, address);
     const collateralToken = await getCollateralTokenData(
      data,
      address
    );
    const borrowedToken = await getBorrowTokenData(
      selectedData.pool.borrowToken,
      address
    );
    setSelectedData({
      ...selectedData,
      ["lend"]: null,
      ["receive"]: {
        ...data.otherToken, ...collateralToken, ...tokenBal
      },
      ["borrow"]: { ...selectedData.pool.borrowToken, ...borrowedToken },
    });
    setIsTokenLoading({ ...isTokenLoading, borrow: false });
}

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
  handleClear: () => void
) => {
  setOperationProgress(0);
  try {
   // const lendToken = await getAllowance(selectedData?.lend, address);
    // const borrowToken = await getAllowance(selectedData?.borrow, address);
    setIsBorrowProgressModal(true);
    

    // if (Number(lendAmount) > Number(lendToken.allowanceFixed)) {
    //   setModalMsg("Spend Aprroval for " + selectedData.lend.symbol);
    //   await handleApproval(selectedData?.lend.address, address, lendAmount);
    //   setOperationProgress(1);

    //   handleRepayTransaction(
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
    // }  else
     
      // setModalMsg(
      //   selectedData.lend.symbol +
      //     "-" +
      //     selectedData.borrow.symbol +
      //     "-" +
      //     selectedData.receive.symbol
      // );
      setOperationProgress(2);
      let hash;
      if (selectedData.borrow.source == "Unilend") {
        hash = await handleRedeem(
          redeemAmount,
          selectedData,
          address,
          isMax
        );
      } else {
        hash = await handleCompoundRepay(
          redeemAmount,
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
    
  } catch (error) {
    console.log("Error1", { error });
  }
};

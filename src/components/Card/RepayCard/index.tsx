import React, { useEffect, useState } from "react";
import { Button, Slider, Modal } from "antd";
import {
  getAllowance,
  getPoolBasicData,
  handleApproval,
  handleSwap,
} from "../../../api/contracts/actions";
import {
  decimal2Fixed,
  fixed2Decimals,
  getBorrowAmount,
  getCurrentLTV,
} from "../../../helpers";
import type { UnilendV2State } from "../../../states/store";
import { wagmiConfig } from "../../../main";
import { useSelector, useDispatch } from "react-redux";
import "./index.scss";
import useWalletHook from "../../../api/hooks/useWallet";
import PoolListModel from "../../Common/PoolListModel";
import TokenListModal from "../../Common/TokenListModal";
import AmountContainer from "../../Common/AmountContainer";
import ButtonWithDropdown from "../../Common/ButtonWithDropdown";
import { contractAddresses } from "../../../api/contracts/address";
import BorrowLoader from "../../Loader/BorrowLoader";
import { quote } from "../../../api/uniswap/quotes";
import { getQuote } from "../../../api/axios/calls";
import NotificationMessage from "../../Common/NotificationMessage";

enum ActiveOperation {
  BRROW = "Borrow_Swap",
  REPAY = "Swap_Repay",
}

export default function RepayCard({isLoading, uniSwapTokens }: any) {
  // const isLoading = false; //TODO
  const unilendV2Data = useSelector((state: UnilendV2State) => state.unilendV2);
  const { tokenList, poolList } = unilendV2Data;

  const { address, isConnected, chain } = useWalletHook();
  const [lendAmount, setLendAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState(0);
  const [receiveAmount, setReceiveAmount] = useState("");

  // const [borrowingTokens, setBorrowingTokens] = useState<Array<any>>([]);

  // const [isBorrowProgressModal, setIsBorrowProgressModal] =
  //   useState<boolean>(false);
  // const [selectedTokens, setSelectedTokens] = useState<any>({
  //   pool: null,
  //   lend: null,
  //   receive: null,
  // });

  //start here
  //select data state  todo seectedTokens = selectedData
  const [selectedData, setSelectedData] = useState<any>({
    pool: null,
    lend: null,
    receive: null,
  });
  console.log(selectedData);
  // set pools Data
  const [pools, setPools] = useState<Array<any>>([]);

  //set receive token 
  const [repayToken, setRepayToken] = useState<Array<any>>([]);

  //open  diffrent modal dynamically
  const [tokenListStatus, setTokenListStatus] = useState({
    isOpen: false,
    operation: "",
  });

  const [isTokenLoading, setIsTokenLoading] = useState({
    // lend: isLoading,
    // borrow: false,
    // receive: false,
    pool: false,
    lend: false,
    receive: false,
    pools: false,
  });

  const [unilendPool, setUnilendPool] = useState(null as any | null);
  console.log("unilendPool", unilendPool);

  // TODO: add enum for below state;
  const [repayBtn, setRepayBtn] = useState("Select you pay token");

  const [operationProgress, setOperationProgress] = useState(0);

  const handleLendAmount = (amount: string) => {
    setLendAmount(amount);
  };

  const handleReceiveAmount = (amount: string) => {
    setReceiveAmount(amount);
  };

  const handleOpenTokenList = (operation: string) => {
    setTokenListStatus({ isOpen: true, operation });
  };

  //recive token function
  const getTokenData = (selectedData) => {
    console.log("selectedData", selectedData);
   
  };

  // Usage
  const repayTokenAdd = (selectedData) => {
    console.log("selectedData",selectedData)
    if (selectedData.totalBorrow0 !== '0' && selectedData.totalBorrow1 !== '0') {
        console.log("Both tokens have borrowings");
        return ([selectedData.token0, selectedData.token1])
      

    } else if (selectedData.totalBorrow0 !== '0') {
        console.log("Only token 0 has borrowing");
        return ([selectedData.token0])
    } else if (selectedData.totalBorrow1 !== "0") {
        console.log("Only token 1 has borrowing");
        return ([selectedData.token1])
    } 
    
}


  const getOprationToken = () => {
    if (tokenListStatus.operation === "pool") {
      return pools;
    } else if (tokenListStatus.operation === "lend") {
      return uniSwapTokens;
    } else if (tokenListStatus.operation === "receive") {
      // return receiveToken;
      return repayTokenAdd(selectedData.pool);
    } else {
      return [];
    }
  };

  const handleCloseTokenList = () => {
    setTokenListStatus({ isOpen: false, operation: "" });
  };

  // TODO: replace with REPAY
  const handleSwapTransaction = async () => {
    setOperationProgress(0);
    try {
      const lendToken = await getAllowance(selectedData?.lend, address);
      const borrowToken = await getAllowance(selectedData?.receive, address);
      // setIsBorrowProgressModal(true);
      console.log("handleSwapTransaction", lendToken, borrowToken);

      if (Number(lendAmount) > Number(lendToken.allowanceFixed)) {
        await handleApproval(selectedData?.lend.address, address, lendAmount);
        setOperationProgress(1);
        console.log("setOperationProgress(1)", operationProgress);

        handleSwapTransaction();
      } else if (Number(borrowAmount) > Number(borrowToken.allowanceFixed)) {
        setOperationProgress(1);
        console.log("setOperationProgress(11)", operationProgress);
        await handleApproval(
          selectedTokens?.borrow.address,
          address,
          borrowAmount
        );
        setOperationProgress(2);
        console.log("setOperationProgress(2)", operationProgress);
        handleSwapTransaction();
      } else {
        setOperationProgress(2);
        console.log("setOperationProgress(22)", operationProgress);
        const hash = await handleSwap(lendAmount);
        console.log("hash", hash);
        if (hash) {
          setOperationProgress(3);
        }
      }
    } catch (error) {
      console.log("Error1", { error });
    }
  };


//handle quote 

const handleQuote = async () => {
  // setIsTokenLoading((prevLoading) => ({ ...prevLoading, rangeSlider: true }));
  try {
    const value = await getQuote(
      decimal2Fixed(1, selectedData.lend.decimals),
      address,
      selectedData?.lend?.address,
      selectedData?.receive?.address,
      chain?.id
    );
    console.log("QOUTE_VAL", value);
    if (value?.quoteDecimals) {
      // setb2rRatio(value?.quoteDecimals);
    }
  } catch (error: any) {
    console.error("Error in handleQuote:", error);
    // Handle error
    NotificationMessage(
      "error",
      error?.message || "Error occurred in handleQuote"
    );
  } finally {
    setIsTokenLoading({ ...isTokenLoading, rangeSlider: false });
  }
};

useEffect(() => {
  if (selectedData?.receive && !tokenListStatus.isOpen) {
  console.log("handle recieve call")
    // setIsTokenLoading({ ...isTokenLoading, rangeSlider: true });
    setReceiveAmount("");
    handleQuote();
  }
}, [selectedData]);


  useEffect(() => {
    const poolsArray = Object.values(poolList);
    setPools(poolsArray);
  }, [unilendV2Data]);

  const handleTokenSelection = (data: any) => {
    setSelectedData({
      ...selectedData,
      [tokenListStatus.operation]: data,
    });

    if (tokenListStatus.operation == "pool") {
      console.log("poolData", data);
      setSelectedData({
        ...selectedData,
        ["pool"]: data,
      });

    } else if (tokenListStatus.operation == "lend") {
      //   handleSelectBorrowToken(token.address);
          repayTokenAdd(selectedData)

    } else if (tokenListStatus.operation == "receive") {
        setSelectedData({
                ...selectedData,
                ["receive"]: data,
              });
    }
    setTokenListStatus({ isOpen: false, operation: "" });
  };

  console.log("selectedData", selectedData);
  const checkLoading = (isTokenLoading: object) => {
    return Object.values(isTokenLoading).some((value) => value === true);
  };

  // TODO loading state
  useEffect(() => {
    checkLoading(isTokenLoading);
  }, [isTokenLoading]);

  // TODO: btn states
  useEffect(() => {
    const { pool, lend, receive } = selectedData;
    // TODO: confirm these messages
    switch (true) {
      case pool === null:
        setRepayBtn("Select your pool");
        break;
      case lendAmount === "":
        setRepayBtn("Enter you pay value");
        break;
      case lend === null:
        setRepayBtn("Select your lend token");
        break;
      case receive === null:
        setRepayBtn("Select your receive token");
        break;
      default:
        setRepayBtn("Repay");
    }
  }, [lendAmount, selectedData]);
  return (
    <>
      <div className="repay_container">
        <div className="swap_route">
          <p className="paragraph06 ">Select Pool</p>
          <ButtonWithDropdown
            buttonText={
              selectedData.pool
                ? `${selectedData.pool.token0.symbol} / ${selectedData.pool.token1.symbol}`
                : "Select"
            }
            onClick={() => handleOpenTokenList("pool")}
            className="transparent_btn"
          />
        </div>
        <p className="paragraph06 label">You Pay</p>
        <AmountContainer
          balance="125.25"
          value={lendAmount}
          onChange={(e: any) => handleLendAmount(e.target.value)}
          onMaxClick={() => console.log("Max Clicked")}
          buttonText={selectedData?.lend?.symbol}
          onClick={() => handleOpenTokenList("lend")}
        />
        <p className="paragraph06 label">You Receive</p>
        <AmountContainer
          balance="125.25"
          value={receiveAmount}
          onChange={(e: any) => handleReceiveAmount(e.target.value)}
          onMaxClick={() => console.log("Max Clicked")}
          buttonText={selectedData?.receive?.symbol}
          onClick={() => handleOpenTokenList("receive")}
          // onClick={() =>   selectedData?.pool !== null
          //   ? () => handleOpenTokenList("receive")
          //   : () => {}}
          isShowMaxBtn
        />

        <Button
          disabled={repayBtn !== "Repay"}
          className="primary_btn"
          onClick={handleSwapTransaction}
          title="please slect you pay token"
          loading={isTokenLoading.pools}
        >
          {repayBtn}
        </Button>
      </div>

      {tokenListStatus.operation === "pool" ? (
        <Modal
          className="antd_modal_overlay"
          centered
          onCancel={handleCloseTokenList}
          open={tokenListStatus.isOpen}
          footer={null}
          closable={false}
        >
          <PoolListModel
            tokenList={getOprationToken()}
            onSelectToken={(token: any) => handleTokenSelection(token)}
            operation={ActiveOperation.REPAY}
            tokenListOperation={tokenListStatus.operation}
            isTokenListLoading={isLoading}
            showPoolData={true}
            poolData={Object.values(poolList).filter(
              (item) => item.openPosition && item.totalBorrow0 && item.totalBorrow0
            )}
            selectedData={selectedData} // Pass selectedData to PoolListModal
          />
        </Modal>
      ) : tokenListStatus.operation === "lend" ||
        tokenListStatus.operation === "receive" ? (
        <Modal
          className="antd_modal_overlay"
          centered
          onCancel={handleCloseTokenList}
          open={tokenListStatus.isOpen}
          footer={null}
          closable={false}
        >
          <TokenListModal
            tokenList={getOprationToken()}
            onSelectToken={(token: any) => handleTokenSelection(token)}
            operation={ActiveOperation.REPAY}
            tokenListOperation={tokenListStatus.operation}
            isTokenListLoading={isLoading}
            showPoolData={false}
            poolData={unilendPool}
            selectedData={selectedData} // Pass selectedTokens to TokenListModal
          />
        </Modal>
      ) : null}

      {/* <Modal
        className="antd_popover_content"
        centered
        onCancel={() => setIsBorrowProgressModal(false)}
        open={isBorrowProgressModal}
        footer={null}
        closable={false}
      >
       
        <BorrowLoader
          spendToken={"UFT"}
          SwapToken={"UFT"}
          progress={operationProgress}
        />
      </Modal> */}
    </>
  );
}

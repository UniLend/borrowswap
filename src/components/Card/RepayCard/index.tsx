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
} from "../../../helpers";
import type { UnilendV2State } from "../../../states/store";

import { useSelector } from "react-redux";
import "./index.scss";
import useWalletHook from "../../../api/hooks/useWallet";
import PoolListModel from "../../Common/PoolListModel";
import TokenListModal from "../../Common/TokenListModal";
import AmountContainer from "../../Common/AmountContainer";
import ButtonWithDropdown from "../../Common/ButtonWithDropdown";
import { contractAddresses } from "../../../api/contracts/address";
import BorrowLoader from "../../Loader/BorrowLoader";
import { getQuote } from "../../../api/axios/calls";
import NotificationMessage from "../../Common/NotificationMessage";

enum ActiveOperation {
  BRROW = "Borrow_Swap",
  REPAY = "Swap_Repay",
}

export default function RepayCard({isLoading, uniSwapTokens }: any) {
  const unilendV2Data = useSelector((state: UnilendV2State) => state.unilendV2);
  const { tokenList, poolList, positions } = unilendV2Data;
    
  const { address, chain } = useWalletHook();
  const [lendAmount, setLendAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState(0);
  const [receiveAmount, setReceiveAmount] = useState("");
  const [b2rRatio, setb2rRatio] = useState(1);
  const [tokens, setTokens] = useState(uniSwapTokens);
  const [isBorrowProgressModal, setIsBorrowProgressModal] =
  useState<boolean>(false);
  const [pools, setPools] = useState<Array<any>>([]);
  const [repayToken, setRepayToken] = useState<Array<any>>([]);
  const [modalMsg, setModalMsg] = useState('');
//sorted Specific tokens acording to our choice
  const sortedToken = ["USDT", "USDC", "WETH"];
  useEffect(() => {
      const customSort = (a:any, b:any) => {
          const aIndex = sortedToken.indexOf(a.symbol);
          const bIndex = sortedToken.indexOf(b.symbol);
  
          if (aIndex !== -1 && bIndex !== -1) {
              return aIndex - bIndex;
          } else if (aIndex !== -1) {
              return -1;
          } else if (bIndex !== -1) {
              return 1;
          } else {
              return a.symbol.localeCompare(b.symbol);
          }
      };
  
      const sortedTokens = [...tokens].sort(customSort);
      if (!arraysEqual(sortedTokens, tokens)) {
          setTokens(sortedTokens);
      }
  }, [tokens, sortedToken]);
  function arraysEqual(a:any, b:any) {
      return JSON.stringify(a) === JSON.stringify(b);
  }
  
  //select data state 
  const [selectedData, setSelectedData] = useState<any>({
    pool: null,
    lend: null,
    receive: null,
    borrow:null
  });

  console.log('selectedData', selectedData) 

  //open  diffrent modal dynamically
  const [tokenListStatus, setTokenListStatus] = useState({
    isOpen: false,
    operation: "",
  });

  const [isTokenLoading, setIsTokenLoading] = useState({
    pool: false,
    lend: false,
    receive: false,
    quotation:false
  });

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

  useEffect(() => {
    const poolsArray = Object.values(poolList);
    setPools(poolsArray);
  }, [unilendV2Data]);

const getOprationToken = () => {
  if (tokenListStatus.operation === "pool") {
    return positions;
  } else if (tokenListStatus.operation === "lend") {
    return tokens;
  } else if (tokenListStatus.operation === "receive") {
    return;
  } else {
    return [];
  }
};

  const handleCloseTokenList = () => {
    setTokenListStatus({ isOpen: false, operation: "" });
  };


  //handle Repay transaction function
  const handleRepayTransaction = async () => {
    setOperationProgress(0);
    try {
      const lendToken = await getAllowance(selectedData?.lend, address);
      const borrowToken = await getAllowance(selectedData?.borrow, address);
      setIsBorrowProgressModal(true);
      console.log("handleRepayTransaction", lendToken, borrowToken);

      if (Number(lendAmount) > Number(lendToken.allowanceFixed)) {
        setModalMsg('Spend Aprroval for '+ selectedData.lend.symbol)
        await handleApproval(selectedData?.lend.address, address, lendAmount);
        setOperationProgress(1);
        // console.log("setOperationProgress(1)", operationProgress);

        handleRepayTransaction();
      } else if (Number(borrowAmount) > Number(repayToken.allowanceFixed)) {
        setModalMsg('Spend Aprroval for '+ selectedData.lend.symbol)
        setOperationProgress(1);
        // console.log("setOperationProgress(11)", operationProgress);
        await handleApproval(
          selectedData?.borrow.address,
          address,
          borrowAmount
        );
        setOperationProgress(2);
        // console.log("setOperationProgress(2)", operationProgress);
        handleRepayTransaction();
      } else {
        setModalMsg(selectedData.lend.symbol+'-'+selectedData.borrow.symbol+'-'+selectedData.receive.symbol)
        setOperationProgress(2);
        // console.log("setOperationProgress(22)", operationProgress);
        const hash = await handleSwap(lendAmount);
        // console.log("hash", hash);
        if (hash) {
          setOperationProgress(3);
        }
      }
    } catch (error) {
      console.log("Error1", { error });
    }
  };



//handle quote for Uniswap
const handleQuote = async () => {
  try {
    const value = await getQuote(
      decimal2Fixed(1, selectedData.borrow.decimals),
      // decimal2Fixed(selectedData.borrow.borrowBalanceFixed),
      address,
      selectedData?.borrow?.address,
      selectedData?.lend?.address,
      chain?.id
    );
    if (value?.quoteDecimals) {
      setb2rRatio(value?.quoteDecimals);
    }
    console.log("ratio", value?.quoteDecimals)

    if (b2rRatio && selectedData?.borrow?.borrowBalanceFixed) {
      const calculatedLendAmount = b2rRatio * selectedData.borrow.borrowBalanceFixed;
      setLendAmount(calculatedLendAmount);
    }

    setReceiveAmount(selectedData.receive.collateralBalanceFixed);
  } catch (error: any) {
    console.error("Error in handleQuote:", error);
    NotificationMessage(
      "error",
      error?.message || "Error occurred in handleQuote"
    );
  } finally {
    setIsTokenLoading({ ...isTokenLoading, quotation: false });
  }
};



// Loading Quote Data based on lend State
useEffect(() => {
  if (selectedData?.pool && selectedData?.lend  && !tokenListStatus.isOpen) {
    setIsTokenLoading({ ...isTokenLoading, quotation: true });
    console.log("quotation loading", isTokenLoading.quotation)
    setReceiveAmount("");
    setLendAmount("");
    handleQuote();
  }
}, [selectedData?.lend]);




// Handle Recieve Data 

const handleRepayToken = async (poolData: any) => {

const tokenPool = Object.values(poolList).find((pool) => {
  if (
    (pool.pool == poolData.pool )
  ) {
    return true;
  }  
});

console.log("tokenPool", tokenPool);

  const contracts =
    contractAddresses[chain?.id as keyof typeof contractAddresses];
  const data = await getPoolBasicData(
    contracts,
    tokenPool.pool,
    tokenPool,
    address
  );

  console.log("repay", data)
//   if (parseFloat(data.token0.borrowBalanceFixed) > 0 && parseFloat(data.token1.borrowBalanceFixed) > 0) {
//     setSelectedData({
//       ...selectedData,
//         ["pool"]: poolData,
//         ["lend"]:null,
//       ["receive"]:data.token1,
//       ["borrow"]:data.token0
//     });
// }


  if (parseFloat(data.token0.borrowBalanceFixed) > 0) {
    setSelectedData({
      ...selectedData,
        ["pool"]: poolData,
        ["lend"]:null,
      ["receive"]:data.token1,
      ["borrow"]:data.token0
    });
}

if (parseFloat(data.token1.borrowBalanceFixed) > 0) {
  setSelectedData({
    ...selectedData,
    ["pool"]: poolData,
    ["lend"]:null,
    ["receive"]:data.token0,
    ["borrow"]:data.token1
  });
}
};


  const handleTokenSelection = (data: any) => {
    console.log("handletokendata", data)
    setSelectedData({
      ...selectedData,
      [tokenListStatus.operation]: data,
    });

    if (tokenListStatus.operation == "pool") {
      handleRepayToken(data);
      setReceiveAmount("");
      setLendAmount("");
    } else if (tokenListStatus.operation == "lend") {
        
    } else if (tokenListStatus.operation == "receive") {
        setSelectedData({
                ...selectedData,
                ["receive"]: data,
              });
    }
    setTokenListStatus({ isOpen: false, operation: "" });
  };

  const checkLoading = (isTokenLoading: object) => {
    return Object.values(isTokenLoading).some((value) => value === true);
  };

  // loading state
  useEffect(() => {
    checkLoading(isTokenLoading);
  }, [isTokenLoading]);

  //  Button states
  useEffect(() => {
    const { pool, lend } = selectedData;
    switch (true) {
      case pool === null:
        setRepayBtn("Select your Position");
        break;
      case lend === null:
        setRepayBtn("Select your lend token");
        break;
        case isTokenLoading.quotation:
          setRepayBtn("Quote data loading");
          break;
      default:
        setRepayBtn("Repay");
    }
  }, [selectedData, isTokenLoading]);

  return (
    <>
      <div className="repay_container">
        <div className="swap_route">
          <p className="paragraph06 ">Select Positions</p>
          <ButtonWithDropdown
            buttonText={
              selectedData.pool
                ? `${selectedData.pool.borrowToken.symbol}`
                : "Select"
            }
            onClick={() => handleOpenTokenList("pool")}
            className="transparent_btn"
          />
        </div>
        <p className="paragraph06 label">You Pay</p>
        <AmountContainer
          balance="125.25"
          value={Number(lendAmount) > 0 ? lendAmount : "0"}
          onChange={(e: any) => handleLendAmount(e.target.value)}
          onMaxClick={() => console.log("Max Clicked")}
          buttonText={selectedData?.lend?.symbol}
          onClick={
            selectedData?.pool !== null
              ? () => handleOpenTokenList("lend")
              : () => {}
          }
          // onClick={ () => handleOpenTokenList("lend")
          readonly
        />
        <p className="paragraph06 label">You Receive</p>
        <AmountContainer
          balance={selectedData?.receive?.balanceFixed}
          value={Number(receiveAmount) > 0 ? receiveAmount : "0"}
          onChange={(e: any) => handleReceiveAmount(e.target.value)}
          onMaxClick={() => setReceiveAmount(selectedData.receive.collateralBalanceFixed)}
          buttonText={selectedData?.pool?.otherToken?.symbol}
          isShowMaxBtn
          readonly
        />

        <Button
          disabled={repayBtn !== "Repay"}
          className="primary_btn"
          onClick={handleRepayTransaction}
          title="please slect you pay token"
          loading={isTokenLoading.pool || isTokenLoading.quotation}
        >
          {repayBtn}
        </Button>
      </div>

      {tokenListStatus.operation == "pool" ? (
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
            positionData={Object.values(positions).filter(
              (item) => item.borrowBalance0 !== 0 || item.token1.borrowBalance1 !== 0
          )}
          pools ={pools}
            selectedData={selectedData} // Pass selectedData to PoolListModal
          />
        </Modal>
      ) : tokenListStatus.operation == "lend" ||
        tokenListStatus.operation == "receive" ? (
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
            selectedData={selectedData} // Pass selectedTokens to TokenListModal
          />
        </Modal>
      ) : null}

      <Modal
        className="antd_popover_content"
        centered
        onCancel={() => setIsBorrowProgressModal(false)}
        open={isBorrowProgressModal}
        footer={null}
        closable={false}
      >
       
        <BorrowLoader
          msg={modalMsg}
          progress={operationProgress}
        />
      </Modal>
    </>
  );
}

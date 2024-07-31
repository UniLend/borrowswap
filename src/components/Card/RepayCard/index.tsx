import React, { useEffect, useState, useRef } from "react";
import { Button, Modal } from "antd";
import { getAllowance } from "../../../api/contracts/actions";
import {
  truncateToDecimals,
  getRepayBtnActions,
  mul,
  totalUserData,
} from "../../../helpers";
import type { UnilendV2State } from "../../../states/store";

import { useSelector } from "react-redux";
import "./index.scss";
import useWalletHook from "../../../api/hooks/useWallet";
import {
  TokenListModal,
  AmountContainer,
  ButtonWithDropdown,
  AccordionContainer,
  PoolHealthContainer,
} from "../../Common";
import BorrowLoader from "../../Loader/BorrowLoader";
import {
  handleQuote,
  handleRepayTransaction,
  handleSelectRepayToken,
  handleSelectReceiveToken,
} from "./utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CompoundBaseTokens } from "../../../helpers/constants";
enum ActiveOperation {
  BRROW = "Borrow_Swap",
  REPAY = "Swap_Repay",
}

const compoundTempPosition = [
  {
    id: "100",
    owner: "0xd5b26ac46d2f43f4d82889f4c7bbc975564859e3",
    BorrowBalance: "0",
    BorrowBalanceFixed: 0,
    borrowMin: "100000000",
    borrowMinFixed: 1e-10,
    price: 1.00007938,
    borrowBalance0: "24130340833838900",
    borrowBalance1: "0",
    source: "Compound",
    pool: {
      token0: {
        address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        symbol: "USDC (PoS)",
        name: "USDC (PoS)",
        decimals: 6,
        source: "Compound",
      },
      token1: {
        address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
        symbol: "WBTC",
        name: "Wrapped BTC",
        decimals: 8,
        source: "Compound",
      },
    },
  },
];

const compoundCollateralTokens = [
  {
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    symbol: "WETH",
    name: "Wrapped ETH",
    decimals: 18,
    source: "Compound",
    logo: "https://assets.coingecko.com/coins/images/17238/small/aWETH_2x.png?1626940782",
  },
  {
    address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    symbol: "WBTC",
    name: "Wrapped BTC",
    decimals: 8,
    source: "Compound",
    logo: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png?1548822744",
  },
  {
    address: "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4",
    symbol: "stMATIC",
    name: "Staked Matic",
    decimals: 18,
    source: "Compound",
    logo: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912",
  },
  {
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    symbol: "WMATIC",
    name: "Wrapped Matic",
    decimals: 18,
    source: "Compound",
    logo: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912",
  },
];

export default function RepayCard({ uniSwapTokens }: any) {
  const unilendV2Data = useSelector((state: UnilendV2State) => state.unilendV2);
  const { tokenList, poolList, positions } = unilendV2Data;
  const { address, isConnected, chain } = useWalletHook();
  const [lendAmount, setLendAmount] = useState<string>("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [b2rRatio, setb2rRatio] = useState(1);
  const [tokens, setTokens] = useState(uniSwapTokens);
  const [isBorrowProgressModal, setIsBorrowProgressModal] =
    useState<boolean>(false);
  const [pools, setPools] = useState<Array<any>>([]);
  const [modalMsg, setModalMsg] = useState("");
  const [quoteError, setQuoteError] = useState<boolean>(false);
  //select data state
  const [selectedData, setSelectedData] = useState<any>({
    pool: null,
    lend: null,
    receive: null,
    borrow: null,
  });

  //open  diffrent modal dynamically
  const [tokenListStatus, setTokenListStatus] = useState({
    isOpen: false,
    operation: "",
  });
  const [isTokenLoading, setIsTokenLoading] = useState({
    // positions: true,
    pool: true,
    lend: false,
    receive: false,
    quotation: false,
  });
  const selectedDataRef = useRef(selectedData);
  selectedDataRef.current = selectedData;
  const [accordionModal, setAccordionModal] = useState<boolean>(false);
  const [unilendPool, setUnilendPool] = useState(null as any | null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [uniQuote, setUniQuote] = useState({
    totalFee: 0,
    slippage: 0,
    path: [],
  });

  const [analyticsData, setAnalyticsData] = useState({
    totalBorrowed: 0,
    totalLend: 0,
    healthFactor: 0,
  });
  const handleLendAmount = (amount: string) => {
    setLendAmount(amount);
  };

  const handleReceiveAmount = (amount: string) => {
    setReceiveAmount(amount);
  };

  const handleOpenTokenList = (operation: string) => {
    setTokenListStatus({ isOpen: true, operation });
  };

  // useEffect(() => {
  //   const poolsArray = Object.values(poolList);
  //   setPools(poolsArray);
  //   if (Object.keys(unilendV2Data.poolList).length > 0) {
  //     setIsTokenLoading({ ...isTokenLoading, positions: false });
  //   }
  // }, [unilendV2Data]);

  useEffect(() => {
    const poolsArray = Object.values(poolList);
    setPools(poolsArray);
    if (Object.keys(unilendV2Data.poolList).length > 0) {
      setIsTokenLoading({ ...isTokenLoading, pool: false });
    }
  }, [unilendV2Data]);

  const repayButton = getRepayBtnActions(
    selectedData,
    isTokenLoading,
    quoteError,
    lendAmount
  );

  const getOprationToken = () => {
    if (tokenListStatus.operation === "pool") {
      return [...pools, ...CompoundBaseTokens];
    } else if (tokenListStatus.operation === "lend") {
      return uniSwapTokens;
    } else if (tokenListStatus.operation === "receive") {
      if (selectedData.pool.source === "Compound") {
        return compoundCollateralTokens;
      }
      return;
    } else {
      return [];
    }
  };

  const handleCloseTokenList = () => {
    setTokenListStatus({ isOpen: false, operation: "" });
  };

  const handleClear = () => {
    setLendAmount("");
    setBorrowAmount("");
    setReceiveAmount("");
    setSelectedData({
      pool: null,
      lend: null,
      receive: null,
      borrow: null,
    });
    setb2rRatio(0);
    setTimeout(() => {
      setIsBorrowProgressModal(false);
      setOperationProgress(0);
    }, 3000);
  };

  //handle quote for Uniswap
  const handleQuoteValue = async () => {
    await handleQuote(
      selectedDataRef,
      selectedData,
      chain,
      address,
      isTokenLoading,
      setb2rRatio,
      setLendAmount,
      setReceiveAmount,
      setQuoteError,
      setIsTokenLoading,
      setUniQuote,
      setAccordionModal
    );
  };
  useEffect(() => {}, [selectedData]);

  const handleRepayToken = async (poolData: any) => {
    await handleSelectRepayToken(
      poolData,
      isTokenLoading,
      poolList,
      chain,
      address,
      selectedData,
      setIsTokenLoading,
      setSelectedData
    );
  };
  const handleReceiveToken = async (data: any) => {
    await handleSelectReceiveToken(
      data,
      address,
      isTokenLoading,
      selectedData,
      setIsTokenLoading,
      setSelectedData
    );
  };

  const handleSwapRepayTransaction = async () => {
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
      uniQuote.path
    );
  };

  const handleTokenSelection = async (data: any) => {
    setTokenListStatus({ isOpen: false, operation: "" });
    setSelectedData({
      ...selectedData,
      [tokenListStatus.operation]: { ...data, map: true },
    });
    if (tokenListStatus.operation == "pool") {
      handleRepayToken(data);
      setAccordionModal(false);
      setReceiveAmount("");
      setLendAmount("");
    } else if (tokenListStatus.operation == "lend") {
      setTokenListStatus({ isOpen: false, operation: "" });
      const tokenBal = await getAllowance(data, address);
      setSelectedData({
        ...selectedData,
        [tokenListStatus.operation]: { ...data, ...tokenBal },
      });
      setIsTokenLoading({ ...isTokenLoading, quotation: true });
      setLendAmount("");
      handleQuoteValue();
    } else if (tokenListStatus.operation == "receive") {
      handleReceiveToken(data);
      //    setSelectedData({
      //   ...selectedData,
      //   ["lend"]: null,
      //   ["receive"]: {
      //     ...data.otherToken, ...borrowedToken
      //   },
      //   ["borrow"]: { ...data.otherToken, ...borrowedToken },
      // });
    }
  };

  const checkLoading = (isTokenLoading: object) => {
    return Object.values(isTokenLoading).some((value) => value === true);
  };

  // Loading Quote Data based on lend State
  // useEffect(() => {
  //   if (selectedData?.pool && selectedData?.lend && !tokenListStatus.isOpen) {
  //     console.log("lendChnage");
  //     setIsTokenLoading({ ...isTokenLoading, quotation: true });
  //     setLendAmount("");
  //     handleQuoteValue();
  //   }
  // }, [selectedData?.lend]);

  useEffect(() => {
    if (selectedData?.pool?.source === "compound") {
      setReceiveAmount(selectedData?.receive?.collateralBalanceFixed || 0);
      setBorrowAmount(selectedData?.borrow?.borrowBalanceFixed || 0);
    } else {
      setReceiveAmount(
        (selectedData?.receive?.collateralBalanceFixed || 0) +
          (selectedData?.receive?.redeemBalanceFixed || 0)
      );
      setBorrowAmount(selectedData?.borrow?.borrowBalanceFixed || 0);
    }
  }, [selectedData?.receive, selectedData.borrow]);

  // loading state
  useEffect(() => {
    checkLoading(isTokenLoading);
  }, [isTokenLoading]);

  useEffect(() => {
    if (selectedData) {
      const data: any = totalUserData(selectedData);

      setAnalyticsData(data);
    }
  }, [selectedData?.borrow]);

  return (
    <>
      <div className='repay_container'>
        <div className='swap_route'>
          <p className='paragraph06 '>Select Pool</p>
          <ButtonWithDropdown
            buttonText={
              selectedData.pool
                ? `${selectedData.pool.borrowToken.symbol}`
                : "Select"
            }
            onClick={isConnected ? () => handleOpenTokenList("pool") : () => {}}
            className={selectedData?.pool === null ? "transparent_btn" : ""}
            btnClass={!isConnected ? "disable_btn newbtn" : "visible"}
          />
        </div>
        <p className='paragraph06 label'>You Pay</p>
        <AmountContainer
          balance={truncateToDecimals(
            selectedData?.lend?.balanceFixed || 0,
            4
          ).toString()}
          value={Number(lendAmount) > 0 ? lendAmount : "0"}
          onChange={(e: any) => handleLendAmount(e.target.value)}
          isShowMaxBtn
          buttonText={selectedData?.lend?.symbol}
          onMaxClick={() => {
            setLendAmount(
              (selectedData?.borrow?.borrowBalanceFixed * b2rRatio).toFixed(
                selectedData?.borrow.decimals
              )
            );
          }}
          onClick={
            selectedData?.borrow?.borrowBalanceFixed > 0
              ? () => handleOpenTokenList("lend")
              : () => {}
          }
          // readonly
          btnClass={
            selectedData?.pool === null ||
            selectedData?.receive?.collateralBalanceFixed === 0 ||
            selectedData?.receive === null
              ? "disable_btn"
              : "visible"
          }
        />
        <p className='paragraph06 label'>You Borrowed</p>
        <AmountContainer
          balance={selectedData?.borrow?.balanceFixed}
          value={Number(borrowAmount) > 0 ? borrowAmount : "0"}
          onChange={(e: any) => handleReceiveAmount(e.target.value)}
          onMaxClick={() => {
            setLendAmount(
              (selectedData?.borrow?.borrowBalanceFixed * b2rRatio).toString()
            );
          }}
          // buttonText={selectedData?.pool?.otherToken?.symbol}
          buttonText={
            selectedData?.pool?.source === "Compound"
              ? selectedData?.receive?.symbol
              : selectedData?.pool?.borrowToken?.symbol
          }
          // isShowMaxBtn
          // onClick={
          //   selectedData?.pool !== null &&
          //   selectedData.pool.source !== "Compound" &&
          //   selectedData.pool.source !== "Unilend"
          //     ? () => handleOpenTokenList("receive")
          //     : () => {}
          // }
          onClick={() => {}}
          readonly
          btnClass={
            selectedData?.pool?.source === "Compound" &&
            selectedData?.pool?.source === "Unilend"
              ? ""
              : "disable_btn"
          }
        />
        <PoolHealthContainer
          selectedTokens={selectedData}
          totalBorrow={analyticsData.totalBorrowed}
          totalLend={analyticsData.totalLend}
          healthFactor={analyticsData.healthFactor}
          showAccordion={accordionModal}
        />
        {isConnected ? (
          <Button
            disabled={repayButton.disable}
            className='primary_btn'
            onClick={handleSwapRepayTransaction}
            title='please slect you pay token'
            loading={
              (isTokenLoading.pool && selectedData.pool) ||
              isTokenLoading.quotation
            }
          >
            {repayButton.text}
          </Button>
        ) : (
          <div className='connect-btn'>
            <ConnectButton />
          </div>
        )}
        <AccordionContainer
          tokenIn={selectedData?.borrow?.symbol}
          tokenOut={selectedData?.lend?.symbol}
          b2rRatio={b2rRatio}
          fee={uniQuote.totalFee}
          slippage={uniQuote.slippage}
          lendAmount={lendAmount}
          showAccordion={accordionModal}
        />
      </div>

      <Modal
        className='antd_modal_overlay'
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
          // isTokenListLoading={isTokenLoading.positions}
          isTokenListLoading={isTokenLoading.pool}
          showPoolData={tokenListStatus.operation == "pool" ? true : false}
          positionData={[...Object.values(positions)].filter(
            (item) =>
              item.borrowBalance0 !== 0 || item.token1.borrowBalance1 !== 0
          )}
          currentOperation={tokenListStatus.operation}
        />
      </Modal>

      <Modal
        className='antd_popover_content'
        centered
        onCancel={() => setIsBorrowProgressModal(false)}
        open={isBorrowProgressModal}
        footer={null}
        closable={false}
      >
        <BorrowLoader msg={modalMsg} progress={operationProgress} />
      </Modal>
    </>
  );
}

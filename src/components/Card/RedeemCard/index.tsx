import React, { useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { getAllowance } from "../../../api/contracts/actions";
import {
  truncateToDecimals,
  getRepayBtnActionsRedeem,
  decimal2Fixed,
  fixed2Decimals,
  mul,
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
} from "../../Common";
import BorrowLoader from "../../Loader/BorrowLoader";
import {
  handleQuote,
  handleRepayTransaction,
  handleSelectRepayToken,
  handleSelectReceiveToken,
  // checkLiquidity
} from "./utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
// import { compoundCollateralTokens } from "../../../helpers/constants";

enum ActiveOperation {
  BRROW = "Borrow_Swap",
  REDEEM = "Redeem_Swap",
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
    logo: "https://assets.coingecko.com/coins/images/14073/standard/matic.png?1696513797",
  },
];

export default function RedeemCard({ uniSwapTokens }: any) {
  const unilendV2Data = useSelector((state: UnilendV2State) => state.unilendV2);
  const { tokenList, poolList, positions } = unilendV2Data;
  const { address, isConnected, chain } = useWalletHook();
  const [lendAmount, setLendAmount] = useState<any>("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState<any>("");
  const [b2rRatio, setb2rRatio] = useState(1);
  const [tokens, setTokens] = useState(uniSwapTokens);
  const [isBorrowProgressModal, setIsBorrowProgressModal] =
    useState<boolean>(false);
  const [pools, setPools] = useState<Array<any>>([]);
  const [modalMsg, setModalMsg] = useState("");
  const [quoteError, setQuoteError] = useState<boolean>(false);
  const [isMax, setIsMax] = useState(false);
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
    positions: true,
    pool: false,
    lend: false,
    receive: false,
    quotation: false,
  });
  const [unilendPool, setUnilendPool] = useState(null as any | null);
  const [operationProgress, setOperationProgress] = useState(1);
  const [uniQuote, setUniQuote] = useState({
    totalFee: 0,
    slippage: 0,
    path: [],
  });

  //sorted Specific tokens acording to our choice
  const sortedToken = ["USDT", "USDC", "WETH", "WBTC"];
  useEffect(() => {
    const customSort = (a: any, b: any) => {
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
  function arraysEqual(a: any, b: any) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  const handleLendAmount = (amount: string) => {
    const TrunAmount = truncateToDecimals(
      Number(amount),
      selectedData?.lend?.decimals
    );

    // setLendAmount(TrunAmount);

    setReceiveAmount(mul(Number(amount), b2rRatio).toString());
    setIsMax(false);
  };

  const handleReceiveAmount = (amount: string) => {
    // const amountConvert = decimal2Fixed(amount, selectedData.receive.decimals);
    // console.log("amountConverted", amountConvert);
    setReceiveAmount(amount);
  };

  const handleOpenTokenList = (operation: string) => {
    setTokenListStatus({ isOpen: true, operation });
  };

  useEffect(() => {
    const poolsArray = Object.values(poolList);
    setPools(poolsArray);
    if (Object.keys(unilendV2Data.poolList).length > 0) {
      setIsTokenLoading({ ...isTokenLoading, positions: false });
    }
  }, [unilendV2Data]);

  const redeemButton = getRepayBtnActionsRedeem(
    selectedData,
    isTokenLoading,
    quoteError,
    lendAmount
  );

  const getOprationToken = () => {
    if (tokenListStatus.operation === "pool") {
      return [...pools, ...compoundCollateralTokens];
    } else if (tokenListStatus.operation === "receive") {
      return tokens;
    } else if (tokenListStatus.operation === "lend") {
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

    setTimeout(() => {
      setIsBorrowProgressModal(false);
      setOperationProgress(1);
    }, 3000);
    setb2rRatio(0);
  };

  //handle quote for Uniswap
  const handleQuoteValue = async () => {
    await handleQuote(
      selectedData,
      chain,
      address,
      isTokenLoading,
      setb2rRatio,
      setLendAmount,
      setBorrowAmount,
      handleReceiveAmount,
      setQuoteError,
      setIsTokenLoading,
      setUniQuote
    );
    setIsMax(true);
  };

  const handleRepayToken = async (poolData: any) => {
    await handleSelectRepayToken(
      poolData,
      isTokenLoading,
      poolList,
      chain,
      address,
      selectedData,
      setIsTokenLoading,
      setSelectedData,
      setLendAmount
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
    handleRepayTransaction(
      selectedData,
      address,
      lendAmount,
      borrowAmount,
      receiveAmount,
      unilendPool,
      isMax,
      setOperationProgress,
      setIsBorrowProgressModal,
      setModalMsg,
      handleClear,
      uniQuote.path
    );
  };

  const handleTokenSelection = async (data: any) => {
    console.log("handletokendata", data, tokenListStatus);
    setTokenListStatus({ isOpen: false, operation: "" });
    setSelectedData({
      ...selectedData,
      [tokenListStatus.operation]: { ...data, map: true },
    });
    if (tokenListStatus.operation == "pool") {
      handleRepayToken(data);
      setReceiveAmount("");
      setLendAmount("");
      // if(data.source == 'Compound'){
      //   const tokenBal = await getAllowance(data.borrowToken, address);
      //   setSelectedData({
      //     ...selectedData,
      //     ['lend']: { ...data.borrowToken, ...tokenBal },
      //   });
      // }
    } else if (tokenListStatus.operation == "lend") {
      setTokenListStatus({ isOpen: false, operation: "" });

      const tokenBal = await getAllowance(data, address);
      setSelectedData({
        ...selectedData,
        [tokenListStatus.operation]: { ...data, ...tokenBal },
      });
    } else if (tokenListStatus.operation == "receive") {
      // handleReceiveToken(data)
      setTokenListStatus({ isOpen: false, operation: "" });

      const tokenBal = await getAllowance(data, address);
      setSelectedData({
        ...selectedData,
        [tokenListStatus.operation]: { ...data, ...tokenBal },
      });
    }
  };

  const checkLoading = (isTokenLoading: object) => {
    return Object.values(isTokenLoading).some((value) => value === true);
  };

  // Loading Quote Data based on lend State
  useEffect(() => {
    if (
      selectedData?.pool &&
      selectedData?.receive &&
      !tokenListStatus.isOpen
    ) {
      setIsTokenLoading({ ...isTokenLoading, quotation: true });
      handleQuoteValue();
    }
  }, [selectedData?.receive]);

  // useEffect(() => {
  //     if(selectedData?.pool?.source === 'compound'){
  //         setReceiveAmount(
  //         (selectedData?.receive?.collateralBalanceFixed || 0)
  //     )
  //     }else{
  //         setReceiveAmount(
  //         (selectedData?.receive?.collateralBalanceFixed || 0) +
  //         (selectedData?.receive?.redeemBalanceFixed || 0)
  //       )
  //     }
  // }, [selectedData?.receive]);

  // loading state
  useEffect(() => {
    checkLoading(isTokenLoading);
  }, [isTokenLoading]);

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

        <p className='paragraph06 label'>You Redeem</p>
        <AmountContainer
          balance={selectedData?.lend?.balanceFixed}
          value={Number(lendAmount) > 0 ? lendAmount : "0"}
          onChange={(e: any) => handleLendAmount(e.target.value)}
          onMaxClick={() => {
            // console.log(selectedData);
            setLendAmount(
              truncateToDecimals(
                Number(selectedData?.lend?.redeemBalanceFixed),
                selectedData?.lend?.decimals
              )
            );
            setReceiveAmount(
              mul(Number(selectedData?.lend?.redeemBalanceFixed), b2rRatio)
            );
            setIsMax(true);
          }}
          // buttonText={selectedData?.pool?.otherToken?.symbol}
          buttonText={
            selectedData?.pool?.source === "Compound"
              ? selectedData?.lend?.symbol
              : selectedData?.pool?.borrowToken?.symbol
          }
          isShowMaxBtn
          // onClick={
          //   selectedData?.pool !== null &&
          //   selectedData.pool.source !== "Compound" &&
          //   selectedData.pool.source !== "Unilend"
          //     ? () => handleOpenTokenList("receive")
          //     : () => {}
          // }
          onClick={() => {}}
          btnClass={
            selectedData?.pool === null ||
            selectedData?.receive?.collateralBalanceFixed === 0 ||
            selectedData?.receive === null
              ? "disable_btn"
              : "visible"
          }
          // btnClass={
          //   selectedData?.pool?.source === "Compound" ? "" : "disable_btn"
          // }
        />
        <p className='paragraph06 label'>You Receive</p>
        <AmountContainer
          balance={truncateToDecimals(
            selectedData?.receive?.balanceFixed || 0,
            4
          ).toString()}
          value={Number(receiveAmount) > 0 ? receiveAmount : "0"}
          onChange={(e: any) => {}}
          // onMaxClick={() => {
          //   setLendAmount((selectedData?.lend?.redeemBalanceFixed))
          // }}
          buttonText={selectedData?.receive?.symbol}
          onClick={
            selectedData?.pool !== null && lendAmount != "0"
              ? () => handleOpenTokenList("receive")
              : () => {}
          }
          readonly
          btnClass={
            selectedData?.pool === null || lendAmount == "0"
              ? "disable_btn"
              : "visible"
          }
        />
        {isConnected ? (
          <Button
            disabled={redeemButton.disable}
            className='primary_btn'
            onClick={handleSwapRepayTransaction}
            title='please slect you pay token'
            loading={isTokenLoading.pool || isTokenLoading.quotation}
          >
            {redeemButton.text}
          </Button>
        ) : (
          <ConnectButton />
        )}
        <AccordionContainer
          selectedTokens={selectedData}
          b2rRatio={b2rRatio}
          fee={uniQuote.totalFee}
          slippage={uniQuote.slippage}
          lendAmount={lendAmount}
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
          operation={ActiveOperation.REDEEM}
          isTokenListLoading={isTokenLoading.positions}
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

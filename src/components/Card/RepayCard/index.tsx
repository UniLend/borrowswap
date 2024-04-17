import React, { useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { getAllowance } from "../../../api/contracts/actions";
import { truncateToDecimals, getRepayBtnActions } from "../../../helpers";
import type { UnilendV2State } from "../../../states/store";

import { useSelector } from "react-redux";
import "./index.scss";
import useWalletHook from "../../../api/hooks/useWallet";
import TokenListModal from "../../Common/TokenListModal";
import AmountContainer from "../../Common/AmountContainer";
import ButtonWithDropdown from "../../Common/ButtonWithDropdown";
import BorrowLoader from "../../Loader/BorrowLoader";
import {
  handleQuote,
  handleRepayTransaction,
  handleSelectRepayToken,
} from "./utils";

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
        symbol: "USDC",
        name: "USDC",
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

const compoundColleteralTokens = [
  {
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    symbol: "WETH",
    name: "wrap eth",
    decimals: 18,
    source: "Compound",
    // logo: "https://assets.coingecko.com/coins/images/14243/small/aUSDT.78f5faae.png?1615528400"
  },
  {
    address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    symbol: "WBTC",
    name: "Wrapped BTC",
    decimals: 8,
    source: "Compound",
    // logo: "https://assets.coingecko.com/coins/images/14243/small/aUSDT.78f5faae.png?1615528400"
  }
];

const baseTokens = [
  {
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    symbol: "USDC",
    name: "USDC",
    decimals: 6,
    source: "Compound",
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
  const [repayToken, setRepayToken] = useState<Array<any>>([]);
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
    positions: true,
    pool: false,
    lend: false,
    receive: false,
    quotation: false,
  });
  const [unilendPool, setUnilendPool] = useState(null as any | null);
  const [operationProgress, setOperationProgress] = useState(0);

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
    if (Object.keys(unilendV2Data.poolList).length > 0) {
      setIsTokenLoading({ ...isTokenLoading, positions: false });
    }
  }, [unilendV2Data]);

  const repayButton = getRepayBtnActions(
    selectedData,
    isTokenLoading,
    quoteError
  );

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
    setIsBorrowProgressModal(false);
    setOperationProgress(0);
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
      setReceiveAmount,
      setQuoteError,
      setIsTokenLoading
    );
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
      setOperationProgress,
      setIsBorrowProgressModal,
      setModalMsg,
      handleClear
    );
  };

  const handleTokenSelection = async (data: any) => {
    console.log("handletokendata", data);
    setSelectedData({
      ...selectedData,
      [tokenListStatus.operation]: { ...data, map: true },
    });

    if (tokenListStatus.operation == "pool") {
      handleRepayToken(data);
      setReceiveAmount("");
      setLendAmount("");
    } else if (tokenListStatus.operation == "lend") {
      const tokenBal = await getAllowance(data, address);
      setSelectedData({
        ...selectedData,
        [tokenListStatus.operation]: { ...data, ...tokenBal },
      });
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

  // Loading Quote Data based on lend State
  useEffect(() => {
    if (selectedData?.pool && selectedData?.lend && !tokenListStatus.isOpen) {
      setIsTokenLoading({ ...isTokenLoading, quotation: true });
      setReceiveAmount("");
      setLendAmount("");
      handleQuoteValue();
    }
  }, [selectedData?.lend]);

  // loading state
  useEffect(() => {
    checkLoading(isTokenLoading);
  }, [isTokenLoading]);

  return (
    <>
      <div className='repay_container'>
        <div className='swap_route'>
          <p className='paragraph06 '>Select Positions</p>
          <ButtonWithDropdown
            buttonText={
              selectedData.pool
                ? `${selectedData.pool.borrowToken.symbol}`
                : "Select"
            }
            onClick={() => handleOpenTokenList("pool")}
            className='transparent_btn'
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
          onMaxClick={() => console.log("Max Clicked")}
          buttonText={selectedData?.lend?.symbol}
          onClick={
            selectedData?.borrow !== null
              ? () => handleOpenTokenList("lend")
              : () => {}
          }
          // readonly
        />
        <p className='paragraph06 label'>You Receive</p>
        <AmountContainer
          balance={selectedData?.receive?.balanceFixed}
          value={Number(receiveAmount) > 0 ? receiveAmount : "0"}
          onChange={(e: any) => handleReceiveAmount(e.target.value)}
          onMaxClick={() =>
            (selectedData?.receive?.collateralBalanceFixed || 0) +
            (selectedData?.receive?.redeemBalanceFixed || 0)
          }
          buttonText={selectedData?.pool?.otherToken?.symbol}
          isShowMaxBtn
          onClick={
            selectedData?.pool !== null
              ? () => handleOpenTokenList("pool")
              : () => {}
          }
          readonly
          btnClass='disable_btn'
        />

        <Button
          disabled={repayButton.disable}
          className='primary_btn'
          onClick={handleSwapRepayTransaction}
          title='please slect you pay token'
          loading={isTokenLoading.pool || isTokenLoading.quotation}
        >
          {repayButton.text}
        </Button>
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
          isTokenListLoading={isTokenLoading.positions}
          showPoolData={tokenListStatus.operation == "pool" ? true : false}
          positionData={[
            ...Object.values(positions),
            ...compoundTempPosition,
          ].filter(
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

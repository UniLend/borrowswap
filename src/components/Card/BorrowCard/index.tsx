import React, { useEffect, useRef, useState } from "react";
import { Button, Slider, Modal } from "antd";
import { getUserProxy } from "../../../api/contracts/actions";
import {
  findBorrowToken,
  getButtonAction,
  truncateToDecimals,
} from "../../../helpers";
import type { UnilendV2State } from "../../../states/store";
import { useSelector } from "react-redux";
import "./index.scss";
import useWalletHook from "../../../api/hooks/useWallet";
import {AccordionContainer, TokenListModal, AmountContainer, ButtonWithDropdown } from "../../Common"
import BorrowLoader from "../../Loader/BorrowLoader";
import {
  checkLiquidity,
  getOprationToken,
  handleLTVSlider,
  handleQuote,
  handleSelectBorrowToken,
  handleSwapTransaction,
  handleTokenSelection,
} from "./utils";

enum ActiveOperation {
  BRROW = "Borrow_Swap",
  REPAY = "Swap_Repay",
}

const compoundCollateralTokens = [
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
  },
];

const baseTokens = [
  {
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    symbol: "USDC (PoS)",
    name: "USD Coin (PoS) ",
    decimals: 6,
    source: "Compound",
  },
];

export default function BorrowCard({ uniSwapTokens }: any) {
  const unilendV2Data = useSelector((state: UnilendV2State) => state.unilendV2);
  const { tokenList, poolList } = unilendV2Data;
  const { address, isConnected, chain } = useWalletHook();
  const [lendAmount, setLendAmount] = useState("");
  const [modalMsg, setModalMsg] = useState("");
  const [borrowAmount, setBorrowAmount] = useState(0);
  const [receiveAmount, setReceiveAmount] = useState("");
  const [lendingTokens, setLendingTokens] = useState<Array<any>>([]);
  const [borrowingTokens, setBorrowingTokens] = useState<Array<any>>([]);
  const [tokenListStatus, setTokenListStatus] = useState({
    isOpen: false,
    operation: "",
  });
  const [isBorrowProgressModal, setIsBorrowProgressModal] =
    useState<boolean>(false);
  const [selectedTokens, setSelectedTokens] = useState<any>({
    lend: null,
    borrow: null,
    receive: null,
  });
  const selectedTokensRef = useRef(selectedTokens);
  selectedTokensRef.current = selectedTokens;
  const [selectedLTV, setSelectedLTV] = useState<number>(5);
  const [unilendPool, setUnilendPool] = useState(null as any | null);
  const [currentLTV, setCurrentLTV] = useState("0");
  const [b2rRatio, setb2rRatio] = useState(1);
  const [userProxy, setUserProxy] = useState(address);
  const [quoteError, setQuoteError] = useState<boolean>(false);
  const [isLowLiquidity, setIsLowLiquidity] = useState(false);
  const [isTokenLoading, setIsTokenLoading] = useState({
    lend: true,
    borrow: false,
    receive: false,
    pools: false,
    rangeSlider: false,
  });
  const [operationProgress, setOperationProgress] = useState(0);

  const isLowBal: boolean =
    +lendAmount >
    truncateToDecimals(selectedTokens?.lend?.balanceFixed || 0, 4);

  const borrowBtn = getButtonAction(
    selectedTokens,
    lendAmount,
    isTokenLoading,
    quoteError,
    isLowLiquidity,
    isLowBal
  );

  const handleLendAmount = (amount: string) => {
    setLendAmount(amount);
  };

  const handleReceiveAmount = (amount: string) => {
    setReceiveAmount(amount);
  };

  const handleBorrowModal = (visible: boolean) => {
    setIsBorrowProgressModal(visible);
    setOperationProgress(0);
  };

  const handleOpenTokenList = (operation: string) => {
    setTokenListStatus({ isOpen: true, operation });
  };

  const handleCloseTokenList = async () => {
    setTokenListStatus({ isOpen: false, operation: "" });
  };

  const handleSelectLendToken = async (token: any) => {
    if (token.source == "Unilend") {
      setIsTokenLoading((prevLoading) => ({ ...prevLoading, borrow: true }));
      const borrowTokens = findBorrowToken(poolList, token?.address);
      setBorrowingTokens(borrowTokens);
      setIsTokenLoading((prevLoading) => ({ ...prevLoading, borrow: false }));
    } else {
    }
  };

  // TODO: check and remove
  const getProxy = async () => {
    const proxy = await getUserProxy(address);
    console.log("userProxyContract", proxy);
    setUserProxy(proxy);
  };

  const handleLTVSliderWithValue = (value: number) => {
    handleLTVSlider(
      value,
      lendAmount,
      selectedTokens,
      b2rRatio,
      setSelectedLTV,
      setBorrowAmount,
      setReceiveAmount
    );
  };

  const handleQuoteValue = async () => {
    await handleQuote(
      selectedTokensRef,
      address as string,
      chain,
      selectedTokens,
      isTokenLoading,
      setb2rRatio,
      setSelectedLTV,
      setQuoteError,
      setIsTokenLoading
    );
  };

  const handleBorrowSwapTransaction = async () => {
    await handleSwapTransaction(
      selectedTokens,
      address,
      lendAmount,
      unilendPool,
      borrowAmount,
      setIsBorrowProgressModal,
      setModalMsg,
      setOperationProgress,
      handleClear
    );
  };

  const handleBorrowToken = async (token: any) => {
    await handleSelectBorrowToken(
      token,
      isTokenLoading,
      poolList,
      selectedTokens,
      chain,
      address,
      selectedTokensRef,
      setIsTokenLoading,
      setSelectedTokens,
      setCurrentLTV,
      setSelectedLTV,
      setUnilendPool
    );
  };

  const handleTokensSelection = async (token: any) => {
    await handleTokenSelection(
      token,
      selectedTokens,
      tokenListStatus,
      address,
      isTokenLoading,
      setSelectedTokens,
      setTokenListStatus,
      setReceiveAmount,
      setIsTokenLoading,
      handleQuoteValue,
      handleSelectLendToken,
      handleBorrowToken
    );
  };

  const getCurrentOperationToken = (): any => {
    return getOprationToken(
      tokenListStatus,
      lendingTokens,
      compoundCollateralTokens,
      selectedTokens,
      borrowingTokens,
      baseTokens,
      uniSwapTokens
    );
  };

  const handleClear = () => {
    setLendAmount("");
    setBorrowAmount(0);
    setReceiveAmount("");
    setSelectedTokens({
      lend: null,
      borrow: null,
      receive: null,
    });
    setIsBorrowProgressModal(false);
    setOperationProgress(0);
    setCurrentLTV("0");
    setb2rRatio(0);
    setSelectedLTV(5);
  };

  useEffect(() => {
    if (selectedTokens.borrow !== null) {
      checkLiquidity(
        lendAmount,
        selectedTokens.borrow.source,
        unilendPool,
        selectedTokens,
        borrowAmount,
        setIsLowLiquidity
      );
    }
  }, [lendAmount, selectedLTV]);

  useEffect(() => {
    if (selectedTokens?.lend?.priceRatio) {
      handleLTVSliderWithValue(5);
    }
  }, [lendAmount, selectedTokens?.receive]);

  useEffect(() => {
    const tokensArray = Object.values(tokenList);
    setLendingTokens(tokensArray);
    if (Object.keys(unilendV2Data.poolList).length > 0) {
      setIsTokenLoading({ ...isTokenLoading, lend: false });
    }
  }, [unilendV2Data]);

  useEffect(() => {
    if (selectedTokens.receive !== null && !isTokenLoading.rangeSlider) {
      handleLTVSliderWithValue(currentLTV ? +currentLTV : 5);
      setSelectedLTV(currentLTV ? +currentLTV : 5);
    }
  }, [b2rRatio]);

  const checkLoading = (isTokenLoading: object) => {
    return Object.values(isTokenLoading).some((value) => value === true);
  };

  useEffect(() => {
    checkLoading(isTokenLoading);
  }, [isTokenLoading]);

  return (
    <>
      <div className='borrow_container'>
        <p className='paragraph06 label'>You Pay</p>
        <AmountContainer
          balance={truncateToDecimals(
            selectedTokens?.lend?.balanceFixed || 0,
            4
          ).toString()}
          value={lendAmount}
          onChange={(e: any) => handleLendAmount(e.target.value)}
          onMaxClick={() => setLendAmount(selectedTokens?.lend?.balanceFixed)}
          buttonText={selectedTokens?.lend?.symbol}
          onClick={() => handleOpenTokenList("lend")}
          isShowMaxBtn
        />
        <div className='swap_route'>
          <p className='paragraph06 '>You borrow</p>
          <ButtonWithDropdown
            buttonText={selectedTokens?.borrow?.symbol}
            onClick={
              selectedTokens?.lend !== null
                ? () => handleOpenTokenList("borrow")
                : () => {}
            }
            className={"transparent_btn"}
            title={
              selectedTokens?.lend === null ? "please select you pay token" : ""
            }
          />
        </div>
        <p className='paragraph06 label'>You Receive</p>
        <AmountContainer
          balance={truncateToDecimals(
            selectedTokens?.receive?.balanceFixed || 0,
            4
          ).toString()}
          value={Number(receiveAmount) > 0 ? receiveAmount : "0"}
          onChange={(e: any) => handleReceiveAmount(e.target.value)}
          onMaxClick={() => console.log("Max Clicked")}
          buttonText={selectedTokens?.receive?.symbol}
          onClick={
            selectedTokens?.borrow !== null && !isTokenLoading.pools 
              ? () => handleOpenTokenList("receive")
              : () => {}
          }
          title={
            selectedTokens?.borrow === null
              ? "please select you borrow token"
              : ""
          }
        />
        <div className='range_container'>
          <div>
            <p className='paragraph06 '>Current LTV</p>
            <p className='paragraph06'>{currentLTV}%</p>
          </div>
          <div>
            <p className='paragraph06 '>New LTV</p>
            <p className='paragraph06'>
              {selectedLTV}%/
              {unilendPool?.maxLTV || selectedTokens?.lend?.ltv || "75"}%
            </p>
          </div>
          <Slider
            value={selectedLTV}
            defaultValue={50}
            onChange={(value) => handleLTVSliderWithValue(value)}
            min={5}
            max={unilendPool?.maxLTV || selectedTokens?.lend?.ltv || 75}
            className='range_slider'
            disabled={
              isLowBal || quoteError || selectedTokens?.receive === null
            }
          />
        </div>

        <Button
          disabled={borrowBtn.disable}
          className='primary_btn'
          onClick={handleBorrowSwapTransaction}
          title='please slect you pay token'
          loading={isTokenLoading.pools || isTokenLoading.rangeSlider}
        >
          {borrowBtn.text}
        </Button>

        <AccordionContainer selectedTokens={selectedTokens}/>

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
          tokenList={getCurrentOperationToken()}
          onSelectToken={(token: any) => handleTokensSelection(token)}
          operation={ActiveOperation.BRROW}
          isTokenListLoading={isTokenLoading.lend}
          showPoolData={tokenListStatus.operation === "borrow" ? true : false}
          lendTokenSymbol={selectedTokens?.lend?.symbol}
        />
      </Modal>
      <Modal
        className='antd_popover_content'
        centered
        onCancel={() => handleBorrowModal(false)}
        open={isBorrowProgressModal}
        footer={null}
        closable={false}
      >
        <BorrowLoader msg={modalMsg} progress={operationProgress} />
      </Modal>
    </>
  );
}

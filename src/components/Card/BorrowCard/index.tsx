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
import {
  AccordionContainer,
  TokenListModal,
  AmountContainer,
  ButtonWithDropdown,
} from "../../Common";
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
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  CompoundBaseTokens,
  compoundCollateralTokens,
} from "../../../helpers/constants";

enum ActiveOperation {
  BRROW = "Borrow_Swap",
  REPAY = "Swap_Repay",
}

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

  const [uniQuote, setUniQuote] = useState({
    totalFee: 0,
    slippage: 0,
    path: [],
  });

  const isLowBal: boolean = +lendAmount > selectedTokens?.lend?.balanceFixed;
  const connectWallet = isConnected;

  const borrowBtn = getButtonAction(
    selectedTokens,
    lendAmount,
    isTokenLoading,
    quoteError,
    isLowLiquidity,
    isLowBal,
    connectWallet
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
    console.log("value", value);
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
      setIsTokenLoading,
      setUniQuote
    );
  };

  const handleBorrowSwapTransaction = async () => {
    await handleSwapTransaction(
      selectedTokens,
      address,
      lendAmount,
      unilendPool,
      borrowAmount,
      uniQuote.path,
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
      setLendAmount,
      setIsTokenLoading,
      handleQuoteValue,
      handleSelectLendToken,
      handleBorrowToken,
      setSelectedLTV
    );
  };

  const getCurrentOperationToken = (): any => {
    return getOprationToken(
      tokenListStatus,
      lendingTokens,
      compoundCollateralTokens,
      selectedTokens,
      borrowingTokens,
      CompoundBaseTokens,
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
    setCurrentLTV("0");
    setb2rRatio(0);
    setSelectedLTV(5);
    setTimeout(() => {
      setIsBorrowProgressModal(false);
      setOperationProgress(0);
    }, 3000);
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

  // useEffect(() => {
  //   if (selectedTokens?.lend?.priceRatio) {
  //     handleLTVSliderWithValue(5);
  //   }
  // }, [lendAmount, selectedTokens?.receive]);

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

  useEffect(() => {
    console.log("selectedTokens", selectedTokens);
  }, [selectedTokens]);

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
          // onClick={() => handleOpenTokenList("lend")}
          onClick={isConnected ? () => handleOpenTokenList("lend") : () => {}}
          isShowMaxBtn
          btnClass={!isConnected ? "disable_btn newbtn" : "visible"}
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
            className={selectedTokens?.borrow === null ? "transparent_btn" : ""}
            title={
              selectedTokens?.lend === null ? "please select you pay token" : ""
            }
            btnClass={
              selectedTokens?.lend === null ? "disable_btn newbtn" : "visible"
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
          btnClass={
            selectedTokens?.borrow === null ? "disable_btn newbtn" : "visible"
          }
        />
        <div className='range_container'>
          {/* <div>
            <p className='paragraph06 '>Current LTV</p>
            <p className='paragraph06'>{currentLTV}%</p>
          </div> */}
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
        {isConnected ? (
          <Button
            disabled={borrowBtn.disable}
            className='primary_btn'
            onClick={handleBorrowSwapTransaction}
            title='please select you pay token'
            loading={isTokenLoading.pools || isTokenLoading.rangeSlider}
          >
            {borrowBtn.text}
          </Button>
        ) : (
          <div className='connect-btn'>
            <ConnectButton />
          </div>
        )}
        <AccordionContainer
          selectedTokens={selectedTokens}
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

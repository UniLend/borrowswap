import React, { useEffect, useRef, useState } from "react";
import { Button, Slider, Modal } from "antd";
import {
  getAllowance,
  getBorrowTokenData,
  getCollateralTokenData,
  getPoolBasicData,
  getUserProxy,
  handleApproval,
  handleCompoundSwap,
  handleSwap,
} from "../../../api/contracts/actions";
import {
  debounce,
  decimal2Fixed,
  findBorrowToken,
  fixed2Decimals,
  getBorrowAmount,
  getButtonAction,
  getCompoundBorrowAmount,
  getCompoundCurrentLTV,
  getCurrentLTV,
  truncateToDecimals,
} from "../../../helpers";
import type { UnilendV2State } from "../../../states/store";
import { wagmiConfig } from "../../../main";
import { useSelector, useDispatch } from "react-redux";
import "./index.scss";
import useWalletHook from "../../../api/hooks/useWallet";
import TokenListModal from "../../Common/TokenListModal";
import AmountContainer from "../../Common/AmountContainer";
import ButtonWithDropdown from "../../Common/ButtonWithDropdown";
import { contractAddresses } from "../../../api/contracts/address";
import BorrowLoader from "../../Loader/BorrowLoader";
import { quote } from "../../../api/uniswap/quotes";
import { getQuote } from "../../../api/axios/calls";
import NotificationMessage from "../../Common/NotificationMessage";
import { checkLiquidity, handleLTVSlider, handleQuote } from "./utils";

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
  const [tokenAllowance, setTokenAllowance] = useState({
    token1: "0",
    token2: "0",
  });
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
  // TODO: add enum for below state;
  // const [borrowBtn, setBorrowBtn] = useState("Select you pay token");
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
    console.log("mylendToken", token);
    if (token.source == "Unilend") {
      setIsTokenLoading((prevLoading) => ({ ...prevLoading, borrow: true }));

      const borrowTokens = findBorrowToken(poolList, token?.address);

      setBorrowingTokens(borrowTokens);
      setIsTokenLoading((prevLoading) => ({ ...prevLoading, borrow: false }));
    } else {
    }
  };

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
      setReceiveAmount,
      getBorrowAmount,
      getCompoundBorrowAmount
    );
  };

  const handleQuoteValue = async () => {
    await handleQuote(
      selectedTokensRef,
      address as string,
      chain,
      setb2rRatio,
      setSelectedLTV,
      setQuoteError,
      selectedTokens,
      isTokenLoading,
      setIsTokenLoading
    );
  };

  // const handleLTVSlider = (value: number) => {
  //   setSelectedLTV(value);
  //   let borrowAmount = 0;
  //   if (selectedTokens.borrow.source == "Unilend") {
  //     borrowAmount = getBorrowAmount(
  //       lendAmount,
  //       value,
  //       selectedTokens.lend,
  //       selectedTokens.borrow
  //     );
  //   } else {
  //     borrowAmount = getCompoundBorrowAmount(
  //       lendAmount,
  //       value,
  //       selectedTokens.lend.collateralBalanceFixed,
  //       selectedTokens.borrow.BorrowBalanceFixed,
  //       selectedTokens.lend.price
  //     );
  //   }

  //   setBorrowAmount(borrowAmount);

  //   if (selectedTokens?.receive) {
  //     let receiveVal = borrowAmount * b2rRatio;
  //     if (isNaN(receiveVal) || receiveVal < 0) {
  //       receiveVal = 0;
  //     }
  //     setReceiveAmount(receiveVal.toString());
  //   }
  // };

  // const checkLiquidity = (lendAmount: string, source: string) => {
  //   const lendAmountNumber = parseFloat(lendAmount);

  //   if (!isNaN(lendAmountNumber) && lendAmountNumber > 0) {
  //     if (source === "Unilend") {
  //       let liquidity = { value: "", decimals: "" };
  //       if (unilendPool?.token0?.address === selectedTokens?.borrow?.address) {
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
  //       if (borrowAmount > truncateToDecimals(Number(fixedLiquidity) || 0, 9)) {
  //         setIsLowLiquidity(true);
  //       } else {
  //         setIsLowLiquidity(false);
  //       }
  //     } else {
  //       // TODO: write liquidity for compound
  //     }
  //   }
  // };

  useEffect(() => {
    if (address) {
      //handleCompoundSwap(address)
    }
    if (selectedTokens.borrow !== null) {
      // checkLiquidity(lendAmount, selectedTokens.borrow.source);
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
      // handleLTVSlider(5);
      handleLTVSliderWithValue(5);
    }
  }, [lendAmount, selectedTokens?.receive]);

  const handleSelectBorrowToken = async (token: any) => {
    console.log("source", token);

    if (token.source == "Unilend") {
      setIsTokenLoading({ ...isTokenLoading, pools: true });
      const tokenPool = Object.values(poolList).find((pool) => {
        if (
          (pool.token1.address == token.address &&
            pool.token0.address == selectedTokens.lend?.address) ||
          (pool.token0.address == token.address &&
            pool.token1.address == selectedTokens.lend?.address)
        ) {
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

      if (data.token0.address == selectedTokens.lend.address) {
        setSelectedTokens({
          ...selectedTokens,
          ["lend"]: { ...selectedTokens.lend, ...data.token0 },
          ["borrow"]: data.token1,
        });
        const currentLtv = getCurrentLTV(data.token1, data.token0);

        setCurrentLTV(currentLtv);

        if (+currentLtv != 0) {
          setSelectedLTV(+currentLtv);
        }
      } else {
        setSelectedTokens({
          ...selectedTokens,
          ["lend"]: { ...selectedTokens.lend, ...data.token1 },
          ["borrow"]: data.token0,
        });
        const currentLtv = getCurrentLTV(data.token0, data.token1);
        setCurrentLTV(currentLtv);
        if (+currentLtv != 0) {
          setSelectedLTV(+currentLtv);
        }
      }
      setUnilendPool(data);
      setIsTokenLoading({ ...isTokenLoading, pools: false });
    } else {
      setIsTokenLoading({ ...isTokenLoading, pools: true });
      const collateralToken = await getCollateralTokenData(
        selectedTokensRef?.current?.lend,
        address
      );
      const borrowedToken = await getBorrowTokenData(token, address);
      setIsTokenLoading({ ...isTokenLoading, pools: false });
      const ltv = getCompoundCurrentLTV(
        borrowedToken?.BorrowBalanceFixed,
        collateralToken?.collateralBalanceFixed,
        collateralToken?.price
      );
      setCurrentLTV(ltv);
      setSelectedTokens({
        ...selectedTokens,
        ["lend"]: { ...selectedTokensRef?.current?.lend, ...collateralToken },
        ["borrow"]: { ...selectedTokens.borrow, ...borrowedToken },
      });
    }
  };

  const getOprationToken = () => {
    if (tokenListStatus.operation === "lend") {
      const common: any = {};
      const tokenArray = [...lendingTokens, ...compoundCollateralTokens];
      for (const token of tokenArray) {
        if (common[String(token.address).toLocaleUpperCase()]) {
          common[String(token.address).toLocaleUpperCase()] = {
            ...token,
            ...common[token.address],
            availableIn: ["unilend", "compound"],
          };
        } else if (token.source == "Unilend") {
          common[String(token.address).toLocaleUpperCase()] = {
            ...token,
            availableIn: ["unilend"],
          };
        } else if (token.source == "Compound") {
          common[String(token.address).toLocaleUpperCase()] = {
            ...token,
            availableIn: ["compound"],
          };
        }
      }
      console.log("tokenOperatrion", common, tokenArray);

      return Object.values(common);
    } else if (tokenListStatus.operation === "borrow") {
      const tokensAvailableIn =
        Array.isArray(selectedTokens.lend.availableIn) &&
        selectedTokens.lend.availableIn;
      console.log("selectedTokens", selectedTokens, tokensAvailableIn);
      if (
        tokensAvailableIn.includes("unilend") &&
        tokensAvailableIn.includes("compound")
      ) {
        return [...borrowingTokens, ...baseTokens];
      } else if (tokensAvailableIn.includes("unilend")) {
        return [...borrowingTokens];
      } else if (tokensAvailableIn.includes("compound")) {
        return [...baseTokens];
      }
    } else if (tokenListStatus.operation === "receive") {
      return uniSwapTokens;
    } else {
      return [];
    }
  };

  const handleSwapTransaction = async () => {
    try {
      const lendToken = await getAllowance(selectedTokens?.lend, address);
      const borrowToken = await getAllowance(selectedTokens?.borrow, address);
      console.log("allowance", lendToken, borrowToken);

      setIsBorrowProgressModal(true);
      if (Number(lendAmount) > Number(lendToken.allowanceFixed)) {
        setModalMsg("Spend Aprroval for " + selectedTokens.lend.symbol);
        await handleApproval(selectedTokens?.lend.address, address, lendAmount);
        handleSwapTransaction();
      } else if (Number(10) > Number(borrowToken.allowanceFixed)) {
        setOperationProgress(1);
        setModalMsg("Spend Aprroval for " + selectedTokens.borrow.symbol);
        await handleApproval(selectedTokens?.borrow.address, address, 10);
        handleSwapTransaction();
      } else {
        setOperationProgress(2);
        setModalMsg(
          selectedTokens.lend.symbol +
            "-" +
            selectedTokens.borrow.symbol +
            "-" +
            selectedTokens?.receive?.symbol
        );
        let hash;
        if (selectedTokens.borrow.source == "Unilend") {
          hash = await handleSwap(
            lendAmount,
            unilendPool,
            selectedTokens,
            address,
            borrowAmount
          );
        } else {
          hash = await handleCompoundSwap(
            selectedTokens.lend.address,
            selectedTokens.borrow.address,
            selectedTokens.receive.address,
            decimal2Fixed(lendAmount, selectedTokens.lend.decimals),
            decimal2Fixed(borrowAmount, selectedTokens.borrow.decimals),
            address
          );
        }

        console.log("hash", hash);

        if (hash) {
          setOperationProgress(3);
          handleClear();
          setTimeout(() => {
            setIsBorrowProgressModal(false);
          }, 1000);
        }
      }
    } catch (error) {
      console.log("handleSwap", { error });
    }
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
  };

  useEffect(() => {
    const tokensArray = Object.values(tokenList);
    setLendingTokens(tokensArray);
    if (Object.keys(unilendV2Data.poolList).length > 0) {
      setIsTokenLoading({ ...isTokenLoading, lend: false });
    }
  }, [unilendV2Data]);

  const handleTokenSelection = async (token: any) => {
    setSelectedTokens({
      ...selectedTokens,
      [tokenListStatus.operation]: { ...token, map: true },
    });
    setTokenListStatus({ isOpen: false, operation: "" });
    const tokenBal = await getAllowance(token, address);
    console.log("tokenBal", tokenBal);

    if (tokenListStatus.operation == "lend") {
      handleSelectLendToken(token);
      setSelectedTokens({
        [tokenListStatus.operation]: { ...token, ...tokenBal },
        ["borrow"]: null,
        ["receive"]: null,
      });
      setReceiveAmount("");
    } else if (tokenListStatus.operation == "borrow") {
      console.log(token.address);
      handleSelectBorrowToken(token);
      setSelectedTokens({
        ...selectedTokens,
        [tokenListStatus.operation]: { ...token, ...tokenBal },
        ["receive"]: null,
      });
      setReceiveAmount("");
    } else if (tokenListStatus.operation == "receive") {
      setSelectedTokens({
        ...selectedTokens,
        [tokenListStatus.operation]: { ...token, ...tokenBal },
      });
      setIsTokenLoading({ ...isTokenLoading, rangeSlider: true });
      setReceiveAmount("");
      // handleQuote();
      handleQuoteValue();
    }
  };

  // const handleQuote = async () => {
  //   try {
  //     const value = await getQuote(
  //       decimal2Fixed(1, selectedTokensRef.current.borrow.decimals),
  //       address,
  //       selectedTokensRef.current.borrow.address,
  //       selectedTokensRef.current.receive.address,
  //       chain?.id == 16153 ? 137 : chain?.id
  //     );
  //     if (value?.quoteDecimals) {
  //       setb2rRatio(value?.quoteDecimals);
  //     }
  //     setQuoteError(false);
  //     setSelectedLTV(5); // TODO check
  //   } catch (error: any) {
  //     setQuoteError(true);
  //     NotificationMessage(
  //       "error",
  //       `Swap is not available for ${selectedTokens.receive.symbol}, please select different receive token.`
  //     );
  //   } finally {
  //     setIsTokenLoading({ ...isTokenLoading, rangeSlider: false });
  //   }
  // };

  useEffect(() => {
    if (selectedTokens.receive !== null && !isTokenLoading.rangeSlider) {
      // handleLTVSlider(currentLTV ? +currentLTV : 5);
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
          //   isTokensLoading={isLoading}
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
            selectedTokens?.borrow !== null
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
          onClick={handleSwapTransaction}
          title='please slect you pay token'
          loading={isTokenLoading.pools || isTokenLoading.rangeSlider}
        >
          {borrowBtn.text}
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
          operation={ActiveOperation.BRROW}
          isTokenListLoading={isTokenLoading.lend}
          showPoolData={tokenListStatus.operation === "borrow" ? true : false}
          lendTokenSymbol={selectedTokens?.lend?.symbol}
          //   poolData={tokenListStatus.operation === "receive" ? poolList : []}
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
        {/* TODO: updaet spend ans swap tokens here */}
        <BorrowLoader msg={modalMsg} progress={operationProgress} />
      </Modal>
    </>
  );
}

import React, { useEffect, useState } from "react";
import { Button, Slider, Modal } from "antd";
import {
  getAllowance,
  getPoolBasicData,
  getUserProxy,
  handleApproval,
  handleSwap,
} from "../../../api/contracts/actions";
import {
  debounce,
  decimal2Fixed,
  fixed2Decimals,
  getBorrowAmount,
  getButtonAction,
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

enum ActiveOperation {
  BRROW = "Borrow_Swap",
  REPAY = "Swap_Repay",
}

export default function BorrowCard({ uniSwapTokens }: any) {
  const unilendV2Data = useSelector((state: UnilendV2State) => state.unilendV2);
  const { tokenList, poolList } = unilendV2Data;
  const [tokenAllowance, setTokenAllowance] = useState({
    token1: "0",
    token2: "0",
  });
  const { address, isConnected, chain } = useWalletHook();
  const [lendAmount, setLendAmount] = useState("");
  const [modalMsg, setModalMsg] = useState('');
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
  const [selectedLTV, setSelectedLTV] = useState<number>(5);
  const [unilendPool, setUnilendPool] = useState(null as any | null);

  const [currentLTV, setCurrentLTV] = useState("0");
  const [b2rRatio, setb2rRatio] = useState(1);
  const [userProxy, setUserProxy] = useState(address);
  const [quoteError, setQuoteError] = useState(false);
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

  const borrowBtn = getButtonAction(
    selectedTokens,
    lendAmount,
    receiveAmount,
    isTokenLoading,
    quoteError,
    isLowLiquidity
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

  const handleSelectLendToken = (token: string) => {
    console.log("mylendToken", token)
    setIsTokenLoading((prevLoading) => ({ ...prevLoading, borrow: true }));

    const tokenPools = Object.values(poolList).filter((pool) => {
      if (pool.token0.address == token || pool.token1.address == token) {
        return true;
      }
    });
console.log("tokenPools", tokenPools)
    const borrowTokens = tokenPools.map((pool) => {
      if (pool.token0.address == token) {
        return {
          ...pool.token1,
          maxLTV: pool.maxLTV,
          borrowApy: pool.borrowApy0,
          pairToken: pool.token0,
        };
      } else {
        return {
          ...pool.token0,
          maxLTV: pool.maxLTV,
          borrowApy: pool.borrowApy1,
          pairToken: pool.token1,
        };
      }
    });

    setBorrowingTokens(borrowTokens);
    setIsTokenLoading((prevLoading) => ({ ...prevLoading, borrow: false }));
  };

  const handleLTV = (value: number) => {
    setSelectedLTV(value);
  };

  const getProxy = async () => {
    const proxy = await getUserProxy(address);
    console.log("userProxyContract", proxy);
    setUserProxy(proxy);
  };

  const handleLTVSlider = (value: number) => {
    setSelectedLTV(value);

    const borrowAmount = getBorrowAmount(
      lendAmount,
      currentLTV ? value - Number(currentLTV) : value,
      selectedTokens.lend,
      selectedTokens.borrow
    );
    setBorrowAmount(borrowAmount);

    if (selectedTokens?.receive) {
      let receiveVal = borrowAmount * b2rRatio;
      console.log("borrowAmount", borrowAmount);
      if (isNaN(receiveVal) || receiveVal < 0) {
        receiveVal = 0;
      }
      setReceiveAmount(receiveVal.toString());
    }
  };

  const checkLiquidity = (lendAmount: string) => {
    if (+lendAmount > 0) {
      let liquidity;
      if (unilendPool?.token0?.address === selectedTokens?.borrow?.address) {
        liquidity = unilendPool?.liquidity0;
      } else {
        liquidity = unilendPool?.liquidity1;
      }

      console.log("BORROW_AMOUNT", borrowAmount);
      console.log("LIQUIDITY_AMOUNT", truncateToDecimals(Number(liquidity), 9));
      // if (borrowAmount > truncateToDecimals(Number(liquidity), 9)) {
      if (borrowAmount > 1.3) {
        setIsLowLiquidity(true);
        console.log("LOW_LIQUITY");
      } else {
        setIsLowLiquidity(false);
      }
    }
    // console.log("BORROW_TOKEN", selectedTokens.borrow);
  };

  useEffect(() => {
    checkLiquidity(lendAmount);
  }, [lendAmount, b2rRatio]);

  // const debouncedHandleLTVSlider = debounce((value: number) => {
  //   setSelectedLTV(value);

  //   const borrowAmount = getBorrowAmount(
  //     lendAmount,
  //     currentLTV ? value - Number(currentLTV) : value,
  //     selectedTokens.lend,
  //     selectedTokens.borrow
  //   );
  //   setBorrowAmount(borrowAmount);

  //   if (selectedTokens?.receive) {
  //     let receiveVal = borrowAmount * b2rRatio;
  //     if (isNaN(receiveVal) || receiveVal < 0) {
  //       receiveVal = 0;
  //     }
  //     setReceiveAmount(receiveVal.toString());
  //   }
  // }, 300);

  // const handleLTVSlider = (value: number) => {
  //   debouncedHandleLTVSlider(value);
  // };

  useEffect(() => {
    // getProxy();

    if (selectedTokens?.lend?.priceRatio) {
      handleLTVSlider(5);
    }
  }, [lendAmount, selectedTokens?.receive]);

  const handleSelectBorrowToken = async (token: string) => {
    console.log(token)
    setIsTokenLoading({ ...isTokenLoading, pools: true });
    const tokenPool = Object.values(poolList).find((pool) => {
      if (
        (pool.token1.address == token &&
          pool.token0.address == selectedTokens.lend?.address) ||
        (pool.token0.address == token &&
          pool.token1.address == selectedTokens.lend?.address)
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
    console.log("data", data);

    if (data.token0.address == selectedTokens.lend.address) {
      setSelectedTokens({
        ...selectedTokens,
        ["lend"]: { ...selectedTokens.lend, ...data.token0 },
        ["borrow"]: data.token1,
      });
      const currentLtv = getCurrentLTV(data.token1, data.token0);

      setCurrentLTV(currentLtv);
      setSelectedLTV(+currentLtv);
      // handleLTV(Number(currentLtv));
    } else {
      setSelectedTokens({
        ...selectedTokens,
        ["lend"]: { ...selectedTokens.lend, ...data.token1 },
        ["borrow"]: data.token0,
      });
      const currentLtv = getCurrentLTV(data.token0, data.token1);
      setCurrentLTV(currentLtv);
      setSelectedLTV(+currentLtv);
      // handleLTV(Number(currentLtv));
    }
    console.log("POOL_DATA", data);
    setUnilendPool(data);
    setIsTokenLoading({ ...isTokenLoading, pools: false });
  };

  const getOprationToken = () => {
    if (tokenListStatus.operation === "lend") {
      return lendingTokens;
    } else if (tokenListStatus.operation === "borrow") {
      return borrowingTokens;
    } else if (tokenListStatus.operation === "receive") {
      // TODO: return receive tokens dynamically
      //   return receiveToken;
      return uniSwapTokens;
    } else {
      return [];
    }
  };

  const handleSwapTransaction = async () => {
    try {
      const lendToken = await getAllowance(selectedTokens?.lend, address);
      const borrowToken = await getAllowance(selectedTokens?.borrow, address);
      setIsBorrowProgressModal(true);
      if (Number(lendAmount) > Number(lendToken.allowanceFixed)) {
        setModalMsg("Spend Aprroval for " + selectedTokens.lend.symbol);
        await handleApproval(selectedTokens?.lend.address, address, lendAmount);

        handleSwapTransaction();
      } else if (Number(borrowAmount) > Number(borrowToken.allowanceFixed)) {
        setOperationProgress(1);
        setModalMsg("Spend Aprroval for " + selectedTokens.borrow.symbol);
        await handleApproval(
          selectedTokens?.borrow.address,
          address,
          borrowAmount
        );

        handleSwapTransaction();
      } else {
        setOperationProgress(2);
        setModalMsg(
          selectedTokens.lend.symbol +
            "-" +
            selectedTokens.borrow.symbol +
            "-" +
            selectedTokens.receive.symbol
        );
        const hash = await handleSwap(
          lendAmount,
          unilendPool,
          selectedTokens,
          address,
          borrowAmount
        );
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
      console.log("Error1", { error });
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
    // setBorrowBtn("Select you pay token");
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

    setSelectedTokens({
      ...selectedTokens,
      [tokenListStatus.operation]: { ...token, ...tokenBal },
    });

    if (tokenListStatus.operation == "lend") {
      handleSelectLendToken(token.address);
      setSelectedTokens({
        [tokenListStatus.operation]: { ...token, ...tokenBal },
        ["borrow"]: null,
        ["receive"]: null,
      });
      setReceiveAmount("");
    } else if (tokenListStatus.operation == "borrow") {
      console.log(token.address)
      handleSelectBorrowToken(token.address);
      setSelectedTokens({
        ...selectedTokens,
        [tokenListStatus.operation]: { ...token, ...tokenBal },
        ["receive"]: null,
      });
      setReceiveAmount("");
    } else {
      setSelectedTokens({
        ...selectedTokens,
        [tokenListStatus.operation]: { ...token, ...tokenBal },
      });
    }
  };

  const handleQuote = async () => {
    try {                                                                                                                                            
      const value = await getQuote(
        decimal2Fixed(1, selectedTokens.borrow.decimals),
        address,
        selectedTokens.borrow.address,
        // "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        selectedTokens.receive.address,
        chain?.id == 16153 ? 137 : chain?.id
      );
      if (value?.quoteDecimals) {
        setb2rRatio(value?.quoteDecimals);
      }
    } catch (error: any) {
      setQuoteError(true);
      NotificationMessage(
        "error",
        error?.message || "Error occurred in handleQuote"
      );
    } finally {
      setIsTokenLoading({ ...isTokenLoading, rangeSlider: false });
    }
  };

  useEffect(() => {
    if (selectedTokens?.receive && !tokenListStatus.isOpen) {
      setIsTokenLoading({ ...isTokenLoading, rangeSlider: true });
      setReceiveAmount("");
      handleQuote();
    }
  }, [selectedTokens]);

  useEffect(() => {
    if (selectedTokens.receive !== null && !isTokenLoading.rangeSlider) {
      handleLTVSlider(currentLTV ? +currentLTV : 5);
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
            // isTokensLoading={isTokenLoading.borrow}
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
          readonly
          //   isTokensLoading={isTokenLoading.pools}
        />
        <div className='range_container'>
          <div>
            <p className='paragraph06 '>Current LTV</p>
            <p className='paragraph06'>{currentLTV}%</p>
          </div>
          <div>
            <p className='paragraph06 '>New LTV</p>
            <p className='paragraph06'>
              {selectedLTV}%/{unilendPool?.maxLTV || "75"}%
            </p>
          </div>
          <Slider
            value={selectedLTV}
            defaultValue={50}
            onChange={(value) => handleLTVSlider(value)}
            min={5}
            max={unilendPool?.maxLTV || 75}
            className='range_slider'
          />
        </div>
        <Button
          // disabled={borrowBtn.text !== "Borrow"}
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

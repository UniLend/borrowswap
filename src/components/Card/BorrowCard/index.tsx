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

export default function BorrowCard({ isLoading, uniSwapTokens }: any) {
  const unilendV2Data = useSelector((state: UnilendV2State) => state.unilendV2);
  const { tokenList, poolList } = unilendV2Data;
  const [tokenAllowance, setTokenAllowance] = useState({
    token1: "0",
    token2: "0",
  });
  const { address, isConnected, chain } = useWalletHook();
  const [lendAmount, setLendAmount] = useState("");
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

  // TODO: add enum for below state;
  const [borrowBtn, setBorrowBtn] = useState("Select you pay token");
  const [isTokenLoading, setIsTokenLoading] = useState({
    // lend: isLoading,
    borrow: false,
    receive: false,
    pools: false,
    rangeSlider: false,
  });
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

  const handleCloseTokenList = async () => {
    if (selectedTokens?.receive) {
      setTokenListStatus({ isOpen: false, operation: "" });
    }
  };

  const handleSelectLendToken = (token: string) => {
    console.log("mylendToken", token)
    setIsTokenLoading((prevLoading) => ({ ...prevLoading, borrow: true }));
    console.log("istokenLoading_1", isTokenLoading);
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

    console.log("borrowTokens", borrowTokens);
    setBorrowingTokens(borrowTokens);
    setIsTokenLoading((prevLoading) => ({ ...prevLoading, borrow: false }));
    console.log("istokenLoading_2", isTokenLoading);
  };

  const handleLTVSlider = (value: number) => {
    setSelectedLTV(value);

    const borrowAmount = getBorrowAmount(
      lendAmount,
      currentLTV ? value - +currentLTV : value, // TODO fix error
      selectedTokens.lend,
      selectedTokens.borrow
    );
    // setBorrowAmount(borrowAmount);

    if (selectedTokens?.receive) {
      let receiveVal = borrowAmount * b2rRatio;
      if (isNaN(receiveVal) || receiveVal < 0) {
        receiveVal = 0;
      }
      setReceiveAmount(receiveVal.toString());
    }
  };

  useEffect(() => {
    if (selectedTokens?.lend?.priceRatio) {
      handleLTVSlider(5);
    }
  }, [lendAmount, selectedTokens?.receive]);

  const handleSelectBorrowToken = async (token: string) => {
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
        ["lend"]: data.token0,
        ["borrow"]: data.token1,
      });
      const currentLtv = getCurrentLTV(data.token1, data.token0);

      setCurrentLTV(currentLtv);
      setSelectedLTV(+currentLtv);
      // handleLTV(Number(currentLtv));
    } else {
      setSelectedTokens({
        ...selectedTokens,
        ["lend"]: data.token1,
        ["borrow"]: data.token0,
      });
      const currentLtv = getCurrentLTV(data.token0, data.token1);
      setCurrentLTV(currentLtv);
      setSelectedLTV(+currentLtv);
      // handleLTV(Number(currentLtv));
    }

    setUnilendPool(data);
    setIsTokenLoading({ ...isTokenLoading, pools: false });
  };

  const getOprationToken = () => {
    if (tokenListStatus.operation === "lend") {
      return lendingTokens;
    } else if (tokenListStatus.operation === "borrow") {
      return borrowingTokens;
    } else if (tokenListStatus.operation === "receive") {
      return uniSwapTokens;
    } else {
      return [];
    }
  };

  const handleSwapTransaction = async () => {
    setOperationProgress(0);
    try {
      const lendToken = await getAllowance(selectedTokens?.lend, address);
      const borrowToken = await getAllowance(selectedTokens?.borrow, address);
      setIsBorrowProgressModal(true);
      console.log("handleSwapTransaction", lendToken, borrowToken);

      if (Number(lendAmount) > Number(lendToken.allowanceFixed)) {
        await handleApproval(selectedTokens?.lend.address, address, lendAmount);
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

  useEffect(() => {
    const tokensArray = Object.values(tokenList);
    setLendingTokens(tokensArray);
  }, [unilendV2Data]);

  const handleTokenSelection = async (token: any) => {
    if (tokenListStatus.operation == "lend") {
      handleSelectLendToken(token.address);
      setSelectedTokens({
        [tokenListStatus.operation]: token,
        ["borrow"]: null,
        ["receive"]: null,
      });
      setReceiveAmount("");
    } else if (tokenListStatus.operation == "borrow") {
      console.log(token.address)
      handleSelectBorrowToken(token.address);
      setSelectedTokens({
        ...selectedTokens,
        [tokenListStatus.operation]: token,
        ["receive"]: null,
      });
      setReceiveAmount("");
    } else {
      setSelectedTokens({
        ...selectedTokens,
        [tokenListStatus.operation]: token,
      });
    }
    setTokenListStatus({ isOpen: false, operation: "" });
  };

  const handleQuote = async () => {
    try {
      const value = await getQuote(
        decimal2Fixed(1, selectedTokens.borrow.decimals),
        address,
        selectedTokens?.borrow?.address,
        selectedTokens?.receive?.address,
        chain?.id
      );
      if (value?.quoteDecimals) {
        setb2rRatio(value?.quoteDecimals);
      }
    } catch (error: any) {
      console.error("Error in handleQuote:", error);
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
    }
  }, [b2rRatio]);

  const checkLoading = (isTokenLoading: object) => {
    return Object.values(isTokenLoading).some((value) => value === true);
  };

  useEffect(() => {
    checkLoading(isTokenLoading);
  }, [isTokenLoading]);

  useEffect(() => {
    const { lend, borrow, receive } = selectedTokens;
    // TODO: confirm these messages
    switch (true) {
      case lend === null:
        setBorrowBtn("Select pay token");
        break;
      case lendAmount === "":
        setBorrowBtn("Enter pay token value");
        break;
      case borrow === null:
        setBorrowBtn("Select borrow token");
        break;
      case receive === null:
        setBorrowBtn("Select receive token");
        break;
      case isTokenLoading.rangeSlider:
        setBorrowBtn("Quote data loading");
        break;
      default:
        setBorrowBtn("Borrow");
    }
  }, [lendAmount, selectedTokens, isTokenLoading]);
  return (
    <>
      <div className='borrow_container'>
        <p className='paragraph06 label'>You Pay</p>
        <AmountContainer
          balance={selectedTokens?.lend?.balanceFixed}
          value={lendAmount}
          onChange={(e: any) => handleLendAmount(e.target.value)}
          onMaxClick={() => setLendAmount(selectedTokens?.lend?.balanceFixed)}
          buttonText={selectedTokens?.lend?.symbol}
          onClick={() => handleOpenTokenList("lend")}
          isShowMaxBtn
          isTokensLoading={isLoading}
        />
        <div className='swap_route'>
          <p className='paragraph06 '>You borrow</p>
          <ButtonWithDropdown
            buttonText={selectedTokens?.borrow?.symbol}
            onClick={
              selectedTokens?.lend !== null && lendAmount !== ""
                ? () => handleOpenTokenList("borrow")
                : () => {}
            }
            className={"transparent_btn"}
            title={
              selectedTokens?.lend === null ? "please select you pay token" : ""
            }
            isTokensLoading={isTokenLoading.borrow}
          />
        </div>
        <p className='paragraph06 label'>You Receive</p>
        <AmountContainer
          balance='125.25'
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
          disabled={borrowBtn !== "Borrow"}
          className='primary_btn'
          onClick={handleSwapTransaction}
          title='please slect you pay token'
        >
          {borrowBtn}
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
          isTokenListLoading={isLoading}
          showPoolData={tokenListStatus.operation === "borrow" ? true : false}
          //   poolData={tokenListStatus.operation === "receive" ? poolList : []}
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
        {/* TODO: updaet spend ans swap tokens here */}
        <BorrowLoader
          spendToken={"UFT"}
          SwapToken={"UFT"}
          progress={operationProgress}
        />
      </Modal>
    </>
  );
}

import React, { useEffect, useState } from "react";
import { Input, Button, Slider, Modal } from "antd";
import { FaChevronDown } from "react-icons/fa";
import { erc20Abi } from "viem";
import { useWriteContract, useAccount, useReadContract } from "wagmi";
import {
  getAllowance,
  getPoolBasicData,
  handleApproval,
  handleSwap,
} from "../../api/contracts/actions";
import {
  decimal2Fixed,
  fixed2Decimals,
  getBorrowAmount,
  getCurrentLTV,
} from "../../helpers";
import type { UnilendV2State } from "../../states/store";
import { wagmiConfig } from "../../main";
import { useSelector, useDispatch } from "react-redux";
import "./index.scss";
import useWalletHook from "../../api/hooks/useWallet";
import TokenListModal from "../Common/TokenListModal";
import AmountContainer from "../Common/AmountContainer";
import ButtonWithDropdown from "../Common/ButtonWithDropdown";
import { contractAddresses } from "../../api/contracts/address";
import BorrowLoader from "../Loader/BorrowLoader";
import { quote } from "../../api/uniswap/quotes";
import { getQuote } from "../../api/axios/calls";

enum ActiveOperation {
  BRROW = "Borrow_Swap",
  REPAY = "Swap_Repay",
}

export default function Card() {
  const unilendV2Data = useSelector((state: UnilendV2State) => state.unilendV2);
  const [activeOperation, setActiveOperation] = useState<ActiveOperation>(
    ActiveOperation.BRROW
  );
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

  const handleLendAmount = (amount: string) => {
    setLendAmount(amount);
  };

  const handleReceiveAmount = (amount: string) => {
    setReceiveAmount(amount);
  };

  const handleLTV = (value: number) => {
    setSelectedLTV(value);
  };

  const handleOpenTokenList = (operation: string) => {
    setTokenListStatus({ isOpen: true, operation });
  };

  const handleSwitchOperation = (operation: ActiveOperation) => {
    setActiveOperation(operation);
  };

  const handleSelectLendToken = (token: string) => {
    const tokenPools = Object.values(poolList).filter((pool) => {
      if (pool.token0.address == token || pool.token1.address == token) {
        return true;
      }
    });

    const borrowTokens = tokenPools.map((pool) => {
      if (pool.token0.address == token) {
        return pool.token1;
      } else {
        return pool.token0;
      }
    });

    setBorrowingTokens(borrowTokens);
  };

  const handleLTVSlider = (value: number) => {
    if (selectedLTV > Number(unilendPool.maxLTV)) {
      setSelectedLTV(Number(unilendPool.maxLTV) - 1);
    } else if (selectedLTV == Number(currentLTV)) {
      setSelectedLTV(selectedLTV - 1);
    } else {
      setSelectedLTV(value);
    }

    const borrowAmount = getBorrowAmount(
      lendAmount,
      value,
      selectedTokens.lend,
      selectedTokens.borrow
    );
    setBorrowAmount(borrowAmount);
    setReceiveAmount((borrowAmount * b2rRatio).toString());
  };

  const handleSelectBorrowToken = async (token: string) => {
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
        ["lend"]: data.token0,
        ["borrow"]: data.token1,
      });
      const currentLtv = getCurrentLTV(data.token1, data.token0);

      setCurrentLTV(currentLtv);
      handleLTV(Number(currentLtv));
    } else {
      setSelectedTokens({
        ...selectedTokens,
        ["lend"]: data.token1,
        ["borrow"]: data.token0,
      });
      const currentLtv = getCurrentLTV(data.token0, data.token1);
      setCurrentLTV(currentLtv);
      handleLTV(Number(currentLtv));
    }

    setUnilendPool(data);
  };

  const getOprationToken = () => {
    if (tokenListStatus.operation === "lend") {
      return lendingTokens;
    } else if (tokenListStatus.operation === "borrow") {
      return borrowingTokens;
    } else if (tokenListStatus.operation === "receive") {
      // TODO: return receive tokens
      return [];
    } else {
      return [];
    }
  };

  const handleCloseTokenList = () => {
    setTokenListStatus({ isOpen: false, operation: "" });
  };

  const handleSwapTransaction = async () => {
    const hash = await handleSwap(lendAmount);
    // setIsBorrowProgressModal(true);
  };

  useEffect(() => {
    const tokensArray = Object.values(tokenList);
    setLendingTokens(tokensArray);
  }, [unilendV2Data]);

  const handleTokenSelection = (token: any) => {
    setSelectedTokens({
      ...selectedTokens,
      [tokenListStatus.operation]: token,
    });

    if (tokenListStatus.operation == "lend") {
      handleSelectLendToken(token.address);
    } else if (tokenListStatus.operation == "borrow") {
      handleSelectBorrowToken(token.address);
    }
    setTokenListStatus({ isOpen: false, operation: "" });
  };

  const handleQuote = async () => {
    try {
      const value = await getQuote(
        decimal2Fixed(1, selectedTokens.borrow.decimals),
        address,
        selectedTokens.borrow.address,
        "0xdac17f958d2ee523a2206206994597c13d831ec7",
        chain?.id
      );
      setb2rRatio(value?.quoteDecimals);
    } catch (error) {
      console.log("error", { error });
    }
  };

  useEffect(() => {
    if (selectedTokens?.borrow) {
      handleQuote();
    }
  }, [selectedTokens?.borrow]);

  return (
    <div className='swap_card_component'>
      <div className='swap_card'>
        <div className='tab_switcher'>
          <Button
            onClick={() => handleSwitchOperation(ActiveOperation.BRROW)}
            className={`tab_btn ${
              activeOperation === "Borrow_Swap" ? "active" : ""
            }`}
          >
            Borrow & Swap
          </Button>
          <Button
            onClick={() => handleSwitchOperation(ActiveOperation.REPAY)}
            className={`tab_btn ${
              activeOperation === "Swap_Repay" ? "active" : ""
            }`}
          >
            Swap & Repay
          </Button>
        </div>
        {/*  */}
        {activeOperation === ActiveOperation.BRROW && (
          <>
            <p className='paragraph06 label'>You Pay</p>
            <AmountContainer
              balance={selectedTokens?.lend?.balanceFixed}
              value={lendAmount}
              onChange={(e: any) => handleLendAmount(e.target.value)}
              onMaxClick={() => console.log("Max Clicked")}
              buttonText={selectedTokens?.lend?.symbol}
              onClick={() => handleOpenTokenList("lend")}
              isShowMaxBtn
            />
            <div className='swap_route'>
              <p className='paragraph06 '>You borrow</p>
              <ButtonWithDropdown
                buttonText={selectedTokens?.borrow?.symbol}
                onClick={() => handleOpenTokenList("borrow")}
                className={"transparent_btn"}
              />
            </div>
            <p className='paragraph06 label'>You Receive</p>
            <AmountContainer
              balance='125.25'
              value={receiveAmount}
              onChange={(e: any) => handleReceiveAmount(e.target.value)}
              onMaxClick={() => console.log("Max Clicked")}
              buttonText={selectedTokens?.receive?.symbol}
              onClick={() => handleOpenTokenList("receive")}
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
                onChange={(value) => handleLTV(value)}
                min={5}
                max={unilendPool?.maxLTV || 75}
                className='range_slider'
              />
            </div>
            <Button className='primary_btn' onClick={handleSwapTransaction}>
              Borrow
            </Button>
          </>
        )}
        {activeOperation === ActiveOperation.REPAY && (
          <>
            <div className='swap_route'>
              <p className='paragraph06 '>Select Pool</p>
              <ButtonWithDropdown
                buttonText={selectedTokens?.borrow?.symbol}
                onClick={() => handleOpenTokenList("borrow")}
                className={"transparent_btn"}
              />
            </div>
            <p className='paragraph06 label'>You Pay</p>
            <AmountContainer
              balance='125.25'
              value={lendAmount}
              onChange={(e: any) => handleLendAmount(e.target.value)}
              onMaxClick={() => console.log("Max Clicked")}
              buttonText={selectedTokens?.lend?.symbol}
              onClick={() => handleOpenTokenList("lend")}
            />
            <p className='paragraph06 label'>You Receive</p>
            <AmountContainer
              balance='125.25'
              value={receiveAmount}
              onChange={(e: any) => handleReceiveAmount(e.target.value)}
              onMaxClick={() => console.log("Max Clicked")}
              buttonText={selectedTokens?.receive?.symbol}
              onClick={() => handleOpenTokenList("receive")}
              isShowMaxBtn
            />
            <Button className='primary_btn' onClick={handleSwapTransaction}>
              Borrow
            </Button>
          </>
        )}
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
          operation={activeOperation}
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
        <BorrowLoader spendToken={"UFT"} SwapToken={"UFT"} progress={2} />
      </Modal>
    </div>
  );
}

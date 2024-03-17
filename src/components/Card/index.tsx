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
import { getQuote, uniswapTokensData } from "../../api/axios/calls";
import NotificationMessage from "../Common/NotificationMessage";
import BorrowCard from "./BorrowCard";
import RepayCard from "./RepayCard";

enum ActiveOperation {
  BRROW = "Borrow_Swap",
  REPAY = "Swap_Repay",
}

export default function Card({ isLoading }: any) {
  const unilendV2Data = useSelector((state: UnilendV2State) => state.unilendV2);
  const { tokenList, poolList } = unilendV2Data;
  const { chainId } = useWalletHook();
  console.log({ tokenList, poolList }, { chainId });
  const [activeOperation, setActiveOperation] = useState<ActiveOperation>(
    ActiveOperation.BRROW
  );
  const [uniSwapTokens, setUniSwapTokens] = useState([]);

  const handleSwitchOperation = (operation: ActiveOperation) => {
    setActiveOperation(operation);
  };

  const getUniswapTokens = async (chainId: number) => {
    const data = await uniswapTokensData(chainId);
    setUniSwapTokens(data);
  };

  useEffect(() => {
    if (chainId) {
      getUniswapTokens(chainId);
    }
  }, [chainId]);

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
          <BorrowCard isLoading={isLoading} uniSwapTokens={uniSwapTokens} />
        )}
        {activeOperation === ActiveOperation.REPAY && (
          <RepayCard uniSwapTokens={uniSwapTokens} />
        )}
      </div>
      {/* <Modal
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
          isTokenListLoading={isLoading}
          showPoolData={tokenListStatus.operation === "receive" ? true : false}
          poolData={
            tokenListStatus.operation === "receive" ? poolList : unilendPool
          }
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
        <BorrowLoader
          spendToken={"UFT"}
          SwapToken={"UFT"}
          progress={operationProgress}
        />
      </Modal> */}
    </div>
  );
}

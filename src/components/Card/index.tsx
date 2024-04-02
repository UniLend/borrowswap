import React, { useEffect, useState } from "react";
import { Button } from "antd";
import type { UnilendV2State } from "../../states/store";
import { useSelector } from "react-redux";
import "./index.scss";
import useWalletHook from "../../api/hooks/useWallet";
import BorrowCard from "./BorrowCard";
import RepayCard from "./RepayCard";
import { uniswapTokensData } from "../../api/axios/calls";

enum ActiveOperation {
  BRROW = "Borrow_Swap",
  REPAY = "Swap_Repay",
}

export default function Card({ isLoading }: any) {
  const unilendV2Data = useSelector((state: UnilendV2State) => state.unilendV2);
  const { tokenList, poolList } = unilendV2Data;
  const { chainId } = useWalletHook();
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
    </div>
  );
}

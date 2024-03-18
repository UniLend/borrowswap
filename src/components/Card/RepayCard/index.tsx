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

enum ActiveOperation {
  BRROW = "Borrow_Swap",
  REPAY = "Swap_Repay",
}

export default function RepayCard({ uniSwapTokens }: any) {
  const isLoading = false; //TODO
  const unilendV2Data = useSelector((state: UnilendV2State) => state.unilendV2);
  const { tokenList, poolList } = unilendV2Data;

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
    pool: null,
    lend: null,
    receive: null,
  });

  const [unilendPool, setUnilendPool] = useState(null as any | null);
  console.log("unilendPool", unilendPool);

  // TODO: add enum for below state;
  const [repayBtn, setRepayBtn] = useState("Select you pay token");
  const [isTokenLoading, setIsTokenLoading] = useState({
    // lend: isLoading,
    // borrow: false,
    // receive: false,
    pool: false,
    lend: false,
    recieve: false,
    pools: false,
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

  const getOprationToken = () => {
    if (tokenListStatus.operation === "pool") {
      return lendingTokens;
    } else if (tokenListStatus.operation === "lend") {
      return uniSwapTokens;
    } else if (tokenListStatus.operation === "receive") {
      // TODO: get from props
    } else {
      return [];
    }
  };

  const handleCloseTokenList = () => {
    setTokenListStatus({ isOpen: false, operation: "" });
  };

  // TODO: replace with REPAY
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

  const handleTokenSelection = (token: any) => {
    setSelectedTokens({
      ...selectedTokens,
      [tokenListStatus.operation]: token,
    });

    if (tokenListStatus.operation == "pool") {
      //   handleSelectLendToken(token.address);
    } else if (tokenListStatus.operation == "lend") {
      //   handleSelectBorrowToken(token.address);
    }
    setTokenListStatus({ isOpen: false, operation: "" });
  };

  const checkLoading = (isTokenLoading: object) => {
    return Object.values(isTokenLoading).some((value) => value === true);
  };

  // TODO loading state
  useEffect(() => {
    checkLoading(isTokenLoading);
  }, [isTokenLoading]);

  // TODO: btn states
  useEffect(() => {
    const { pool, lend, receive } = selectedTokens;
    // TODO: confirm these messages
    switch (true) {
      case pool === null:
        setRepayBtn("Select your pool");
        break;
      case lendAmount === "":
        setRepayBtn("Enter you pay value");
        break;
      case lend === null:
        setRepayBtn("Select your lend token");
        break;
      case receive === null:
        setRepayBtn("Select your receive token");
        break;
      default:
        setRepayBtn("Repay");
    }
  }, [lendAmount, selectedTokens]);
  return (
    <>
      <div className="repay_container">
        <div className="swap_route">
          <p className="paragraph06 ">Select Pool</p>
          <ButtonWithDropdown
            buttonText={selectedTokens?.pool?.symbol}
            onClick={() => handleOpenTokenList("pool")}
            className={"transparent_btn"}
          />
        </div>
        <p className="paragraph06 label">You Pay</p>
        <AmountContainer
          balance="125.25"
          value={lendAmount}
          onChange={(e: any) => handleLendAmount(e.target.value)}
          onMaxClick={() => console.log("Max Clicked")}
          buttonText={selectedTokens?.lend?.symbol}
          onClick={() => handleOpenTokenList("lend")}
        />
        <p className="paragraph06 label">You Receive</p>
        <AmountContainer
          balance="125.25"
          value={receiveAmount}
          onChange={(e: any) => handleReceiveAmount(e.target.value)}
          onMaxClick={() => console.log("Max Clicked")}
          buttonText={selectedTokens?.receive?.symbol}
          onClick={() => handleOpenTokenList("receive")}
          isShowMaxBtn
        />

        <Button
          disabled={repayBtn !== "Repay"}
          className="primary_btn"
          onClick={handleSwapTransaction}
          title="please slect you pay token"
          loading={isTokenLoading.pools}
        >
          {repayBtn}
        </Button>
      </div>
      <Modal
        className="antd_modal_overlay"
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
          isTokenListLoading={isLoading}
          showPoolData={tokenListStatus.operation === "pool" ? true : false}
          poolData={
            tokenListStatus.operation === "pool" ? poolList : unilendPool
          }
        />
      </Modal>
      <Modal
        className="antd_popover_content"
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

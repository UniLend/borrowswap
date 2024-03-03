import React, { useEffect, useState } from "react";
import { Input, Button, Slider, Modal } from "antd";
import { FaChevronDown } from "react-icons/fa";
import { erc20Abi } from "viem";
import { useWriteContract, useAccount, useReadContract } from "wagmi";
import {
  getAllowance,
  handleApproval,
  handleSwap,
} from "../../api/contracts/actions";
import { fixed2Decimals } from "../../helpers";
import type { UnilendV2State } from "../../states/store";
import { wagmiConfig } from "../../main";
import { useSelector, useDispatch } from "react-redux";
import "./index.scss";
import useWalletHook from "../../api/hooks/useWallet";
import TokenListModal from "../Common/TokenListModal";
import AmountContainer from "../Common/AmountContainer";
import ButtonWithDropdown from "../Common/ButtonWithDropdown";

export default function Card() {
  const unilendV2Data = useSelector((state: UnilendV2State) => state.unilendV2);
  const { tokenList, poolList } = unilendV2Data;
  const [tokenAllowance, setTokenAllowance] = useState({
    token1: "0",
    token2: "0",
  });
  const { address, isConnected } = useWalletHook();
  const [lendAmount, setLendAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");

  const [lendingTokens, setLendingTokens] = useState<Array<any>>([]);
  const [borrowingTokens, setBorrowingTokens] = useState<Array<any>>([]);
  const [lendToken, setLendToken] = useState({ address: "" });
  const [tokenListStatus, setTokenListStatus] = useState({
    isOpen: false,
    operation: "",
  });
  const [selectedTokens, setSelectedTokens] = useState<any>({
    lend: null,
    borrow: null,
    receive: null,
  });
  const [selectedLTV, setSelectedLTV] = useState<number>(0);
  console.log("selectedTokens", selectedTokens);

  const handleLendAmount = (amount: string) => {
    setLendAmount(amount);
  };

  const handleReceiveAmount = (amount: string) => {
    setReceiveAmount(amount);
  };

  const handleLTV = (value: number) => {
    setSelectedLTV(value);
  };

  const handleSelectLendToken = (token: string) => {
    const lendToken = tokenList[token.toUpperCase() as keyof typeof tokenList];
    setLendToken(lendToken);
    console.log(lendToken, token, tokenList);

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

  const handleSelectBorrowToken = (token: string) => {
    const borrowToken =
      tokenList[token.toUpperCase() as keyof typeof tokenList];

    const tokenPools = Object.values(poolList).find((pool) => {
      if (
        (pool.token1.address == token &&
          pool.token0.address == lendToken?.address) ||
        (pool.token0.address == token &&
          pool.token1.address == lendToken?.address)
      ) {
        return true;
      }
    });

    console.log(borrowToken, tokenPools);
  };

  const handleAllowance = async (tokenAddress: string) => {
    const hash = await handleApproval(tokenAddress, address, lendAmount);
  };

  const handleSwapTransaction = async () => {
    const hash = await handleSwap(lendAmount);
  };
  const checkAllowance = async () => {
    const token1Allowance = await getAllowance(
      "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
      address
    );
    const token2Allowance = await getAllowance(
      "0x172370d5cd63279efa6d502dab29171933a610af",
      address
    );

    console.log(token1Allowance, token2Allowance);
    setTokenAllowance({
      token1: fixed2Decimals(token1Allowance).toString(),
      token2: token2Allowance,
    });
  };

  const handleOpenTokenList = (operation: string) => {
    setTokenListStatus({ isOpen: true, operation });
  };

  const handleCloseTokenList = () => {
    setTokenListStatus({ isOpen: false, operation: "" });
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

  const handleTokenSelection = (token: any) => {
    setSelectedTokens({
      ...selectedTokens,
      [tokenListStatus.operation]: token,
    });
    setTokenListStatus({ isOpen: false, operation: "" });
  };

  useEffect(() => {
    console.log("unilend", unilendV2Data);

    const tokensArray = Object.values(tokenList);

    setLendingTokens(tokensArray);
  }, [unilendV2Data]);

  return (
    <div className='swap_card_component'>
      <div className='swap_card'>
        <p className='paragraph06 label'>You Pay</p>
        <AmountContainer
          balance='125.25'
          value={lendAmount}
          onChange={(e: any) => handleLendAmount(e.target.value)}
          onMaxClick={() => console.log("Max Clicked")}
          buttonText={selectedTokens?.lend?.symbol}
          onClick={() => handleOpenTokenList("lend")}
        />
        <div className='swap_route'>
          <p className='paragraph06 '>You borrow</p>
          <ButtonWithDropdown
            buttonText={selectedTokens?.borrow?.symbol}
            onClick={() => handleOpenTokenList("borrow")}
          />
        </div>
        {/*  */}
        <p className='paragraph06 label you_receive'>You Receive</p>
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
            <p className='paragraph06 '>New LTV</p>
            <p className='paragraph06'>{selectedLTV}%/75%</p>
          </div>
          <Slider
            value={selectedLTV}
            defaultValue={50}
            onChange={() => handleLTV}
            min={5}
            max={80}
            className='range_slider'
          />
        </div>
        <div className='button_container'>
          {Number(lendAmount) > 0 ? (
            Number(lendAmount) > Number(tokenAllowance.token1) ||
            Number(lendAmount) > Number(tokenAllowance.token2) ? (
              <>
                <Button
                  className={`${
                    Number(lendAmount) < Number(tokenAllowance.token1)
                      ? "approved"
                      : ""
                  }`}
                  onClick={() =>
                    handleAllowance(
                      "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a"
                    )
                  }
                >
                  {Number(lendAmount) < Number(tokenAllowance.token1)
                    ? "Approved"
                    : "Approve 1"}
                </Button>
                <Button
                  className={`${
                    Number(lendAmount) < Number(tokenAllowance.token2)
                      ? "approved"
                      : ""
                  }`}
                  onClick={() =>
                    handleAllowance(
                      "0x172370d5cd63279efa6d502dab29171933a610af"
                    )
                  }
                >
                  {Number(lendAmount) < Number(tokenAllowance.token2)
                    ? "Approved"
                    : "Approve 2"}
                </Button>
              </>
            ) : (
              <Button onClick={handleSwapTransaction}>Borrow</Button>
            )
          ) : (
            <Button className='primary_btn' disabled>
              Enter Amount
            </Button>
          )}
        </div>
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
        />
      </Modal>
    </div>
  );
}

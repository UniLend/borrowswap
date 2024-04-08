import React, { useEffect, useState } from "react";
import { Button, Slider, Modal } from "antd";
import {
  getAllowance,
  getPoolBasicData,
  handleApproval,
  handleRepay,
  handleCompoundRepay,
  getBorrowTokenData
} from "../../../api/contracts/actions";
import {
  decimal2Fixed,
  truncateToDecimals,
  getRepayBtnActions,
  findBorrowToken
} from "../../../helpers";

import type { UnilendV2State } from "../../../states/store";

import { useSelector } from "react-redux";
import "./index.scss";
import useWalletHook from "../../../api/hooks/useWallet";
import PoolListModel from "../../Common/PoolListModel";
import TokenListModal from "../../Common/TokenListModal";
import AmountContainer from "../../Common/AmountContainer";
import ButtonWithDropdown from "../../Common/ButtonWithDropdown";
import { contractAddresses } from "../../../api/contracts/address";
import BorrowLoader from "../../Loader/BorrowLoader";
import { getQuote } from "../../../api/axios/calls";
import NotificationMessage from "../../Common/NotificationMessage";

enum ActiveOperation {
  BRROW = "Borrow_Swap",
  REPAY = "Swap_Repay",
}

const compoundColleteralTokens = [
  {
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    symbol: "WETH",
    name: "wrap eth",
    decimals: 18,
    source: "Compound",
    // logo: "https://assets.coingecko.com/coins/images/14243/small/aUSDT.78f5faae.png?1615528400"
  },
];


const baseTokens = [

  {
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    symbol: "USDC",
    name: "USDC",
    decimals: 6,
    source: "Compound",
    
  },
];


export default function RepayCard({ uniSwapTokens }: any) {
  const unilendV2Data = useSelector((state: UnilendV2State) => state.unilendV2);
  const { tokenList, poolList, positions } = unilendV2Data;
  // const { tokenList, poolList } = unilendV2Data;
  
  // console.log("PoolList", poolList);


 

  const { address, isConnected, chain } = useWalletHook();
  const [lendAmount, setLendAmount] = useState<string>("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [b2rRatio, setb2rRatio] = useState(1);
  const [tokens, setTokens] = useState(uniSwapTokens);
  const [isBorrowProgressModal, setIsBorrowProgressModal] =
    useState<boolean>(false);
  const [pools, setPools] = useState<Array<any>>([]);
  const [repayToken, setRepayToken] = useState<Array<any>>([]);
  const [modalMsg, setModalMsg] = useState("");
  const [quoteError, setQuoteError] = useState<boolean>(false);
  //sorted Specific tokens acording to our choice
  const sortedToken = ["USDT", "USDC", "WETH"];
  useEffect(() => {
    const customSort = (a: any, b: any) => {
      const aIndex = sortedToken.indexOf(a.symbol);
      const bIndex = sortedToken.indexOf(b.symbol);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      } else if (aIndex !== -1) {
        return -1;
      } else if (bIndex !== -1) {
        return 1;
      } else {
        return a.symbol.localeCompare(b.symbol);
      }
    };

    const sortedTokens = [...tokens].sort(customSort);
    if (!arraysEqual(sortedTokens, tokens)) {
      setTokens(sortedTokens);
    }
  }, [tokens, sortedToken]);
  function arraysEqual(a: any, b: any) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

const borrowToken = baseTokens;

const borrow = () => {
  return new Promise((resolve, reject) => {
    getBorrowTokenData(borrowToken, address)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

borrow().then((borrowTokens) => {
  console.log('borrowTokens', borrowTokens);
});


  //select data state
  const [selectedData, setSelectedData] = useState<any>({
    pool: null,
    lend: null,
    receive: null,
    borrow: null,
  });

  console.log("selectedData", selectedData);

  //open  diffrent modal dynamically
  const [tokenListStatus, setTokenListStatus] = useState({
    isOpen: false,
    operation: "",
  });

  const [isTokenLoading, setIsTokenLoading] = useState({
    positions: true,
    pool: false,
    lend: false,
    receive: false,
    quotation: false,
  });
  const [unilendPool, setUnilendPool] = useState(null as any | null);

  // TODO: add enum for below state;
  // const [repayBtn, setRepayBtn] = useState("Select you pay token");

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

  useEffect(() => {
    const poolsArray = Object.values(poolList);
    setPools(poolsArray);
    if (Object.keys(unilendV2Data.poolList).length > 0) {
      setIsTokenLoading({ ...isTokenLoading, positions: false });
    }
  }, [unilendV2Data]);

  const repayButton = getRepayBtnActions(
    selectedData,
    isTokenLoading,
    quoteError
  );

  const getOprationToken = () => {
    if (tokenListStatus.operation === "pool") {
        console.log("tokenOperatrion", [
        ...baseTokens,
      ]);

      return [positions ,  baseTokens];
    } else if (tokenListStatus.operation === "lend") {
      return tokens;
    } else if (tokenListStatus.operation === "receive") {
      return;
    } else {
      return [];
    }
  };




  const handleCloseTokenList = () => {
    setTokenListStatus({ isOpen: false, operation: "" });
  };

const selectedcompundData = {
    "pool": {
        "borrowToken": {
            "decimals": 18,
            "id": "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
            "name": "SushiToken (PoS)",
            "symbol": "SUSHI"
        },
        "otherToken": {
            "id": "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
            "decimals": 6,
            "name": "USD Coin",
            "symbol": "USDC",
            "priceUSD": "100000000"
        },
        "pool": "0x2e3204ee5ef49543671e7062aea4f42f389faea3",
        "positionId": "11"
    },
    "lend": {
        "chainId": 137,
        "address": "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        "name": "Polygon Bridged USDT  Polygon ",
        "symbol": "USDT",
        "decimals": 6,
        "logoURI": "https://assets.coingecko.com/coins/images/35023/thumb/USDT.png?1707233644",
        "allowance": "63368740735194260",
        "allowanceFixed": 63368740735.19426,
        "balance": "622408",
        "balanceFixed": 0.622408
    },
    "receive": {
        "symbol": "WETH",
        "name": "WETH",
        "poolCount": "1",
        "lentCount": "0",
        "borrowCount": "0",
        "id": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        "txCount": "0",
        "totalPoolsLiquidityUSD": "0",
        "totalPoolsLiquidity": "0",
        "decimals": 6,
        "source": "Unilend",
        "address": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        "logo": "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389",
        "priceUSD": 5.989515048596811,
        "pricePerToken": 0.9982525080994685,
        "priceRatio": 0.6035931894206918,
        "balance": "567262",
        "balanceFixed": 5.67262e-13,
        "allowance": "1000000",
        "allowanceFixed": "1e-12",
        "borrowBalance": "0",
        "borrowBalanceFixed": 0,
        "borrowShare": "0",
        "borrowSharefixed": 0,
        "healthFactor18": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        "healthFactorFixed": 1.157920892373162e+59,
        "healthFactor": "100",
        "interest": "257195240071",
        "interestFixed": 5.21764705211e-7,
        "lendBalance": "99001",
        "lendBalanceFixed": 0.099001,
        "lendShare": "99000",
        "lendShareFixed": 0.099,
        "totalBorrow": "17844",
        "totalBorrowFixed": 0.017844,
        "totalBorrowShare": "17844",
        "totalBorrowShareFixed": 0.017844,
        "totalLendShare": "1100000",
        "totalLendShareFixed": 1.1,
        "totalLiqFull": "9739404",
        "utilRate": "0.1832",
        "borrowAPY": "540,727,272,725.00",
        "lendAPY": "NaN",
        "collateralBalance": "94486.10631324418",
        "collateralBalanceFixed": 0.09448610631324418,
        "redeemBalance": "4514.89368675582",
        "redeemBalanceFixed": 0.0045148936867558205
    },
    "borrow": {
        "symbol": "USDC",
        "name": "USDC",
        "poolCount": "2",
        "lentCount": "0",
        "borrowCount": "0",
        "id": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        "txCount": "0",
        "totalPoolsLiquidityUSD": "0",
        "totalPoolsLiquidity": "0",
        "decimals": 18,
        "source": "Unilend",
        "address": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        "logo": "https://assets.coingecko.com/coins/images/12271/large/512x512_Logo_no_chop.png?1606986688",
        "priceUSD": 29.76929736903763,
        "pricePerToken": 1.6538498538354238,
        "priceRatio": 1.6567450023082035,
        "balance": "386165263254182938",
        "balanceFixed": 0.38616526325418293,
        "allowance": "386165263254182900",
        "allowanceFixed": 0.38616526325418293,
        "borrowBalance": "39921819185887529",
        "borrowBalanceFixed": 1418.142655,
        "borrowShare": "39753411579061800",
        "borrowSharefixed": 0.0397534115790618,
        "healthFactor18": "1347150443240967006",
        "healthFactorFixed": 1.3471504432409669,
        "healthFactor": "1.35",
        "interest": "521764705211",
        "interestFixed": 5.21764705211e-7,
        "lendBalance": "100073965495985788",
        "lendBalanceFixed": 0.1000739654959858,
        "lendShare": "99999999999999000",
        "lendShareFixed": 0.099999999999999,
        "totalBorrow": "39821831223922972",
        "totalBorrowFixed": 0.03982183122392298,
        "totalBorrowShare": "39753411579062800",
        "totalBorrowShareFixed": 0.0397534115790628,
        "totalLendShare": "1209273962122902435",
        "totalLendShareFixed": 1.2092739621229025,
        "totalLiqFull": "10532219295788434792",
        "utilRate": "0.38",
        "borrowAPY": "1.09",
        "lendAPY": "0.00412123929582750974",
        "collateralBalance": "0",
        "collateralBalanceFixed": 0,
        "redeemBalance": "100073965495985788",
        "redeemBalanceFixed": 0.1000739654959858
    }
}

  //handle Repay transaction function
  // const handleRepayTransaction = async () => {
  //   setOperationProgress(0);
  //   try {
  //     const lendToken = await getAllowance(selectedData?.lend, address);
  //     const borrowToken = await getAllowance(selectedData?.borrow, address);
  //     setIsBorrowProgressModal(true);
  //     console.log("handleRepayTransaction", lendToken, borrowToken);

  //     if (Number(lendAmount) > Number(lendToken.allowanceFixed)) {
  //       setModalMsg("Spend Aprroval for " + selectedData.lend.symbol);
  //       await handleApproval(selectedData?.lend.address, address, lendAmount);
  //       setOperationProgress(1);
  //       // console.log("setOperationProgress(1)", operationProgress);

  //       handleRepayTransaction();
  //     } else if (Number(borrowAmount) > Number(borrowToken.allowanceFixed)) {
  //       setModalMsg('Spend Aprroval for '+ selectedData.borrow.symbol)
  //       setOperationProgress(1);
  //       // console.log("setOperationProgress(11)", operationProgress);
  //       await handleApproval(
  //         selectedData?.borrow.address,
  //         address,
  //         borrowAmount
  //       );
  //       setOperationProgress(2);
  //       // console.log("setOperationProgress(2)", operationProgress);
  //       handleRepayTransaction();
  //     } else {
  //       setModalMsg(
  //         selectedData.lend.symbol +
  //           "-" +
  //           selectedData.borrow.symbol +
  //           "-" +
  //           selectedData.receive.symbol
  //       );
  //       setOperationProgress(2);
  //       console.log('borrowAmount',borrowAmount)
  //       // console.log("setOperationProgress(22)", operationProgress);
  //     //  const hash = await handleRepay(
  //     //     lendAmount,
  //     //     unilendPool,
  //     //     selectedData,
  //     //     address,
  //     //     borrowAmount
  //     //   );
  //       console.log("handle repay compund");
  //       const hash = await handleCompoundRepay(
  //         lendAmount,
  //         unilendPool,
  //         selectedData,
  //         address,
  //         borrowAmount
  //       );
  //       if (hash) {
  //         setOperationProgress(3);
  //       }
  //     }
  //   } catch (error) {
  //     console.log("Error1", { error });
  //   }
  // };
  const handleRepayTransaction = async () => {
    setOperationProgress(0);
    try {
      console.log("lendapproval",selectedcompundData?.lend, address);
      const lendToken = await getAllowance(selectedcompundData?.lend, address);
      const borrowToken = await getAllowance(selectedcompundData?.borrow, address);
      setIsBorrowProgressModal(true);
      console.log("handleRepayTransaction", lendToken, borrowToken);

      if (Number(lendAmount) > Number(lendToken.allowanceFixed)) {
        setModalMsg("Spend Aprroval for " + selectedData.lend.symbol);
        await handleApproval(selectedData?.lend.address, address, lendAmount);
        setOperationProgress(1);
        // console.log("setOperationProgress(1)", operationProgress);

        handleRepayTransaction();
      } else if (Number(borrowAmount) > Number(borrowToken.allowanceFixed)) {
        setModalMsg('Spend Aprroval for '+ selectedcompundData.borrow.symbol)
        setOperationProgress(1);
        // console.log("setOperationProgress(11)", operationProgress);
        await handleApproval(
          selectedcompundData?.borrow.address,
          address,
          borrowAmount
        );
        setOperationProgress(2);
        // console.log("setOperationProgress(2)", operationProgress);
        handleRepayTransaction();
      } else {
        setModalMsg(
          selectedcompundData.lend.symbol +
            "-" +
            selectedcompundData.borrow.symbol +
            "-" +
            selectedcompundData.receive.symbol
        );
        setOperationProgress(2);
        console.log('borrowAmount',borrowAmount)
        // console.log("setOperationProgress(22)", operationProgress);
      //  const hash = await handleRepay(
      //     lendAmount,
      //     unilendPool,
      //     selectedData,
      //     address,
      //     borrowAmount
      //   );
        console.log("handle repay compund");
        const hash = await handleCompoundRepay(
          lendAmount,
          unilendPool,
          selectedcompundData,
          address,
          borrowAmount
        );
        if (hash) {
          setOperationProgress(3);
        }
      }
    } catch (error) {
      console.log("Error1", { error });
    }
  };


//handle quote for Uniswap
const handleQuote = async () => {
  try {
    // const borrowDecimals = selectedData?.borrow?.decimals; // borrow token decimals
    // const lendAddress = selectedData?.lend?.address; // select erc20 address
    // const borrowAddress = selectedData?.borrow?.address; // select borrow token address (borrow token)
    // const chainId = chain?.id;    // chain id 

    const borrowDecimals = 6 // borrow token decimals
    const lendAddress = '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' // select erc20 address
    const borrowAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // select borrow token address (borrow token)
    const chainId = chain?.id;    // chain id 

    const value = await getQuote(decimal2Fixed(1, borrowDecimals), address, borrowAddress, lendAddress, chainId);

    if (value?.quoteDecimals) {
      setb2rRatio(value.quoteDecimals);
      // const payLendAmount = value.quoteDecimals * (selectedData?.borrow?.borrowBalanceFixed || 0);
        const payLendAmount = value.quoteDecimals * (1418.142655);
      console.log("payamount", payLendAmount)
      setLendAmount(payLendAmount.toString());
    }
    
    setBorrowAmount(selectedData?.borrow?.borrowBalanceFixed || 0);
    setReceiveAmount((selectedData?.receive?.collateralBalanceFixed || 0) + (selectedData?.receive?.redeemBalanceFixed || 0));

  } catch (error: any) {
    console.error("Error in handleQuote:", error);
    NotificationMessage("error", error?.message || "Error occurred in handleQuote");
  } finally {
    setIsTokenLoading({ ...isTokenLoading, quotation: false });
  }
};


// Loading Quote Data based on lend State
useEffect(() => {
  if (selectedData?.pool && selectedData?.lend  && !tokenListStatus.isOpen) {
    setIsTokenLoading({ ...isTokenLoading, quotation: true });
    console.log("quotation loading", isTokenLoading.quotation)
    setReceiveAmount("");
    setLendAmount("");
    // setRepayAmount("");
    handleQuote();
  }
}, [selectedData?.lend]);




// Handle Recieve Data 

const handleRepayToken = async (poolData: any) => {
console.log("pooolData", poolData)
const tokenPool = Object.values(poolList).find((pool) => {
  if (
    (pool.pool == poolData.pool )
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

  if (parseFloat(data.token0.borrowBalanceFixed) > 0 && data.token0.address === poolData.borrowToken.id) {
      console.log("IS_DATA_SET1");
      setSelectedData({
        ...selectedData,
        ["pool"]: poolData,
        ["lend"]: null,
        ["receive"]: data.token1,
        ["borrow"]: data.token0,
      });
    }

    if (
      parseFloat(data.token1.borrowBalanceFixed) > 0 &&
      data.token1.address === poolData.borrowToken.id
    ) {
      console.log("IS_DATA_SET2");
      setSelectedData({
        ...selectedData,
        ["pool"]: poolData,
        ["lend"]: null,
        ["receive"]: data.token0,
        ["borrow"]: data.token1,
      });
    }
    setIsTokenLoading({ ...isTokenLoading, pool: false });
  };

  const handleTokenSelection = async (data: any) => {
    console.log("handletokendata", data);
    setSelectedData({
      ...selectedData,
      [tokenListStatus.operation]: { ...data, map: true },
    });
    // setSelectedData({
    //   ...selectedData,
    //   [tokenListStatus.operation]: data,
    // });

    if (tokenListStatus.operation == "pool") {
      handleRepayToken(data);
      setReceiveAmount("");
      setLendAmount("");
    } else if (tokenListStatus.operation == "lend") {
      // // setBorrowAmount(selectedData.borrow.borrowBalanceFixed);
       const tokenBal = await getAllowance(data, address);
      console.log("tokenBal", tokenBal);
      setSelectedData({
        ...selectedData,
        [tokenListStatus.operation]: { ...data, ...tokenBal },
      });

    } else if (tokenListStatus.operation == "receive") {
      setSelectedData({
        ...selectedData,
        ["receive"]: data,
      });
    }
    setTokenListStatus({ isOpen: false, operation: "" });
  };

  const checkLoading = (isTokenLoading: object) => {
    return Object.values(isTokenLoading).some((value) => value === true);
  };

  // loading state
  useEffect(() => {
    checkLoading(isTokenLoading);
  }, [isTokenLoading]);

  return (
    <>
      <div className='repay_container'>
        <div className='swap_route'>
          <p className='paragraph06 '>Select Positions</p>
          <ButtonWithDropdown
            buttonText={
              selectedData.pool
                ? `${selectedData.pool.borrowToken.symbol}`
                : "Select"
            }
            onClick={() => handleOpenTokenList("pool")}
            className='transparent_btn'
          />
        </div>
        <p className='paragraph06 label'>You Pay</p>
        <AmountContainer
          balance={truncateToDecimals(
            selectedData?.lend?.balanceFixed || 0,
            4
          ).toString()}
          value={Number(lendAmount) > 0 ? lendAmount : "0"}
          onChange={(e: any) => handleLendAmount(e.target.value)}
          onMaxClick={() => console.log("Max Clicked")}
          buttonText={selectedData?.lend?.symbol}
          onClick={
            selectedData?.pool !== null
              ? () => handleOpenTokenList("lend")
              : () => {}
          }
          // onClick={ () => handleOpenTokenList("lend")
          readonly
        />
        <p className='paragraph06 label'>You Receive</p>
        <AmountContainer
          balance={selectedData?.receive?.balanceFixed}
          value={Number(receiveAmount) > 0 ? receiveAmount : "0"}
          onChange={(e: any) => handleReceiveAmount(e.target.value)}
          onMaxClick={() => (selectedData?.receive?.collateralBalanceFixed || 0) + (selectedData?.receive?.redeemBalanceFixed || 0)}
          buttonText={selectedData?.pool?.otherToken?.symbol}
          isShowMaxBtn
           onClick={
            selectedData?.pool !== null
              ? () => handleOpenTokenList("pool")
              : () => {}
          }
          readonly
          btnClass='disable_btn'
        />
{/* 
        <Button
          disabled={repayButton.disable}
          className='primary_btn'
          onClick={handleRepayTransaction}
          title='please slect you pay token'
          loading={isTokenLoading.pool || isTokenLoading.quotation}
        >
          {repayButton.text}
        </Button> */}
        <button onClick={handleRepayTransaction}> repay</button>
      </div>

      {tokenListStatus.operation == "pool" ? (
        <Modal
          className='antd_modal_overlay'
          centered
          onCancel={handleCloseTokenList}
          open={tokenListStatus.isOpen}
          footer={null}
          closable={false}
        >
          <PoolListModel
            tokenList={getOprationToken()}
            onSelectToken={(token: any) => handleTokenSelection(token)}
            operation={ActiveOperation.REPAY}
            // tokenListOperation={tokenListStatus.operation}
            isTokenListLoading={isTokenLoading.positions}
            showPoolData={true}
            positionData={Object.values(positions).filter(
              (item) =>
                item.borrowBalance0 !== 0 || item.token1.borrowBalance1 !== 0
            )}
            pools={pools}
            // selectedData={selectedData} // Pass selectedData to PoolListModal
          />
        </Modal>
      ) : tokenListStatus.operation == "lend" ||
        tokenListStatus.operation == "receive" ? (
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
            operation={ActiveOperation.REPAY}
            // tokenListOperation={tokenListStatus.operation}
            isTokenListLoading={isTokenLoading.positions} // TODO
            showPoolData={false}
            // selectedData={selectedData} // Pass selectedTokens to TokenListModal
          />
        </Modal>
      ) : null}

      <Modal
        className='antd_popover_content'
        centered
        onCancel={() => setIsBorrowProgressModal(false)}
        open={isBorrowProgressModal}
        footer={null}
        closable={false}
      >
        <BorrowLoader msg={modalMsg} progress={operationProgress} />
      </Modal>
    </>
  );
}

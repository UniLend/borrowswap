import {
  borrowswapABI,
  compoundABI,
  controllerABI,
  coreAbi,
  erc20Abi,
  helperAbi,
  positionAbi
} from "./abi";
import { readContracts, writeContract } from "wagmi/actions";
import { getEtherContract } from "./ethers";
import {
  add,
  decimal2Fixed,
  div,
  fixed2Decimals,
  fromBigNumber,
  greaterThan,
  isZeroAddress,
  mul,
  sub,
  toAPY,
} from "../../helpers/index";
import {
  readContract,
  waitForTransactionReceipt,
  getBlockNumber,
  getChainId,
} from "@wagmi/core";
import { wagmiConfig } from "../../main";
import { contractAddresses } from "./address";

export const waitForTransaction = async (hash: any) => {
  try {
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash: hash,
    });

    // const status = await watchBlock(receipt.blockNumber);

    console.log("waitForTransaction", receipt, status);
    return receipt;
  } catch (error) {
    throw error;
  }
};

const watchBlock = async (prevBlockNumber: any) => {
  const blockNumber = await getBlockNumber(wagmiConfig);

  await new Promise((resolve, reject) => {
    if (blockNumber - prevBlockNumber > 3) {
      return resolve(true);
    } else {
      setTimeout(async () => {
        await watchBlock(prevBlockNumber);
      }, 2000);
    }
  });
};

export const handleApproval = async (
  tokenAddress: string,
  user: `0x${string}` | undefined,
  amount: string | number
) => {
  var maxAllow =
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";
  const instance = await getEtherContract(tokenAddress, erc20Abi);

  const Amount =
    amount == "" ? maxAllow : (Number(amount) * 10 ** 18).toString();

  console.log("hanldeApproval", instance, Amount, tokenAddress);
  const chainId = getChainId(wagmiConfig);
  const controllerAddress =
    contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
  const { hash } = await instance?.approve(controllerAddress, Amount);
  const receipt = await waitForTransaction(hash);
  return receipt;
};

export const getUserProxy = async (user: any) => {
  try {
    const chainId = getChainId(wagmiConfig);
    const controllerAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
    const instance = await getEtherContract(
      controllerAddress,
      controllerABI,
      false
    );
    const proxy = await instance?.proxyAddress(user);
    if (proxy && isZeroAddress(proxy)) {
      return user;
    }

    return proxy ? proxy : user;
  } catch (error) {
    return user; //if no proxy just use the users address as
  }
};

export const handleSwap = async (
  amount: any,
  pool: any,
  selectedTokens: any,
  user: any,
  borrow: any
) => {
  try {
    const chainId = getChainId(wagmiConfig);
    const controllerAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
    const instance = await getEtherContract(controllerAddress, controllerABI);

    const borrowAmount =
      selectedTokens.borrow.token == 1
        ? String(decimal2Fixed(borrow, selectedTokens.borrow.decimals))
        : String(decimal2Fixed(-borrow, selectedTokens.borrow.decimals));

    // '0x784c4a12f82204e5fb713b055de5e8008d5916b6',
    // '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a',
    // '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    // '0x172370d5cd63279efa6d502dab29171933a610af',
    // '10000000000000000000',
    // '200000000000000',
    // owner.address
    console.log("handleswap",    pool.pool,
      selectedTokens.lend.address,
      selectedTokens.receive.address,
      // selectedTokens.borrow.address,
      decimal2Fixed(amount, selectedTokens.lend.decimals),
      borrowAmount,
      user, instance);

    const { hash } = await instance?.uniBorrow(
      pool.pool,
      selectedTokens.lend.address,
      selectedTokens.receive.address,
      // selectedTokens.borrow.address,
      decimal2Fixed(amount, selectedTokens.lend.decimals),
      borrowAmount,
      user
    );
    console.log("transaction", hash);
    const receipt = await waitForTransaction(hash);
    return hash;
    return "";
  } catch (error) {
    console.log("Error", { error });

    throw error;
  }
};
//handle repay borrow
export const handleRepay = async (
  payAmount: any,
  pool: any,
  selectedData: any,
  user: any,
  borrow: any,
  receiveAmount: any
) => {
  try {
    const chainId = getChainId(wagmiConfig);
    const controllerAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
    const instance = await getEtherContract(controllerAddress, controllerABI);
    const positionAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.positionAddress;
    const positionInstance = await getEtherContract(positionAddress, positionAbi);
    const getNftID = await positionInstance?.getNftId(
      selectedData.pool.pool,
      "0x75264A54CB62F488f7C4B44a63BC021455B000E9"
    )
  const borrowAmount =
      selectedData.borrow.token == 1
        ? String(decimal2Fixed(borrow, selectedData.borrow.decimals))
        : String(decimal2Fixed(-borrow, selectedData.borrow.decimals));

    const nftId = parseInt(getNftID, 10);
    console.log("nftId", nftId)
    console.log(
      "repay",
      // address _pool,
      // address _tokenIn, //erc 20 token address
      // address _borrowedToken, // borrowed token address
      // address _user,  // user address
      // uint256 _nftID, // position Id
      // int256 _amountOut,  // redeem 
      // int256 _repayAmount,  // borrowed amount amount

      // "0x2e3204ee5ef49543671e7062aea4f42f389faea3",
      // "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
      // "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
      // "0xe1cF3edCe24D67E049075304850914fD9AAA6883",
      // "22",
      // decimal2Fixed(receiveAmount),
      // decimal2Fixed(borrowAmount),
      "0x2e3204ee5ef49543671e7062aea4f42f389faea3",
      "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
      "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
      "0xe1cF3edCe24D67E049075304850914fD9AAA6883",
      "27",
    decimal2Fixed(0.01),
     "-3988348792588741",
      instance,
      positionInstance
    );

    const { hash } = await instance?.uniRepay(
      // selectedData.pool.pool,
      // selectedData.lend.address,
      // selectedData.borrow.address,
      // user,
      // nftId,
      // decimal2Fixed(receiveAmount),
      // decimal2Fixed(borrowAmount),

      "0x2e3204ee5ef49543671e7062aea4f42f389faea3",
      "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
      "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
      "0xe1cF3edCe24D67E049075304850914fD9AAA6883",
      "27",
      decimal2Fixed(0.01),
      "-3988348792588741",

    );
    console.log("transaction", hash);
    const receipt = await waitForTransaction(hash);
    return receipt;
    return "";
  } catch (error) {
    console.log("Error", { error });

    throw error;
  }
};

export const handleCompoundRepay = async (
  lend: any,
  user: any,
  selectedData: any,
  borrowAmount: any
) => {
  console.log(
    "repay",

    // address _borrowedToken,   borrow token address
    // address _tokenIn, erc token address
    // address _user, user address
    // address _collateralToken, recive token address - weth  - 
    // uint256 _collateralAmount, colltaral amount 
    // uint256 _repayAmount repay amount  // 250 sushi  - 
    
  '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    // '0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a',
  "0xB32794a7B538adF268dB7f1e4F59E6db84f0a988",
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    '100000000000000000',
   "145818661",
//        selectedData?.borrow?.address,
//     // selectedData?.borrow?.address,

//     selectedData?.lend?.address,
//     user,
//     selectedData?.receive?.address,
//     selectedData.receive.collateralBalance,
//     //  "5817938978",
//  decimal2Fixed(0.16481),

  );
  try {
    const chainId = getChainId(wagmiConfig);
    const controllerAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
    const instance = await getEtherContract(controllerAddress, controllerABI);

    console.log("instance", instance)
    const { hash } = await instance?.reapay(
 '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    // '0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a',
  "0xB32794a7B538adF268dB7f1e4F59E6db84f0a988",
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    '100000000000000000',
    "145818661",
    //    selectedData?.borrow?.address,
    // // selectedData?.borrow?.address,
    //   selectedData?.lend?.address,
    //   user,
    //   selectedData?.receive?.address,
    //   selectedData.receive.collateralBalance,
    //   // "5817938978"
    //   decimal2Fixed(0.16481),
    );
    console.log("transaction", hash);
    const receipt = await waitForTransaction(hash);
    return receipt;
    return "";
  } catch (error) {
    console.log("Error", { error });

    throw error;
  }
};

export const getAllowance = async (
  token: any,
  user: `0x${string}` | undefined
) => {
  console.log("allowance", token);
  try {
    var maxAllow =
      "115792089237316195423570985008687907853269984665640564039457584007913129639935";
    const instance = await getEtherContract(token.address, erc20Abi);
    const chainId = getChainId(wagmiConfig);
    const controllerAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
    const allowance = await instance?.allowance(user, controllerAddress);

    const allowanceFixed =
      Number(fromBigNumber(allowance)) == Number(maxAllow)
        ? fromBigNumber(allowance)
        : fixed2Decimals(fromBigNumber(allowance), token.decimals);
    const bal = await instance?.balanceOf(user);

    return {
      allowance: fromBigNumber(allowance),
      allowanceFixed: allowanceFixed,
      balance: fromBigNumber(bal),
      balanceFixed: fixed2Decimals(fromBigNumber(bal), token.decimals),
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getPoolData = (poolAddress: string) => {};



export const getPoolBasicData = async (
  contracts: any,
  poolAddress: string,
  poolData: any,
  userAddress: any
) => {
  let pool = { ...poolData };
  console.log("PoolData", poolData);
  if (true) {
    try {
      const proxy = await getUserProxy(userAddress);

      const instance = await getEtherContract(
        contracts.helperAddress,
        helperAbi
      );
      const oracleInstance = await getEtherContract(
        contracts.coreAddress,
        coreAbi
      );
      const [token0, token1, data] = await Promise.all([
        getAllowance(pool.token0, userAddress),
        getAllowance(pool.token1, userAddress),
        instance?.getPoolFullData(
          contracts.positionAddress,
          poolAddress,
          proxy
        ),
      ]);
      // const token0 = await getAllowance(pool.token0.address, userAddress)
      console.log("data", data)
      let token0Price = 0;
      let token1Price = 0;

      if (poolData.token0.decimals == 6 || poolData.token1.decimals == 6) {
        let oracleData = await oracleInstance?.getOraclePrice(
          poolData.token1.address,
          poolData.token0.address,
          decimal2Fixed(1, poolData.token1.decimals)
        );
        const Price = fixed2Decimals(oracleData, poolData.token0.decimals);

        token1Price = Price;
        token0Price = 1 / Price;
      } else {
        let oracleData = await oracleInstance?.getOraclePrice(
          poolData.token0.address,
          poolData.token1.address,
          decimal2Fixed(1, poolData.token0.decimals)
        );
        const Price = fixed2Decimals(oracleData, poolData.token0.decimals);

        token0Price = Price;
        token1Price = 1 / Price;
      }

      const totLiqFull0 = add(
        div(mul(pool.liquidity0, 100), pool.rf),
        fromBigNumber(data._totalBorrow0)
      );

      const totLiqFull1 = add(
        div(mul(pool.liquidity1, 100), pool.rf),
        fromBigNumber(data._totalBorrow1)
      );
      let collateral0 = mul(
        div(
          mul(
            Number(
              mul(
                Number(fromBigNumber(data._borrowBalance1)),
                Number(token1Price)
              )
            ) / poolData.maxLTV,
            100
          ),
          10 ** poolData.token1.decimals
        ),
        10 ** poolData.token0.decimals
      );
      let collateral1 = mul(
        div(
          mul(
            Number(
              mul(
                Number(fromBigNumber(data._borrowBalance0)),
                Number(token0Price)
              )
            ) / poolData.maxLTV,
            100
          ),
          10 ** poolData.token0.decimals
        ),
        10 ** poolData.token1.decimals
      );
      let redeem0 = sub(fromBigNumber(data._lendBalance0), collateral0);
      let redeem1 = sub(fromBigNumber(data._lendBalance1), collateral1);

      pool = {
        ...pool,
        token0: {
          ...pool?.token0,
          priceRatio: token0Price,
          balance: fromBigNumber(token0.balance),
          balanceFixed: fixed2Decimals(token0.balance, pool.token0.decimals),
          allowance: fromBigNumber(token0.allowance),
          allowanceFixed: fixed2Decimals(
            token0.allowance,
            pool.token0.decimals
          ),
          borrowBalance: fromBigNumber(data._borrowBalance0),
          borrowBalanceFixed: fixed2Decimals(
            data._borrowBalance0,
            pool.token0.decimals
          ),
          borrowShare: fromBigNumber(data._borrowShare0),
          borrowSharefixed: fixed2Decimals(
            data._borrowShare0,
            poolData.token0.decimals
          ),

          healthFactor18: fromBigNumber(data._healthFactor0),
          healthFactorFixed: fixed2Decimals(data._healthFactor0, 18),
          healthFactor: greaterThan(
            fixed2Decimals(data._healthFactor0, 18),
            100
          )
            ? "100"
            : Number(fixed2Decimals(data._healthFactor0, 18)).toFixed(2),

          interest: fromBigNumber(data._interest0),
          interestFixed: fixed2Decimals(data._interest0, pool.token0.decimals),

          lendBalance: fromBigNumber(data._lendBalance0),
          lendBalanceFixed: fixed2Decimals(
            data._lendBalance0,
            pool.token0.decimals
          ),

          lendShare: fromBigNumber(data._lendShare0),
          lendShareFixed: fixed2Decimals(
            data._lendShare0,
            pool.token0.decimals
          ),

          totalBorrow: fromBigNumber(data._totalBorrow0),
          totalBorrowFixed: fixed2Decimals(
            data._totalBorrow0,
            pool.token0.decimals
          ),

          totalBorrowShare: fromBigNumber(data._totalBorrowShare0),
          totalBorrowShareFixed: fixed2Decimals(
            data._totalBorrowShare0,
            pool.token0.decimals
          ),

          totalLendShare: fromBigNumber(data._totalLendShare0),
          totalLendShareFixed: fixed2Decimals(
            data._totalLendShare0,
            pool.token0.decimals
          ),
          totalLiqFull: totLiqFull0,
          utilRate: Number(
            mul(div(fromBigNumber(data._totalBorrow0), totLiqFull0), 100)
          ).toFixed(2),
          borrowAPY: toAPY(
            fixed2Decimals(data._interest0, poolData.token0.decimals)
          ),

          lendAPY: div(
            toAPY(fixed2Decimals(data._interest0, poolData.token0.decimals)),
            div(totLiqFull0, fromBigNumber(data._totalBorrow0))
          ),
          collateralBalance: collateral0,
          collateralBalanceFixed: fixed2Decimals(
            collateral0,
            poolData.token0.decimals
          ),
          redeemBalance: Number(redeem0) > 0 ? redeem0 : 0,
          redeemBalanceFixed: fixed2Decimals(
            Number(redeem0) > 0 ? redeem0 : 0,
            poolData.token0.decimals
          ),
        },
        token1: {
          ...poolData?.token1,
          priceRatio: token1Price,
          balance: fromBigNumber(token1.balance),
          balanceFixed: fixed2Decimals(token1.balance, pool.token1.decimals),
          allowance: fromBigNumber(token1.allowance),
          allowanceFixed: fixed2Decimals(
            token1.allowance,
            pool.token0.decimals
          ).toString(),
          borrowBalance: fromBigNumber(data._borrowBalance1),
          borrowBalanceFixed: fixed2Decimals(
            data._borrowBalance1,
            poolData.token1.decimals
          ),

          borrowShare: fromBigNumber(data._borrowShare1),
          borrowSharefixed: fixed2Decimals(
            data._borrowShare1,
            poolData.token1.decimals
          ),

          healthFactor18: fromBigNumber(data._healthFactor1),
          healthFactorFixed: fixed2Decimals(data._healthFactor1, 18),
          healthFactor: greaterThan(
            fixed2Decimals(data._healthFactor1, 18),
            100
          )
            ? "100"
            : Number(fixed2Decimals(data._healthFactor1, 18)).toFixed(2),

          interest: fromBigNumber(data._interest1),
          interestFixed: fixed2Decimals(
            data._interest0,
            poolData.token0.decimals
          ),

          lendBalance: fromBigNumber(data._lendBalance1),
          lendBalanceFixed: fixed2Decimals(
            data._lendBalance1,
            poolData.token1.decimals
          ),

          lendShare: fromBigNumber(data._lendShare1),
          lendShareFixed: fixed2Decimals(
            data._lendShare1,
            poolData.token1.decimals
          ),

          totalBorrow: fromBigNumber(data._totalBorrow1),
          totalBorrowFixed: fixed2Decimals(
            data._totalBorrow1,
            poolData.token1.decimals
          ),

          totalBorrowShare: fromBigNumber(data._totalBorrowShare1),
          totalBorrowShareFixed: fixed2Decimals(
            data._totalBorrowShare1,
            poolData.token1.decimals
          ),

          totalLendShare: fromBigNumber(data._totalLendShare1),
          totalLendShareFixed: fixed2Decimals(
            data._totalLendShare1,
            poolData.token1.decimals
          ),
          totalLiqFull: totLiqFull1,
          utilRate: Number(
            mul(div(fromBigNumber(data._totalBorrow1), totLiqFull1), 100)
          ).toFixed(4),
          borrowAPY: toAPY(
            fixed2Decimals(data._interest1, poolData.token1.decimals)
          ),
          lendAPY: div(
            toAPY(fixed2Decimals(data._interest1, poolData.token1.decimals)),
            div(totLiqFull1, fromBigNumber(data._totalBorrow1))
          ),
          collateralBalance: collateral1,
          collateralBalanceFixed: fixed2Decimals(
            collateral1,
            poolData.token1.decimals
          ),
          redeemBalance: Number(redeem1) > 0 ? redeem1 : 0,
          redeemBalanceFixed: fixed2Decimals(
            Number(redeem1) > 0 ? redeem1 : 0,
            poolData.token1.decimals
          ),
        },
      };

      console.log("poolData", pool);
      return pool;
    } catch (error) {
      console.error("REPAY_POOLDATA_ERROR", error);
      throw error;
    }
  }
};

export const getCollateralTokenData = async (token: any, address: any) => {
  const chainId = getChainId(wagmiConfig);
  const compoundAddress =
    contractAddresses[chainId as keyof typeof contractAddresses]?.compound;
  const comet = await getEtherContract(compoundAddress, compoundABI);

  const proxy = await getUserProxy(address);
  console.log("comp", comet, proxy);
  const tokenAddress = token?.address;

  const assetInfo = await comet?.getAssetInfoByAddress(tokenAddress);
  const collateralBal = await comet?.userCollateral(proxy, tokenAddress);
  //const baseToken = await comet?.getCollateralReserves(tokenAddress)
  // quote = await comet?.quoteCollateral(tokenAddress, '1000000000000000000')
  const price = await comet?.getPrice(assetInfo.priceFeed);
  const info = {
    ...token,
    ltv:
      fixed2Decimals(fromBigNumber(assetInfo.borrowCollateralFactor)) * 100 -
      0.5,
    collateralBalance: fromBigNumber(collateralBal.balance),
    collateralBalanceFixed: fixed2Decimals(
      fromBigNumber(collateralBal.balance),
      token?.decimals || 18
    ),
    // baseToken: fromBigNumber(baseToken),
    price: Number(fromBigNumber(price)) / 10 ** 8,
    //quote: fixed2Decimals(fromBigNumber(quote))
  };
  console.log("getCollateralTokenData", info);
  return info;
};

export const getBorrowTokenData = async (token: any, address: any) => {
  try {
    const chainId = getChainId(wagmiConfig);
    const compoundAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.compound;
    const comet = await getEtherContract(compoundAddress, compoundABI);

    const proxy = await getUserProxy(address);

    const tokenAddress = token?.address;
    console.log("comp", comet, proxy, token);
    //const assetInfo = await comet?.getAssetInfoByAddress(tokenAddress)
    const BorrowBal = await comet?.borrowBalanceOf(proxy);
    //  const Bal = await comet?.balanceOf( proxy)
    // const quote = await comet?.quoteCollateral(tokenAddress, '1000000000000000000')
    const borrowMin = await comet?.baseBorrowMin();
    const baseTokenPriceFeed = await comet?.baseTokenPriceFeed();
    const price = await comet?.getPrice(baseTokenPriceFeed);
    const info = {
      ...token,
      // ltv: fixed2Decimals(fromBigNumber(assetInfo.borrowCollateralFactor))*100,
      BorrowBalance: fromBigNumber(BorrowBal),
      BorrowBalanceFixed: fixed2Decimals(
        fromBigNumber(BorrowBal),
        token?.decimals || 18
      ),
      borrowMin: fromBigNumber(borrowMin),
      borrowMinFixed: fixed2Decimals(
        fromBigNumber(borrowMin),
        token?.decimals || 18
      ),
      price: Number(fromBigNumber(price)) / 10 ** 8,
      // quote: fixed2Decimals(fromBigNumber(quote))
    };
    console.log("getBorrowTokenData", info, BorrowBal);
    return info;
  } catch (error) {
    console.log("Error in getBorrowTokenData ", { error });
  }
};

export const handleCompoundSwap = async (
  tokenIn: string,
  borrowAsset: string,
  tokenOut: string,
  supplyAmount: string,
  borrowAmount: string,
  user: any
) => {
  const chainId = getChainId(wagmiConfig);
  const controllerAddress =
    contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
  const instance = await getEtherContract(controllerAddress, controllerABI);

  console.log("instance", instance, {
    tokenIn,
    borrowAsset,
    tokenOut,
    supplyAmount,
    borrowAmount,
    user,
  });

  const { hash } = await instance?.compoundBorrow(
    tokenIn,
    borrowAsset,
    tokenOut,
    supplyAmount,
    borrowAmount,
    user
  );

  const receipt = await waitForTransaction(hash);
  return hash;
};

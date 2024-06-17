import { abiEncode } from "./../../helpers/index";
import {
  borrowswapABI,
  compoundABI,
  controllerABI,
  coreAbi,
  erc20Abi,
  helperAbi,
  positionAbi,
  aavePoolDataProviderABI,
  aavePoolABI,
  aaveOracleABI,
} from "./abi";

import { getEtherContract } from "./ethers";
import { readContractLib } from "./lib";
import { readContracts } from "@wagmi/core";
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
  getTransactionConfirmations,
} from "@wagmi/core";
import { wagmiConfig } from "../../main";
import { contractAddresses } from "./address";
import { CompoundBaseTokens } from "../../helpers/constants";
import { BigNumber } from "ethers";

export const waitForTransaction = async (hash: any) => {
  try {
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash: hash,
      confirmations: 3,
    });
    const status = await watchBlock(receipt.blockNumber);
    // const status = await transaction(hash);
    console.log("status", status);
    return receipt;
  } catch (error) {
    throw error;
  }
};

const watchBlock = async (prevBlockNumber: any) => {
  const blockNumber = await getBlockNumber(wagmiConfig);
  console.log(
    "watchBlock",
    prevBlockNumber,
    blockNumber,
    blockNumber - prevBlockNumber > 1
  );

  await new Promise((resolve, reject) => {
    if (blockNumber - prevBlockNumber > 1) {
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
  tokenDecimal: number,
  user: `0x${string}` | undefined,
  amount: string | number
) => {
  var maxAllow =
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";
  const instance = await getEtherContract(tokenAddress, erc20Abi);

  const Amount = amount == "" ? maxAllow : decimal2Fixed(amount, tokenDecimal);

  const chainId = getChainId(wagmiConfig);
  const controllerAddress =
    contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
  console.log("handleApproval", instance, controllerAddress, maxAllow);

  const { hash } = await instance?.approve(controllerAddress, maxAllow);
  const receipt = await waitForTransaction(hash);
  return receipt;
};

export const getUserProxy = async (user: any) => {
  try {
    const chainId = getChainId(wagmiConfig);
    const controllerAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
    const proxy = await readContractLib(
      controllerAddress,
      controllerABI,
      "proxyAddress",
      [user]
    );

    console.log("proxy", proxy);
    return proxy;
  } catch (error) {
    return "0x0000000000000000000000000000000000000000"; //if no proxy just use the users address as
  }
};

export const handleSwap = async (
  amount: any,
  pool: any,
  selectedTokens: any,
  user: any,
  borrow: any,
  path: any
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

    const parameters = {
      _pool: pool.pool,
      _supplyAsset: selectedTokens.lend.address,
      _tokenOUt: selectedTokens.receive.address,
      _collateral_amount: decimal2Fixed(amount, selectedTokens.lend.decimals),
      _amount: borrowAmount,
      _user: user,
      _route: path,
    };
    console.log("BorrowTsransaction", parameters);

    //     _pool: '0x784c4a12f82204e5fb713b055de5e8008d5916b6',
    // _supplyAsset: '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a',
    // _tokenOUt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    // _collateral_amount: '10000000000000000000',
    // _amount: '200000000000000',
    // _user: owner.address,
    // _route: [3000, 10000]

    const { hash } = await instance?.uniBorrow(parameters);
    console.log("transaction", hash);
    const receipt = await waitForTransaction(hash);
    return hash;
    return "";
  } catch (error) {
    console.log("Error", { error });
    throw error;
  }
};

export const handleRedeem = async (
  redeemAmount: any,
  selectedTokens: any,
  user: any,
  isMax: boolean,
  path: any
) => {
  try {
    const chainId = getChainId(wagmiConfig);
    const controllerAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
    const instance = await getEtherContract(controllerAddress, controllerABI);

    // const Amount =
    //   selectedTokens.lend.token == 1
    //     ? String(decimal2Fixed(redeemAmount, selectedTokens.lend.decimals))
    //     : String(decimal2Fixed(-redeemAmount, selectedTokens.lend.decimals));

    let Amount = decimal2Fixed(redeemAmount, selectedTokens.lend.decimals);
    // let maxAmount = selectedTokens.lend.lendShare;
    // if (Number(selectedTokens.lend.lendShare) > Number(selectedTokens.lend.liquidity)) {
    //   maxAmount = selectedTokens.lend.liquidity;
    // }
    // if( selectedTokens.borrow.borrowBalance > 0 && Number(Amount) > Number(selectedTokens.lend.liquidity) ){
    //     Amount = Number(selectedTokens.lend.liquidity).toString()
    // } else if (selectedTokens.borrow.borrowBalance > 0){
    //   Amount = decimal2Fixed(redeemAmount, selectedTokens.lend.decimals)
    // }
    if (Number(Amount) > Number(selectedTokens.lend.liquidity)) {
      Amount = selectedTokens.lend.liquidity;
    }

    if (isMax && !(Number(selectedTokens.lend.collateralBalance) > 0)) {
      if (
        Number(selectedTokens.lend.lendShare) >
        Number(selectedTokens.lend.liquidity)
      ) {
        Amount = selectedTokens.lend.liquidity;
      } else {
        Amount = selectedTokens.lend.lendShare;
      }
    }

    if (selectedTokens.lend.token == 0) {
      Amount = mul(Amount, -1);
    }

    const parameters = {
      _pool: selectedTokens.pool.pool,
      _user: user,
      _amount: Amount,
      _tokenOut: selectedTokens.receive.address,
      _route: path,
    };
    console.log("handleRedeem", instance, parameters);

    const { hash } = await instance?.uniRedeem(parameters);

    console.log("transaction", hash);
    const receipt = await waitForTransaction(hash);
    console.log("transaction after", hash);
    return hash;
  } catch (error) {
    throw error;
  }
};

//handle repay borrow

export const handleRepay = async (
  payAmount: any,

  selectedTokens: any,
  user: any,
  path: any
) => {
  try {
    const chainId = getChainId(wagmiConfig);
    const controllerAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
    const instance = await getEtherContract(controllerAddress, controllerABI);

    const borrowAmount =
      selectedTokens.borrow.token == 1
        ? String(decimal2Fixed(payAmount, selectedTokens.lend.decimals))
        : String(decimal2Fixed(payAmount, selectedTokens.lend.decimals));

    const parameters = {
      _pool: selectedTokens.pool.pool,
      _tokenIn: selectedTokens.lend.address,
      _user: user,
      _borrowAddress: selectedTokens.borrow.address,
      _repayAmount: borrowAmount,
      _route: path,
    };

    console.log("handleRepay", instance, parameters);

    const { hash } = await instance?.uniRepay(parameters);

    console.log("transaction", hash);
    const receipt = await waitForTransaction(hash);
    return hash;
  } catch (error) {
    console.log("Error", { error });
    throw error;
  }
};

export const handleCompoundRedeem = async (
  lend: any,
  user: any,
  selectedData: any,
  borrowAmount: any,
  fees: any
) => {
  try {
    const chainId = getChainId(wagmiConfig);
    const controllerAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
    const instance = await getEtherContract(controllerAddress, controllerABI);

    const parameters = {
      _user: user,
      _collateralToken: selectedData?.borrow.address,
      _collateralAmount: decimal2Fixed(lend, selectedData?.lend.decimals),
      _tokenOut: selectedData?.receive.address,
      _route: fees,
    };
    console.log("handleComReeem", parameters);

    const { hash } = await instance?.compRedeem(parameters);
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
  borrowAmount: any,
  fees: any
) => {
  try {
    const chainId = getChainId(wagmiConfig);
    const controllerAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
    const instance = await getEtherContract(controllerAddress, controllerABI);

    const parameters = {
      _borrowedToken: selectedData?.borrow.address,
      _tokenIn:
        lend == "" ? selectedData?.borrow.address : selectedData?.lend.address,
      _repayAmount: decimal2Fixed(lend, selectedData?.lend.decimals),
      _route: fees,
    };
    const { hash } = await instance?.compRepay(parameters);
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
  try {
    var maxAllow =
      "115792089237316195423570985008687907853269984665640564039457584007913129639935";
    const instance = await getEtherContract(token.address, erc20Abi);
    const chainId = getChainId(wagmiConfig);
    const controllerAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
    const allowance = await readContractLib(
      token.address,
      erc20Abi,
      "allowance",
      [user, controllerAddress]
    );

    const bal = await readContractLib(token.address, erc20Abi, "balanceOf", [
      user,
    ]);

    // const allowance = await instance?.allowance(user, controllerAddress);
    const allowanceFixed =
      Number(fromBigNumber(allowance)) == Number(maxAllow)
        ? fromBigNumber(allowance)
        : fixed2Decimals(fromBigNumber(allowance), token.decimals);

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
  if (true) {
    try {
      // const chainId = getChainId(wagmiConfig);
      const proxy = await getUserProxy(userAddress);

      // const instance = await getEtherContract(
      //   contracts.helperAddress,
      //   helperAbi
      // );
      // const oracleInstance = await getEtherContract(
      //   contracts.coreAddress,
      //   coreAbi
      // );
      const [token0, token1, data]: any = await Promise.all([
        getAllowance(pool.token0, userAddress),
        getAllowance(pool.token1, userAddress),
        readContractLib(contracts.helperAddress, helperAbi, "getPoolFullData", [
          contracts.positionAddress,
          poolAddress,
          proxy,
        ]),
      ]);
      // const positionAddress =
      // contractAddresses[chainId as keyof typeof contractAddresses]?.positionAddress;
      // const positionInstance = await getEtherContract(positionAddress, positionAbi);

      // const NftID = await positionInstance?.getNftId(
      //   poolData.id,
      //   proxy
      // )
      // const token0 = await getAllowance(pool.token0.address, userAddress)

      // const NftID = await positionInstance?.getNftId(
      //   poolData.id,
      //   proxy
      // )
      // const token0 = await getAllowance(pool.token0.address, userAddress)
      console.log("getPoolData", data);
      let token0Price = 0;
      let token1Price = 0;

      if (poolData.token0.decimals == 6 || poolData.token1.decimals == 6) {
        // let oracleData = await oracleInstance?.getOraclePrice(
        //   poolData.token1.address,
        //   poolData.token0.address,
        //   decimal2Fixed(1, poolData.token1.decimals)
        // );

        let oracleData = await readContractLib(
          contracts.coreAddress,
          coreAbi,
          "getOraclePrice",
          [
            poolData.token1.address,
            poolData.token0.address,
            decimal2Fixed(1, poolData.token1.decimals),
          ]
        );
        const Price = fixed2Decimals(oracleData, poolData.token0.decimals);
        console.log("price", Price);
        token1Price = Price;
        token0Price = 1 / Price;
      } else {
        let oracleData = await readContractLib(
          contracts.coreAddress,
          coreAbi,
          "getOraclePrice",
          [
            poolData.token0.address,
            poolData.token1.address,
            decimal2Fixed(1, poolData.token0.decimals),
          ]
        );
        // let oracleData = await oracleInstance?.getOraclePrice(
        //   poolData.token0.address,
        //   poolData.token1.address,
        //   decimal2Fixed(1, poolData.token0.decimals)
        // );
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
            ) /
              (poolData.maxLTV - 0.05),
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
            ) /
              (poolData.maxLTV - 0.05),
            100
          ),
          10 ** poolData.token0.decimals
        ),
        10 ** poolData.token1.decimals
      );
      let redeem0 = sub(
        fromBigNumber(data._lendBalance0),
        Math.floor(Number(collateral0))
      );
      let redeem1 = sub(
        fromBigNumber(data._lendBalance1),
        Math.floor(Number(collateral1))
      );
      let redeem0val = decimal2Fixed(redeem0, poolData.token0.decimals);
      let redeem1val = decimal2Fixed(redeem1, poolData.token1.decimals);

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
          ).toFixed(pool.token0.decimals),
          borrowShare: fromBigNumber(data._borrowShare0),
          borrowSharefixed: fixed2Decimals(
            data._borrowShare0,
            poolData.token0.decimals
          ).toFixed(pool.token0.decimals),

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
          ).toFixed(poolData.token1.decimals),

          borrowShare: fromBigNumber(data._borrowShare1),
          borrowSharefixed: fixed2Decimals(
            data._borrowShare1,
            poolData.token1.decimals
          ).toFixed(poolData.token1.decimals),

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
      console.log("getPoolBasicData", proxy, pool);
      return pool;
    } catch (error) {
      console.error("REPAY_POOLDATA_ERROR", error);
      throw error;
    }
  }
};

export const getCollateralValue = async (address: any) => {
  const chainId = getChainId(wagmiConfig);
  const compoundAddress =
    contractAddresses[chainId as keyof typeof contractAddresses]?.compound;
  const comet = await getEtherContract(compoundAddress, compoundABI);

  const proxy = await getUserProxy(address);

  // const tokenAddress = token?.address;

  const collateralTokens: any = CompoundBaseTokens[0]?.compoundCollateralTokens;

  const values = (
    await Promise.all(
      collateralTokens.map((token: any) =>
        comet?.userCollateral(proxy, token.address)
      )
    )
  ).map((values: any, i: any) =>
    fixed2Decimals(fromBigNumber(values.balance), collateralTokens[i].decimals)
  );
  const assets = await Promise.all(
    collateralTokens.map((token: any) =>
      comet?.getAssetInfoByAddress(token.address)
    )
  );
  console.log("assets", assets, values);
  const priceFeeds = assets.map((values: any) => values.priceFeed);
  //const quote =  (await Promise.all(collateralTokens.map((token: any)=> comet?.quoteCollateral(token.address, 1)))).map((values: any)=> fromBigNumber(values) )
  const prices = (
    await Promise.all(
      priceFeeds.map((add: any, i: any) => comet?.getPrice(add))
    )
  ).map((value: any) => Number(fromBigNumber(value)) / 10 ** 8);

  const borrowToken = await Promise.all([
    comet?.borrowBalanceOf(proxy),
    comet?.baseTokenPriceFeed(),
  ]);
  const borrowPrice = await comet?.getPrice(borrowToken[1]);

  let totalCollateral = 0;

  const totalBorrow =
    (Number(fromBigNumber(borrowPrice)) / 10 ** 8) *
    fixed2Decimals(
      fromBigNumber(borrowToken[0]),
      CompoundBaseTokens[0].decimals
    );

  for (let i = 0; i < collateralTokens.length; i++) {
    const ltv = fixed2Decimals(fromBigNumber(assets[i].borrowCollateralFactor));

    totalCollateral = totalCollateral + values[i] * prices[i] * ltv;
  }

  const redeemBalanceInUSD = totalCollateral - totalBorrow;

  return { totalCollateral, totalBorrow, redeemBalanceInUSD };

  // return { totalCollateral, totalBorrow, redeemBalanceInUSD };
};

export const getCollateralTokenData = async (token: any, address: any) => {
  const chainId = getChainId(wagmiConfig);
  const compoundAddress =
    contractAddresses[chainId as keyof typeof contractAddresses]?.compound;
  // const comet = await getEtherContract(compoundAddress, compoundABI);

  const proxy = await getUserProxy(address);

  const tokenAddress = token?.address;

  // const contracts: any = [
  //   {
  //     address: compoundAddress,
  //     abi: compoundABI,
  //     functionName: "getAssetInfoByAddress",
  //     args: [tokenAddress],
  //   },
  //   {
  //     address: compoundAddress,
  //     abi: compoundABI,
  //     functionName: "getPrice",
  //     args: [contracts[0].result.priceFeed],
  //   },
  //   {
  //     address: compoundAddress,
  //     abi: compoundABI,
  //     functionName: "userCollateral",
  //     args: [await getUserProxy(address), tokenAddress],
  //   },
  // ];

  // const results = await readContracts(wagmiConfig, { contracts });
  // const assetInfo = results[0].result;
  // const price = results[1].result;
  // const collateralBal = results[2].result;

  // console.log("price", results);

  const assetInfo: any = await readContractLib(
    compoundAddress,
    compoundABI,
    "getAssetInfoByAddress",
    [tokenAddress]
  );
  console.log("aasetInfo", assetInfo.borrowCollateralFactor);
  const price = await readContractLib(
    compoundAddress,
    compoundABI,
    "getPrice",
    [assetInfo.priceFeed]
  );
  const collateralBal: any = await readContractLib(
    compoundAddress,
    compoundABI,
    "userCollateral",
    [proxy, tokenAddress]
  );

  // const collateralBal = await comet?.userCollateral(proxy, tokenAddress);
  console.log("collateralDataCompound", collateralBal, price, assetInfo);
  //const baseToken = await comet?.getCollateralReserves(tokenAddress)
  // quote = await comet?.quoteCollateral(tokenAddress, '1000000000000000000')
  const data = await getAllowance(token, address);

  const info = {
    ...token,
    ...data,
    ltv:
      fixed2Decimals(fromBigNumber(assetInfo.borrowCollateralFactor)) * 100 -
      0.5,
    collateralBalance: fromBigNumber(collateralBal[0]),
    collateralBalanceFixed: fixed2Decimals(
      fromBigNumber(collateralBal[0]),
      token?.decimals || 18
    ),
    // baseToken: fromBigNumber(baseToken),
    price: Number(fromBigNumber(price)) / 10 ** 8,
    //quote: fixed2Decimals(fromBigNumber(quote))
  };
  return info;
};

export const getBorrowTokenData = async (token: any, address: any) => {
  try {
    const chainId = getChainId(wagmiConfig);
    const compoundAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.compound;
    const proxy = await getUserProxy(address);

    const tokenAddress = token?.address;

    const BorrowBal: any = await readContractLib(
      compoundAddress,
      compoundABI,
      "borrowBalanceOf",
      [proxy]
    );
    console.log("borrow Balance", BorrowBal);
    //const assetInfo = await comet?.getAssetInfoByAddress(tokenAddress)
    // const BorrowBal = await comet?.borrowBalanceOf(proxy);
    //  const Bal = await comet?.balanceOf( proxy)
    // const quote = await comet?.quoteCollateral(tokenAddress, '1000000000000000000')

    const borrowMin: any = await readContractLib(
      compoundAddress,
      compoundABI,
      "baseBorrowMin",
      []
    );
    const baseTokenPriceFeed: any = await readContractLib(
      compoundAddress,
      compoundABI,
      "baseTokenPriceFeed",
      []
    );
    const price: any = await readContractLib(
      compoundAddress,
      compoundABI,
      "getPrice",
      [baseTokenPriceFeed]
    );

    // const borrowMin = await comet?.baseBorrowMin();
    // const baseTokenPriceFeed = await comet?.baseTokenPriceFeed();
    // const price = await comet?.getPrice(baseTokenPriceFeed);
    const info = {
      ...token,
      // ltv: fixed2Decimals(fromBigNumber(assetInfo.borrowCollateralFactor))*100,
      // bal: fromBigNumber(Bal),
      borrowBalance: fromBigNumber(BorrowBal),
      borrowBalanceFixed: fixed2Decimals(
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
  user: any,
  fees: any
) => {
  const chainId = getChainId(wagmiConfig);
  const controllerAddress =
    contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
  const instance = await getEtherContract(controllerAddress, controllerABI);

  const parameters = {
    _supplyAsset: tokenIn,
    _borrowAsset: borrowAsset,
    _tokenOut: tokenOut,
    _supplyAmount: supplyAmount,
    _borrowAmount: borrowAmount,
    _user: user,
    _route: fees,
  };
  console.log("instance", instance, parameters);

  const { hash } = await instance?.compoundBorrow(parameters);

  const receipt = await waitForTransaction(hash);
  return hash;
};

export const getCollateralTokenDataAave = async (token: any, address: any) => {
  try {
    // const proxy = await getUserProxy(address);
    const tokenAddress = token.address;
    const chainId = getChainId(wagmiConfig);

    const poolDataAddress: any =
      contractAddresses[chainId as keyof typeof contractAddresses]
        ?.aavePoolDataProvider;

    const poolDataInstance: any = await getEtherContract(
      poolDataAddress,
      aavePoolDataProviderABI
    );

    //get User account data
    const { totalCollateralInUSD, ltv, healthFactor }: any =
      await getAaveUserData(token, address);

    //for fetching Price of any token
    const aaveOracle: any =
      contractAddresses[chainId as keyof typeof contractAddresses]?.aaveOracle;
    const poolOracleInstance: any = await getEtherContract(
      aaveOracle,
      aaveOracleABI
    );
    const price = await poolOracleInstance.getAssetPrice(tokenAddress);

    //for fetching user reserve data for specific token and User
    const userReserveData: any = await poolDataInstance.getUserReserveData(
      tokenAddress,
      address
    );

    const lendAmount = fromBigNumber(userReserveData.currentATokenBalance);
    const collateralAmount = fromBigNumber(
      userReserveData.usageAsCollateralEnabled
        ? userReserveData.currentATokenBalance
        : "0"
    );

    const info = {
      ...token,
      collateralBalance: collateralAmount,
      collateralBalanceFixed: fixed2Decimals(collateralAmount, token.decimals),
      ltv: ltv,
      healthFactorFixed: healthFactor,
      totalLendBalanceFixedinUSd: totalCollateralInUSD,
      lendBalance: fixed2Decimals(lendAmount, token.decimals),
      lendBalanceFixed: fixed2Decimals(lendAmount, token.decimals),
      price: Number(fromBigNumber(price)) / 10 ** 8,
    };
    console.log("user Data", info);
    return info;
  } catch (error) {
    console.error("Error fetching Lend data:", error);
  }
};

export const getBorrowTokenDataAave = async (token: any, userAddress: any) => {
  try {
    const tokenAddress = token.address;
    const chainId = getChainId(wagmiConfig);

    const poolDataAddress: any =
      contractAddresses[chainId as keyof typeof contractAddresses]
        ?.aavePoolDataProvider;
    const poolDataInstance: any = await getEtherContract(
      poolDataAddress,
      aavePoolDataProviderABI
    );

    const aaveOracle: any =
      contractAddresses[chainId as keyof typeof contractAddresses]?.aaveOracle;
    const poolOracleInstance: any = await getEtherContract(
      aaveOracle,
      aaveOracleABI
    );
    //for fetching Price of Token
    const price = await poolOracleInstance.getAssetPrice(tokenAddress);

    //for fetching user Account Account Data
    const { totalBorrowInUSD, totalCollateralInUSD, ltv, healthFactor }: any =
      await getAaveUserData(token, userAddress);

    //for fetching user reserve data for specific token and User
    const userReserveData: any = await poolDataInstance.getUserReserveData(
      tokenAddress,
      userAddress
    );
    // borrow and supply caps
    const userReserveCap: any = await poolDataInstance.getReserveCaps(
      tokenAddress
    );
    console.log("userReserveCap", userReserveCap);
    const borrowAmount = fromBigNumber(
      userReserveData.currentStableDebt + userReserveData.currentVariableDebt
    );

    const info = {
      ...token,
      borrowBalance: borrowAmount,
      borrowBalanceFixed: fixed2Decimals(borrowAmount, token?.decimals),
      price: Number(fromBigNumber(price)) / 10 ** 8,
      ltv: ltv,
      healthFactorFixed: healthFactor,

      totalCollateralInUSD: totalCollateralInUSD,
      totalDebtInUSD: totalBorrowInUSD,
      borrowCap: fixed2Decimals(
        fromBigNumber(userReserveCap.borrowCap),
        token.decimals
      ),
      SupplyCap: fixed2Decimals(
        fromBigNumber(userReserveCap.supplyCap),
        token.decimals
      ),
    };
    console.log("user Data", info);
    return info;
  } catch (error) {
    console.error("Error fetching borrow data:", error);
  }
};

export const getAaveUserData = async (token: any, userAddress: any) => {
  try {
    const chainId = getChainId(wagmiConfig);
    const aavePoolAddress: any =
      contractAddresses[chainId as keyof typeof contractAddresses]
        ?.aavePoolAddress;
    const poolInstance: any = await getEtherContract(
      aavePoolAddress,
      aavePoolABI
    );
    const getUserAccountData = await poolInstance.getUserAccountData(
      userAddress
    );

    const totalCollateralInUSD =
      Number(fromBigNumber(getUserAccountData.totalCollateralBase)) / 10 ** 8;
    const totalBorrowInUSD =
      Number(fromBigNumber(getUserAccountData.totalDebtBase)) / 10 ** 8;
    const ltv = Number(fromBigNumber(getUserAccountData.ltv)) / 100;
    const healthFactor = fromBigNumber(getUserAccountData.healthFactor);
    const redeemBalanceInUSD = totalCollateralInUSD - totalBorrowInUSD;
    console.log("redeeminUsd", redeemBalanceInUSD);
    return {
      redeemBalanceInUSD,
      totalBorrowInUSD,
      totalCollateralInUSD,
      ltv,
      healthFactor,
    };
  } catch (error) {
    console.error("Error fetching user repay amount:", error);
  }
};

export const handleAaveSwap = async (
  tokenIn: string,
  borrowAsset: string,
  tokenOut: string,
  supplyAmount: string,
  borrowAmount: string,
  user: any,
  fees: any
) => {
  const chainId = getChainId(wagmiConfig);
  const controllerAddress =
    contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
  const instance = await getEtherContract(controllerAddress, controllerABI);

  const parameters = {
    _supplyAsset: tokenIn,
    _borrowAsset: borrowAsset,
    _tokenOut: tokenOut,
    _supplyAmount: supplyAmount,
    _borrowAmount: borrowAmount,
    _user: user,
    _route: fees,
  };
  console.log("instance", instance, parameters);

  const { hash } = await instance?.compoundBorrow(parameters);

  const receipt = await waitForTransaction(hash);
  return hash;
};
export const handleAaveRedeem = async (
  lend: any,
  user: any,
  selectedData: any,
  borrowAmount: any,
  fees: any
) => {
  try {
    const chainId = getChainId(wagmiConfig);
    const controllerAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
    const instance = await getEtherContract(controllerAddress, controllerABI);

    const parameters = {
      _user: user,
      _collateralToken: selectedData?.borrow.address,
      _collateralAmount: decimal2Fixed(lend, selectedData?.lend.decimals),
      _tokenOut: selectedData?.receive.address,
      _route: fees,
    };
    console.log("handleComReeem", parameters);

    const { hash } = await instance?.compRedeem(parameters);
    console.log("transaction", hash);
    const receipt = await waitForTransaction(hash);
    return receipt;
    return "";
  } catch (error) {
    console.log("Error", { error });

    throw error;
  }
};

export const handleAaveRepay = async (
  lend: any,
  user: any,
  selectedData: any,
  borrowAmount: any,
  fees: any
) => {
  try {
    const chainId = getChainId(wagmiConfig);
    const controllerAddress =
      contractAddresses[chainId as keyof typeof contractAddresses]?.controller;
    const instance = await getEtherContract(controllerAddress, controllerABI);

    const parameters = {
      _borrowedToken: selectedData?.borrow.address,
      _tokenIn:
        lend == "" ? selectedData?.borrow.address : selectedData?.lend.address,
      _repayAmount: decimal2Fixed(lend, selectedData?.lend.decimals),
      _route: fees,
    };
    const { hash } = await instance?.compRepay(parameters);
    console.log("transaction", hash);
    const receipt = await waitForTransaction(hash);
    return receipt;
    return "";
  } catch (error) {
    console.log("Error", { error });

    throw error;
  }
};

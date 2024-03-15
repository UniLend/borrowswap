import { borrowswapABI, coreAbi, erc20Abi, helperAbi } from "./abi";
import { readContracts, writeContract } from "wagmi/actions";
import { getEtherContract } from "./ethers";
import { add, decimal2Fixed, div, fixed2Decimals, fromBigNumber, greaterThan, mul, sub, toAPY } from '../../helpers/index';
import { readContract, waitForTransactionReceipt, getBlockNumber } from '@wagmi/core'
import { wagmiConfig } from "../../main";

export const waitForTransaction = async (hash: any) => {
  try {
    const receipt = await waitForTransactionReceipt( wagmiConfig, {
      hash: hash,
      confirmations: 5
    })

    const status = await watchBlock(receipt.blockNumber);    
    return receipt;
  } catch (error) {
    throw error
  }

};

const watchBlock = async (prevBlockNumber: any)=>{
  const blockNumber = await getBlockNumber(wagmiConfig)

 await new Promise((resolve, reject ) => {
  if( blockNumber - prevBlockNumber > 3 ){
   return resolve(true)
  } else {
    setTimeout(async() => {
     await watchBlock(prevBlockNumber)
    }, 2000);
    
  }

 })



}



export const handleApproval = async (
  tokenAddress: string,
  user: `0x${string}` | undefined,
  amount: string | number
) => {
  var maxAllow =
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";
  const instance = await getEtherContract(tokenAddress, erc20Abi);

  const Amount =
   amount == ''
      ? maxAllow
      : (Number(amount) * 10 ** 18).toString();

  const { hash } = await instance?.approve(
    "0xD31F2869Fd5e4422c128064b2EaDa33C6390bf6E",
    Amount
  );
const receipt = await waitForTransaction(hash)
console.log("receipt ", receipt)
  return receipt;
};


export const handleSwap = async (amount: any) => {

  try {
    const instance = await getEtherContract('0xD31F2869Fd5e4422c128064b2EaDa33C6390bf6E', borrowswapABI);

    const borrowAmount =   ((Number(decimal2Fixed(amount)) *2.6) *0.35 ).toString();
  
  
    const {hash} = instance?.InitBorrow(
      '0x784c4a12f82204e5fb713b055de5e8008d5916b6',
      '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a',
      '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      '0x172370d5cd63279efa6d502dab29171933a610af',
      decimal2Fixed(amount),
      borrowAmount
    )
    console.log(hash);
    const receipt = await waitForTransaction(hash)
    return receipt
  } catch (error) {

    console.log("Error", {error});

    throw error
  }

}



export const getAllowance = async (
  token: any,
  user: `0x${string}` | undefined
) => {
  try {
    var maxAllow =
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";
    const instance = await getEtherContract(token.address, erc20Abi);

    const allowance = await instance?.allowance(
      user,
      "0xD31F2869Fd5e4422c128064b2EaDa33C6390bf6E"
    );
  
    const allowanceFixed = Number(fromBigNumber(allowance)) == Number(maxAllow) ? fromBigNumber(allowance): fixed2Decimals(fromBigNumber(allowance), token.decimals)
    
     const bal = await instance?.balanceOf(user);
  
    return { allowance: fromBigNumber(allowance), allowanceFixed: allowanceFixed ,  balance: fromBigNumber(bal)};
  } catch (error) {
    console.log(error);
    
    throw error
  }

};


export const getPoolData = (poolAddress: string) => {

}


export const  getPoolBasicData = async (
  contracts: any,
  poolAddress: string,
  poolData: any,
  userAddress: any,
) => {

  //  console.log(contracts, poolAddress, poolData, userAddress);
   

  let pool = {...poolData};
  if (true) {
    try {
      
      const instance = await getEtherContract(contracts.helperAddress, helperAbi )
      const oracleInstance = await getEtherContract(contracts.coreAddress, coreAbi)
         const [token0, token1, data] = await Promise.all([getAllowance(pool.token0, userAddress), getAllowance(pool.token1, userAddress), instance?.getPoolFullData(
          contracts.positionAddress,
           poolAddress,
           userAddress
        )
      ]);
     // const token0 = await getAllowance(pool.token0.address, userAddress)


      let token0Price = 0
      let token1Price = 0
      
      if(poolData.token0.decimals == 6 || poolData.token1.decimals == 6){
        let oracleData = await oracleInstance?.getOraclePrice(poolData.token1.address, poolData.token0.address, decimal2Fixed(1, poolData.token1.decimals))
       const Price = fixed2Decimals(oracleData, poolData.token0.decimals);

       token1Price = Price;
       token0Price = (1 / Price);
      } else {
        let oracleData = await oracleInstance?.getOraclePrice(poolData.token0.address, poolData.token1.address, decimal2Fixed(1, poolData.token0.decimals))
        const Price = fixed2Decimals(oracleData, poolData.token0.decimals);
 
        token0Price = Price;
        token1Price = (1 / Price);
      }



     

      const totLiqFull0 = add(
        div(mul(pool.liquidity0
          , 100), pool.rf),
        fromBigNumber(data._totalBorrow0),
      );

      const totLiqFull1 = add(
        div(mul(pool.liquidity1, 100), pool.rf),
        fromBigNumber(data._totalBorrow1),
      );
   let collateral0 = mul(
    div(
      mul(
        Number(mul(Number(fromBigNumber(data._borrowBalance1)), Number(token1Price))) / poolData.maxLTV,
        100,
      ),
      10 ** poolData.token1.decimals,
    ),
    10 ** poolData.token0.decimals,
  )
  let  collateral1 = mul(
    div(
      mul(
        Number(mul(Number(fromBigNumber(data._borrowBalance0)), Number(token0Price))) / poolData.maxLTV
        ,
        100,
      ),
      10 ** poolData.token0.decimals,
    ),
    10 ** poolData.token1.decimals,
  )
    let redeem0 = sub(fromBigNumber(data._lendBalance0), collateral0)
     let redeem1 = sub(fromBigNumber(data._lendBalance1), collateral1)

      
      pool = {
        ...pool,
        token0: {
          ...pool?.token0,
          priceRatio : token0Price,
          balance : fromBigNumber(token0.balance),
          balanceFixed : fixed2Decimals(
              token0.balance,
               pool.token0.decimals,
             ),
            allowance: fromBigNumber(token0.allowance),
            allowanceFixed: fixed2Decimals(
              token0.allowance,
              pool.token0.decimals
            ) ,
          borrowBalance: fromBigNumber(data._borrowBalance0),
          borrowBalanceFixed: fixed2Decimals(
            data._borrowBalance0,
            pool.token0.decimals,
          ),
          borrowShare: fromBigNumber(data._borrowShare0),
          borrowSharefixed: fixed2Decimals(
            data._borrowShare0,
            poolData.token0.decimals,
          ),

          healthFactor18: fromBigNumber(data._healthFactor0),
          healthFactorFixed: fixed2Decimals(data._healthFactor0, 18),
          healthFactor: greaterThan(
            fixed2Decimals(data._healthFactor0, 18),
            100,
          )
            ? '100'
            : Number(fixed2Decimals(data._healthFactor0, 18)).toFixed(2),

          interest: fromBigNumber(data._interest0),
          interestFixed: fixed2Decimals(
            data._interest0,
            pool.token0.decimals,
          ),

          lendBalance: fromBigNumber(data._lendBalance0),
          lendBalanceFixed: fixed2Decimals(
            data._lendBalance0,
            pool.token0.decimals,
          ),

          lendShare: fromBigNumber(data._lendShare0),
          lendShareFixed: fixed2Decimals(
            data._lendShare0,
            pool.token0.decimals            ,
          ),

          totalBorrow: fromBigNumber(data._totalBorrow0),
          totalBorrowFixed: fixed2Decimals(
            data._totalBorrow0,
            pool.token0.decimals,
          ),

          totalBorrowShare: fromBigNumber(data._totalBorrowShare0),
          totalBorrowShareFixed: fixed2Decimals(
            data._totalBorrowShare0,
            pool.token0.decimals,
          ),

          totalLendShare: fromBigNumber(data._totalLendShare0),
          totalLendShareFixed: fixed2Decimals(
            data._totalLendShare0,
            pool.token0.decimals,
          ),
          totalLiqFull: totLiqFull0,
          utilRate: Number(
            mul(div(fromBigNumber(data._totalBorrow0), totLiqFull0), 100),
          ).toFixed(2),
          borrowAPY: toAPY(
            fixed2Decimals(data._interest0, poolData.token0.decimals),
          ),

          lendAPY: div(
            toAPY(fixed2Decimals(data._interest0, poolData.token0.decimals)),
            div(totLiqFull0, fromBigNumber(data._totalBorrow0)),
          ),
          collateralBalance : collateral0 ,
          collateralBalanceFixed: fixed2Decimals( collateral0, poolData.token0.decimals),
          redeemBalance: Number(redeem0) > 0? redeem0: 0,
          redeemBalanceFixed: fixed2Decimals(Number(redeem0) > 0? redeem0: 0, poolData.token0.decimals)
        },
        token1: {
          ...poolData?.token1,
          priceRatio : token1Price,
          balance : fromBigNumber(token1.balance),
          balanceFixed : fixed2Decimals(
              token1.balance,
               pool.token0.decimals,
             ),
            allowance: fromBigNumber(token1.allowance) ,
            allowanceFixed: fixed2Decimals(
              token1.allowance,
              pool.token0.decimals
            ).toString() ,
          borrowBalance: fromBigNumber(data._borrowBalance1),
          borrowBalanceFixed: fixed2Decimals(
            data._borrowBalance1,
            poolData.token1.decimals,
          ),

          borrowShare: fromBigNumber(data._borrowShare1),
          borrowSharefixed: fixed2Decimals(
            data._borrowShare1,
            poolData.token1.decimals,
          ),

          healthFactor18: fromBigNumber(data._healthFactor1),
          healthFactorFixed: fixed2Decimals(data._healthFactor1, 18),
          healthFactor: greaterThan(
            fixed2Decimals(data._healthFactor1, 18),
            100,
          )
            ? '100'
            : Number(fixed2Decimals(data._healthFactor1, 18)).toFixed(2),

          interest: fromBigNumber(data._interest1),
          interestFixed: fixed2Decimals(
            data._interest0,
            poolData.token0.decimals,
          ),

          lendBalance: fromBigNumber(data._lendBalance1),
          lendBalanceFixed: fixed2Decimals(
            data._lendBalance1,
            poolData.token1.decimals,
          ),

          lendShare: fromBigNumber(data._lendShare1),
          lendShareFixed: fixed2Decimals(
            data._lendShare1,
            poolData.token1.decimals,
          ),

          totalBorrow: fromBigNumber(data._totalBorrow1),
          totalBorrowFixed: fixed2Decimals(
            data._totalBorrow1,
            poolData.token1.decimals,
          ),

          totalBorrowShare: fromBigNumber(data._totalBorrowShare1),
          totalBorrowShareFixed: fixed2Decimals(
            data._totalBorrowShare1,
            poolData.token1.decimals,
          ),

          totalLendShare: fromBigNumber(data._totalLendShare1),
          totalLendShareFixed: fixed2Decimals(
            data._totalLendShare1,
            poolData.token1.decimals,
          ),
          totalLiqFull: totLiqFull1,
          utilRate: Number(
            mul(div(fromBigNumber(data._totalBorrow1), totLiqFull1), 100),
          ).toFixed(4),
          borrowAPY: toAPY(
            fixed2Decimals(data._interest1, poolData.token1.decimals),
          ),
          lendAPY: div(
            toAPY(fixed2Decimals(data._interest1, poolData.token1.decimals)),
            div(totLiqFull1, fromBigNumber(data._totalBorrow1)),
          ),
          collateralBalance : collateral1,
          collateralBalanceFixed: fixed2Decimals( collateral1, poolData.token1.decimals),
          redeemBalance: Number(redeem1)> 0? redeem1: 0,
          redeemBalanceFixed: fixed2Decimals( Number(redeem1)> 0? redeem1: 0, poolData.token1.decimals) 
        },
      }


      console.log("poolData", pool);
      return pool;
    } catch (error) {
       console.error(error);
      throw error;
    }
  }
};
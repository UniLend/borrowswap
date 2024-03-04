import { borrowswapABI, erc20Abi, helperAbi } from "./abi";
import { readContracts, writeContract } from "wagmi/actions";
import { getEtherContract } from "./ethers";
import { add, decimal2Fixed, div, fixed2Decimals, fromBigNumber, greaterThan, mul, toAPY } from '../../helpers/index';
import { readContract } from '@wagmi/core'
import { wagmiConfig } from "../../main";

export const contracts = {};

export const handleApproval = async (
  tokenAddress: string,
  user: `0x${string}` | undefined,
  amount: string
) => {
  var maxAllow =
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";
  const instance = await getEtherContract(tokenAddress, erc20Abi);

  const Amount =
    tokenAddress == "0x172370d5cd63279efa6d502dab29171933a610af"
      ? maxAllow
      : (Number(amount) * 10 ** 18).toString();

  const { hash } = await instance.approve(
    "0xD31F2869Fd5e4422c128064b2EaDa33C6390bf6E",
    Amount
  );

  return hash;
};


export const handleSwap = async (amount: any) => {
  const instance = await getEtherContract('0xD31F2869Fd5e4422c128064b2EaDa33C6390bf6E', borrowswapABI);

  const borrowAmount =   ((Number(decimal2Fixed(amount)) *2.6) *0.35 ).toString();

console.log(  amount , fixed2Decimals(borrowAmount),
decimal2Fixed(amount),
 borrowAmount );

  const {hash} = instance.InitBorrow(
    '0x784c4a12f82204e5fb713b055de5e8008d5916b6',
    '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a',
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    '0x172370d5cd63279efa6d502dab29171933a610af',
    decimal2Fixed(amount),
    borrowAmount
  )
  console.log(hash);
  
  return hash
}

export const getAllowance = async (
  address: string,
  user: `0x${string}` | undefined
) => {
  const instance = await getEtherContract(address, erc20Abi);

  const allowance = await instance.allowance(
    user,
    "0xD31F2869Fd5e4422c128064b2EaDa33C6390bf6E"
  );

  const bal = await instance.balanceOf(user);

  return { allowance: fromBigNumber(allowance), balance: fromBigNumber(bal)};
};


export const getPoolData = (poolAddress: string) => {

}


export const  getPoolBasicData = async (
  contracts: any,
  poolAddress: string,
  poolData: any,
  userAddress: any
) => {

    

  let pool = {...poolData};
  if (true) {
    try {
      
      const instance = await getEtherContract(contracts.helperAddress, helperAbi )

         const [token0, token1] = await Promise.all([getAllowance(pool.token0.address, userAddress), getAllowance(pool.token1.address, userAddress)]);

      
         console.log(token0, token1);
         
        //  pool.token0.;
        //  pool.token0.;
   
        //  pool.token1.balance = fromBigNumber(token1.balance);
        //  pool.token1.balanceFixed = fixed2Decimals(
        //   token1.balance,
        //    poolData.token1.decimals,
        //  );
        //  pool.token0.allowance = fromBigNumber(token0.allowance);
        //  pool.token0.allowanceFixed = fixed2Decimals(
        //   token0.allowance,
        //    poolData.token0.decimals,
        //  );
   
        //  pool.token1.allowance = fromBigNumber(token1.allowance);
        //  pool.token1.allowanceFixed = fixed2Decimals(
        //   token1.allowance,
        //    poolData.token1.decimals,
        //  );
   
         
         
        const data = await instance.getPoolFullData(
          contracts.positionAddress,
           poolAddress,
           userAddress
        )
      


      const totLiqFull0 = add(
        div(mul(pool.token0.liquidity, 100), pool.rf),
        fromBigNumber(data._totalBorrow0),
      );

      const totLiqFull1 = add(
        div(mul(pool.token1.liquidity, 100), pool.rf),
        fromBigNumber(data._totalBorrow1),
      );
      pool = {
        ...pool,
        token0: {
          ...pool?.token0,
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
        },
        token1: {
          ...poolData?.token1,
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
        },
      }

      console.log("poolData", pool, poolData);
      return pool;
    } catch (error) {
       console.error(error);
      throw error;
    }
  }
};
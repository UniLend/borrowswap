import { ethers } from 'ethers';
import { getTokenPrice } from '../api/axios/calls';
import {store} from '../states/store'
import { setPools, setTokens } from '../states/unilendV2Reducer';
export function fromBigNumber(bignumber: any) {
    return ethers.BigNumber.from(bignumber).toString();
  }

  export function decimal2Fixed(amount: any, decimals=18) {
    let newNum = (Number(amount) * (10 ** decimals)).toFixed()

    if (newNum.indexOf('.') > -1) {
      newNum = newNum.split('.')[0];
    }
  
    return newNum.toString();
  }
  
  export function fixed2Decimals(amount: any, decimals = 18) {
    const amt = amount?._hex ? amount?._hex : amount;
    const dec = fromBigNumber(decimals);

    
    return  (Number((amt)) / (10 ** Number(dec)));
  }

  export const checkOpenPosition = (position: any)  => {
    if (
      (Number(position.lendBalance0) > 0 || Number(position.lendBalance1)) > 0
    ) {
      return true;
    }
    return false;
  };
  


 export const loadPoolsWithGraph = async (data: any, chain: any) => {
  
    if (data ) {
      const allPositions = data?.positions;
      const poolData: any = {};
      const tokenList: any = {};
      const poolsData = Array.isArray(data.pools) && data.pools;
      const tokenPrice = await getTokenPrice(data, chain)
  console.log('tokenPrice', tokenPrice);
  
      for (const pool of poolsData) {
   
  
        const openPosiions = allPositions.filter(
          (el: any) => el?.pool?.pool == pool.pool,
        );
        const poolInfo = {
          ...pool,
          poolAddress: pool?.pool,
  
          totalLiquidity:
            fixed2Decimals(pool.liquidity0, pool.token0.decimals) *
              tokenPrice[pool?.token0?.id] +
            fixed2Decimals(pool.liquidity1, pool.token1.decimals) *
              tokenPrice[pool?.token1?.id] +
            (fixed2Decimals(pool.totalBorrow0, pool.token0.decimals) *
              tokenPrice[pool?.token0?.id] +
              fixed2Decimals(pool.totalBorrow1, pool.token1.decimals) *
                tokenPrice[pool?.token1?.id]),
  
          totalBorrowed:
            fixed2Decimals(pool.totalBorrow0, pool.token0.decimals) *
              tokenPrice[pool?.token0?.id] +
            fixed2Decimals(pool.totalBorrow1, pool.token1.decimals) *
              tokenPrice[pool?.token1?.id],
  
          openPosition:
            openPosiions.length > 0 && checkOpenPosition(openPosiions[0]),
          token0: {
            ...pool.token0,
            address: pool?.token0?.id,
            
            priceUSD: tokenPrice[pool?.token0?.id] * pool.token0.decimals,
            pricePerToken: tokenPrice[pool?.token0?.id],
          },
          token1: {
            ...pool.token1,
            address: pool?.token1?.id,
       
            priceUSD: tokenPrice[pool?.token1?.id] * pool.token1.decimals,
            pricePerToken: tokenPrice[pool?.token1?.id],
          },
        };
        tokenList[String(pool.token0.id).toUpperCase() ] = {
          ...pool.token0,
          address: pool?.token0?.id,
         
          priceUSD: tokenPrice[pool?.token0?.id] * pool.token0.decimals,
          pricePerToken: tokenPrice[pool?.token0?.id],
        };
        tokenList[String(pool.token1.id).toUpperCase()] = {
          ...pool.token1,
          address: pool?.token1?.id,
         
          priceUSD: tokenPrice[pool?.token1?.id] * pool.token1.decimals,
          pricePerToken: tokenPrice[pool?.token1?.id],
        };
        poolData[pool?.pool as keyof typeof poolData] = poolInfo;
      }
      store.
      dispatch(setPools(poolData));
      store.dispatch(setTokens(tokenList));
      console.log({ poolData, tokenList });
      
    }
  };
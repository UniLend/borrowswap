export const getPoolCreatedGraphQuery = (address: `0x${string}` | undefined) => {
    const query = `
    {
        positions(where: {owner: "${
          address || '0x0000000000000000000000000000000000000000'
        }"}) {
          id
          owner
          pool {
            id
            pool
          }
          lendBalance0
          lendBalance1
        }
        pools {
              token0 {
        symbol
        name
        
        poolCount
        lentCount
        borrowCount
        id
        txCount
        totalPoolsLiquidityUSD
        totalPoolsLiquidity
        decimals
        }
          token1 {
        symbol
        name
        
        poolCount
        lentCount
        borrowCount
        id
        txCount
        totalPoolsLiquidityUSD
        totalPoolsLiquidity
        decimals
        }
          borrowApy0
          borrowApy1
          UtilizationRate0
          UtilizationRate1
          blockNumber
          blockTimestamp
          id
          interest0
          interest1
          lB
          lendApy0
          lendApy1
          lendingPositionCount
          liquidity0
          liquidity1
          maxLTV
          openPositionCount
          pool
          poolNo
          rf
          totalBorrow0
          totalBorrow1
          transactionHash
          txCount
        }
        assetOracles {
          id
          asset
          source
        }
      }
    `;
    return query;
  };
import { ethers } from 'ethers'
import { computePoolAddress } from '@uniswap/v3-sdk'
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import {
  POOL_FACTORY_CONTRACT_ADDRESS,
  QUOTER_CONTRACT_ADDRESS,
  USDC_TOKEN, WETH_TOKEN 
} from '../../helpers/constants'

import { toReadableAmount, fromReadableAmount } from '../../helpers'


import { Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { getEthersProvider } from '../contracts/ethers'

// Inputs that configure this example to run
export interface ExampleConfig {
  rpc: {
    local: string
    mainnet: string
  }
  tokens: {
    in: Token
    amountIn: number
    out: Token
    poolFee: number
  }
}

// Example Configuration

export const CurrentConfig: ExampleConfig = {
  rpc: {
    local: 'http://localhost:8545',
    mainnet: '',
  },
  tokens: {
    in: USDC_TOKEN,
    amountIn: 1000,
    out: WETH_TOKEN,
    poolFee: FeeAmount.MEDIUM,
  },
}

export async function quote(): Promise<string> {
  const quoterContract = new ethers.Contract(
    QUOTER_CONTRACT_ADDRESS,
    Quoter.abi,
    getEthersProvider()
  )
  const poolConstants = await getPoolConstants()

  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    poolConstants.token0,
    poolConstants.token1,
    poolConstants.fee,
    fromReadableAmount(
      CurrentConfig.tokens.amountIn,
      CurrentConfig.tokens.in.decimals
    ).toString(),
    0
  )

  return toReadableAmount(quotedAmountOut, CurrentConfig.tokens.out.decimals)
}

async function getPoolConstants(): Promise<{
  token0: string
  token1: string
  fee: number
}> {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: CurrentConfig.tokens.in,
    tokenB: CurrentConfig.tokens.out,
    fee: CurrentConfig.tokens.poolFee,
  })

  const poolContract = new ethers.Contract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi,
    getEthersProvider()
  )
  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ])

  return {
    token0,
    token1,
    fee,
  }
}
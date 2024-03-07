// This file stores web3 related constants such as addresses, token definitions, ETH currency references and ABI's

import {  Token, SUPPORTED_CHAINS } from '@uniswap/sdk-core'

// Addresses

export const POOL_FACTORY_CONTRACT_ADDRESS =
  '0x1F98431c8aD98523631AE4a59f267346ea31F984'
export const QUOTER_CONTRACT_ADDRESS =
  '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'

// Currencies and Tokens

export const WETH_TOKEN = new Token(
  137,
  '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  18,
)
export const CURV_TOKEN = new Token(
    137,
    '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
    18,
  )

export const USDT_TOKEN = new Token(
  137,
  '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  6,
)
import React, { useEffect, useState } from "react";
import { erc20Abi } from "viem";
import { useWriteContract, useAccount, useReadContract } from "wagmi";
import {getAllowance, handleApproval, handleSwap} from '../../api/contracts/actions'
import { fixed2Decimals } from "../../helpers";
import type { UnilendV2State } from '../../states/store';
import { wagmiConfig } from "../../main";
import { useSelector, useDispatch } from 'react-redux'
import "./index.scss";
import useWalletHook from "../../api/hooks/useWallet";

export default function Card() {
const unilendV2Data = useSelector((state: UnilendV2State)=> state.unilendV2)
const { tokenList, poolList} = unilendV2Data;
const [ tokenAllowance, setTokenAllowance ] = useState({ token1: '0', token2: '0' })
const { address , isConnected} = useWalletHook()
const [lendAmount, setLendAmount] = useState('')

const [lendingTokens, setLendingTokens] = useState<Array<any>>([])
const [borrowingTokens, setBorrowingTokens] = useState<Array<any>>([])
const [lendToken, setLendToken] = useState({address: ''})

const handleLendAmount = (amount: string) => {
 setLendAmount((amount)  )
}



const handleSelectLendToken = (token: string) => {

const lendToken = tokenList[token.toUpperCase() as keyof typeof tokenList]
setLendToken(lendToken )
console.log(lendToken, token, tokenList);

const tokenPools = Object.values(poolList).filter((pool) => {
     if(pool.token0.address == token || pool.token1.address == token ){
      return true
     }
})

const borrowTokens = tokenPools.map((pool) => {
  if(pool.token0.address == token  ){
    return pool.token1
   } else {
    return pool.token0
   }
} )



setBorrowingTokens(borrowTokens)

}

const handleSelectBorrowToken = (token: string) => {
  const borrowToken = tokenList[token.toUpperCase() as keyof typeof tokenList]

  const tokenPools = Object.values(poolList).find((pool) => {
    if((pool.token1.address == token && pool.token0.address == lendToken?.address) || (pool.token0.address == token && pool.token1.address == lendToken?.address) ){
      return true
     }
})

console.log( borrowToken, tokenPools  );


}

const handleAllowance = async (tokenAddress: string) => {
const hash = await handleApproval(tokenAddress, address, lendAmount)

}

const handleSwapTransaction = async () => {
  const hash = await handleSwap(lendAmount)
}
const checkAllowance = async () => {
  const token1Allowance = await getAllowance('0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a', address)
  const token2Allowance = await getAllowance('0x172370d5cd63279efa6d502dab29171933a610af', address)

  console.log(token1Allowance, token2Allowance);
  setTokenAllowance({
    token1: fixed2Decimals(token1Allowance).toString(),
    token2: token2Allowance
  })
  
}


useEffect(() => {
console.log("unilend", unilendV2Data);

const tokensArray = Object.values(tokenList)

setLendingTokens(tokensArray)

}, [unilendV2Data])





  return (
    <div className="card_container">
      <div className="card">
        <div className="input_container">
            <span>You Pay</span>
            <input value={lendAmount} onChange={(e)=> handleLendAmount(e.target.value)} type="number" placeholder="0" />
            <select onChange={(e)=> handleSelectLendToken(e.target.value)} >
            <option value="">Select Token</option>
              {
                lendingTokens.map((token, i) => <option key={i} value={token.address}>{token?.name}</option>)
              }
                
            </select>
        </div>
        <div className="route">
        <select onChange={(e)=> handleSelectBorrowToken(e.target.value)}>
        <option value="">Select Token</option>

        {
          borrowingTokens.map((token, i)=> <option key={i} value={token.address}>{token?.name}</option>)
        }
            </select>
        </div>
        <div className="input_container">
            <span>You Received</span>
            <input type="number" placeholder="0" />
            <select>
                <option value="UFT">UFT</option>
                <option value="UNI">UNI</option>
                <option value="DAI">DAI</option>
            </select>
        </div>
        <div className="button_container">
          {
            (Number(lendAmount)> 0 )  ? (Number(lendAmount) > Number(tokenAllowance.token1) || (Number(lendAmount) > Number(tokenAllowance.token2)))? <>

            <button className={`${Number(lendAmount) < Number(tokenAllowance.token1) ? 'approved': ''}`} onClick={()=>handleAllowance('0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a')}  >{Number(lendAmount) < Number(tokenAllowance.token1) ? 'Approved': 'Approve 1' }</button>
            <button className={`${Number(lendAmount) < Number(tokenAllowance.token2) ? 'approved': ''}`} onClick={()=>handleAllowance('0x172370d5cd63279efa6d502dab29171933a610af')} >{Number(lendAmount) < Number(tokenAllowance.token2) ? 'Approved': 'Approve 2' }</button>
           </>: <button onClick={handleSwapTransaction} >Borrow</button>  :
            <button disabled >Enter Amount</button>   
          }
           
        </div>
      </div>
    </div>
  );
}

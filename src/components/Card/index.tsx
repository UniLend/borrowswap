import React, { useEffect, useState } from "react";
import { erc20Abi } from "viem";
import { useWriteContract, useAccount } from "wagmi";
import {getAllowance, handleApproval, handleSwap} from '../../api/contracts/actions'
import { fixed2Decimals } from "../../helpers";
import { wagmiConfig } from "../../main";
import "./index.scss";

export default function Card() {
const [ tokenAllowance, setTokenAllowance ] = useState({ token1: '0', token2: '0' })
const { address , isConnected} = useAccount()
const [lendAmount, setLendAmount] = useState('')

const handleLendAmount = (amount: string) => {
 setLendAmount((amount)  )
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
    token1: fixed2Decimals(token1Allowance),
    token2: token2Allowance
  })
  
}

useEffect(()=> {
  if(address && isConnected){
console.log(address , isConnected);
 setTimeout(() => {
  checkAllowance()
 }, 1000);
  
  }
}, [isConnected])

useEffect(()=> {
console.log(Number(lendAmount) < Number(tokenAllowance.token1), lendAmount < tokenAllowance.token2, lendAmount, tokenAllowance);

},[lendAmount])

  return (
    <div className="card_container">
      <div className="card">
        <div className="input_container">
            <span>You Pay</span>
            <input value={lendAmount} onChange={(e)=> handleLendAmount(e.target.value)} type="number" placeholder="0" />
            <select>
                <option value="UFT">UFT</option>
                <option value="UNI">UNI</option>
                <option value="DAI">DAI</option>
            </select>
        </div>
        <div className="route">
        <select>
                <option value="UFT">UFT</option>
                <option value="UNI">UNI</option>
                <option value="DAI">DAI</option>
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

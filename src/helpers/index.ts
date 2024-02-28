import { ethers } from 'ethers';
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

    
    return  (Number((amt)) / (10 ** Number(dec))).toString();
  }
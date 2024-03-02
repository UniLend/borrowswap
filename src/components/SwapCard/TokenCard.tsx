import React from "react";
import "./TokenCard.scss";

export default function TokenCard({ token }: any) {
  const handleTokensList = () => {
    // handleCloseModals();
    // setSelectedToken(token);
  };

  return (
    <div onClick={handleTokensList} className='token_card'>
      <div className='tokens_details'>
        <img src={token.logoURI || token.logo} alt='' />
        <div>
          <h3>{token.name}</h3>
          <span>{token.symbol}</span>
        </div>
      </div>
      <div className='pool_details'>
        <div className='pool_logo'>
          <img src={token.logo} alt='' />
          <img src={token.logo} alt='' />
        </div>
        <p className='paragraph03'>LTV: 30%</p>
      </div>
    </div>
  );
}

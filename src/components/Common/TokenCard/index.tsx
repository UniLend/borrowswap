import React from "react";
import "./index.scss";

interface Token {
  logoURI?: string;
  logo: string;
  name: string;
  symbol: string;
}

interface TokenCardProps {
  token: Token;
  onClick: (token: Token) => void;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, onClick }) => {
  const handleTokensList = () => {
    onClick(token);
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
      {/* TODO: update token pool data */}
      <div className='pool_details'>
        <div className='pool_logo'>
          <img src={token.logo} alt='' />
          <img src={token.logo} alt='' />
        </div>
        <p className='paragraph03'>LTV: 30%</p>
      </div>
    </div>
  );
};

// Default Props
TokenCard.defaultProps = {
  onClick: (token: Token) => {},
};

export default TokenCard;

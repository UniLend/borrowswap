import React from "react";
import "./index.scss";

interface Token {
  logoURI?: string;
  logo: string;
  name: string;
  symbol: string;
}
enum ActiveOperation {
  BRROW = "Borrow_Swap",
  REPAY = "Swap_Repay",
}

interface TokenCardProps {
  token: Token;
  onClick: (token: Token) => void;
  operation?: ActiveOperation;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, onClick, operation }) => {
  const handleTokensList = () => {
    onClick(token);
  };

  return (
    <>
      {operation === ActiveOperation.BRROW ? (
        <div onClick={handleTokensList} className='token_card'>
          <div className='tokens_details'>
            <img src={token.logoURI || token.logo} alt='' />
            <div>
              <div className='token_pool_logo'>
                <h3>{token.symbol}</h3>
                {/* TODO: update the condition */}
                {true && (
                  <div className='pool_logo'>
                    <img src={token.logo} alt='' />
                    <img src={token.logo} alt='' />
                  </div>
                )}
              </div>
              <span>Borrow APY: 30%</span>
            </div>
          </div>
          {/* TODO: update token pool data */}
          <div className='pool_details'>
            <div>
              <p className='paragraph06'>Unilend</p>
              <img src={token.logo} alt='' />
            </div>
            <p className='paragraph06'>Max LTV: 30%</p>
          </div>
        </div>
      ) : (
        <div onClick={handleTokensList} className='token_card'>
          <div className='tokens_details'>
            <img src={token.logoURI || token.logo} alt='' />
            <div>
              <div className='token_pool_logo'>
                <h3>{token.symbol}</h3>
              </div>
            </div>
          </div>
          {/* TODO: update token pool data */}
          <div className='pool_details'>
            <div className='pool_logo'>
              <img src={token.logo} alt='' />
              <img src={token.logo} alt='' />
            </div>
            <p className='paragraph06'>Repay: 512.02</p>
          </div>
        </div>
      )}
    </>
  );
};

// Default Props
TokenCard.defaultProps = {
  onClick: (token: Token) => {},
};

export default TokenCard;

import React from "react";
import "./index.scss";
import { truncateToDecimals } from "../../../helpers";

interface Token {
  logoURI?: string;
  logo: string;
  name: string;
  symbol: string;
  pairToken: any; //TODO update
  maxLTV: string;
  borrowApy: string;
}
enum ActiveOperation {
  BRROW = "Borrow_Swap",
  REPAY = "Swap_Repay",
}

interface TokenCardProps {
  token: Token;
  onClick: (token: Token) => void;
  operation?: ActiveOperation;
  showPoolData?: boolean;
  poolData?: any; // update later
}

const TokenCard: React.FC<TokenCardProps> = ({
  token,
  onClick,
  operation,
  showPoolData,
  poolData,
}) => {
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
                {/* TODO: update the unilend tokens condition in place if true */}
                {true && showPoolData && (
                  <div className='pool_logo'>
                    <img src={token.logo} alt='' />
                    <img src={token.pairToken?.logo} alt='' />
                  </div>
                )}
              </div>
              {showPoolData && (
                <span>
                  Borrow APY: {truncateToDecimals(+token.borrowApy, 2)}%
                </span>
              )}
            </div>
          </div>
          {/* TODO: update token pool data */}
          <div className='pool_details'>
            <div>
              <p className='paragraph06'>Unilend</p>
              <img src={token.logoURI || token.logo} alt='' />
            </div>
            {showPoolData && (
              <p className='paragraph06'>Max LTV: {token.maxLTV}%</p>
            )}
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
  showPoolData: false,
  poolData: [],
};

export default TokenCard;

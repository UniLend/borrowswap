import React from "react";
import "./index.scss";
import { truncateToDecimals } from "../../../helpers";
import { getTokenSymbol } from "../../../utils";

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
  onClick: (positionData: Token) => void;
  operation?: ActiveOperation;
  showPoolData?: boolean;
  positionData?: any; // update later
  list: list;
}

const TokenCard: React.FC<TokenCardProps> = ({
  token,
  onClick,
  operation,
  showPoolData,
}) => {
  const handleTokensList = () => {
    onClick(token);
  };

  return (
    <>
      {operation === ActiveOperation.BRROW ? (
        <div onClick={handleTokensList} className="token_card">
          <div className="tokens_details">
            <img src={token.logoURI || token.logo} alt="" />
            <div>
              <div className="token_pool_logo">
                <h3>{token.symbol}</h3>
                {/* TODO: update the unilend tokens condition in place if true */}
                {true && showPoolData && (
                  <div className="pool_logo">
                    <img src={token.logo} alt="" />
                    <img src={token.pairToken?.logo} alt="" />
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
          <div className="pool_details">
            <div>
              <p className="paragraph06">Unilend</p>
              <img src={token.logoURI || token.logo} alt="" />
            </div>
            {showPoolData && (
              <p className="paragraph06">Max LTV: {token.maxLTV}%</p>
            )}
          </div>
        </div>
      ) : (
        <div onClick={handleTokensList} className="token_card">
            <div className="tokens_details">
              <img src={getTokenSymbol(token.borrowToken.symbol)} alt="" />
              <div>
                <div className="token_pool_logo">
                  <h3>{token.borrowToken.symbol}</h3>
                </div>
                  <span>
                  {/* Repay:.0123 */}
                  </span>
              </div>
            </div>
            <div className="pool_details">
               <div>
               <img className="token_over" src={getTokenSymbol(token.borrowToken.symbol)} alt="" />
                 <img src={getTokenSymbol(token.otherToken.symbol)} alt="" />
               </div>
               <p className="paragraph06">unilend</p>
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

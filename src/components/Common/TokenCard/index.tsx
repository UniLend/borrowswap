import React from "react";
import "./index.scss";
import { truncateToDecimals } from "../../../helpers";
import { getTokenLogo } from "../../../utils";

interface Token {
  logoURI?: string;
  logo: string;
  name: string;
  symbol: string;
  pairToken: any; //TODO update
  maxLTV: string;
  borrowApy: string;
  borrowToken?: any;
  otherToken?: any;
  source: string;
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
  // poolData?: any; // update later
  lendTokenSymbol?: string;
}

const TokenCard: React.FC<TokenCardProps> = ({
  token,
  onClick,
  operation,
  showPoolData,
  // poolData,
  lendTokenSymbol,
}) => {
  const handleTokensList = () => {
    onClick(token);
  };
  // const handlePoolList = () => {
  //   onClick(poolData);
  // };

  return (
    <>
      {operation === ActiveOperation.BRROW ? (
        <div onClick={handleTokensList} className='token_card'>
          <div className='tokens_details'>
            <img
              src={token.logoURI || token.logo || getTokenLogo(token.symbol)}
              alt=''
            />
            <div>
              <div className='token_pool_logo'>
                <h3>{token.symbol}</h3>
                {token?.source === "Unilend" && showPoolData && (
                  <div className='pool_logo'>
                    <img src={token?.logo} alt='' />
                    <img src={token?.pairToken?.logo} alt='' />
                  </div>
                )}
                {token?.source !== "Unilend" && showPoolData && (
                  <div className='pool_logo'>
                    <img src={getTokenLogo(token?.symbol)} alt='' />
                    <img src={getTokenLogo(lendTokenSymbol as string)} alt='' />
                  </div>
                )}
              </div>
              {showPoolData && token?.source === "Unilend" && (
                <span>
                  Borrow APY: {truncateToDecimals(+token.borrowApy, 2)}%
                </span>
              )}
            </div>
          </div>
          {/* TODO: update token pool data */}
          {showPoolData && (
            <div className='pool_details'>
              <div>
                <p className='paragraph06'>{token?.source}</p>
                <img src={getTokenLogo("UFT")} alt='' />
              </div>
              {token?.source === "Unilend" && (
                <p className='paragraph06'>Max LTV: {token?.maxLTV}%</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div onClick={handleTokensList} className='token_card'>
          {!showPoolData ? (
            <div className='tokens_details'>
              <img src={token?.logoURI || token?.logo} alt='' />
              <div>
                <div className='token_pool_logo'>
                  <h3>{token?.symbol}</h3>
                </div>
              </div>
            </div>
          ) : (
            <div className='tokens_details'>
              <img src={getTokenLogo(token?.borrowToken?.symbol)} alt='' />
              <div>
                <div className='token_pool_logo'>
                  <h3>{token?.borrowToken?.symbol}</h3>
                </div>
                <span>{/* Repay:.0123 */}</span>
              </div>
            </div>
          )}
          {showPoolData && (
            <div className='pool_details'>
              <div>
                <img
                  className='token_over'
                  src={getTokenLogo(token?.borrowToken?.symbol)}
                  alt=''
                />
                <img src={getTokenLogo(token?.otherToken?.symbol)} alt='' />
              </div>
              <p className='paragraph06'>{token?.source}</p>
            </div>
          )}
          {/* <div className='pool_details'>
            <div>
              <p className='paragraph06'>{token?.source}</p>
              <img src={getTokenLogo("UFT")} alt='' />
            </div>
          </div> */}
        </div>
      )}
    </>
  );
};

// Default Props
TokenCard.defaultProps = {
  onClick: (token: Token) => {},
  showPoolData: false,
  // poolData: [],
  lendTokenSymbol: "logo",
};

export default TokenCard;

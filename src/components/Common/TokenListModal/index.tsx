import React, { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import TokenCard from "../TokenCard";
import "./index.scss";

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

interface TokenListModalProps {
  tokenList: Token[];
  onSelectToken: (token: Token) => void;
  operation: ActiveOperation;
  isTokenListLoading?: boolean;
  showPoolData?: boolean;
  poolData?: any; // update later
}

const TokenListModal: React.FC<TokenListModalProps> = ({
  tokenList,
  onSelectToken,
  operation,
  isTokenListLoading,
  showPoolData,
  poolData,
}) => {
  // TODO: update typeScript here
  console.log("tokenList", tokenList)
  const container = useRef<any>(null);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleTokensList = (token: Token) => {
    onSelectToken(token);
  };

  const filteredTokenList = tokenList.filter((token) =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    container?.current?.addEventListener("scroll", () => {
      if (
        container.current.scrollTop + container.current.clientHeight >=
        container.current.scrollHeight
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    });
  }, []);

  return (
    <div className='select_token_modal'>
      <div className='search_token'>
        <h3 className='paragraph02'>Select Token</h3>
        <div className='input_container'>
          <FiSearch />
          <input
            autoFocus
            type='text'
            placeholder='Search Address/ Token/ Tnx'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      {isTokenListLoading ? (
        <div className='token_list'>
          <p className='paragraph01'>Tokens are loading...</p>
        </div>
      ) : (
        <div ref={container} className='token_list'>
          {/* {filteredTokenList?.map(
            (token: Token, i: number) =>
              i < page * 100 && (
                <TokenCard
                  key={i}
                  token={token}
                  onClick={() => handleTokensList(token)}
                  operation={operation}
                />
              )
          )}
          {filteredTokenList?.length === 0 && <h2>Tokens are not available</h2>} */}
          {filteredTokenList.length > 0 ? (
            filteredTokenList.map((token: Token, i: number) =>
              i < page * 100 ? (
                <TokenCard
                  key={i}
                  token={token}
                  onClick={() => handleTokensList(token)}
                  operation={operation}
                  showPoolData={showPoolData}
                  poolData={poolData}
                />
              ) : null
            )
          ) : (
            <p className='paragraph01'>Tokens are not available</p>
          )}
        </div>
      )}
    </div>
  );
};

// Default Props
TokenListModal.defaultProps = {
  tokenList: [],
  onSelectToken: (token: Token) => {},
  operation: ActiveOperation.BRROW,
  isTokenListLoading: false,
  showPoolData: false,
  poolData: [],
};

export default TokenListModal;

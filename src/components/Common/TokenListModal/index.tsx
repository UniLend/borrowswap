import React, { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import TokenCard from "../TokenCard";
import "./index.scss";
import UnilendLoader from "../../Loader/UnilendLoader";

interface Token {
  logoURI?: string;
  logo: string;
  name: string;
  symbol: string;
  pairToken: any; //TODO update
  maxLTV: string;
  borrowApy: string;
  borrowToken: any;
  otherToken: any;
  pool: any;
  source: string;
}
interface PositionData {
  borrowBalance0: number;
  borrowBalance1: number;
  pool: {
    token0: Token;
    token1: Token;
    pool: any;
  };
  id: any;
  source: any;
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
  // poolData?: any; // update later
  positionData?: any;
  lendTokenSymbol?: string;
  currentOperation?: string;
}

const TokenListModal: React.FC<TokenListModalProps> = ({
  tokenList,
  onSelectToken,
  operation,
  isTokenListLoading,
  showPoolData,
  // poolData,
  positionData,
  lendTokenSymbol,
  currentOperation,
}) => {
  // TODO: update typeScript here
  const container = useRef<any>(null);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleTokensList = (token: Token) => {
    onSelectToken(token);
    setSearchQuery("");
  };

  let list: any = [];
  for (let i = 0; i < positionData!.length; i++) {
    if (
      positionData[i].borrowBalance0 > 0 &&
      positionData[i].borrowBalance1 > 0
    ) {
      let temp0 = {
        borrowToken: positionData[i].pool.token0,
        otherToken: positionData[i].pool.token1,
        pool: positionData[i].pool.pool,
        positionId: positionData[i].id,
        source: positionData[i].source,
      };
      list.push(temp0);
      let temp1 = {
        borrowToken: positionData[i].pool.token1,
        otherToken: positionData[i].pool.token0,
        pool: positionData[i].pool.pool,
        positionId: positionData[i].id,
        source: positionData[i].source,
      };
      list.push(temp1);
    } else if (positionData[i].borrowBalance0 > 0) {
      let temp = {
        borrowToken: positionData[i].pool.token0,
        otherToken: positionData[i].pool.token1,
        pool: positionData[i].pool.pool,
        positionId: positionData[i].id,
        source: positionData[i].source,
      };
      list.push(temp);
    } else if (positionData[i].borrowBalance1 > 0) {
      let temp = {
        borrowToken: positionData[i].pool.token1,
        otherToken: positionData[i].pool.token0,
        pool: positionData[i].pool.pool,
        positionId: positionData[i].id,
        source: positionData[i].source,
      };
      list.push(temp);
    }
  }

  let filteredTokenList = [];

  if (currentOperation === "pool") {
    filteredTokenList = list.filter((token: Token) =>
      token.borrowToken.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  } else {
    filteredTokenList = tokenList.filter(
      (token) =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

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
          <UnilendLoader width='200px' height='200px' className='logo_loader' />
        </div>
      ) : (
        <div ref={container} className='token_list'>
          {filteredTokenList.length > 0 ? (
            filteredTokenList?.map((token: Token, i: number) =>
              i < page * 100 ? (
                <TokenCard
                  key={i}
                  token={token}
                  onClick={() => handleTokensList(token)}
                  operation={operation}
                  showPoolData={showPoolData}
                  // poolData={poolData}
                  lendTokenSymbol={lendTokenSymbol}
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
  // poolData: [],
  positionData: [],
  lendTokenSymbol: "logo",
  currentOperation: "",
};

export default TokenListModal;

import React, { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import TokenCard from "../TokenCard";
import "./index.scss";
import UnilendLoader from "../../Loader/UnilendLoader";
import { CompoundBaseTokens } from "../../../helpers/constants";

interface Token {
  type: string;
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
  address: string;
  token0?: any;
  token1?: any;
  compoundCollateralTokens?: any;
  aaveCollateralTokens?: any;
  availableIn?: any;
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
  REDEEM = "Redeem_Swap",
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
  isShowfilter: boolean;
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
  isShowfilter,
}) => {
  // console.log("tokenList", tokenList, isShowfilter);
  // TODO: update typeScript here
  const container = useRef<any>(null);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredTokenList, setFilteredTokenList] = useState<any>([]);
  const [borrowedPosition, setBorrowedposition] = useState([]);
  const [poolsData, setPoolsData] = useState([]);
  const handleTokensList = (token: Token) => {
    onSelectToken(token);
    setSearchQuery("");
  };

  const platforms = ["unilend", "compound", "aave"];

  const [selectedPlatforms, setSelectedPlatforms]: any = useState({
    unilend: false,
    compound: false,
    aave: false,
  });

  const findPoolData = () => {
    let list: any = [];
    for (let i = 0; i < tokenList!.length; i++) {
      if (tokenList[i].source == "Unilend") {
        let temp0 = {
          borrowToken: tokenList[i].token0,
          otherToken: tokenList[i].token1,
          pool: tokenList[i].pool,
          positionId: 1,
          source: tokenList[i].source,
        };
        list.push(temp0);
        let temp1 = {
          borrowToken: tokenList[i].token1,
          otherToken: tokenList[i].token0,
          pool: tokenList[i].pool,
          positionId: 1,
          source: tokenList[i].source,
        };
        list.push(temp1);
      } else if (tokenList[i].source == "Compound") {
        if (
          operation == "Redeem_Swap" &&
          tokenList[i]?.compoundCollateralTokens?.length
        ) {
          for (const tkn of tokenList[i]?.compoundCollateralTokens) {
            list.push({
              borrowToken: tkn,
              otherToken: tokenList[i],
              pool: null,
              positionId: 1,
              source: tokenList[i].source,
            });
          }
        }
        list.push({
          borrowToken: tokenList[i],
          otherToken: tokenList[i],
          pool: null,
          positionId: 1,
          source: tokenList[i].source,
        });
      } else if (tokenList[i].source == "Aave") {
        if (
          operation == "Redeem_Swap" &&
          tokenList[i]?.aaveCollateralTokens?.length
        ) {
          for (const tkn of tokenList[i]?.aaveCollateralTokens) {
            list.push({
              borrowToken: tkn,
              otherToken: tokenList[i],
              pool: null,
              positionId: 1,
              source: tokenList[i].source,
            });
          }
        }
        list.push({
          borrowToken: tokenList[i],
          otherToken: tokenList[i],
          pool: null,
          positionId: 1,
          source: tokenList[i].source,
        });
      }
    }

    setPoolsData(list);
    // console.log("pool List", operation, list);
  };

  useEffect(() => {
    if (tokenList.length) {
      findPoolData();
    }
  }, [tokenList]);

  useEffect(() => {
    handleSearch("");
  }, [page, tokenList, poolsData]);

  const handleSearch = (searched: string) => {
    const searchQueryLower = searched.toLowerCase();
    setSearchQuery(searchQueryLower);
    let filtered = [];

    if (currentOperation === "pool") {
      filtered = poolsData.filter((token: Token) =>
        token.borrowToken.name
          .toLowerCase()
          .includes(searchQueryLower.toLowerCase())
      );

      setFilteredTokenList(filtered);
    } else {
      filtered = tokenList.filter(
        (token) =>
          token.symbol.toLowerCase().includes(searchQueryLower.toLowerCase()) ||
          token.address.toLowerCase().includes(searchQueryLower.toLowerCase())
      );

      const priorityTokens = ["usdc", "usdt", "sushi", "uft"];
      filtered.sort((a, b) => {
        const aIndex = priorityTokens?.indexOf(a.symbol.toLowerCase());
        const bIndex = priorityTokens?.indexOf(b.symbol.toLowerCase());
        if (aIndex !== -1 && bIndex === -1) return -1;
        if (aIndex === -1 && bIndex !== -1) return 1;
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        return 0;
      });
      setFilteredTokenList(filtered);
    }
  };

  // useEffect(() => {
  //   container?.current?.addEventListener("scroll", () => {
  //     if (
  //       container.current.scrollTop + container.current.clientHeight >=
  //       container.current.scrollHeight
  //     ) {
  //       setPage((prevPage) => prevPage + 1);
  //     }
  //   });
  // }, []);

  useEffect(() => {
    checkBoxFilter();
  }, [selectedPlatforms]);

  const handlePlatformClick = (platform: any) => {
    setSelectedPlatforms((prev: any) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };
  const checkBoxFilter = () => {
    let filtered = [];
    if (currentOperation === "pool") {
      const platforms = Object.keys(selectedPlatforms).filter(
        (platform) => selectedPlatforms[platform]
      );
      filtered = poolsData.filter((token: any) => {
        const matchesPlatform =
          platforms.length === 0 ||
          platforms.some(
            (platform) =>
              token.borrowToken.source.toLowerCase() === platform.toLowerCase()
          );
        const matchesSearch = poolsData.filter((token: Token) =>
          token.borrowToken.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
        return matchesPlatform && matchesSearch;
      });

      setFilteredTokenList(filtered);
    } else {
      const platforms = Object.keys(selectedPlatforms).filter(
        (platform) => selectedPlatforms[platform]
      );

      filtered = tokenList.filter((token) => {
        const matchesPlatform =
          platforms.length === 0 ||
          platforms.some((platform) => token.availableIn.includes(platform));
        const matchesSearch =
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesPlatform && matchesSearch;
      });

      setFilteredTokenList(filtered);
    }
  };

  return (
    <div className='select_token_modal'>
      <div className='search_token'>
        <h3 className='paragraph02'>Select Token</h3>
        <div className='input_container'>
          <FiSearch />
          <input
            autoFocus
            type='text'
            placeholder='Search Token / Address'
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      {isShowfilter && (
        <div className='checkbox-div'>
          {platforms.map((platform) => (
            <div
              className={`platform-container ${
                selectedPlatforms[platform] ? "active" : ""
              }`}
              key={platform}
              onClick={() => handlePlatformClick(platform)}
            >
              <span className='platform-text'>{platform}</span>
            </div>
          ))}
        </div>
      )}
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
  isShowfilter: false,
};

export default TokenListModal;

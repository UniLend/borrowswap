import React, { useState, useRef, useEffect } from "react";
import { Modal } from "antd";
import { FaSearch } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import TokenCard from "./TokenCard";
import "./TokenListModal.scss";

const tempData: any = [
  {
    symbol: "USDC",
    name: "USD Coin",
    poolCount: "4",
    lentCount: "0",
    borrowCount: "0",
    id: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    txCount: "0",
    totalPoolsLiquidityUSD: "0",
    totalPoolsLiquidity: "0",
    decimals: 6,
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    logo: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389",
    priceUSD: 5.9904826074773645,
    pricePerToken: 0.998413767912894,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    poolCount: "1",
    lentCount: "0",
    borrowCount: "0",
    id: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    txCount: "0",
    totalPoolsLiquidityUSD: "0",
    totalPoolsLiquidity: "0",
    decimals: 18,
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    logo: "https://assets.coingecko.com/coins/images/17238/small/aWETH_2x.png?1626940782",
    priceUSD: 61239.69,
    pricePerToken: "3402.205",
  },
  {
    symbol: "stETH",
    name: "Liquid staked Ether 2.0",
    poolCount: "1",
    lentCount: "0",
    borrowCount: "0",
    id: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    txCount: "0",
    totalPoolsLiquidityUSD: "0",
    totalPoolsLiquidity: "0",
    decimals: 18,
    address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    logo: "https://e7.pngegg.com/pngimages/407/710/png-clipart-ethereum-cryptocurrency-bitcoin-cash-smart-contract-bitcoin-blue-angle-thumbnail.png",
    priceUSD: 61178.63137975149,
    pricePerToken: 3398.8128544306383,
  },
  {
    symbol: "LINK",
    name: "ChainLink Token",
    poolCount: "1",
    lentCount: "0",
    borrowCount: "0",
    id: "0x514910771af9ca656af840dff83e8264ecf986ca",
    txCount: "0",
    totalPoolsLiquidityUSD: "0",
    totalPoolsLiquidity: "0",
    decimals: 18,
    address: "0x514910771af9ca656af840dff83e8264ecf986ca",
    logo: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png?1547034700",
    priceUSD: 355.7050686691865,
    pricePerToken: 19.761392703843697,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    poolCount: "1",
    lentCount: "0",
    borrowCount: "0",
    id: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    txCount: "0",
    totalPoolsLiquidityUSD: "0",
    totalPoolsLiquidity: "0",
    decimals: 6,
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    logo: "https://assets.coingecko.com/coins/images/14243/small/aUSDT.78f5faae.png?1615528400",
    priceUSD: 6.0276062613657055,
    pricePerToken: 1.004601043560951,
  },
];

export default function TokenListModal() {
  const container = useRef<any>(null);
  const [page, setPage] = useState<number>(1);
  const availableToken: Array<any> = tempData;

  useEffect(() => {
    container?.current.addEventListener("scroll", () => {
      if (
        container.current.scrollTop + container.current.clientHeight >=
        container.current.scrollHeight
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    });
  }, []);
  return (
    <Modal
      className='antd_modal_overlay'
      centered
      // onCancel={handleCloseModals}
      // open={isOpenMangeToken}
      // open={true}
      footer={null}
      closable={false}
    >
      <div className='select_token_modal'>
        <div className='search_token'>
          <h3 className='paragraph02'>Select Token</h3>
          <div className='input_container'>
            <FiSearch />
            <input
              autoFocus
              type='text'
              placeholder='Search Address/ Token/ Tnx'
              // value={serachTokenFromList}
              onChange={(e) => console.log(e)}
            />
          </div>
        </div>
        <div ref={container} className='token_list'>
          {availableToken?.length === 0 && <h2>Tokens are not availbale</h2>}
          {
            // isOpenTokenList &&
            availableToken?.map(
              (token, i) =>
                i < page * 100 && (
                  <TokenCard key={i} token={token} render='tokenlist' />
                )
            )
          }
        </div>
      </div>
    </Modal>
  );
}

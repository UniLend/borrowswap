import React, { useState } from "react";
import "./index.scss";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { truncateToDecimals } from "../../../helpers";

interface LiquidityFactorsProps {
  fee: number;
  slippage: number;
}

const LiquidityFactors: React.FC<LiquidityFactorsProps> = ({
  fee,
  slippage,
}) => (
  <div className='toggle_div'>
    <p>
      <span>Fee</span>
      <span>{fee} Wei</span>
    </p>
    <p>
      <span>Max. Slippage</span>
      <span>{slippage}% (auto)</span>
    </p>
    <p>
      <span>Order Routing</span>
      <span>Uniswap Api</span>
    </p>
  </div>
);

interface AccordionProps {
  selectedTokens: any;
  b2rRatio: any;
  fee: number;
  slippage: number;
  lendAmount: string;
  showAccordion: boolean;
}

const AccordionContainer: React.FC<AccordionProps> = ({
  selectedTokens,
  b2rRatio,
  fee,
  slippage,
  lendAmount,
  showAccordion,
}) => {
  const [isLiquidityFactorsOpen, setIsLiquidityFactorsOpen] = useState(false);
  const toggleLiquidityFactors = () => {
    setIsLiquidityFactorsOpen(!isLiquidityFactorsOpen);
  };

  return (
    <>
      {showAccordion ? (
        b2rRatio && fee > 0 ? (
          <div className='accordion'>
            <div className='toggle_div' onClick={toggleLiquidityFactors}>
              <p>
                <span className='bold'>
                  {`1 ${selectedTokens?.borrow?.symbol} = ${truncateToDecimals(
                    b2rRatio,
                    6
                  )} ${selectedTokens?.receive?.symbol}`}
                </span>
                <span className='dropdown'>
                  {isLiquidityFactorsOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </p>
            </div>
            {isLiquidityFactorsOpen && (
              <LiquidityFactors fee={fee} slippage={slippage} />
            )}
          </div>
        ) : (
          "Fetching Data"
        )
      ) : null}
    </>
  );
};

export default AccordionContainer;

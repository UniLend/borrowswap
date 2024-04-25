import React, { useState } from "react";
import "./index.scss";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const LiquidityFactors: React.FC = () => (
  <div className="toggle_div">
    <p>
      <span>Fee (0.5%)</span>
      <span>$0.77</span>
    </p>
    <p>
      <span>Price Impact</span>
      <span>$0.77</span>
    </p>
    <p>
      <span>Max. Slippage</span>
      <span>0.5%</span>
    </p>
  </div>
);

interface AccordionProps {
  selectedTokens: any;
}

const AccordionContainer: React.FC<AccordionProps> = ({ selectedTokens }) => {
  const [isLiquidityFactorsOpen, setIsLiquidityFactorsOpen] = useState(false);

  const toggleLiquidityFactors = () => {
    setIsLiquidityFactorsOpen(!isLiquidityFactorsOpen);
  };

  return (
    <div className="accordion">
     <div className="toggle_div" onClick={toggleLiquidityFactors}>
    <p>
        {selectedTokens?.borrow?.priceUSD > 0 && (
        <>
            <span className="bold">{`1 ${selectedTokens?.lend.symbol} = 0.5 ${selectedTokens?.borrow.symbol} ($1.00)`}</span>
            <span className="dropdown">{isLiquidityFactorsOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
        </>
        )}
    </p>
    </div>

      {isLiquidityFactorsOpen && <LiquidityFactors />}
    </div>
  );
};

export default AccordionContainer;

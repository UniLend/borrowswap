import React, { useEffect, useState } from "react";
import "./index.scss";
import { Input, Button } from "antd";
import ButtonWithDropdown from "../ButtonWithDropdown";
import { truncateToDecimals } from "../../../helpers";

interface AmountContainerProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  buttonText: string;
  onClick: () => void;
  onMaxClick?: () => void;
  balance: string;
  className?: string;
  isShowMaxBtn?: boolean;
  title?: string;
  isTokensLoading?: boolean;
  readonly?: boolean;
}

const AmountContainer: React.FC<AmountContainerProps> = ({
  value,
  onChange,
  buttonText,
  onClick,
  onMaxClick,
  balance,
  className,
  isShowMaxBtn,
  title,
  isTokensLoading,
  readonly,
}) => {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedValue = value === "." ? "0" + value : value;
    if (/^[.]?[0-9]*[.]?[0-9]*$/.test(parsedValue) || parsedValue === "") {
      setInputValue(parsedValue);
      onChange({
        target: { value: parsedValue },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  useEffect(() => {
  
    setInputValue(value);
  }, [value]);

  return (
    <div className={`amount_container ${className}`}>
      <div className='amount_container_left amount_div'>
        <Input
          value={inputValue}
          placeholder='0'
          onChange={handleInputChange} // Use the custom handler
          readOnly={readonly}
        />
        {isShowMaxBtn && (
          <Button onClick={onMaxClick} className='max_btn' type='text'>
            Max
          </Button>
        )}
      </div>
      <div className='amount_container_right amount_div'>
        <p className='paragraph06 right'>
          Balance: {truncateToDecimals(Number(balance), 4)}
        </p>
        <ButtonWithDropdown
          buttonText={buttonText}
          onClick={onClick}
          title={title}
          isTokensLoading={isTokensLoading}
        />
      </div>
    </div>
  );
};

// Default Props
AmountContainer.defaultProps = {
  value: "",
  onChange: () => console.log("onChange"),
  buttonText: "Select Token",
  onClick: () => console.log("onClick"),
  onMaxClick: () => console.log("onMaxClick"),
  balance: "0",
  className: "",
  isShowMaxBtn: false,
  title: "",
  isTokensLoading: false,
  readonly: false,
};

export default AmountContainer;

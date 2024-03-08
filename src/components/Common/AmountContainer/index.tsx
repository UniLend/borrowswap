import React, { useEffect, useState } from "react";
import "./index.scss";
import { Input, Button } from "antd";
import ButtonWithDropdown from "../ButtonWithDropdown";

interface AmountContainerProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  buttonText: string;
  onClick: () => void;
  onMaxClick: () => void;
  balance: string;
  className?: string;
}

const AmountContainer: React.FC<AmountContainerProps> = ({
  value,
  onChange,
  buttonText,
  onClick,
  onMaxClick,
  balance,
  className,
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

  useEffect(()=> {
console.log("value", value, inputValue);
setInputValue(value)
  },[value])

  return (
    <div className={`amount_container ${className}`}>
      <div className='amount_container_left amount_div'>
        <Input
          value={inputValue}
          placeholder='0'
          onChange={handleInputChange} // Use the custom handler
        />
        <Button onClick={onMaxClick} className='max_btn' type='text'>
          Max
        </Button>
      </div>
      <div className='amount_container_right amount_div'>
        <p className='paragraph06 right'>Balance: {balance}</p>
        <ButtonWithDropdown buttonText={buttonText} onClick={onClick} />
      </div>
    </div>
  );
};

// Default Props
AmountContainer.defaultProps = {
  value: "",
  onChange: () => console.log("onChange"),
  buttonText: "Select",
  onClick: () => console.log("onClick"),
  onMaxClick: () => console.log("onMaxClick"),
  balance: "0",
  className: "",
};

export default AmountContainer;

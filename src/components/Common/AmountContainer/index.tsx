import React from "react";
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
  return (
    <div className={`amount_container ${className}`}>
      <div className='amount_container_left amount_div'>
        <Input
          value={value}
          placeholder='0'
          // type='number'
          onChange={onChange}
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

AmountContainer.defaultProps = {
  value: "",
  onChange: () => console.log("onChange"),
  buttonText: "select",
  onClick: () => console.log("onClick"),
  onMaxClick: () => console.log("onMaxClick"),
  balance: "0",
  className: "",
};

export default AmountContainer;

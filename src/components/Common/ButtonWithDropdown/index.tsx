import React from "react";
import { FaChevronDown } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import "./index.scss";
import { getTokenSymbol } from "../../../utils";

interface ButtonWithDropdownProps {
  buttonText: string;
  onClick: () => void;
  className?: string;
}

const ButtonWithDropdown: React.FC<ButtonWithDropdownProps> = ({
  buttonText,
  onClick,
  className,
}) => {
  return (
    <div
      role='presentation'
      onClick={onClick}
      className={`btn_with_dropdown ${className}`}
    >
      <div onClick={() => console.log("dropdown")} className='token_tab'>
        <img src={getTokenSymbol(buttonText)} alt='logo' />
        <h2>{buttonText}</h2>
      </div>
      <div onClick={() => console.log("handle dropdown")} className='dropdown'>
        <FaChevronDown className='dropicon' />
      </div>
    </div>
  );
};

export default ButtonWithDropdown;

ButtonWithDropdown.defaultProps = {
  buttonText: "Select",
  onClick: () => console.log("Clicked"),
  className: "",
};

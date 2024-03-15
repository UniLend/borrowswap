import React, { memo } from "react";
import { FaChevronDown } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import "./index.scss";
import { getTokenSymbol } from "../../../utils";

interface ButtonWithDropdownProps {
  buttonText: string;
  onClick: () => void;
  className?: string;
  title?: string;
  isTokensLoading?: boolean;
}

const ButtonWithDropdown: React.FC<ButtonWithDropdownProps> = ({
  buttonText,
  onClick,
  className,
  title,
  isTokensLoading,
}) => {
  return (
    <div
      role='presentation'
      onClick={!isTokensLoading ? onClick : undefined}
      className={`btn_with_dropdown ${className}`}
      title={title}
    >
      <div onClick={() => console.log("dropdown")} className='token_tab'>
        {buttonText === "Select Token" ? (
          isTokensLoading ? (
            <h2>loading...</h2>
          ) : (
            <h2>Select</h2>
          )
        ) : (
          <>
            <img src={getTokenSymbol(buttonText)} alt='logo' />
            <h2>{buttonText}</h2>
          </>
        )}
      </div>
      <div onClick={() => console.log("handle dropdown")} className='dropdown'>
        <FaChevronDown className='dropicon' />
      </div>
    </div>
  );
};

export default memo(ButtonWithDropdown);

ButtonWithDropdown.defaultProps = {
  buttonText: "Select Token",
  onClick: () => console.log("Clicked"),
  className: "",
  title: "",
  isTokensLoading: false,
};

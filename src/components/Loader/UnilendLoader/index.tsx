import React from "react";
import loader from "../../../assets/unilend-loader.gif";
import "./index.scss";

interface LoaderProps {
  width?: string;
  height?: string;
  className?: string;
}

const UnilendLoader: React.FC<LoaderProps> = ({ width, height, className }) => {
  return (
    <div className={`unilend_loader_container ${className}`}>
      <img
        src={loader}
        alt='Loading...'
        style={{ width: width, height: height }}
      />
    </div>
  );
};

export default UnilendLoader;

UnilendLoader.defaultProps = {
  width: "300px",
  height: "300px",
  className: "logo_loader",
};

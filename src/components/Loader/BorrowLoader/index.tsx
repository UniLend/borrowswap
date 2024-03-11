import React from "react";
import Lottie from "react-lottie";
import cubeLoader from "../../../assets/3D-Cube-loader.json";
import loader from "../../../assets/3D-Cube-loader.gif";
import "./index.scss";

interface BorrowLoaderProps {
  spendToken: string;
  SwapToken: string;
  progress: 1 | 2 | 3 | 4 | 5;
}

const BorrowLoader: React.FC<BorrowLoaderProps> = ({
  spendToken,
  SwapToken,
  progress,
}) => {
  // TODO: fix react-lottie issue
  const defaultOptionsLotti = {
    loop: true,
    autoplay: true,
    animationData: cubeLoader,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const rangeStyle = {
    width: `${progress * 20}%`,
    background: `linear-gradient(to right, var(--main-light) ${
      progress * 20
    }%, var(--button-border) ${progress * 20}%)`,
    transition: "width 0.5s ease",
  };

  return (
    <div className='borrow_loader_container'>
      <div className='loader_animation'>
        {/* <Lottie options={defaultOptionsLotti} height={300} width={300} /> */}
        <img src={loader} alt='loader' />
      </div>
      <div className='loader_part message'>
        <p className='paragraph02'>Enable spending {spendToken}</p>
        <p className='paragraph02'>Swapping : {SwapToken}</p>
      </div>
      <div className='loader_part status'>
        <p className='paragraph05'>Proceed in your wallet</p>
        <div className='range' style={rangeStyle}></div>
      </div>
    </div>
  );
};

// Default props
BorrowLoader.defaultProps = {
  spendToken: "TOKEN1",
  SwapToken: "TOKEN2",
  progress: 1,
};

export default BorrowLoader;

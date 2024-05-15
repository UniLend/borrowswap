import React from "react";
import cubeLoader from "../../../assets/3D-Cube-loader.json";
import loader from "../../../assets/sending.gif";
import successLoader from "../../../assets/success.gif";
import "./index.scss";

interface BorrowLoaderProps {
  msg: string;
  progress: Number;
  length?: Number;
}

const BorrowLoader: React.FC<BorrowLoaderProps> = ({
  msg,
  progress,
  length = 2,
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
    width: `${Number(progress) * (100 / Number(length))}%`,
    background: `linear-gradient(to right, var(--main-light) ${
      Number(progress) * (100 / Number(length))
    }%, var(--button-border) ${Number(progress) * (100 / Number(length))}%)`,
    transition: "width 0.5s ease",
  };

  return (
    <div className='borrow_loader_container'>
      <div className='loader_animation'>
        {/* <Lottie options={defaultOptionsLotti} height={300} width={300} /> */}
        {progress === 3 ? (
          <img src={successLoader} alt='success loader' />
        ) : (
          <img src={loader} alt='loader' />
        )}
      </div>
      <div className='loader_part message'>
        <span className='exec_text'>Execute Transactions in Wallet</span>
        <p className='paragraph02'>{msg}</p>
        {/* <p className='paragraph02'>Swapping : {SwapToken}</p> */}
      </div>
      <div className='loader_part status'>
        {progress === 3 ? (
          <></>
        ) : (
          <>
            <p className='paragraph05'>Proceed in your wallet</p>
            <div className='range' style={rangeStyle}></div>
          </>
        )}
      </div>
    </div>
  );
};

// Default props
BorrowLoader.defaultProps = {
  msg: "",
  progress: 1,
};

export default BorrowLoader;

import React from "react";
import { Input, Button, Slider, Modal } from "antd";
import { FaChevronDown } from "react-icons/fa";
import "./index.scss";
import uftLogo from "../../assets/uft.svg";
import TokenListModal from "../Common/TokenListModal";
import BorrowLoader from "../Loader/BorrowLoader";

export default function SwapCard() {
  return (
    <div className='swap_card_component'>
      <div className='swap_card'>
        <p className='paragraph06 label'>You Pay</p>
        {/* AMOUNT */}
        <div className='amount_container'>
          <div className='amount_container_left amount_div'>
            <Input placeholder='0' onChange={(e) => console.log(e)} />
            <Button className='max_btn' type='text'>
              Max
            </Button>
          </div>

          <div className='amount_container_right amount_div'>
            <p className='paragraph06'>Balance: 123.2525 </p>

            <div className='btn_with_dropdown'>
              <div
                onClick={() => console.log("dropdown")}
                className='token_tab'
              >
                <img src={uftLogo} alt='logo' />
                <h2>UFT</h2>
              </div>
              <div
                onClick={() => console.log("handle dropdown")}
                className='dropdown'
              >
                <FaChevronDown className='dropicon' />
              </div>
            </div>
          </div>
        </div>
        {/* SWAP */}
        <div className='swap_route'>
          <p className='paragraph06 '>You borrow</p>
          <div className='btn_with_dropdown center'>
            <div onClick={() => console.log("dropdown")} className='token_tab'>
              <img src={uftLogo} alt='logo' />
              <h2>UFT</h2>
            </div>
            <div
              onClick={() => console.log("handle dropdown")}
              className='dropdown'
            >
              <FaChevronDown className='dropicon' />
            </div>
          </div>
        </div>
        {/* <div className='swap_changer amount_container'>
          <div className='btn_with_dropdown'>
            <div onClick={() => console.log("dropdown")} className='token_tab'>
              <img src={uftLogo} alt='logo' />
              <h2>UFT</h2>
            </div>
            <div
              onClick={() => console.log("handle dropdown")}
              className='dropdown'
            >
              <FaChevronDown className='dropicon' />
            </div>
          </div>
          <div className='max_container'>
            <p className='paragraph06'>Max LTV</p>
            <p className='paragraph01'>30.36%</p>
          </div>
        </div> */}

        <p className='paragraph06 label you_receive'>You Receive</p>
        {/* AMOUNT */}
        <div className='amount_container'>
          <div className='amount_container_left amount_div'>
            <Input placeholder='0' onChange={(e) => console.log(e)} />
            <Button className='max_btn' type='text'>
              Max
            </Button>
          </div>

          <div className='amount_container_right amount_div'>
            <p className='paragraph06'>Balance: 123.25</p>

            <div className='btn_with_dropdown'>
              <div
                onClick={() => console.log("dropdown")}
                className='token_tab'
              >
                <img src={uftLogo} alt='logo' />
                <h2>UFT</h2>
              </div>
              <div
                onClick={() => console.log("handle dropdown")}
                className='dropdown'
              >
                <FaChevronDown className='dropicon' />
              </div>
            </div>
          </div>
        </div>
        {/* RANGE */}
        <div className='range_container'>
          <div>
            <p className='paragraph06 '>New LTV</p>
            <p className='paragraph06'>30%/75%</p>
          </div>
          <Slider
            // value=
            defaultValue={50}
            onChange={() => console.log("change LTV")}
            min={5}
            max={80}
            className='range_slider'
          />
        </div>
        <Button className='primary_btn'>Borrow</Button>
      </div>
      {/* <TokenListModal /> */}
      <BorrowLoader />
    </div>
  );
}

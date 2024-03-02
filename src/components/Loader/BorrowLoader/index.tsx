import React from "react";
import "./index.scss";
import { Modal } from "antd";

export default function BorrowLoader() {
  return (
    <Modal
      className='antd_popover_content'
      centered
      // onCancel={handleCloseModals}
      // open={isOpenMangeToken}
      // open={true}
      footer={null}
      closable={false}
    >
      <div className='borrow_loader_container'>
        <div className='loader_animation'></div>
        <div className='loader_part message'>
          <p className='paragraph02'>Enable spending USDT</p>
          <p className='paragraph02'>Swapping : AAVE V3</p>
        </div>
        <div className='loader_part status'>
          <p className='paragraph05'>Proceed in your wallet</p>
          <div className='range'></div>
        </div>
      </div>
    </Modal>
  );
}

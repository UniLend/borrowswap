import "./styles/index.scss";
import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.svg";
import ethlogo from "../../assets/eth.svg";
import arblogo from "../../assets/arbitrum-logo.svg";
import { Button, Popover, Modal } from "antd";
import { FaChevronDown } from "react-icons/fa";
import { FiCopy } from "react-icons/fi";
import useWalletHook from "../../api/hooks/useWallet";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { getChainSymbol } from "../../utils";
import { shortenAddress } from "../../utils";
import { useSwitchChain } from "wagmi";

export default function Navbar() {
  const { chains, switchChain } = useSwitchChain();

  const { address, chainId } = useWalletHook()
  const { disconnect } = useDisconnect();
  const [wrongNetworkModal, setWrongNetworkModal] = useState(false);

  const [visible, setVisible] = useState(false);
  const [isNetworkVisible, setIsNetworkVisible] = useState(false);
  const currentUser = address;

  const handleOpenSwitchNetwork = (visible:boolean) => {
    setIsNetworkVisible(visible);
  };
  const handleVisibleChange = (newVisible:boolean) => {
    setVisible(newVisible);
  };



  const WalletModalBody = () => {
    return (
      <div className="walletModel">
        <h1>Wrong Network</h1>
        <p>UniLend V2 is on Ethereum Mainnet only. Please Switch Network.</p>
        <div className="networks">
          <div onClick={() => switchChain({ chainId: 1 })}>
            <img src={ethlogo} alt="Etherium" />
            <p>Ethereum</p>
          </div>
          <div onClick={() => switchChain({ chainId: 42161 })}>
            <img src={arblogo} alt="Etherium" />
            <p>Arbitrum</p>
          </div>
          {/* <div onClick={() => switchChain({ chainId: 1442 })}>
            <img src={ethlogo} alt="Etherium" />
            <p>zkEVM</p>
          </div> */}
          {/* <div onClick={() => switchChain({ chainId: 8081 })}>
            <img src={shardeumLogo} alt="Etherium" />
            <p>Shardeum</p>
          </div> */}
        </div>
      </div>
    );
  };
  const SortContent = React.memo(() => {
    return (
      <div className="sort_popover">
        <h3>Select a Network</h3>
        {chains.map((chain) => (
          <div
            key={chain?.id}
            className="network_box"
            onClick={() => switchChain({ chainId: chain.id })}
          >
            <div className={chainId == chain?.id ? "activeChain" : ""}>
              <img src={getChainSymbol(chain?.id)} alt={`${chain.name} logo`}/>
              <p className="wallet-name">{chain?.name}</p>
            </div>
          </div>
        ))}
      </div>
    );
  });
  const PopoverContent = () => {
    const [copied, setCopied] = useState(false);
  
     const copyToClipboard = () => {
      if (currentUser) {
        navigator.clipboard.writeText(currentUser);
        setCopied(true);
      }
  };

    return (
      <div className="popover-content">
        <div className="disconnect">
          {/* Active green signal */}
          <div>
            <p></p>
          </div>
          <h4>{shortenAddress(currentUser)}</h4>
          <Button className="btn_class" onClick={() => disconnect()}>
            Disconnect
          </Button>
        </div>
        <div className="explorer">
          <div onClick={copyToClipboard} className={copied ? "copied" : ""}>
            {/* <img src={copyIcon} alt="copyicon" /> */}
            <FiCopy />
            <p> {copied ? "Copied" : "Copy address"}</p>
          </div>
          <a href="#" target="_blank">
            <div>
              {/* <img
                src={theme === 'dark' ? viewExplorer : viewExplorerLight}
                alt='viewExplorericon'
              /> */}
              <p>TXN History</p>
            </div>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="nav_container">
      <div className="route_container">
        <div className="unilend_logo">
          <a href="/">
            {" "}
            <img src={logo} alt="unilend_logo" />
          </a>
        </div>
      </div>
      <div className="last_container">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== "loading";
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === "authenticated");

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <div className="connect_btn">
                        <button onClick={openConnectModal} type="button">
                          Connect Wallet
                        </button>
                      </div>
                    );
                  }

                  if (chain && chain.unsupported) {
                    return (
                      <div
                        className="unsupported-btn"
                        style={{ marginTop: "8px" }}
                      >
                        <button onClick={openChainModal} type="button">
                          Not Supported Network
                        </button>
                        <div className="network_address">
                          <div className="address">{account.displayName}</div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="wallet_connection">
                      <Popover
                        content={<SortContent />}
                        trigger="click"
                        overlayClassName="sort_dropDownnew"
                        placement="bottomLeft"
                        open={isNetworkVisible}
                        onOpenChange={handleOpenSwitchNetwork}
                      >
                        {chain.hasIcon && (
                          <div className="network_chamber">
                            <div>
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl}
                                  style={{ width: 28, height: 28 }}
                                />
                              )}
                              <p>{chain.name}</p>
                              <FaChevronDown />
                            </div>
                          </div>
                        )}
                        
                      </Popover>
                      <Popover
                        content={<PopoverContent />}
                        trigger="click"
                        overlayClassName="sort_dropDownnew"
                        placement="bottomLeft"
                        open={visible}
                        onOpenChange={handleVisibleChange}
                      >
                        <div className="network_address">
                          {account.displayBalance
                            ? ` ${account.displayBalance}`
                            : ""}
                          <div className="address">{account.displayName}</div>
                        </div>
                      </Popover>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
      <Modal
        className="antd_modal_overlaywrong"
        open={wrongNetworkModal}
        centered
        footer={null}
        closable={false}
      >
        <WalletModalBody />
      </Modal>
    </div>
  );
}

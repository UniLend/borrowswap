import "./styles/index.scss";
import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.svg";
import ethlogo from "../../assets/eth.svg";
import arblogo from "../../assets/arbitrum-logo.svg";
import { Button, Popover, Modal } from "antd";
import { FiLock } from "react-icons/fi";
import { FaChevronDown } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { LockOutlined, WalletFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { FiCopy } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../states/unilendV2Reducer";
import useWalletHook from "../../api/hooks/useWallet";
import { useConnectModal, ConnectButton } from "@rainbow-me/rainbowkit";
import { ChangeNetwork, supportedNetworks } from "../../api/networks/networks";
import { useDisconnect } from "wagmi";
import { switchNetworkLib } from "../../api/lib/functions";
import {connectWallet} from "../../api/services/wallet"
import {
  fromWei,
  removeFromSessionStorage,
  saveToSessionStorage,
  shortenAddress,
} from "../../api/utils";
import {
  useAccountEffect,
  useSwitchChain
} from "wagmi";
export default function Navbar() {

  const user = useSelector((state) => state.user);
  const { openConnectModal } = useConnectModal();
  const { chain, isConnected, address, status, chainId, isReconnected } =  useWalletHook();
  console.log("chain", chainId);
  const { disconnect } = useDisconnect();
  const pathname = window.location.pathname;
  const [wrongNetworkModal, setWrongNetworkModal] = useState(false);
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const availableChain = Object.values(supportedNetworks).map(
    (net) => net.chainId
  );
  console.log(availableChain);

  const [visible, setVisible] = useState(false);
  const [isHaveAccess, setIsHaveAccess] = useState(true);
  const [isNetworkVisible, setIsNetworkVisible] = useState(false);
  const [isNavigateAllow, setIsNavigateAllow] = useState(false);
  const dispatch = useDispatch();
  const currentUser = address;

  useAccountEffect({
    onConnect(data) {
      const userData = data;
      console.log("userData", data);
    },
  });

  const handleOpenWalletModal = () => {
    // setIsWalletModalVisible(true);
    openConnectModal();
  };

  const handleOpenSwitchNetwork = (visible) => {
    setIsNetworkVisible(visible);
  };
  const handleVisibleChange = (newVisible) => {
    setVisible(newVisible);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", async (chainId) => {
        const user = await connectWallet();
        handleDomain(user);
        dispatch(setUser(user));
        window.location.href = window.location.origin;
      });
      window.ethereum.on("accountsChanged", async (account) => {
        const user = await connectWallet();
        handleDomain(user);
        dispatch(setUser(user));
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      });
    }
  }, []);




//Handle chain Not availble Modal  
  useEffect(() => {
    if (chainId && !availableChain.includes(chainId)) {
      setWrongNetworkModal(true);
    } else {
      setWrongNetworkModal(false);
    }
    // handleDomain(user);
  }, [isReconnected]);

  const handleSwitchNetwork = async (id) => {
    try {
      const network = await switchNetworkLib({
        chainId: id,
      });
      setWrongNetworkModal(false);
      window.location.reload();
    } catch (error) {
      console.log("switchError", { error });
      await ChangeNetwork(id);
    }
  };

  const WalletModalBody = () => {
    return (
      <div className="walletModel">
        <h1>Wrong Network</h1>
        <p>UniLend V2 is on Ethereum Mainnet only. Please Switch Network.</p>
        <div className="networks">
          <div onClick={() => handleSwitchNetwork(1)}>
            <img src={ethlogo} alt="Etherium" />
            <p>Ethereum</p>
          </div>
          <div onClick={() => handleSwitchNetwork(42161)}>
            <img src={arblogo} alt="Etherium" />
            <p>Arbitrum</p>
          </div>
          {/* <div onClick={() => handleSwitchNetwork(1442)}>
            <img src={ethlogo} alt="Etherium" />
            <p>zkEVM</p>
          </div> */}
          {/* <div onClick={() => handleSwitchNetwork(8081)}>
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
        {Object.keys(supportedNetworks).map((chainId) => (
          <div
            key={chainId}
            className="network_box"
            onClick={() => handleSwitchNetwork(chainId)}
          >
            <div className={chain?.id == chainId ? "activeChain" : ""}>
              <img
                src={supportedNetworks[chainId].logoUrl}
                alt={`${supportedNetworks[chainId].chainName} Logo`}
              />
              <p className="wallet-name">
                {supportedNetworks[chainId].chainName}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  });
  const PopoverContent = () => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
      navigator.clipboard.writeText(currentUser);
      setCopied(true);
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
            openAccountModal,
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
                              <p> {chain.name} </p>
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

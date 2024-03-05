import "./styles/index.scss";
import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.svg";
import ethlogo from "../../assets/eth.svg"
import arblogo from "../../assets/arbitrum-logo.svg"
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
import { connectWallet } from "../../api/services/wallet";
import { useDisconnect } from "wagmi";
import { switchNetworkLib } from '../../api/lib/functions';

import {
  fromWei,
  removeFromSessionStorage,
  saveToSessionStorage,
  shortenAddress
} from "../../api/utils";

export default function Navbar() {
  const user = useSelector((state) => state.user);
  console.log(user);
  const { openConnectModal } = useConnectModal();
  const { chain, isConnected, address, status } = useWalletHook();
  console.log("chain", chain?.id)
  const { disconnect } = useDisconnect();
  const pathname = window.location.pathname;
  const [wrongNetworkModal, setWrongNetworkModal] = useState(false);
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const availableChain = Object.values(supportedNetworks).map(
    (net) => net.chainId
  );
console.log(availableChain)
  // const [currentUser, setCurrentUser] = useState({
  //   ...user,
  //   domain: shortenAddress(user?.address),
  // });
  const [visible, setVisible] = useState(false);
  const [isHaveAccess, setIsHaveAccess] = useState(true);
  const [isNetworkVisible, setIsNetworkVisible] = useState(false);
  const [isNavigateAllow, setIsNavigateAllow] = useState(false);
  const dispatch = useDispatch();
  const currentUser = address;

  const handleDisconnect = async () => {
    console.log("click on disconnect");
    await disconnect();
    // removeFromSessionStorage('user');
    // localStorage.clear();
    // window.location.reload();
  };

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

  const handleConnect = async (action, recursion) => {
    try {
      setIsWalletModalVisible(false);
      const user = await connectWallet(action);
      console.log("user", user);
      window.location.reload();
      // handleDomain(user);
      dispatch(setUser(user));
    } catch (error) {}
  };

  const handleCloseModal = () => {
    setWrongNetworkModal(false);
  };


  useEffect(() => {

    if (chain === undefined) {
      console.log("chain not supported");
      setWrongNetworkModal(true);
    } else {
      setWrongNetworkModal(false);
    }
    // handleDomain(user);
  }, [user]);

  const handleSwitchNetwork = async (id) => {
    try {
      const network = await switchNetworkLib({
        chainId: id,
      });
      window.location.href = window.location.origin;
      // window.location.reload();
      setWrongNetworkModal(false);
    } catch (error) {
      console.log('switchError', { error });
      await ChangeNetwork(id);
    }

    const connector = localStorage.getItem('wagmi.wallet');
    if (connector == 'walletConnect') {
      setTimeout(() => {
        window.location.reload();
        //removeFromSessionStorage('user')
      }, 1000);
    }
  };

  const WalletModalBody = () => {
    return (
      <div className='walletModel'>
        <h1>Wrong Network</h1>
        <p>UniLend V2 is on Ethereum Mainnet only. Please Switch Network.</p>
        <div className='networks'>
          <div onClick={() => handleSwitchNetwork(1)}>
            <img src={ethlogo} alt='Etherium' />
            <p>Ethereum</p>
          </div>
          <div onClick={() => handleSwitchNetwork(42161)}>
            <img src={arblogo} alt='Etherium' />
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
          <Button className="btn_class" onClick={() => handleDisconnect()}>
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
        <div className="nav_routes">
          <nav>
            {/* <a
              href='/pools'
              className={`${pathname === '/pools' ? 'active' : ''}`}
            >
              Pools
            </a> */}

            <a href="#" className="disable_route">
              Rewards
              <LockOutlined style={{ marginLeft: "5px" }} />
            </a>

            <a
              href="/history"
              className={`${pathname === "/history" ? "active" : ""}`}
            >
              History
            </a>
          </nav>
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
            // Note: If your app doesn't use authentication, you
            // can remove all 'authenticationStatus' checks
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

                  // if (chain && chain.unsupported) {
                  //   return (
                  //     <button onClick={openChainModal} type="button">
                  //       Wrong network
                  //     </button>
                  //   );
                  // }

                  return (
                    <div
                      className="wallet_connection"
                      
                    >
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
                                  style={{ width: 30, height: 30 }}
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
        className='antd_modal_overlaywrong'
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

import eth from '../../assets/eth_nav.svg';
import polygon from '../../assets/polygon_nav.svg';
import shardeum from '../../assets/shardeum_nav.svg';
import arb from '../../assets/arbitrum-logo.svg';
export const networks = {
  1: {
    chainId: `0x${Number(1).toString(16)}`,
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    logoUrl: eth,
    rpcUrls: [
      'https://mainnet.infura.io/v3/${INFURA_API_KEY}',
      'wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}',
      'https://api.mycryptoapi.com/eth',
      'https://cloudflare-eth.com',
    ],
    blockExplorerUrls: ['https://etherscan.io'],
  },

  137: {
    chainId: `0x${Number(137).toString(16)}`,
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    logoURl: polygon,
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
    graphAvailable: true,
  },

  56: {
    chainId: `0x${Number(56).toString(16)}`,
    chainName: 'Binance Smart Chain Mainnet',
    nativeCurrency: {
      name: 'Binance Chain Native Token',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: [
      'https://bsc-dataseed1.binance.org',
      'https://bsc-dataseed2.binance.org',
      'https://bsc-dataseed3.binance.org',
      'https://bsc-dataseed4.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://bsc-dataseed2.defibit.io',
      'https://bsc-dataseed3.defibit.io',
      'https://bsc-dataseed4.defibit.io',
      'https://bsc-dataseed1.ninicoin.io',
      'https://bsc-dataseed2.ninicoin.io',
      'https://bsc-dataseed3.ninicoin.io',
      'https://bsc-dataseed4.ninicoin.io',
      'wss://bsc-ws-node.nariox.org',
    ],
    blockExplorerUrls: ['https://bscscan.com'],
  },

  1284: {
    chainId: `0x${Number(1284).toString(16)}`,
    chainName: 'MOON',
    nativeCurrency: {
      name: 'Glimmer',
      symbol: 'GLMR',
      decimals: 18,
    },
    rpcUrls: [
      'https://rpc.api.moonbeam.network',
      'wss://wss.api.moonbeam.network',
    ],
    blockExplorerUrls: ['https://moonbeam.moonscan.io'],
  },
  5: {
    chainId: `0x${Number(5).toString(16)}`,
    chainName: 'Goerli Test Network',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'GoerliETH',
      decimals: 18,
    },
    logoUrl: eth,
    rpcUrls: ['https://goerli.infura.io/v3/'],
    blockExplorerUrls: ['https://goerli.infura.io/'],
  },
  11155111: {
    chainId: `0x${Number(11155111).toString(16)}`,
    chainName: 'Sepolia Test Network',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'SepoliaETH',
      decimals: 18,
    },
    logoUrl: eth,
    rpcUrls: [
      'https://sepolia.infura.io/v3/',
      'https://rpc.sepolia.dev',
      'https://rpc.sepolia.online',
      'https://www.sepoliarpc.space',
      'https://rpc.sepolia.org',
      'https://rpc-sepolia.rockx.com',
    ],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },

  80001: {
    chainId: `0x${Number(80001).toString(16)}`,
    chainName: 'Polygon Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    logoUrl: polygon,
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
  1442: {
    chainId: `0x${Number(1442).toString(16)}`,
    chainName: 'zkEVM Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    logoUrl: eth,
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://testnet-zkevm.polygonscan.com/'],
  },
  8081: {
    chainId: `0x${Number(8081).toString(16)}`,
    chainName: 'Shardeum Sphinx Dapp 1.X',
    nativeCurrency: { name: 'shardeum', symbol: 'SHM', decimals: 18 },
    rpcUrls: ['https://dapps.shardeum.org/'],
    blockExplorerUrls: ['https://explorer-dapps.shardeum.org/'],
    logoUrl: shardeum,
  },
};

// Supported network List
export const supportedNetworks = {
  1: {
    chainId: 1,
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    logoUrl: eth,
    rpcUrls: [
      'https://mainnet.infura.io/v3/${INFURA_API_KEY}',
      'wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}',
      'https://api.mycryptoapi.com/eth',
      'https://cloudflare-eth.com',
    ],
    blockExplorerUrls: ['https://etherscan.io'],
    graphAvailable: true,
    baseCurrency: 'ETH',
  },
  42161: {
    chainId: 42161,
    chainName: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    logoUrl: arb,
    rpcUrls: ['https://arb-mainnet.g.alchemy.com/v2/${VITE_ALCHEMY_ID}'],
    blockExplorerUrls: ['https://arbiscan.io'],
    graphAvailable: true,
    baseCurrency: 'USD',
  },

  137: {
    chainId: 137,
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    logoUrl: polygon,
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
    graphAvailable: true,
    baseCurrency: 'ETH',
  },

  // 11155111: {
  //   chainId: 11155111,
  //   chainName: "Sepolia Test Network",
  //   nativeCurrency: {
  //     name: "Ether",
  //     symbol: "SepoliaETH",
  //     decimals: 18,
  //   },
  //   logoUrl: eth,
  //   rpcUrls: [
  //     "https://sepolia.infura.io/v3/",
  //     "https://rpc.sepolia.dev",
  //     "https://rpc.sepolia.online",
  //     "https://www.sepoliarpc.space",
  //     "https://rpc.sepolia.org",
  //     "https://rpc-sepolia.rockx.com",
  //   ],
  //   blockExplorerUrls: ["https://sepolia.etherscan.io"],
  //   graphAvailable: false,
  // },

  80001: {
    chainId: 80001,
    chainName: 'Polygon Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    logoUrl: polygon,
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
    graphAvailable: true,
  },
  // 1442: {
  //   chainId: 1442,
  //   chainName: "zkEVM Testnet",
  //   nativeCurrency: {
  //     name: "ETH",
  //     symbol: "ETH",
  //     decimals: 18,
  //   },
  //   logoUrl: eth,
  //   rpcUrls: ["https://polygon-rpc.com/"],
  //   blockExplorerUrls: ["https://testnet-zkevm.polygonscan.com/"],
  //   graphAvailable: true,
  // },
  // 8081: {
  //   chainId: 8081,
  //   chainName: "Shardeum Sphinx Dapp 1.X",
  //   nativeCurrency: { name: "shardeum", symbol: "SHM", decimals: 18 },
  //   rpcUrls: ["https://dapps.shardeum.org/"],
  //   blockExplorerUrls: ["https://explorer-dapps.shardeum.org/"],
  //   logoUrl: shardeum,
  //   graphAvailable: false
  // },
  // 17000: {
  //   chainId: 17000,
  //   chainName: "Holesky Testnet",
  //   nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  //   rpcUrls: ["https://ethereum-holesky.publicnode.com"],
  //   blockExplorerUrls: ["https://holesky.etherscan.io/"],
  //   logoUrl: eth,
  //   graphAvailable: false
  // },
};

export const ChangeNetwork = async (networkId) => {
  try {
    if (!window.ethereum) throw new Error('No crypto wallet found');
    const account = await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: `0x${Number(Number(networkId)).toString(16)}`,
        },
      ],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              ...networks[networkId],
            },
          ],
        });
      } catch (err) {
        setError(err.message);
      }
    }
  }
};

export const allNetworkIds = {
  mainNet: '1',
  polygonMainNet: '137',
  binanceMainNet: '56',
  moonMainNet: '1284',
  goerli: '5',
  sepolia: '11155111',
  polygonMumbai: '80001',
};

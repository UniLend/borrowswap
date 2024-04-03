import { Chain } from '@rainbow-me/rainbowkit';
export const zkEVMTestNet = {
  id: 1442,
  name: 'zkEVM Testnet',
  network: 'polygon-zkevm-testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://polygonzkevm-testnet.g.alchemy.com/v2/Y-o5wyGBAAG1-0zx1UpZqB9f_K7C3YIE',
        'https://polygon-zkevm-testnet.rpc.thirdweb.com/ed043a51a23b0db3873f5a38b77ab28175fa496f15d3c53cf70401be89b622a',
        'https://rpc.public.zkevm-test.net',
      ],
      webSocket: [
        'wss://polygonzkevm-testnet.g.alchemy.com/v2/Y-o5wyGBAAG1-0zx1UpZqB9f_K7C3YIE',
        'wss://polygon-zkevm-testnet.rpc.thirdweb.com/ed043a51a23b0db3873f5a38b77ab28175fa496f15d3c53cf70401be89b622a',
        'wss://rpc.public.zkevm-test.net',
      ],
    },
    public: {
      http: [
        'https://polygonzkevm-testnet.g.alchemy.com/v2/Y-o5wyGBAAG1-0zx1UpZqB9f_K7C3YIE',
        'https://polygon-zkevm-testnet.rpc.thirdweb.com/ed043a51a23b0db3873f5a38b77ab28175fa496f15d3c53cf70401be89b622a',
      ],
      webSocket: [
        'wss://polygonzkevm-testnet.g.alchemy.com/v2/Y-o5wyGBAAG1-0zx1UpZqB9f_K7C3YIE',
        'wss://polygon-zkevm-testnet.rpc.thirdweb.com/ed043a51a23b0db3873f5a38b77ab28175fa496f15d3c53cf70401be89b622a',
        'wss://rpc.public.zkevm-test.net',
        'wss://rpc.public.zkevm-test.net',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.public.zkevm-test.net',
    },
  },
  testnet: true,
} as Chain;

export const shardeumTestnet = {
  id: 8081,
  name: 'Shardeum Testnet',
  network: 'Shardeum Sphinx Dapp 1.X',
  nativeCurrency: { name: 'shardeum', symbol: 'SHM', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://dapps.shardeum.org/'],
    },
    public: {
      http: ['https://dapps.shardeum.org/ '],
    },
  },
  blockExplorers: {
    default: {
      name: 'shardeum',
      url: 'https://explorer-dapps.shardeum.org/',
    },
  },
  testnet: true,
} as Chain;

export const sepoliaTestnet = {
  id: 11155111,
  name: 'Sepolia Testnet',
  network: 'Sepolia Testnet',
  nativeCurrency: { name: 'Etherium', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://eth-sepolia.g.alchemy.com/v2/Qw1EshzKUZDHO-C0gThrpT9wukR-XKaN',
        'https://eth-sepolia.g.alchemy.com/v2/mibiTKAFT4EkiFnw5Fkl55NkwpOVibgP',
        'https://sepolia.infura.io/v3/603c7bc2fa6c46ecb189576fded15f81',
        'https://eth-sepolia.g.alchemy.com/v2/mibiTKAFT4EkiFnw5Fkl55NkwpOVibgP',
      ],
      webSocket: [
        'wss://eth-sepolia.g.alchemy.com/v2/Qw1EshzKUZDHO-C0gThrpT9wukR-XKaN',
        'wss://eth-sepolia.g.alchemy.com/v2/mibiTKAFT4EkiFnw5Fkl55NkwpOVibgP',
        'wss://sepolia.infura.io/v3/603c7bc2fa6c46ecb189576fded15f81',
        'wss://eth-sepolia.g.alchemy.com/v2/mibiTKAFT4EkiFnw5Fkl55NkwpOVibgP',
      ],
    },
    public: {
      http: [
        'https://eth-sepolia.g.alchemy.com/v2/Qw1EshzKUZDHO-C0gThrpT9wukR-XKaN',
        'https://eth-sepolia.g.alchemy.com/v2/mibiTKAFT4EkiFnw5Fkl55NkwpOVibgP',
        'https://sepolia.infura.io/v3/603c7bc2fa6c46ecb189576fded15f81 ',
      ],
      webSocket: [
        'wss://eth-sepolia.g.alchemy.com/v2/Qw1EshzKUZDHO-C0gThrpT9wukR-XKaN',
        'wss://eth-sepolia.g.alchemy.com/v2/mibiTKAFT4EkiFnw5Fkl55NkwpOVibgP',
        'wss://sepolia.infura.io/v3/603c7bc2fa6c46ecb189576fded15f81 ',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'sepolia',
      url: 'https://sepolia.etherscan.io/',
    },
  },
  testnet: true,
} as Chain;

export const mumbaiTestnet = {
  id: 80001,
  name: 'Polygon Mumbai',
  network: 'Polygon Mumbai',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://polygon-mumbai.g.alchemy.com/v2/2Uqa_uWFpqzmbVfbHrVn5euVsAJ5eHQK',
      ],
      webSocket: [
        'wss://polygon-mumbai.g.alchemy.com/v2/2Uqa_uWFpqzmbVfbHrVn5euVsAJ5eHQK',
      ],
    },
    public: {
      http: [
        'https://polygon-mumbai.g.alchemy.com/v2/2Uqa_uWFpqzmbVfbHrVn5euVsAJ5eHQK',
      ],
      webSocket: [
        'wss://polygon-mumbai.g.alchemy.com/v2/2Uqa_uWFpqzmbVfbHrVn5euVsAJ5eHQK',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'etherscan',
      url: 'https://mumbai.polygonscan.com/',
    },
  },
  testnet: true,
} as Chain;

export const unilendTestnet = {
  id: 16153,
  name: 'unilend test',
  network: 'unilendtest',
  nativeCurrency: { name: 'token', symbol: 'TOKEN', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.buildbear.io/honest-spiderwoman-6c6fbc8e',
      ]
    },
    public: {
      http: [
        'https://rpc.buildbear.io/honest-spiderwoman-6c6fbc8e',
      ]

    },
  },
  blockExplorers: {
    default: {
      name: 'explore',
      url: 'https://explorer.buildbear.io/honest-spiderwoman-6c6fbc8e/transactions',
    },
  },
  testnet: true,
} as Chain;
export const polygonMainnet = {
  id: 137,
  name: 'Polygon',
  network: 'Polygon',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://polygon-mainnet.infura.io/v3/66e3a238dbe74ec3b1921da35f98b8e9',
        'https://polygon-mainnet.g.alchemy.com/v2/3UO4F86XEds-_CMUV4vnlrf0MOgFt5bn',
      ],
      webSocket: [
        'wss://polygon-mainnet.infura.io/v3/66e3a238dbe74ec3b1921da35f98b8e9',
        'wss://polygon-mainnet.g.alchemy.com/v2/3UO4F86XEds-_CMUV4vnlrf0MOgFt5bn',
      ],
    },
    public: {
      http: [
        'https://polygon-mainnet.infura.io/v3/66e3a238dbe74ec3b1921da35f98b8e9',
        'https://polygon-mainnet.g.alchemy.com/v2/3UO4F86XEds-_CMUV4vnlrf0MOgFt5bn',
      ],
      webSocket: [
        'wss://polygon-mainnet.infura.io/v3/66e3a238dbe74ec3b1921da35f98b8e9',
        'wss://polygon-mainnet.g.alchemy.com/v2/3UO4F86XEds-_CMUV4vnlrf0MOgFt5bn',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'etherscan',
      url: 'https://mumbai.polygonscan.com/',
    },
  },
  testnet: true,
} as Chain;

export const holeskyTestnet = {
  id: 17000,
  name: 'Holesky Testnet',
  network: 'Holesky Testnet',
  nativeCurrency: { name: 'Etherium', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        // "https://cosmological-attentive-brook.ethereum-holesky.discover.quiknode.pro/69f39654fa3a896989bffe0693039994ec14a8ce/",
        'https://ethereum-holesky.publicnode.com',
      ],
      webSocket: [
        // "wss://cosmological-attentive-brook.ethereum-holesky.discover.quiknode.pro/69f39654fa3a896989bffe0693039994ec14a8ce/",
        'wss://ethereum-holesky.publicnode.com',
      ],
    },
    public: {
      http: [
        // "https://cosmological-attentive-brook.ethereum-holesky.discover.quiknode.pro/69f39654fa3a896989bffe0693039994ec14a8ce/",
        'https://ethereum-holesky.publicnode.com',
      ],
      webSocket: [
        // "wss://cosmological-attentive-brook.ethereum-holesky.discover.quiknode.pro/69f39654fa3a896989bffe0693039994ec14a8ce/",
        'wss://ethereum-holesky.publicnode.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'holesky',
      url: 'https://holesky.etherscan.io/',
    },
  },
  testnet: true,
} as Chain;

export const arbitrum = {
  id: 42161,
  name: 'Arbitrum One',
  network: 'Arbitrum',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://arb-mainnet.g.alchemy.com/v2/_vEjJjw0LdVci7UvXV2G66_oIxPtbnJT',
      ],
      webSocket: [
        'wss://arb-mainnet.g.alchemy.com/v2/_vEjJjw0LdVci7UvXV2G66_oIxPtbnJT',
      ],
    },
    public: {
      http: [
        'https://arb-mainnet.g.alchemy.com/v2/_vEjJjw0LdVci7UvXV2G66_oIxPtbnJT',
      ],
      webSocket: [
        'wss://arb-mainnet.g.alchemy.com/v2/_vEjJjw0LdVci7UvXV2G66_oIxPtbnJT',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'arbscan',
      url: 'https://arbiscan.io',
    },
  },
  testnet: true,
} as Chain;


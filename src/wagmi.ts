
// import { http, createConfig } from 'wagmi'
// import { mainnet, polygon, arbitrum, polygonMumbai} from 'wagmi/chains'
// const { wallets } = getDefaultWallets();
// import {
//     RainbowKitProvider,
//     getDefaultWallets,
//     getDefaultConfig,
//   } from "@rainbow-me/rainbowkit";
// import {
//     rabbyWallet,
//     trustWallet,
//     ledgerWallet,
//     okxWallet,
//     coin98Wallet
//   } from "@rainbow-me/rainbowkit/wallets";

// export const wagmiConfig = getDefaultConfig({
//     appName: 'BorrowSwap',
//     projectId: 'YOUR_PROJECT_ID',
//     chains: [mainnet, polygon, arbitrum, polygonMumbai],
//     wallets: [
//       ...wallets,
//       {
//         groupName: "Recommended",
//         wallets: [rabbyWallet, trustWallet, okxWallet, coin98Wallet],
//       },
//     ],
//     transports: {
//       [mainnet.id]: http(),
//       [polygon.id]: http(),
//     }
//   });
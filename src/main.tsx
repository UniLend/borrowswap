import "./polyfills";
import "./global.css";
import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { injected } from "wagmi/connectors";
import infinityLogo from "./assets/infinity-logo.svg";
// import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { mainnet, polygon } from "wagmi/chains";
import { mumbaiTestnet, arbitrum, unilendTestnet } from "./api/networks/Chains";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./states/store";
import { Provider } from "react-redux";
import { myCustomTheme } from "./theme/customWalletTheme";
// import {wagmiConfig} from "./config.ts"
import {
  rabbyWallet,
  trustWallet,
  ledgerWallet,
  okxWallet,
  coin98Wallet,
} from "@rainbow-me/rainbowkit/wallets";

const { wallets } = getDefaultWallets();

export const wagmiConfig = getDefaultConfig({
  appName: "BorrowSwap",
  projectId: "YOUR_PROJECT_ID",
  chains: [polygon, unilendTestnet, mainnet],
  wallets: [
    ...wallets,
    {
      groupName: "Recommended",
      wallets: [rabbyWallet, trustWallet, okxWallet, coin98Wallet],
    },
  ],
  transports: {
    [mainnet.id]: http(),
    [unilendTestnet.id]: http(),
    [polygon.id]: http(),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider modalSize='compact' theme={myCustomTheme}>
            <App />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Provider>
  </React.StrictMode>
);

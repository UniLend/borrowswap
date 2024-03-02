import { ConnectButton } from "@rainbow-me/rainbowkit";
// import "@ant-design/react-native/dist/antd.css";
import "./App.scss";
import Card from "./components/Card";
import Navbar from "./components/Navbar";
import SwapCard from "./components/SwapCard";

import { useEffect } from "react";
import { fetchGraphQlData, getTokenPrice } from "./api/axios/calls";
import useWalletHook from "./api/hooks/useWallet";
import { getPoolCreatedGraphQuery } from "./api/axios/query";
import { useQuery } from "@tanstack/react-query";
import { loadPoolsWithGraph } from "./helpers";

function App() {
  document.body.className = `body dark`;
  const { address, chain } = useWalletHook();
  const query = getPoolCreatedGraphQuery(address);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["pools"],
    queryFn: async () => {
      const fetchedDATA = await fetchGraphQlData(chain?.id || 1, query);
      return fetchedDATA;
    },
  });

  useEffect(() => {
    if (chain?.id) {
      loadPoolsWithGraph(data, chain);
    }
  }, [data]);

  return (
    <div>
      <Navbar />
      {/* <Card /> */}
      <SwapCard />
    </div>
  );
}

export default App;

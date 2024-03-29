import { Suspense, lazy, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import "./App.scss";
const Card = lazy(() => import("./components/Card"));
import Navbar from "./components/Navbar";
import SwapCard from "./components/SwapCard";

import { fetchGraphQlData, getTokenPrice } from "./api/axios/calls";
import useWalletHook from "./api/hooks/useWallet";
import { getPoolCreatedGraphQuery } from "./api/axios/query";
import { loadPoolsWithGraph } from "./helpers";
import { connectWallet } from "./api/services/wallet";
function App() {
  document.body.className = `body dark`;
  const { address, chain, isConnected } = useWalletHook();
  const query = getPoolCreatedGraphQuery(address);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["pools"],
    queryFn: async () => {
      const fetchedDATA = await fetchGraphQlData(chain?.id || 1, query);
      return fetchedDATA;
    },
  });
console.log("data", data);
  useEffect(() => {
    if (chain?.id) {
      loadPoolsWithGraph(data, chain);
    }
  }, [data]);

  return (
    <div>
      <Navbar />
      <Suspense fallback={<p className='paragraph01'>Loading...</p>}>
        <Card isLoading={isLoading} />
      </Suspense>
    </div>
  );
}

export default App;

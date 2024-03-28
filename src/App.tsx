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
  // const query = getPoolCreatedGraphQuery('0xC6e35522F7847F3D44D1F7D57AFc843A7D679fC5');
  // const { data, isLoading, refetch } = useQuery({
  //   queryKey: ["pools"],
  //   queryFn: async () => {
  //     const fetchedDATA = await fetchGraphQlData(chain?.id || 1, query);
  //     return fetchedDATA;
  //   },
  // });

  useEffect(() => {
    if (chain?.id && address) {
    
      loadPoolsWithGraph(chain, address);
    }
  }, [chain]);

  return (
    <div>
      <Navbar />
      <Suspense fallback={<p className='paragraph01'>Loading...</p>}>
        <Card  />
      </Suspense>
    </div>
  );
}

export default App;

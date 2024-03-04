import { ConnectButton } from '@rainbow-me/rainbowkit';
import Card from './components/Card';
import Navbar from './components/Navbar';


import { useEffect } from 'react';
import { fetchGraphQlData, getTokenPrice } from './api/axios/calls';
import useWalletHook from './api/hooks/useWallet';
import { getPoolCreatedGraphQuery } from './api/axios/query';
import { useQuery } from '@tanstack/react-query';
import {  loadPoolsWithGraph } from './helpers';

function App() {
const { address, chain } = useWalletHook();
const query = getPoolCreatedGraphQuery(address);
const {data, isLoading, refetch} = useQuery({queryKey: ['pools'], queryFn:  async () => {
  const fetchedDATA = await fetchGraphQlData(
    chain?.id || 1,
     query,
  );
  return fetchedDATA;
}});


useEffect(() => {
  console.log("data", data);
  
if(chain?.id){
  loadPoolsWithGraph( data, chain)
}
}, [data])

  return (
    <div>
    <Navbar/>
<Card/>
    </div>

  );
}

export default App;

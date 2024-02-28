import { useAccount } from 'wagmi';

export default function useWalletHook() {
  const { address, isConnecting, isDisconnected, isConnected, chain } = useAccount();
 
  return { address, isConnected, chain };
}

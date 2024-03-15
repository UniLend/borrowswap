import { useAccount, useBalance } from 'wagmi';

export default function useWalletHook() {
  const { address, isConnecting, isDisconnected, isConnected, chain, chainId, isReconnected } = useAccount();
  return { address, isConnected, chain,chainId, status, isReconnected };
}

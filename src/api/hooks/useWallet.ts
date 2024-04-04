import { useAccount } from 'wagmi';

export default function useWalletHook() {
  const { address, isConnected, chain, chainId } = useAccount();
  return { address, isConnected, chain, chainId };
}

import { type Config, getClient, getConnectorClient } from '@wagmi/core'
import { providers, ethers } from 'ethers'
import type { Client, Chain, Transport, Account } from 'viem'
import { wagmiConfig } from '../../main';

export function clientToProvider(client: Client<Transport, Chain> | { transport?: any; chain?: any }) {
  const { chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  if (transport.type === 'fallback')
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<Transport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network),
      ),
    )
  return new providers.JsonRpcProvider(transport.url, network)
}

/** Action to convert a viem Public Client to an ethers.js Provider. */
export function getEthersProvider(
  config: Config,
  { chainId }: { chainId?: number } = {},
) {
  const client = getClient(config, { chainId })
  return clientToProvider(client || { transport: '', chain: '' })
}


export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer
}

/** Action to convert a Viem Client to an ethers.js Signer. */
export async function getEthersSigner(
  config: Config,
  { chainId }: { chainId?: number } = {},
) {
  const client = await getConnectorClient(config, { chainId })
  return clientToSigner(client)
}

export async function getEtherContract(
  address: any,
  abi: any,
  chainId?: number,
) {
  const signer = await getEthersSigner( wagmiConfig, { chainId });
  const provider = getEthersProvider( wagmiConfig, { chainId });

  const contract = new ethers.Contract(
    address,
    abi,
    signer ? signer : provider,
  );

  return contract;
}
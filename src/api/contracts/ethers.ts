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
  { chainId }: { chainId?: number } = {},
) {

  const client = getClient(wagmiConfig, { chainId })
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
  { chainId }: { chainId?: number } = {},
) {
  const client = await getConnectorClient(wagmiConfig, { chainId })
  return clientToSigner(client)
}

export async function getEtherContract(
  address: any,
  abi: any,
  chainId?: number,
) {
  try {
    const signer = await getEthersSigner(  { chainId });
    const provider = getEthersProvider(  { chainId });
  
    const contract = new ethers.Contract(
      address,
      abi,
      signer ? signer : provider,
    );
  
    return contract;
  } catch (error) {
    console.log("Error creating the Ethereum contract", error);
    
  }
  
}
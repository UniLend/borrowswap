import {
    switchChain,
  } from 'wagmi/actions';
  
  export const switchNetworkLib = async (props) => {
    try {
      const data = await switchChain(props);
      return data;
    } catch (error) {
      throw error;
    }
  };
  
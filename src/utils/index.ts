import { tokensBYSymbol, chainsBySymbol } from "./tokenDetails";

export function imgError(source: any): boolean {
  source.target.src =
    "https://e7.pngegg.com/pngimages/407/710/png-clipart-ethereum-cryptocurrency-bitcoin-cash-smart-contract-bitcoin-blue-angle-thumbnail.png";
  source.target.onerror = null;
  return true;
}

export function getTokenLogo(symbol: string): string {
  if (tokensBYSymbol[symbol]) {
    return tokensBYSymbol[symbol].logo;
  } else {
    return "https://e7.pngegg.com/pngimages/407/710/png-clipart-ethereum-cryptocurrency-bitcoin-cash-smart-contract-bitcoin-blue-angle-thumbnail.png";
  }
}

export function getChainSymbol(symbol: number): string {
  if (chainsBySymbol[symbol]) {
    return chainsBySymbol[symbol].logo;
  } else {
    return "https://e7.pngegg.com/pngimages/407/710/png-clipart-ethereum-cryptocurrency-bitcoin-cash-smart-contract-bitcoin-blue-angle-thumbnail.png";
  }
}


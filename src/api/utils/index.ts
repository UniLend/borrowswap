export const shortenAddress = (address) =>
  address && `${address.slice(0, 5)}....${address.slice(address.length - 4)}`;

export const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getFromLocalStorage = (key) => {
  return JSON.parse(localStorage.getItem(key));
};

export const removeFromLocalStorage = (key) => {
  localStorage.removeItem(key);
};

export const saveToSessionStorage = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const getFromSessionStorage = (key) => {
  return JSON.parse(sessionStorage.getItem(key));
};

export const removeFromSessionStorage = (key) => {
  sessionStorage.removeItem(key);
};
//'https://assets.coingecko.com/coins/images/12591/large/binance-coin-logo.png'





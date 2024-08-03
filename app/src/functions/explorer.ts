import { ChainId } from "constants/chainIds";

const explorers = {
  etherscan: (
    link: string,
    data: string,
    type: "transaction" | "token" | "address" | "block"
  ) => {
    switch (type) {
      case "transaction":
        return `${link}/tx/${data}`;
      default:
        return `${link}/${type}/${data}`;
    }
  },

  blockscout: (
    link: string,
    data: string,
    type: "transaction" | "token" | "address" | "block"
  ) => {
    switch (type) {
      case "transaction":
        return `${link}/tx/${data}`;
      case "token":
        return `${link}/tokens/${data}`;
      default:
        return `${link}/${type}/${data}`;
    }
  },

  harmony: (
    link: string,
    data: string,
    type: "transaction" | "token" | "address" | "block"
  ) => {
    switch (type) {
      case "transaction":
        return `${link}/tx/${data}`;
      case "token":
        return `${link}/address/${data}`;
      default:
        return `${link}/${type}/${data}`;
    }
  },

  okex: (
    link: string,
    data: string,
    type: "transaction" | "token" | "address" | "block"
  ) => {
    switch (type) {
      case "transaction":
        return `${link}/tx/${data}`;
      case "token":
        return `${link}/tokenAddr/${data}`;
      default:
        return `${link}/${type}/${data}`;
    }
  },
};
interface ChainObject {
  [chainId: number]: {
    link: string;
    builder: (
      chainName: string,
      data: string,
      type: "transaction" | "token" | "address" | "block"
    ) => string;
  };
}

const chains: ChainObject = {
  [ChainId.MAINNET]: {
    link: "https://etherscan.io",
    builder: explorers.etherscan,
  },
  [ChainId.RINKEBY]: {
    link: "https://rinkeby.etherscan.io",
    builder: explorers.etherscan,
  },
};

export function getExplorerLink(
  chainId: number,
  data: string,
  type: "transaction" | "token" | "address" | "block"
): string {
  const chain = chains[chainId];
  return chain?.builder(chain.link, data, type);
}

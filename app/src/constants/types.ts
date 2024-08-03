import { ChainId } from "./chainIds";

export enum ConnectorNames {
    Injected = 'injected',
    WalletConnect = 'walletconnect',
    BSC = 'bsc',
  }
  export const NETWORK_SYMBOL: { [chainId in ChainId]?: string } = {
    [ChainId.MAINNET]: 'ETH',
    [ChainId.RINKEBY]: 'ETH',
    [ChainId.BSC]: 'BNB',
    [ChainId.BSC_TESTNET]: 'BNB',
    [ChainId.HARDHAT]: 'ETH',
    [ChainId.HARDHAT2]: 'ETH',
  }
import { Avalanche, Binance, Celo, Ether, Fantom, Fuse, Harmony, Heco, Matic, Movr, Okex, Palm, xDai, Lux } from './entities/Native';

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  MATIC = 137,
  MATIC_TESTNET = 80001,
  FANTOM = 250,
  FANTOM_TESTNET = 4002,
  XDAI = 100,
  BSC = 56,
  BSC_TESTNET = 97,
  ARBITRUM = 42161,
  ARBITRUM_TESTNET = 79377087078960,
  MOONBEAM_TESTNET = 1287,
  LUX = 43114,
  LUX_TESTNET = 43113,
  HECO = 128,
  HECO_TESTNET = 256,
  HARMONY = 1666600000,
  HARMONY_TESTNET = 1666700000,
  OKEX = 66,
  OKEX_TESTNET = 65,
  CELO = 42220,
  PALM = 11297108109,
  PALM_TESTNET = 11297108099,
  MOONRIVER = 1285,
  FUSE = 122,
  HARDHAT = 1337,
  HARDHAT2 = 1338
}
export declare const NATIVE: {
  1: Ether;
  3: Ether;
  4: Ether;
  5: Ether;
  42: Ether;
  250: Fantom;
  4002: Fantom;
  137: Matic;
  80001: Matic;
  100: xDai;
  56: Binance;
  97: Binance;
  42161: Ether;
  43114: Lux;
  43113: Lux;
  128: Heco;
  256: Heco;
  1666600000: Harmony;
  1666700000: Harmony;
  66: Okex;
  65: Okex;
  42220: Celo;
  11297108109: Palm;
  1285: Movr;
  122: Fuse;
  1337: Ether;
  1338: Ether;
};

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import dotenv from 'dotenv';

dotenv.config ();

const PRIVATE_KEY: string = process.env.PRIVATE_KEY!;
const SEPOLIA_RPC: string = process.env.SEPOLIA_RPC!;
const BASE_RPC: string = process.env.BASE_RPC!;
const BSC_TESTNET_RPC: string = process.env.BSC_TESTNET_RPC!;

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  // defaultNetwork: "sepolia",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC,
      accounts: [PRIVATE_KEY],
    },
    bsc_testnet: {
      url: BSC_TESTNET_RPC,
      accounts: [PRIVATE_KEY]
    },
    base: {
      url: BASE_RPC,
      accounts: [PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY!,
      bsc: process.env.BSCSCAN_API_KEY!
    }
  },
  sourcify: {
    enabled: true,
  },
};

export default config;
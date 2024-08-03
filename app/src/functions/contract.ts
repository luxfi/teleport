// NOTE: Try not to add anything to thie file, it's almost entirely refactored out.

import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'

import { AddressZero } from '@ethersproject/constants'

import { Contract } from '@ethersproject/contracts'
import { isAddress } from './validate'
import { SUPPORTED_NETWORKS } from 'config/networks'

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}



export async function switchChain(chainId, library, account) {
  console.debug(
    `Switching to chain ${chainId}`,
    SUPPORTED_NETWORKS[chainId]
  );
  const params = SUPPORTED_NETWORKS[chainId];
  try {
    await library?.send("wallet_switchEthereumChain", [
      { chainId: `0x${chainId.toString(16)}` },
      account,
    ]);
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    // @ts-ignore TYPE NEEDS FIXING
    if (switchError.code === 4902) {
      try {
        await library?.send("wallet_addEthereumChain", [
          params,
          account,
        ]);
      } catch (addError) {
        // handle "add" error
        console.error(`Add chain error ${addError}`);
      }
    }
    console.error(`Switch chain error ${switchError}`);
    // handle other "switch" errors
  }
}
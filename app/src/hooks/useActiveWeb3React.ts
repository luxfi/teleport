import type { Connector } from '@web3-react/types'
import type { BaseProvider, Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';

export function useActiveWeb3React(): {
  connector: Connector;
  library: BaseProvider | Web3Provider | any;
  chainId: number | undefined;
  account: string | undefined;
  active: boolean;
  error: Error | undefined;
  accounts: string[] | undefined;
  isActivating: boolean
} {
  const { provider, connector,
    chainId,
    account,
    error, isActivating, accounts, isActive, } = useWeb3React()



  // replace with address to impersonate
  return {
    connector,
    library: provider,
    chainId,
    account,
    accounts,
    active: isActive,
    error, isActivating
  }
}

export default useActiveWeb3React
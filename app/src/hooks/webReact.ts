import { BaseProvider, ExternalProvider, JsonRpcFetchFunc, Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import { getSigner } from 'functions/contract'

export const getLibrary = (provider: ExternalProvider | JsonRpcFetchFunc): Web3Provider => {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

export async function signMessage(message: string, account: string, wallet: BaseProvider | Web3Provider | any) {
  const signature = await getSigner(wallet, account).signMessage(`${message}`);
  return signature
}

// const handleSignMessage = async ({
//   message,
//   library,
// }: {
//   message: any;
//   library: any;
// }) => {
//   try {
//     
//     return signature;
//   } catch (err) {
//     // notify("You need to sign the message to be able to log in.");
//     // window.location.reload();
//   }
// };
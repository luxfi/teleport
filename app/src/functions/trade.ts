import { BigNumber } from '@ethersproject/bignumber'
import Web3 from 'web3'


// add 20%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000))
}

export async function getGasPrice(library): Promise<string> {
  if (library) {
    const gasPrice = await library.getGasPrice();
    console.log('getGasPrice', Web3.utils.fromWei(gasPrice.toString()))
    return Web3.utils.fromWei(gasPrice.toString())
  }
}
import { useSelector } from 'react-redux'
import { NetworkState } from './reducer'

export function useGasPrice(): number | undefined {
  return useSelector((state: NetworkState) => state.gasPrice)
}

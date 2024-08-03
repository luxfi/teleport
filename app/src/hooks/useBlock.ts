import { useWeb3React } from '@web3-react/core'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateBlockNumber } from 'state/application/actions'
import Web3 from 'web3'
import useDebounce from './useDebounce'
import useIsWindowVisible from './useIsWindowVisible'


export function useUpdateBlockNumber(): () => void {
    const { provider, chainId } = useWeb3React()
    const dispatch = useDispatch()
    const web3 = new Web3(Web3.givenProvider);

    const windowVisible = useIsWindowVisible()

    const [state, setState] = useState<{
        chainId: number | undefined
        blockNumber: number | null
    }>({
        chainId,
        blockNumber: null,
    })

    const blockNumberCallback = useCallback(
        (blockNumber: number) => {
            console.log('blockNumber', blockNumber, 'state', state)
            setState((state) => {
                if (chainId === state.chainId) {
                    if (state.blockNumber && typeof state.blockNumber !== 'number') return { chainId, blockNumber }
                    return {
                        chainId,
                        blockNumber: Math.max(blockNumber, state.blockNumber),
                    }
                }
                return state
            })
        },
        [chainId, setState],
    )

    // attach/detach listeners


    const debouncedState = useDebounce(state, 100)

    useEffect(() => {
        if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return
        dispatch(
            updateBlockNumber({
                chainId: debouncedState.chainId,
                blockNumber: debouncedState.blockNumber,
            }),
        )
    }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

    return useCallback(async () => {
        if (!provider || !chainId || !windowVisible) return undefined
        setState({ chainId, blockNumber: null })
        // eslint-disable-next-line react-hooks/exhaustive-deps
        web3.eth?.getBlockNumber()
            .then(blockNumberCallback)
            .catch((error) => console.error(`Failed to get block number for chainId: ${chainId}`, error))
    }, [dispatch, chainId, provider, blockNumberCallback, windowVisible]);
}

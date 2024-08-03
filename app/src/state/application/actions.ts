import { createAction } from '@reduxjs/toolkit'

export enum ApplicationModal {
    CONNECT, WALLET, MINT, SIDEBAR, NETWORK
}

export enum ApplicationLoader {
}
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const setStartLoader = createAction<ApplicationLoader | null>('application/setStartLoader')
export const setPriorityConnector = createAction<any>('application/setPriorityConnector')
export const updateBlockNumber = createAction<{
    chainId: number
    blockNumber: number
}>('application/updateBlockNumber')
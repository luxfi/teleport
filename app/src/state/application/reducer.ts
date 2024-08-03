import { createReducer } from '@reduxjs/toolkit'
import { ApplicationLoader, ApplicationModal, setStartLoader, setOpenModal, setPriorityConnector, updateBlockNumber } from './actions'

export interface ApplicationState {
  readonly openModal: ApplicationModal | null
  readonly openLoader: ApplicationLoader | null
  priorityConnector: any;
  readonly blockNumber: { readonly [chainId: number]: number }
}

const initialState: ApplicationState = {
  blockNumber: {},
  openModal: null,
  openLoader: null,
  priorityConnector: null
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setOpenModal, (state, action) => {
      state.openModal = action.payload
    }).addCase(setStartLoader, (state, action) => {
      state.openLoader = action.payload
    }).addCase(setPriorityConnector, (state, action) => {
      state.priorityConnector = action.payload
    }).addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload
      if (state.blockNumber && typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        if (state.blockNumber) {
          state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])

        }
      }
    })

)

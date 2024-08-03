import { createReducer } from '@reduxjs/toolkit'
import { updateGasPrice } from './actions'

export interface NetworkState {
  gasPrice: number
}

const initialState: NetworkState = {
  gasPrice: 0,
}

export default createReducer(initialState, (builder) =>
  builder.addCase(updateGasPrice.fulfilled, (state, action) => {
    const { gasPrice } = action.payload
    state.gasPrice = gasPrice
  }),
)

import { createAsyncThunk } from '@reduxjs/toolkit'

export const updateGasPrice = createAsyncThunk('network/updateGasPrice', async (library: any) => {
  const weiPrice = Number(await library.eth.getGasPrice())
  return { gasPrice: weiPrice }
})

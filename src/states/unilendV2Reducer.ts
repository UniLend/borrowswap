import { createSlice } from '@reduxjs/toolkit';


export interface UnilendV2State {
  poolList: object,
  tokenList: object
}

const initialState: UnilendV2State = {
 poolList:{},
 tokenList: {}
}

export const unilendV2Slice = createSlice({
  name: 'unilendV2',
  initialState,
  reducers: {
 
    setPools: (state, action) => {
      state.poolList = action.payload
    },
    setTokens: (state, action) => {
      state.tokenList = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setPools, setTokens } = unilendV2Slice.actions

export default unilendV2Slice.reducer
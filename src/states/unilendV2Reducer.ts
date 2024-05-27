import { createSlice } from '@reduxjs/toolkit';


export interface UnilendV2State {
  poolList: object,
  tokenList: object,
  positions: object,
  user:object
}

const initialState: UnilendV2State = {
 poolList:{},
 tokenList: {},
 positions:{},
 user: {
  address: '0x',
  balance: null,
  symbol: {},
  network: {
    id: null,
    name: null,
  },
  isConnected: false,
},
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
    setPositions: (state, action) => {
      state.positions = action.payload
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { setPools, setTokens, setUser,  setPositions} = unilendV2Slice.actions

export default unilendV2Slice.reducer
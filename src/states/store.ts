import { configureStore } from '@reduxjs/toolkit'
import UnilendV2Reducer from './unilendV2Reducer'

export const store = configureStore({
  reducer: { unilendV2: UnilendV2Reducer },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type UnilendV2State = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
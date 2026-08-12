import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  status: 'loading',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.status = action.payload ? 'authenticated' : 'unauthenticated'
    },
    setAuthStatus: (state, action) => {
      state.status = action.payload
    },
    setAuthError: (state, action) => {
      state.error = action.payload
    },
    clearAuth: (state) => {
      state.user = null
      state.status = 'unauthenticated'
      state.error = null
    },
  },
})

export const { setUser, setAuthStatus, setAuthError, clearAuth } = authSlice.actions
export default authSlice.reducer

export const selectUser = (state) => state.auth.user
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthLoading = (state) => state.auth.status === 'loading'

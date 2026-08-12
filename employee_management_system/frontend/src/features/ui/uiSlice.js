import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'dark',
    toasts: [],
  },
  reducers: {
    addToast: (state, action) => {
      state.toasts.push({ id: Date.now(), ...action.payload })
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
  },
})

export const { addToast, removeToast } = uiSlice.actions
export default uiSlice.reducer

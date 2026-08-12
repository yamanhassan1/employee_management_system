import { configureStore } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE } from '../utils/constants'
import authReducer from '../features/auth/authSlice'
import uiReducer from '../features/ui/uiSlice'
import '../features/projects/projectsApi'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    credentials: 'include',
  }),
  tagTypes: ['Projects', 'Project', 'Tasks', 'Notifications', 'Calendar'],
  endpoints: () => ({}),
})

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export default store

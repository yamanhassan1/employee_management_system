import axios from 'axios'
import { API_BASE } from '../utils/constants'

let refreshPromise = null

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const path = original?.url || ''

    if (
      status === 401 &&
      !original._retry &&
      !path.includes('/auth/refresh') &&
      !path.includes('/auth/login')
    ) {
      original._retry = true
      if (!refreshPromise) {
        refreshPromise = apiClient.post('/auth/refresh').finally(() => {
          refreshPromise = null
        })
      }
      try {
        await refreshPromise
        return apiClient(original)
      } catch {
        // session expired
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

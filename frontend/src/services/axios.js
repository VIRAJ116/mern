import axios from 'axios'
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from './token-store'

export const http = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise = null

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${http.defaults.baseURL}/refresh`,
        {},
        { withCredentials: true }
      )
      .then((res) => {
        const token = res.data?.accessToken
        if (!token) throw new Error('No access token in refresh response')
        setAccessToken(token)
        return token
      })
      .catch((err) => {
        clearAccessToken()
        throw err
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url = original?.url || ''

    // Don't try to refresh on auth endpoints themselves
    const isAuthEndpoint =
      url.includes('/refresh') ||
      url.includes('/login') ||
      url.includes('/logout')

    if (status === 401 && !original?._retry && !isAuthEndpoint) {
      original._retry = true
      try {
        const token = await refreshAccessToken()
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${token}`
        return http(original)
      } catch (e) {
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

import { http } from './axios'
import { setAccessToken, clearAccessToken } from './token-store'

export const login = async (payload) => {
  const res = await http.post('/login', payload)
  if (res.data?.accessToken) setAccessToken(res.data.accessToken)
  return res.data
}

export const refresh = async () => {
  const res = await http.post('/refresh')
  if (res.data?.accessToken) setAccessToken(res.data.accessToken)
  return res.data
}

export const logout = async () => {
  try {
    const res = await http.post('/logout')
    return res.data
  } finally {
    clearAccessToken()
  }
}

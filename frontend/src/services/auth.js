import { http } from './axios'

export const login = (payload) => {
  return http.post('/login', payload)
}
export const validateMe = () => {
  return http.get('/validate-me')
}

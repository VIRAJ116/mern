import { http } from './axios'

export const login = (payload) => http.post('/login', payload)
export const validateMe = () => http.get('/validate-me')
export const logout = () => http.post('/logout')

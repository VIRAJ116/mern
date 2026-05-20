import { http } from './axios'

export const register = (payload) => http.post('/api/users/signup', payload)
export const updateProfile = (payload) => http.patch('/api/auth/profile', payload)
export const changePassword = (payload) => http.patch('/api/auth/change-password', payload)

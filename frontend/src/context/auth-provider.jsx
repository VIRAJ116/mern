import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { validateMe } from '@/services/auth'
import { AuthContext } from './auth-context'

export const AuthProvider = ({ children }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: validateMe,
    retry: false,
    staleTime: 0,
  })
  const user = data?.data?.user || null

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading,
        isAuthenticated: !!user && !isError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

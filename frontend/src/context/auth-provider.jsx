import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { refresh } from '@/services/auth'
import { AuthContext } from './auth-context'

export const AuthProvider = ({ children }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: refresh,
    retry: false,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })

  const user = data?.data || null

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && !isError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

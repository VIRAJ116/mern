import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router'
import { validateMe } from '@/services/auth'
import { AuthContext } from './auth-context'
import { PUBLIC_ROUTES } from '@/const/route'

// Public routes that don't require authentication

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const location = useLocation()

  // Only validate if not on a public route
  const shouldValidate = !PUBLIC_ROUTES.includes(location.pathname)

  const { isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: validateMe,
    retry: false,
    staleTime: 0,
    enabled: shouldValidate,

    onSuccess: (data) => {
      setUser(data.user)
    },
    onError: () => {
      setUser(null)
    },
  })

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: shouldValidate ? isLoading : false,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

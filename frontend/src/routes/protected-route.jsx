import React from 'react'
import { useAuth } from '@/context/auth-context'
import { Navigate, Outlet } from 'react-router'
import { Spinner } from '@/components/ui/spinner'

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute

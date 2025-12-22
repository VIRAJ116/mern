import React from 'react'
import { useAuth } from '@/context/auth-context'
import { Navigate, Outlet, useLocation } from 'react-router'
import { Spinner } from '@/components/ui/spinner'
import { PUBLIC_ROUTES } from '@/const/route'

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!isAuthenticated && !PUBLIC_ROUTES.includes(location.pathname)) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute

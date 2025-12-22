import React from 'react'
import { useAuth } from '@/context/auth-context'
import { Navigate, Outlet } from 'react-router'
import { Spinner } from '@/components/ui/spinner'

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-dvh bg-primary items-center justify-center">
        <Spinner className="size-8 text-primary-foreground" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default PublicRoute

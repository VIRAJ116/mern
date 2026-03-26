import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/auth-provider';
import { Loader2, ShieldX } from 'lucide-react';

export default function ProtectedRoute() {
  const { isAuthenticated, isAdmin, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <ShieldX className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to access the admin panel.
        </p>
        <button
          onClick={logout}
          className="mt-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80"
        >
          Sign in with a different account
        </button>
      </div>
    );
  }

  return <Outlet />;
}

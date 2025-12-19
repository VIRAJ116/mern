import { createBrowserRouter, Navigate } from 'react-router'
import App from '@/App'
import Login from '@/pages/login'
import ProtectedRoute from '@/routes/protected-route'
import Dashboard from '@/pages/dashboard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
        ],
      },
    ],
  },
])

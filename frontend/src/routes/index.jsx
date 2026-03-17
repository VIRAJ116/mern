import { createBrowserRouter, Navigate } from 'react-router'
import App from '@/App'
import Login from '@/pages/login'
import Register from '@/pages/register'
import HomePage from '@/pages/home'
import MenuPage from '@/pages/menu'
import PizzaDetailPage from '@/pages/menu/[id]'
import CartPage from '@/pages/cart'
import CheckoutPage from '@/pages/checkout'
import OrderConfirmationPage from '@/pages/order-confirmation'
import OrdersPage from '@/pages/orders'
import OrderDetailPage from '@/pages/orders/[id]'
import ProfilePage from '@/pages/profile'
import ProtectedRoute from '@/routes/protected-route'
import PublicRoute from '@/routes/public-route'
import CustomerLayout from '@/layout/CustomerLayout'
import NotFoundPage from '@/pages/notfound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // --- Public-only routes (redirect to home if already logged in) ---
      {
        element: <PublicRoute />,
        children: [
          { path: 'login', element: <Login /> },
          { path: 'register', element: <Register /> },
        ],
      },

      // --- Customer-facing layout (Navbar + Footer) ---
      {
        element: <CustomerLayout />,
        children: [
          // Publicly accessible customer pages
          { index: true, element: <HomePage /> },
          { path: 'menu', element: <MenuPage /> },
          { path: 'menu/:id', element: <PizzaDetailPage /> },
          { path: 'cart', element: <CartPage /> },

          // Protected customer pages (require login)
          {
            element: <ProtectedRoute />,
            children: [
              { path: 'checkout', element: <CheckoutPage /> },
              { path: 'order-confirmation', element: <OrderConfirmationPage /> },
              { path: 'orders', element: <OrdersPage /> },
              { path: 'orders/:id', element: <OrderDetailPage /> },
              { path: 'profile', element: <ProfilePage /> },
            ],
          },
        ],
      },

      // --- 404 ---
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

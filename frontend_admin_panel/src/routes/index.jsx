import { Routes, Route } from 'react-router';
import ProtectedRoute from './protected-route';
import PublicRoute from './public-route';
import { AdminLayout } from '../components/layout/admin-layout';
import LoginPage from '../pages/login';
import Dashboard from '../pages/dashboard';
import PizzasPage from '../pages/pizzas';
import PizzaFormPage from '../pages/pizzas/form';
import CategoriesPage from '../pages/categories';
import ToppingsPage from '../pages/toppings';
import OrdersPage from '../pages/orders';
import OrderDetailPage from '../pages/orders/order-detail';
import UsersPage from '../pages/users';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pizzas" element={<PizzasPage />} />
          <Route path="pizzas/new" element={<PizzaFormPage />} />
          <Route path="pizzas/:id/edit" element={<PizzaFormPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="toppings" element={<ToppingsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

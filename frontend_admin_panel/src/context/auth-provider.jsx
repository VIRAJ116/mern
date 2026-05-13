import { createContext, useContext } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as authService from '../services/auth';

const ADMIN_ROLES = ['admin', 'super_admin'];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.refresh,
    retry: false,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const isAuthenticated = !!user;
  const checkIsAdmin = (role) => {
    if (!role) return false;
    if (Array.isArray(role)) {
      return role.some(r => ADMIN_ROLES.includes(r));
    }
    return ADMIN_ROLES.includes(role);
  };

  const isAdmin = isAuthenticated && checkIsAdmin(user.role);

  const login = async (credentials) => {
    const userData = await authService.login(credentials);
    if (!checkIsAdmin(userData.role)) {
      await authService.logout();
      throw new Error('ACCESS_DENIED');
    }
    queryClient.setQueryData(['auth', 'me'], userData);
  };

  const logout = async () => {
    await authService.logout();
    queryClient.clear();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

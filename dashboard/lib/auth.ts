import { User, AuthResponse } from '@/types';

export const setAuth = (data: AuthResponse) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem(
    'user',
    JSON.stringify({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    })
  );
};

export const getAuth = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const hasRole = (roles: string[]): boolean => {
  const user = getAuth();
  if (!user) return false;
  return roles.includes(user.role);
};


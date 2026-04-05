import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, api } from '../services/api';
import type { User, LoginRequest, RegisterRequest } from '../types/apiTypes';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkSession = async () => {
    try {
      const data = await authService.checkSession();
      if (data.isAuthenticated && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      const res = await authService.login(data);
      if (res.status === 'success' && res.user) {
        setUser(res.user);
        setIsAuthenticated(true);
        toast.success('¡Bienvenido de nuevo!');
      } else {
        toast.error(res.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error de conexión';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const res = await authService.register(data);
      if (res.status === 'success' && res.user) {
        setUser(res.user);
        setIsAuthenticated(true);
        toast.success('¡Cuenta creada correctamente!');
      } else {
        toast.error(res.message || 'Error al registrarse');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error de conexión';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.info('Sesión cerrada');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/usuarios/${user.id}`);
      setUser(res.data);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, checkSession, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

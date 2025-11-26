import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  refreshUser: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBarber: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = () => {
    const currentUser = api.auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  };

  useEffect(() => {
    refreshUser();
    setIsLoading(false);
  }, []);

  const login = (data: AuthResponse) => {
    setUser(data.user);
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  const isAdmin = user?.role === UserRole.ADMIN;
  const isBarber = user?.role === UserRole.BARBER;

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser, isAuthenticated: !!user, isAdmin, isBarber }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
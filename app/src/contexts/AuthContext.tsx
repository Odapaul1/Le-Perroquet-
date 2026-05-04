import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'learner' | 'instructor' | 'admin';
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  bio?: string;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'learner' | 'instructor' | 'admin';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!tokens;

  // Load user data and tokens from localStorage on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('authTokens');
        if (storedTokens) {
          const parsedTokens = JSON.parse(storedTokens);
          setTokens(parsedTokens);
          
          // Try to get user data
          try {
            const userData = await authAPI.getMe(parsedTokens.accessToken);
            setUser(userData);
          } catch (error) {
            // If token is invalid, clear stored auth
            localStorage.removeItem('authTokens');
            setTokens(null);
          }
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        localStorage.removeItem('authTokens');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Save tokens to localStorage when they change
  useEffect(() => {
    if (tokens) {
      localStorage.setItem('authTokens', JSON.stringify(tokens));
    } else {
      localStorage.removeItem('authTokens');
    }
  }, [tokens]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(email, password);
      
      setUser(response.user);
      setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      
      setUser(response.user);
      setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('authTokens');
  }, []);

  const refreshAccessToken = async () => {
    if (!tokens?.refreshToken) {
      logout();
      throw new Error('No refresh token available');
    }

    try {
      const response = await authAPI.refreshToken(tokens.refreshToken);
      
      setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      });
    } catch (error) {
      // If refresh fails, logout
      logout();
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!tokens?.accessToken || !user) {
      throw new Error('User not authenticated');
    }

    try {
      const updatedUser = await authAPI.updateProfile(user._id, userData, tokens.accessToken);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    await authAPI.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await authAPI.resetPassword(token, newPassword);
  };

  const verifyEmail = async (token: string) => {
    await authAPI.verifyEmail(token);
    if (user) {
      setUser({ ...user, isEmailVerified: true });
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAccessToken,
    updateUser,
    forgotPassword,
    resetPassword,
    verifyEmail
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
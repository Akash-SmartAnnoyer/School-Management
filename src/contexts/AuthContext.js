import React, { createContext, useState, useEffect, useContext } from 'react';
import { message } from 'antd';
import { authAPI } from '../services/api';
import { storeTokens, getTokens, clearTokens, getCurrentUser, getAccessToken, getRefreshToken } from '../utils/tokenManager';

export const AuthContext = createContext();

// Define available roles
export const ROLES = {
  PRINCIPAL: 'principal',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tokens = getTokens();
        if (tokens) {
          setCurrentUser(tokens.user);
          
          // If access token is expired but refresh token is valid, refresh it
          if (!tokens.accessToken && tokens.refreshToken) {
            await refreshAccessToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearTokens();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Function to refresh access token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refreshToken({ refresh: refreshToken });
      const { access, user } = response.data;
      
      storeTokens(access, refreshToken, user);
      setCurrentUser(user);
      return access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  // Function to make authenticated API calls
  const makeAuthenticatedRequest = async (apiCall) => {
    try {
      return await apiCall();
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const newAccessToken = await refreshAccessToken();
          // Retry the original request with new token
          return await apiCall();
        } catch (refreshError) {
          throw refreshError;
        }
      }
      throw error;
    }
  };

  const login = async (emailOrPhone, password, role) => {
    try {
      const response = await authAPI.login({
        email_or_phone: emailOrPhone,
        password,
        role
      });

      const { access, refresh, user } = response.data;
      
      // Store tokens securely
      storeTokens(access, refresh, user);
      setCurrentUser(user);
      
      message.success('Login successful!');
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      message.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const accessToken = getAccessToken();
      if (accessToken) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    makeAuthenticatedRequest,
    isAuthenticated: () => !!getCurrentUser()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 
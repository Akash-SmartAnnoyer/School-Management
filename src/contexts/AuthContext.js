import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const ROLES = {
  PRINCIPAL: 'PRINCIPAL',
  TEACHER: 'TEACHER'
};

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
  const [accessToken, setAccessToken] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('currentUser');
    if (token && userData) {
      setAccessToken(token);
      setCurrentUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Function to refresh access token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refreshToken({ refresh: refreshToken });
      const { access } = response;
      
      localStorage.setItem('accessToken', access);
      setAccessToken(access);
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
        // Token expired, try to refresh
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

      const { access, refresh, user } = response;
      
      // Store tokens and user data
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      setAccessToken(access);
      setCurrentUser(user);
      
      message.success('Login successful!');
      return user;
    } catch (error) {
      message.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.data) {
        const { access, user } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', access);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        setCurrentUser(user);
        message.success('Registration successful!');
        return user;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      message.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      setAccessToken(null);
      setCurrentUser(null);
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await makeAuthenticatedRequest(() => 
        authAPI.updateProfile(userData)
      );
      const updatedUser = { ...currentUser, ...response };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      message.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      message.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        register,
        logout,
        updateProfile,
        makeAuthenticatedRequest,
        isAuthenticated: !!currentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      const userData = JSON.parse(localStorage.getItem('currentUser'));
      if (userData) {
        setCurrentUser(userData);
      }
    }
    setLoading(false);
  }, []);

  const login = async (emailOrPhone, password, role) => {
    try {
      console.log('Attempting login with:', { emailOrPhone, role });
      const response = await authAPI.login({
        email_or_phone: emailOrPhone,
        password,
        role
      });

      console.log('Login response:', response);

      if (response.data) {
        const { access, user } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', access);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        setCurrentUser(user);
        message.success('Login successful!');
        return user;
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.non_field_errors?.[0] || 
                          error.response?.data?.detail || 
                          'Login failed. Please check your credentials.';
      message.error(errorMessage);
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
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      message.success('Logged out successfully');
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      
      if (response.data.success) {
        const updatedUser = {
          ...currentUser,
          ...response.data.data
        };

        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        message.success('Profile updated successfully');
        return updatedUser;
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      message.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 
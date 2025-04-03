import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import api from '../services/api';

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
    // Check local storage for existing session
    const savedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      const userData = JSON.parse(savedUser);
      // Verify token and get user data
      api.auth.verifyToken()
        .then(response => {
          if (response.data.success) {
            setCurrentUser(userData);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
          }
        })
        .catch(error => {
          console.error('Error verifying token:', error);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password, role) => {
    try {
      const response = await api.auth.login({
        username,
        password,
        role
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        setCurrentUser(user);
        message.success('Login successful!');
        return user;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      message.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.auth.register(userData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        setCurrentUser(user);
        message.success('Registration successful!');
        return user;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      message.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
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
      const response = await api.auth.updateProfile(userData);
      
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
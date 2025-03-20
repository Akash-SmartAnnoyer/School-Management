import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import { subscribeToCollection } from '../firebase/services';

export const AuthContext = createContext(null);
//test
export const ROLES = {
  PRINCIPAL: 'PRINCIPAL',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT'
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
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password, role) => {
    try {
      // In a real app, this would be an API call to your backend
      // For demo purposes, we'll use some hardcoded values
      let user;
      
      if (role === ROLES.PRINCIPAL && username === 'principal' && password === 'admin') {
        user = {
          id: 'principal1',
          username: 'principal',
          role: ROLES.PRINCIPAL,
          name: 'Dr. Principal Name',
          email: 'principal@school.com',
          profilePic: 'https://via.placeholder.com/150',
        };
      } else {
        // Subscribe to respective collection based on role
        const collection = role.toLowerCase() + 's'; // teachers, parents, students
        const users = await new Promise((resolve) => {
          subscribeToCollection(collection, (data) => {
            resolve(data);
          });
        });

        user = users.find(u => u.username === username && u.password === password);
        if (!user) {
          throw new Error('Invalid credentials');
        }
      }

      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      message.success('Login successful!');
      return user;
    } catch (error) {
      message.error(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    message.success('Logged out successfully');
  };

  const updateProfile = async (userData) => {
    try {
      // In a real app, this would be an API call to update the user profile
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      message.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      message.error('Failed to update profile');
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
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
import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import { validateCredentials } from '../config/organizations';
import { getOrganizations } from '../utils/organizationStorage';

export const AuthContext = createContext(null);

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
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // Get the latest user data from organizations
      const organizations = getOrganizations();
      const school = organizations.schools[userData.schoolId];
      
      if (school) {
        if (userData.role === 'PRINCIPAL') {
          const principalData = {
            ...school.principal,
            role: 'PRINCIPAL',
            schoolId: userData.schoolId,
            schoolName: school.name,
            schoolLogo: school.logo,
            profilePic: school.principal.profilePic || userData.profilePic
          };
          setCurrentUser(principalData);
          // Update localStorage with complete data
          localStorage.setItem('currentUser', JSON.stringify(principalData));
        } else {
          const teacher = school.teachers.find(t => t.username === userData.username);
          if (teacher) {
            const teacherData = {
              ...teacher,
              role: 'TEACHER',
              schoolId: userData.schoolId,
              schoolName: school.name,
              schoolLogo: school.logo,
              profilePic: teacher.profilePic || userData.profilePic
            };
            setCurrentUser(teacherData);
            // Update localStorage with complete data
            localStorage.setItem('currentUser', JSON.stringify(teacherData));
          }
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password, role) => {
    try {
      const user = validateCredentials(username, password, role);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Get the latest data from organizations
      const organizations = getOrganizations();
      const school = organizations.schools[user.schoolId];
      
      if (role === 'PRINCIPAL') {
        // For principal, get complete data from school
        const principalData = {
          ...school.principal,
          role: 'PRINCIPAL',
          schoolId: user.schoolId,
          schoolName: school.name,
          schoolLogo: school.logo,
          profilePic: school.principal.profilePic || 'https://via.placeholder.com/150'
        };
        
        setCurrentUser(principalData);
        localStorage.setItem('currentUser', JSON.stringify(principalData));
      } else {
        // For teachers, enhance with school data
        const enhancedUser = {
          ...user,
          schoolName: school.name,
          schoolLogo: school.logo,
          profilePic: user.profilePic || 'https://via.placeholder.com/150'
        };
        
        setCurrentUser(enhancedUser);
        localStorage.setItem('currentUser', JSON.stringify(enhancedUser));
      }

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
      // Get the latest organizations data
      const organizations = getOrganizations();
      const school = organizations.schools[currentUser.schoolId];
      
      // Create updated user data
      const updatedUser = {
        ...currentUser,
        ...userData,
        // Ensure school data is always up to date
        schoolName: school.name,
        schoolLogo: school.logo,
        profilePic: userData.profilePic || currentUser.profilePic
      };

      // Update current user state
      setCurrentUser(updatedUser);
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // If this is a principal, also update the organizations data
      if (currentUser.role === 'PRINCIPAL') {
        const updatedPrincipal = {
          ...school.principal,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          profilePic: userData.profilePic || school.principal.profilePic
        };

        const updatedSchool = {
          ...school,
          principal: updatedPrincipal
        };

        const updatedOrgs = {
          ...organizations,
          schools: {
            ...organizations.schools,
            [currentUser.schoolId]: updatedSchool
          }
        };

        localStorage.setItem('school_organizations', JSON.stringify(updatedOrgs));
      }

      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
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
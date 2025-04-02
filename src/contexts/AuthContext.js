import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import { organizations as defaultOrganizations, validateCredentials } from '../config/organizations';
import { getSchoolById, updatePrincipal, updateTeacher } from '../firebase/organizationService';

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
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // Get the latest user data from Firestore
      getSchoolById(userData.schoolId)
        .then(school => {
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
                localStorage.setItem('currentUser', JSON.stringify(teacherData));
              }
            }
          }
        })
        .catch(error => {
          console.error('Error loading user data:', error);
          message.error('Failed to load user data');
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
      // First validate credentials against the config file
      const user = validateCredentials(username, password, role);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Get the latest data from Firestore
      const school = await getSchoolById(user.schoolId);
      
      // If school not found in Firestore, use the default organization data
      const schoolData = school || defaultOrganizations.schools[user.schoolId];
      
      if (!schoolData) {
        throw new Error('School not found');
      }
      
      if (role === 'PRINCIPAL') {
        const principalData = {
          ...schoolData.principal,
          role: 'PRINCIPAL',
          schoolId: user.schoolId,
          schoolName: schoolData.name,
          schoolLogo: schoolData.logo,
          profilePic: schoolData.principal.profilePic || 'https://via.placeholder.com/150'
        };
        
        setCurrentUser(principalData);
        localStorage.setItem('currentUser', JSON.stringify(principalData));
      } else {
        const enhancedUser = {
          ...user,
          schoolName: schoolData.name,
          schoolLogo: schoolData.logo,
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
      const school = await getSchoolById(currentUser.schoolId);
      
      const updatedUser = {
        ...currentUser,
        ...userData,
        schoolName: school.name,
        schoolLogo: school.logo,
        profilePic: userData.profilePic || currentUser.profilePic
      };

      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      if (currentUser.role === 'PRINCIPAL') {
        await updatePrincipal(currentUser.schoolId, {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          profilePic: userData.profilePic || school.principal.profilePic
        });
      } else {
        await updateTeacher(currentUser.schoolId, currentUser.username, {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          profilePic: userData.profilePic || currentUser.profilePic
        });
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
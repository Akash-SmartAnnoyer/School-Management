import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { message } from 'antd';
import { useAuth } from './AuthContext';

const ClassesContext = createContext();

export const ClassesProvider = ({ children }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalClasses, setTotalClasses] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const { currentUser } = useAuth();

  const loadClasses = async (page = 1, size = 10, search = '') => {
    try {
      setLoading(true);
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const queryParams = `?page=${page}&page_size=${size}${searchParam}`;
      const response = await api.class.getClasses(queryParams);
      if (response.success) {
        setClasses(response.data.results);
        setTotalClasses(response.data.count);
        setCurrentPage(page);
        setPageSize(size);
        setSearchText(search);
      }
    } catch (error) {
      message.error('Failed to load classes');
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshClasses = () => {
    return loadClasses(currentPage, pageSize, searchText);
  };

  const createClass = async (classData) => {
    try {
      setLoading(true);
      const response = await api.class.createClass(classData);
      if (response.success) {
        message.success('Class created successfully');
        await refreshClasses();
        return true;
      }
      return false;
    } catch (error) {
      message.error('Failed to create class');
      console.error('Error creating class:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateClass = async (id, classData) => {
    try {
      setLoading(true);
      const response = await api.class.updateClass(id, classData);
      if (response.success) {
        message.success('Class updated successfully');
        await refreshClasses();
        return true;
      }
      return false;
    } catch (error) {
      message.error('Failed to update class');
      console.error('Error updating class:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (id) => {
    try {
      setLoading(true);
      const response = await api.class.deleteClass(id);
      if (response.success) {
        message.success('Class deleted successfully');
        await refreshClasses();
        return true;
      }
      return false;
    } catch (error) {
      message.error('Failed to delete class');
      console.error('Error deleting class:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load classes if user is authenticated
    if (currentUser) {
      loadClasses();
    }
  }, [currentUser]); // Add currentUser as dependency

  return (
    <ClassesContext.Provider value={{
      classes,
      loading,
      currentPage,
      totalClasses,
      pageSize,
      searchText,
      setCurrentPage,
      setPageSize,
      setSearchText,
      loadClasses,
      refreshClasses,
      createClass,
      updateClass,
      deleteClass
    }}>
      {children}
    </ClassesContext.Provider>
  );
};

export const useClasses = () => {
  const context = useContext(ClassesContext);
  if (!context) {
    throw new Error('useClasses must be used within a ClassesProvider');
  }
  return context;
}; 
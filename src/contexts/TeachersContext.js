import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { message } from 'antd';
import { useAuth } from './AuthContext';

const TeachersContext = createContext();

export const TeachersProvider = ({ children }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { isAuthenticated } = useAuth();

  const loadTeachers = async (page = 1, size = 10, searchText = '') => {
    if (!isAuthenticated()) {
      return;
    }

    try {
      setLoading(true);
      const searchParam = searchText ? `&search=${encodeURIComponent(searchText)}` : '';
      const response = await api.teacher.getTeachers(`?page=${page}&page_size=${size}${searchParam}`);
      if (response.success) {
        setTeachers(response.data.results);
        setTotalTeachers(response.data.count);
        setCurrentPage(page);
        setPageSize(size);
      }
    } catch (error) {
      message.error('Failed to load teachers');
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshTeachers = () => {
    return loadTeachers(currentPage, pageSize);
  };

  useEffect(() => {
    if (isAuthenticated()) {
      loadTeachers();
    }
  }, [isAuthenticated]);

  return (
    <TeachersContext.Provider value={{
      teachers,
      loading,
      currentPage,
      totalTeachers,
      pageSize,
      setCurrentPage,
      setPageSize,
      loadTeachers,
      refreshTeachers
    }}>
      {children}
    </TeachersContext.Provider>
  );
};

export const useTeachers = () => {
  const context = useContext(TeachersContext);
  if (!context) {
    throw new Error('useTeachers must be used within a TeachersProvider');
  }
  return context;
}; 
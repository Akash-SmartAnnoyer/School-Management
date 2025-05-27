import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { message } from 'antd';

const StudentsContext = createContext();

export const StudentsProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const loadStudents = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      const response = await api.student.getStudents(`?page=${page}&page_size=${size}`);
      if (response.success) {
        setStudents(response.data.results);
        setTotalStudents(response.data.count);
        setCurrentPage(page);
        setPageSize(size);
      }
    } catch (error) {
      message.error('Failed to load students');
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStudents = () => {
    return loadStudents(currentPage, pageSize);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <StudentsContext.Provider value={{
      students,
      loading,
      currentPage,
      totalStudents,
      pageSize,
      setCurrentPage,
      setPageSize,
      loadStudents,
      refreshStudents
    }}>
      {children}
    </StudentsContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentsContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
}; 
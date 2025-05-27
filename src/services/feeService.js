import axios from 'axios';

const API_URL = 'https://360schoolingdev.vercel.app/api/v1';

const feeService = {
  // Get student fees with filters
  getStudentFees: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/students/fees/`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch student fees' };
    }
  },

  // Get all payments with filters
  getPayments: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/payments/`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch payments' };
    }
  },

  // Create new payment
  createPayment: async (paymentData) => {
    try {
      const response = await axios.post(`${API_URL}/payments/`, paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      throw error; // Let the component handle the error
    }
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    try {
      const response = await axios.get(`${API_URL}/payments/${paymentId}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch payment details' };
    }
  },

  // Delete payment
  deletePayment: async (paymentId) => {
    try {
      await axios.delete(`${API_URL}/payments/${paymentId}/`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete payment' };
    }
  },

  // Get student payment history
  getStudentPaymentHistory: async (studentId, params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/students/${studentId}/payment-history/`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch payment history' };
    }
  },

  // Get fee types
  getFeeTypes: async () => {
    try {
      const response = await axios.get(`${API_URL}/fees/types`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching fee types:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  },

  // Get fee structure for a class
  getFeeStructure: async (classId) => {
    try {
      const response = await axios.get(`${API_URL}/fees/structure/${classId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching fee structure:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  },

  // Generate fee due for a period
  generateFeeDue: async (periodData) => {
    try {
      const response = await axios.post(`${API_URL}/fees/generate-due`, periodData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error generating fee due:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  },

  // Get fee statistics
  getFeeStatistics: async () => {
    try {
      const response = await axios.get(`${API_URL}/fees/statistics`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching fee statistics:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
};

export default feeService; 
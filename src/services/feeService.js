import api from './api';

const feeService = {
  // Get all student fees with optional filters
  getStudentFees: async (params = {}) => {
    try {
      const response = await api.get('/fees/students', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching student fees:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  },

  // Get payment history for a specific student
  getStudentPaymentHistory: async (studentId) => {
    try {
      const response = await api.get(`/fees/students/${studentId}/history`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  },

  // Get all payment records with optional filters
  getPayments: async (params = {}) => {
    try {
      const response = await api.get('/fees/payments', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching payments:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  },

  // Create a new payment
  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/fees/payments', paymentData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  },

  // Update a payment record
  updatePayment: async (paymentId, paymentData) => {
    try {
      const response = await api.put(`/fees/payments/${paymentId}`, paymentData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating payment:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  },

  // Delete a payment record
  deletePayment: async (paymentId) => {
    try {
      await api.delete(`/fees/payments/${paymentId}`);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting payment:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  },

  // Get fee types
  getFeeTypes: async () => {
    try {
      const response = await api.get('/fees/types');
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
      const response = await api.get(`/fees/structure/${classId}`);
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
      const response = await api.post('/fees/generate-due', periodData);
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
      const response = await api.get('/fees/statistics');
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
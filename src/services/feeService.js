import { mockStudents, mockPayments, mockPaymentHistory } from './mockData';

const feeService = {
  // Get student fees with filters
  getStudentFees: async (params = {}) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredStudents = [...mockStudents];
      
      // Apply search filter
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredStudents = filteredStudents.filter(student => 
          student.name.toLowerCase().includes(searchLower) ||
          student.student_id.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply class filter
      if (params.class) {
        filteredStudents = filteredStudents.filter(student => 
          student.class === params.class
        );
      }
      
      // Apply status filter
      if (params.status) {
        filteredStudents = filteredStudents.filter(student => 
          student.status === params.status
        );
      }
      
      return { success: true, data: filteredStudents };
    } catch (error) {
      return { success: false, error: 'Failed to fetch student fees' };
    }
  },

  // Get all payments with filters
  getPayments: async (params = {}) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredPayments = [...mockPayments];
      
      // Apply search filter
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredPayments = filteredPayments.filter(payment => 
          payment.student.toLowerCase().includes(searchLower) ||
          payment.student_id.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply class filter
      if (params.class) {
        filteredPayments = filteredPayments.filter(payment => 
          payment.class === params.class
        );
      }
      
      return { success: true, data: filteredPayments };
    } catch (error) {
      return { success: false, error: 'Failed to fetch payments' };
    }
  },

  // Create new payment
  createPayment: async (paymentData) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the student
      const student = mockStudents.find(s => s.id === paymentData.fee_due);
      if (!student) {
        throw new Error('Student not found');
      }
      
      // Create new payment record
      const newPayment = {
        id: mockPayments.length + 1,
        student: student.name,
        student_id: student.student_id,
        class: student.class,
        section: student.section,
        fee_type: student.fee_type,
        amount: paymentData.amount,
        payment_mode: paymentData.payment_mode,
        payment_date: paymentData.payment_date,
        remarks: paymentData.remarks
      };
      
      // Add to mock payments
      mockPayments.push(newPayment);
      
      // Update student status if full payment is made
      if (student.total_due === paymentData.amount) {
        student.status = 'Paid';
        student.total_due = 0;
        student.due_months = 0;
      } else {
        student.total_due -= paymentData.amount;
        student.due_months = Math.ceil(student.total_due / 12500); // Assuming monthly fee is 12500
      }
      
      return { success: true, data: newPayment };
    } catch (error) {
      throw error;
    }
  },

  // Get student payment history
  getStudentPaymentHistory: async (studentId) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const history = mockPaymentHistory[studentId] || [];
      return { success: true, data: history };
    } catch (error) {
      return { success: false, error: 'Failed to fetch payment history' };
    }
  },

  // Get fee types
  getFeeTypes: async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        data: ['Tuition Fee', 'Transport Fee', 'Library Fee', 'Sports Fee']
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch fee types'
      };
    }
  },

  // Get fee structure for a class
  getFeeStructure: async (classId) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        data: {
          tuition_fee: 12500,
          transport_fee: 2000,
          library_fee: 500,
          sports_fee: 1000
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch fee structure'
      };
    }
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const payment = mockPayments.find(p => p.id === paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      return { success: true, data: payment };
    } catch (error) {
      return { success: false, error: 'Failed to fetch payment details' };
    }
  },

  // Delete payment
  deletePayment: async (paymentId) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const paymentIndex = mockPayments.findIndex(p => p.id === paymentId);
      if (paymentIndex === -1) {
        throw new Error('Payment not found');
      }
      
      // Remove payment from mock data
      mockPayments.splice(paymentIndex, 1);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete payment' };
    }
  }
};

export default feeService; 
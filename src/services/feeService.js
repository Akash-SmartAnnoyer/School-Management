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
  getFeeStructure: async (classId, academicYear) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock class-based fee structures
      const classBasedStructures = {
        1: { tuition_fee: 15000, transport_fee: 1500, library_fee: 800, lab_fee: 500, sports_fee: 600, exam_fee: 1000, computer_fee: 400, activity_fee: 300, development_fee: 2000 },
        2: { tuition_fee: 16000, transport_fee: 1600, library_fee: 850, lab_fee: 550, sports_fee: 650, exam_fee: 1100, computer_fee: 450, activity_fee: 350, development_fee: 2200 },
        3: { tuition_fee: 17000, transport_fee: 1700, library_fee: 900, lab_fee: 600, sports_fee: 700, exam_fee: 1200, computer_fee: 500, activity_fee: 400, development_fee: 2400 },
        4: { tuition_fee: 18000, transport_fee: 1800, library_fee: 950, lab_fee: 650, sports_fee: 750, exam_fee: 1300, computer_fee: 550, activity_fee: 450, development_fee: 2600 },
        5: { tuition_fee: 19000, transport_fee: 1900, library_fee: 1000, lab_fee: 700, sports_fee: 800, exam_fee: 1400, computer_fee: 600, activity_fee: 500, development_fee: 2800 },
        6: { tuition_fee: 20000, transport_fee: 2000, library_fee: 1100, lab_fee: 800, sports_fee: 900, exam_fee: 1500, computer_fee: 700, activity_fee: 600, development_fee: 3000 },
        7: { tuition_fee: 21000, transport_fee: 2100, library_fee: 1200, lab_fee: 900, sports_fee: 1000, exam_fee: 1600, computer_fee: 800, activity_fee: 700, development_fee: 3200 },
        8: { tuition_fee: 22000, transport_fee: 2200, library_fee: 1300, lab_fee: 1000, sports_fee: 1100, exam_fee: 1700, computer_fee: 900, activity_fee: 800, development_fee: 3400 },
        9: { tuition_fee: 23000, transport_fee: 2300, library_fee: 1400, lab_fee: 1200, sports_fee: 1200, exam_fee: 1800, computer_fee: 1000, activity_fee: 900, development_fee: 3600 },
        10: { tuition_fee: 25000, transport_fee: 2500, library_fee: 1500, lab_fee: 1500, sports_fee: 1300, exam_fee: 2000, computer_fee: 1200, activity_fee: 1000, development_fee: 4000 },
        11: { tuition_fee: 26000, transport_fee: 2600, library_fee: 1600, lab_fee: 1800, sports_fee: 1400, exam_fee: 2200, computer_fee: 1400, activity_fee: 1100, development_fee: 4200 },
        12: { tuition_fee: 27000, transport_fee: 2700, library_fee: 1700, lab_fee: 2000, sports_fee: 1500, exam_fee: 2400, computer_fee: 1600, activity_fee: 1200, development_fee: 4400 },
      };
      
      const structure = classBasedStructures[classId];
      if (structure) {
        return {
          success: true,
          data: structure
        };
      } else {
        return {
          success: false,
          error: 'Fee structure not found for this class'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch fee structure'
      };
    }
  },

  // Create fee structure
  createFeeStructure: async (classId, academicYear, feeData) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock implementation - in real app, this would save to database
      console.log('Creating fee structure:', { classId, academicYear, feeData });
      
      return {
        success: true,
        data: feeData
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create fee structure'
      };
    }
  },

  // Update fee structure
  updateFeeStructure: async (classId, academicYear, feeData) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock implementation - in real app, this would update database
      console.log('Updating fee structure:', { classId, academicYear, feeData });
      
      return {
        success: true,
        data: feeData
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update fee structure'
      };
    }
  },

  // Delete fee structure
  deleteFeeStructure: async (classId, academicYear) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock implementation - in real app, this would delete from database
      console.log('Deleting fee structure:', { classId, academicYear });
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete fee structure'
      };
    }
  },

  // Get fee structure templates for a specific class
  getClassTemplates: async (classId) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock class-specific templates
      const classTemplates = {
        1: [
          { 
            id: 1,
            name: 'Standard Template - Class 1', 
            description: 'Basic fee structure for Class 1',
            isDefault: true,
            data: { tuition_fee: 12000, transport_fee: 1500, library_fee: 500, lab_fee: 600, sports_fee: 300, exam_fee: 800, computer_fee: 300, activity_fee: 200, development_fee: 1500 }
          },
          { 
            id: 2,
            name: 'Premium Template - Class 1', 
            description: 'Enhanced fee structure for Class 1',
            isDefault: true,
            data: { tuition_fee: 18000, transport_fee: 2500, library_fee: 800, lab_fee: 1000, sports_fee: 500, exam_fee: 1200, computer_fee: 500, activity_fee: 400, development_fee: 2500 }
          }
        ],
        2: [
          { 
            id: 3,
            name: 'Standard Template - Class 2', 
            description: 'Basic fee structure for Class 2',
            isDefault: true,
            data: { tuition_fee: 13000, transport_fee: 1600, library_fee: 550, lab_fee: 650, sports_fee: 350, exam_fee: 900, computer_fee: 350, activity_fee: 250, development_fee: 1700 }
          },
          { 
            id: 4,
            name: 'Premium Template - Class 2', 
            description: 'Enhanced fee structure for Class 2',
            isDefault: true,
            data: { tuition_fee: 19500, transport_fee: 2700, library_fee: 850, lab_fee: 1100, sports_fee: 550, exam_fee: 1300, computer_fee: 550, activity_fee: 450, development_fee: 2700 }
          }
        ],
        10: [
          { 
            id: 19,
            name: 'Standard Template - Class 10', 
            description: 'Basic fee structure for Class 10',
            isDefault: true,
            data: { tuition_fee: 22000, transport_fee: 2500, library_fee: 1000, lab_fee: 1200, sports_fee: 800, exam_fee: 1800, computer_fee: 800, activity_fee: 700, development_fee: 3500 }
          },
          { 
            id: 20,
            name: 'Premium Template - Class 10', 
            description: 'Enhanced fee structure for Class 10',
            isDefault: true,
            data: { tuition_fee: 33000, transport_fee: 4500, library_fee: 1300, lab_fee: 2000, sports_fee: 1000, exam_fee: 2200, computer_fee: 1000, activity_fee: 900, development_fee: 4500 }
          },
          { 
            id: 21,
            name: 'Science Stream - Class 10', 
            description: 'Specialized for science subjects with lab facilities',
            isDefault: true,
            data: { tuition_fee: 30000, transport_fee: 4000, library_fee: 1100, lab_fee: 3000, sports_fee: 900, exam_fee: 2000, computer_fee: 900, activity_fee: 800, development_fee: 4000 }
          }
        ]
      };
      
      const templates = classTemplates[classId] || [];
      return {
        success: true,
        data: templates
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch class templates'
      };
    }
  },

  // Create class-specific template
  createClassTemplate: async (classId, templateData) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock implementation - in real app, this would save to database
      console.log('Creating class template:', { classId, templateData });
      
      return {
        success: true,
        data: { id: Date.now(), classId, ...templateData }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create class template'
      };
    }
  },

  // Apply template to student
  applyTemplateToStudent: async (studentId, templateId, academicYear) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock implementation - in real app, this would save to database
      console.log('Applying template to student:', { studentId, templateId, academicYear });
      
      return {
        success: true,
        data: { studentId, templateId, academicYear, appliedAt: new Date().toISOString() }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to apply template to student'
      };
    }
  },

  // Get student fee structure
  getStudentFeeStructure: async (studentId, academicYear) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock student fee structure
      const studentFeeStructure = {
        studentId,
        academicYear,
        templateId: 1,
        templateName: 'Standard Template',
        appliedAt: '2024-01-15T10:30:00Z',
        feeStructure: {
          tuition_fee: 12000,
          transport_fee: 1500,
          library_fee: 500,
          lab_fee: 600,
          sports_fee: 300,
          exam_fee: 800,
          computer_fee: 300,
          activity_fee: 200,
          development_fee: 1500
        },
        totalAmount: 16500
      };
      
      return {
        success: true,
        data: studentFeeStructure
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch student fee structure'
      };
    }
  },

  // Update student fee structure
  updateStudentFeeStructure: async (studentId, feeData, academicYear) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock implementation - in real app, this would update database
      console.log('Updating student fee structure:', { studentId, feeData, academicYear });
      
      return {
        success: true,
        data: { studentId, feeData, academicYear, updatedAt: new Date().toISOString() }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update student fee structure'
      };
    }
  },

  // Get fee structure templates
  getFeeTemplates: async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const templates = [
        { 
          id: 1,
          name: 'Standard Template', 
          description: 'Basic fee structure for regular classes',
          isDefault: true,
          classBasedData: {
            1: { tuition_fee: 12000, transport_fee: 1500, library_fee: 500, lab_fee: 600, sports_fee: 300, exam_fee: 800, computer_fee: 300, activity_fee: 200, development_fee: 1500 },
            2: { tuition_fee: 13000, transport_fee: 1600, library_fee: 550, lab_fee: 650, sports_fee: 350, exam_fee: 900, computer_fee: 350, activity_fee: 250, development_fee: 1700 },
            3: { tuition_fee: 14000, transport_fee: 1700, library_fee: 600, lab_fee: 700, sports_fee: 400, exam_fee: 1000, computer_fee: 400, activity_fee: 300, development_fee: 1900 },
            4: { tuition_fee: 15000, transport_fee: 1800, library_fee: 650, lab_fee: 750, sports_fee: 450, exam_fee: 1100, computer_fee: 450, activity_fee: 350, development_fee: 2100 },
            5: { tuition_fee: 16000, transport_fee: 1900, library_fee: 700, lab_fee: 800, sports_fee: 500, exam_fee: 1200, computer_fee: 500, activity_fee: 400, development_fee: 2300 },
            6: { tuition_fee: 17000, transport_fee: 2000, library_fee: 750, lab_fee: 850, sports_fee: 550, exam_fee: 1300, computer_fee: 550, activity_fee: 450, development_fee: 2500 },
            7: { tuition_fee: 18000, transport_fee: 2100, library_fee: 800, lab_fee: 900, sports_fee: 600, exam_fee: 1400, computer_fee: 600, activity_fee: 500, development_fee: 2700 },
            8: { tuition_fee: 19000, transport_fee: 2200, library_fee: 850, lab_fee: 950, sports_fee: 650, exam_fee: 1500, computer_fee: 650, activity_fee: 550, development_fee: 2900 },
            9: { tuition_fee: 20000, transport_fee: 2300, library_fee: 900, lab_fee: 1000, sports_fee: 700, exam_fee: 1600, computer_fee: 700, activity_fee: 600, development_fee: 3100 },
            10: { tuition_fee: 22000, transport_fee: 2500, library_fee: 1000, lab_fee: 1200, sports_fee: 800, exam_fee: 1800, computer_fee: 800, activity_fee: 700, development_fee: 3500 },
            11: { tuition_fee: 24000, transport_fee: 2700, library_fee: 1100, lab_fee: 1400, sports_fee: 900, exam_fee: 2000, computer_fee: 900, activity_fee: 800, development_fee: 3900 },
            12: { tuition_fee: 26000, transport_fee: 2900, library_fee: 1200, lab_fee: 1600, sports_fee: 1000, exam_fee: 2200, computer_fee: 1000, activity_fee: 900, development_fee: 4300 }
          }
        },
        { 
          id: 2,
          name: 'Premium Template', 
          description: 'Enhanced fee structure with additional facilities',
          isDefault: true,
          classBasedData: {
            1: { tuition_fee: 18000, transport_fee: 2500, library_fee: 800, lab_fee: 1000, sports_fee: 500, exam_fee: 1200, computer_fee: 500, activity_fee: 400, development_fee: 2500 },
            2: { tuition_fee: 19500, transport_fee: 2700, library_fee: 850, lab_fee: 1100, sports_fee: 550, exam_fee: 1300, computer_fee: 550, activity_fee: 450, development_fee: 2700 },
            3: { tuition_fee: 21000, transport_fee: 2900, library_fee: 900, lab_fee: 1200, sports_fee: 600, exam_fee: 1400, computer_fee: 600, activity_fee: 500, development_fee: 2900 },
            4: { tuition_fee: 22500, transport_fee: 3100, library_fee: 950, lab_fee: 1300, sports_fee: 650, exam_fee: 1500, computer_fee: 650, activity_fee: 550, development_fee: 3100 },
            5: { tuition_fee: 24000, transport_fee: 3300, library_fee: 1000, lab_fee: 1400, sports_fee: 700, exam_fee: 1600, computer_fee: 700, activity_fee: 600, development_fee: 3300 },
            6: { tuition_fee: 25500, transport_fee: 3500, library_fee: 1050, lab_fee: 1500, sports_fee: 750, exam_fee: 1700, computer_fee: 750, activity_fee: 650, development_fee: 3500 },
            7: { tuition_fee: 27000, transport_fee: 3700, library_fee: 1100, lab_fee: 1600, sports_fee: 800, exam_fee: 1800, computer_fee: 800, activity_fee: 700, development_fee: 3700 },
            8: { tuition_fee: 28500, transport_fee: 3900, library_fee: 1150, lab_fee: 1700, sports_fee: 850, exam_fee: 1900, computer_fee: 850, activity_fee: 750, development_fee: 3900 },
            9: { tuition_fee: 30000, transport_fee: 4100, library_fee: 1200, lab_fee: 1800, sports_fee: 900, exam_fee: 2000, computer_fee: 900, activity_fee: 800, development_fee: 4100 },
            10: { tuition_fee: 33000, transport_fee: 4500, library_fee: 1300, lab_fee: 2000, sports_fee: 1000, exam_fee: 2200, computer_fee: 1000, activity_fee: 900, development_fee: 4500 },
            11: { tuition_fee: 36000, transport_fee: 4900, library_fee: 1400, lab_fee: 2200, sports_fee: 1100, exam_fee: 2400, computer_fee: 1100, activity_fee: 1000, development_fee: 4900 },
            12: { tuition_fee: 39000, transport_fee: 5300, library_fee: 1500, lab_fee: 2400, sports_fee: 1200, exam_fee: 2600, computer_fee: 1200, activity_fee: 1100, development_fee: 5300 }
          }
        },
        { 
          id: 3,
          name: 'Science Stream', 
          description: 'Specialized for science subjects with lab facilities',
          isDefault: true,
          classBasedData: {
            1: { tuition_fee: 15000, transport_fee: 2000, library_fee: 600, lab_fee: 1500, sports_fee: 400, exam_fee: 1000, computer_fee: 400, activity_fee: 300, development_fee: 2000 },
            2: { tuition_fee: 16500, transport_fee: 2200, library_fee: 650, lab_fee: 1650, sports_fee: 450, exam_fee: 1100, computer_fee: 450, activity_fee: 350, development_fee: 2200 },
            3: { tuition_fee: 18000, transport_fee: 2400, library_fee: 700, lab_fee: 1800, sports_fee: 500, exam_fee: 1200, computer_fee: 500, activity_fee: 400, development_fee: 2400 },
            4: { tuition_fee: 19500, transport_fee: 2600, library_fee: 750, lab_fee: 1950, sports_fee: 550, exam_fee: 1300, computer_fee: 550, activity_fee: 450, development_fee: 2600 },
            5: { tuition_fee: 21000, transport_fee: 2800, library_fee: 800, lab_fee: 2100, sports_fee: 600, exam_fee: 1400, computer_fee: 600, activity_fee: 500, development_fee: 2800 },
            6: { tuition_fee: 22500, transport_fee: 3000, library_fee: 850, lab_fee: 2250, sports_fee: 650, exam_fee: 1500, computer_fee: 650, activity_fee: 550, development_fee: 3000 },
            7: { tuition_fee: 24000, transport_fee: 3200, library_fee: 900, lab_fee: 2400, sports_fee: 700, exam_fee: 1600, computer_fee: 700, activity_fee: 600, development_fee: 3200 },
            8: { tuition_fee: 25500, transport_fee: 3400, library_fee: 950, lab_fee: 2550, sports_fee: 750, exam_fee: 1700, computer_fee: 750, activity_fee: 650, development_fee: 3400 },
            9: { tuition_fee: 27000, transport_fee: 3600, library_fee: 1000, lab_fee: 2700, sports_fee: 800, exam_fee: 1800, computer_fee: 800, activity_fee: 700, development_fee: 3600 },
            10: { tuition_fee: 30000, transport_fee: 4000, library_fee: 1100, lab_fee: 3000, sports_fee: 900, exam_fee: 2000, computer_fee: 900, activity_fee: 800, development_fee: 4000 },
            11: { tuition_fee: 33000, transport_fee: 4400, library_fee: 1200, lab_fee: 3300, sports_fee: 1000, exam_fee: 2200, computer_fee: 1000, activity_fee: 900, development_fee: 4400 },
            12: { tuition_fee: 36000, transport_fee: 4800, library_fee: 1300, lab_fee: 3600, sports_fee: 1100, exam_fee: 2400, computer_fee: 1100, activity_fee: 1000, development_fee: 4800 }
          }
        }
      ];
      
      return {
        success: true,
        data: templates
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch fee templates'
      };
    }
  },

  // Create fee template
  createFeeTemplate: async (templateData) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock implementation - in real app, this would save to database
      console.log('Creating fee template:', templateData);
      
      return {
        success: true,
        data: { id: Date.now(), ...templateData }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create fee template'
      };
    }
  },

  // Get custom fee types
  getCustomFeeTypes: async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const customTypes = [
        { id: 1, name: 'Music Fee', key: 'music_fee', description: 'Music class fee' },
        { id: 2, name: 'Art Fee', key: 'art_fee', description: 'Art and craft fee' },
        { id: 3, name: 'Dance Fee', key: 'dance_fee', description: 'Dance class fee' },
      ];
      
      return {
        success: true,
        data: customTypes
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch custom fee types'
      };
    }
  },

  // Create custom fee type
  createCustomFeeType: async (feeTypeData) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock implementation - in real app, this would save to database
      console.log('Creating custom fee type:', feeTypeData);
      
      return {
        success: true,
        data: { id: Date.now(), ...feeTypeData }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create custom fee type'
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
  },

  // Update payment
  updatePayment: async (paymentId, paymentData) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the payment to update
      const paymentIndex = mockPayments.findIndex(p => p.id === paymentId);
      if (paymentIndex === -1) {
        throw new Error('Payment not found');
      }
      
      // Find the student
      const student = mockStudents.find(s => s.student_id === mockPayments[paymentIndex].student_id);
      if (!student) {
        throw new Error('Student not found');
      }
      
      // Calculate the difference in amount
      const oldAmount = mockPayments[paymentIndex].amount;
      const newAmount = paymentData.amount;
      const amountDifference = newAmount - oldAmount;
      
      // Update the payment record
      mockPayments[paymentIndex] = {
        ...mockPayments[paymentIndex],
        ...paymentData,
        amount: newAmount
      };
      
      // Update student's total due
      student.total_due += amountDifference;
      student.due_months = Math.ceil(student.total_due / 12500); // Assuming monthly fee is 12500
      
      // Update student status
      if (student.total_due <= 0) {
        student.status = 'Paid';
        student.total_due = 0;
        student.due_months = 0;
      } else {
        student.status = 'Unpaid';
      }
      
      return { success: true, data: mockPayments[paymentIndex] };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to update payment' };
    }
  }
};

export default feeService; 
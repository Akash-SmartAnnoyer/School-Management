// Mock data for fee management system
export const mockStudents = [
  {
    id: 1,
    name: "John Smith",
    student_id: "STU001",
    class: "Class 10",
    section: "A",
    due_months: 2,
    status: "Unpaid",
    total_due: 25000,
    fee_type: "Tuition Fee"
  },
  {
    id: 2,
    name: "Emma Wilson",
    student_id: "STU002",
    class: "Class 9",
    section: "B",
    due_months: 0,
    status: "Paid",
    total_due: 0,
    fee_type: "Tuition Fee"
  },
  {
    id: 3,
    name: "Michael Brown",
    student_id: "STU003",
    class: "Class 8",
    section: "C",
    due_months: 3,
    status: "Unpaid",
    total_due: 37500,
    fee_type: "Tuition Fee"
  },
  {
    id: 4,
    name: "Sarah Davis",
    student_id: "STU004",
    class: "Class 10",
    section: "B",
    due_months: 1,
    status: "Unpaid",
    total_due: 12500,
    fee_type: "Tuition Fee"
  },
  {
    id: 5,
    name: "James Wilson",
    student_id: "STU005",
    class: "Class 7",
    section: "A",
    due_months: 0,
    status: "Paid",
    total_due: 0,
    fee_type: "Tuition Fee"
  },
  {
    id: 6,
    name: "Lisa Anderson",
    student_id: "STU006",
    class: "Class 9",
    section: "C",
    due_months: 2,
    status: "Unpaid",
    total_due: 25000,
    fee_type: "Tuition Fee"
  },
  {
    id: 7,
    name: "Robert Taylor",
    student_id: "STU007",
    class: "Class 8",
    section: "A",
    due_months: 1,
    status: "Unpaid",
    total_due: 12500,
    fee_type: "Tuition Fee"
  },
  {
    id: 8,
    name: "Mary Johnson",
    student_id: "STU008",
    class: "Class 7",
    section: "B",
    due_months: 0,
    status: "Paid",
    total_due: 0,
    fee_type: "Tuition Fee"
  },
  {
    id: 9,
    name: "David Miller",
    student_id: "STU009",
    class: "Class 10",
    section: "C",
    due_months: 2,
    status: "Unpaid",
    total_due: 25000,
    fee_type: "Tuition Fee"
  },
  {
    id: 10,
    name: "Jennifer White",
    student_id: "STU010",
    class: "Class 9",
    section: "A",
    due_months: 1,
    status: "Unpaid",
    total_due: 12500,
    fee_type: "Tuition Fee"
  }
];

export const mockPayments = [
  {
    id: 1,
    student: "Emma Wilson",
    student_id: "STU002",
    class: "Class 9",
    section: "B",
    fee_type: "Tuition Fee",
    amount: 12500,
    payment_mode: "UPI",
    payment_date: "2024-03-15",
    remarks: "March 2024 Fee"
  },
  {
    id: 2,
    student: "James Wilson",
    student_id: "STU005",
    class: "Class 7",
    section: "A",
    fee_type: "Tuition Fee",
    amount: 12500,
    payment_mode: "Cash",
    payment_date: "2024-03-10",
    remarks: "March 2024 Fee"
  },
  {
    id: 3,
    student: "Mary Johnson",
    student_id: "STU008",
    class: "Class 7",
    section: "B",
    fee_type: "Tuition Fee",
    amount: 12500,
    payment_mode: "Bank Transfer",
    payment_date: "2024-03-05",
    remarks: "March 2024 Fee"
  }
];

export const mockPaymentHistory = {
  "STU001": [
    {
      id: 1,
      fee_type: "Tuition Fee",
      period: "January 2024",
      amount: 12500,
      payment_mode: "UPI",
      payment_date: "2024-01-15",
      remarks: "January Fee"
    },
    {
      id: 2,
      fee_type: "Tuition Fee",
      period: "February 2024",
      amount: 12500,
      payment_mode: "Cash",
      payment_date: "2024-02-15",
      remarks: "February Fee"
    }
  ],
  "STU002": [
    {
      id: 3,
      fee_type: "Tuition Fee",
      period: "January 2024",
      amount: 12500,
      payment_mode: "UPI",
      payment_date: "2024-01-10",
      remarks: "January Fee"
    },
    {
      id: 4,
      fee_type: "Tuition Fee",
      period: "February 2024",
      amount: 12500,
      payment_mode: "Bank Transfer",
      payment_date: "2024-02-10",
      remarks: "February Fee"
    },
    {
      id: 5,
      fee_type: "Tuition Fee",
      period: "March 2024",
      amount: 12500,
      payment_mode: "UPI",
      payment_date: "2024-03-15",
      remarks: "March Fee"
    }
  ],
  "STU003": [
    {
      id: 6,
      fee_type: "Tuition Fee",
      period: "January 2024",
      amount: 12500,
      payment_mode: "Cash",
      payment_date: "2024-01-05",
      remarks: "January Fee"
    }
  ],
  "STU004": [
    {
      id: 7,
      fee_type: "Tuition Fee",
      period: "January 2024",
      amount: 12500,
      payment_mode: "UPI",
      payment_date: "2024-01-20",
      remarks: "January Fee"
    },
    {
      id: 8,
      fee_type: "Tuition Fee",
      period: "February 2024",
      amount: 12500,
      payment_mode: "Card",
      payment_date: "2024-02-20",
      remarks: "February Fee"
    }
  ],
  "STU005": [
    {
      id: 9,
      fee_type: "Tuition Fee",
      period: "January 2024",
      amount: 12500,
      payment_mode: "Bank Transfer",
      payment_date: "2024-01-12",
      remarks: "January Fee"
    },
    {
      id: 10,
      fee_type: "Tuition Fee",
      period: "February 2024",
      amount: 12500,
      payment_mode: "UPI",
      payment_date: "2024-02-12",
      remarks: "February Fee"
    },
    {
      id: 11,
      fee_type: "Tuition Fee",
      period: "March 2024",
      amount: 12500,
      payment_mode: "Cash",
      payment_date: "2024-03-10",
      remarks: "March Fee"
    }
  ]
};

// API Response Samples
export const apiResponses = {
  getStudentFees: {
    success: true,
    data: mockStudents
  },
  getPayments: {
    success: true,
    data: mockPayments
  },
  getStudentPaymentHistory: {
    success: true,
    data: mockPaymentHistory
  },
  createPayment: {
    success: true,
    data: {
      id: 4,
      student: "John Smith",
      student_id: "STU001",
      class: "Class 10",
      section: "A",
      fee_type: "Tuition Fee",
      amount: 12500,
      payment_mode: "UPI",
      payment_date: "2024-03-20",
      remarks: "March 2024 Fee"
    }
  }
};

// API Payload Samples
export const apiPayloads = {
  createPayment: {
    fee_due: 1,
    amount: 12500,
    payment_mode: "UPI",
    payment_date: "2024-03-20",
    remarks: "March 2024 Fee"
  },
  getStudentFees: {
    search: "",
    class: "Class 10",
    status: "Unpaid"
  },
  getPayments: {
    search: "",
    class: "Class 10"
  }
}; 
import React, { useState, useEffect, useContext } from 'react';
import { 
  Tabs, 
  Card, 
  Typography, 
  Space, 
  Button, 
  Table, 
  Tag, 
  Input, 
  Select, 
  Modal, 
  Form, 
  DatePicker, 
  Drawer,
  Row,
  Col,
  Statistic,
  Tooltip,
  Badge,
  message,
  Divider,
  Timeline,
  Avatar
} from 'antd';
import {
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  SearchOutlined,
  PlusOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  BankOutlined,
  CreditCardOutlined,
  WalletOutlined,
  MoneyCollectOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  DownloadOutlined,
  PrinterOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useMessage } from '../contexts/MessageContext';
import { useClasses } from '../contexts/ClassesContext';
import { useStudents } from '../contexts/StudentsContext';
import moment from 'moment';
import feeService from '../services/feeService';
import api from '../services/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;
const { confirm } = Modal;

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    class: undefined,
    status: undefined,
    payment_mode: undefined,
    start_date: undefined,
    end_date: undefined,
    amount_min: undefined,
    amount_max: undefined
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const messageApi = useMessage();
  const [editPaymentModalVisible, setEditPaymentModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [form] = Form.useForm();
  const [feeDetailsModalVisible, setFeeDetailsModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState(null);
  const [feeDetailsForm] = Form.useForm();
  const { classes, loading: classesLoading } = useClasses();
  const { students: allStudents, loading: studentsLoading } = useStudents();
  const [feeDetails, setFeeDetails] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [loadingClassStudents, setLoadingClassStudents] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [paymentForm] = Form.useForm();
  const [viewFeeModalVisible, setViewFeeModalVisible] = useState(false);
  const [viewingFee, setViewingFee] = useState(null);
  const [viewPaymentModalVisible, setViewPaymentModalVisible] = useState(false);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPaymentClass, setSelectedPaymentClass] = useState(null);
  const [selectedPaymentStudent, setSelectedPaymentStudent] = useState(null);
  const [paymentClassStudents, setPaymentClassStudents] = useState([]);
  const [loadingPaymentClassStudents, setLoadingPaymentClassStudents] = useState(false);
  const [paymentFeeDues, setPaymentFeeDues] = useState([]);
  const [loadingPaymentFeeDues, setLoadingPaymentFeeDues] = useState(false);

  // Get unique classes from students
  const uniqueClasses = [...new Set(allStudents.map(student => student.profile?.classroom_id))];

  useEffect(() => {
    loadData();
  }, [activeTab, searchText, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === '1') {
        // Load student fee tracking data using Get Fee Payments endpoint
        try {
          // Get all payments first
          const paymentsResponse = await api.fee.getPayments('');
          if (paymentsResponse.success) {
            // Group payments by student and calculate totals
            const studentPayments = {};
            
            paymentsResponse.data.results.forEach(payment => {
              const studentId = payment.student;
              if (!studentPayments[studentId]) {
                studentPayments[studentId] = {
                  id: studentId,
                  name: payment.student_name,
                  payments: [],
                  total_paid: 0,
                  total_due: 0,
                  due_months: 0
                };
              }
              
              studentPayments[studentId].payments.push(payment);
              studentPayments[studentId].total_paid += parseFloat(payment.amount);
            });
            
            // Get fee details to calculate dues
            const feeDetailsResponse = await api.fee.getFeeDues('');
            if (feeDetailsResponse.success) {
              feeDetailsResponse.data.forEach(fee => {
                const studentId = fee.student_id;
                if (studentPayments[studentId]) {
                  const payableAmount = parseFloat(fee.payable_amount);
                  const paidAmount = studentPayments[studentId].total_paid;
                  const dueAmount = payableAmount - paidAmount;
                  
                  studentPayments[studentId].total_due = dueAmount;
                  studentPayments[studentId].due_months = Math.ceil(dueAmount / (payableAmount / fee.number_of_terms));
                  studentPayments[studentId].status = dueAmount > 0 ? 'Unpaid' : 'Paid';
                  studentPayments[studentId].class = fee.class || 'N/A';
                  studentPayments[studentId].section = fee.section || 'N/A';
                  studentPayments[studentId].student_id = fee.student_id || studentId;
                }
              });
            }
            
            // Convert to array and apply filters
            let filteredStudents = Object.values(studentPayments);
            
            // Apply search filter
            if (searchText) {
              filteredStudents = filteredStudents.filter(student => 
                student.name.toLowerCase().includes(searchText.toLowerCase())
              );
            }
            
            // Apply status filter
            if (filters.status) {
              filteredStudents = filteredStudents.filter(student => 
                student.status === filters.status
              );
            }
            
            setStudents(filteredStudents);
          } else {
            messageApi.error(paymentsResponse.error || 'Failed to load student fees');
          }
        } catch (error) {
          console.error('Error loading student fees:', error);
          messageApi.error('Failed to load student fees');
        }
      } else if (activeTab === '2') {
        // Load payment records using real API
        let response;
        
        // Check if advanced filters are applied
        const hasAdvancedFilters = filters.payment_mode || filters.start_date || filters.end_date || 
                                  filters.amount_min || filters.amount_max;
        
        if (hasAdvancedFilters) {
          // Use filtered payments endpoint
          const filterParams = {};
          if (filters.payment_mode) filterParams.payment_mode = filters.payment_mode;
          if (filters.start_date) filterParams.start_date = filters.start_date;
          if (filters.end_date) filterParams.end_date = filters.end_date;
          if (filters.amount_min) filterParams.amount_min = filters.amount_min;
          if (filters.amount_max) filterParams.amount_max = filters.amount_max;
          if (filters.status) filterParams.status = filters.status;
          
          response = await api.fee.getFilteredPayments(filterParams);
        } else {
          // Use regular payments endpoint with basic filters
          const queryParams = [];
          if (searchText) queryParams.push(`search=${encodeURIComponent(searchText)}`);
          if (filters.class) queryParams.push(`class=${filters.class}`);
          
          response = await api.fee.getPayments(queryParams.length > 0 ? `?${queryParams.join('&')}` : '');
        }
        
        if (response.success) {
          // Transform the data to include student names and class info
          const transformedPayments = await Promise.all(response.data.results.map(async (payment) => {
            const student = allStudents.find(s => s.id === payment.student);
            return {
              ...payment,
              student: payment.student_name || (student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'),
              student_id: student?.student_profile?.student_id || payment.student,
              class: student?.profile?.class || 'N/A',
              section: student?.profile?.section || 'N/A',
              payment_date: payment.payment_date || payment.date
            };
          }));
          setPayments(transformedPayments);
        } else {
          messageApi.error(response.error || 'Failed to load payments');
        }
      } else if (activeTab === '3') {
        // Load fee details
        console.log('Loading fee details...'); // Debug log
        const response = await api.fee.getFeeDues(searchText ? `?search=${searchText}` : '');
        console.log('Fee details API response:', response); // Debug log
        if (response.success) {
          // Load all students if not already loaded or if we have few students
          let allStudentsData = allStudents;
          if (allStudents.length < 50) { // If we have less than 50 students, load all
            try {
              const studentsResponse = await api.student.getStudents('?page_size=1000');
              if (studentsResponse.success) {
                allStudentsData = studentsResponse.data.results || studentsResponse.data;
              }
            } catch (error) {
              console.warn('Could not load all students, using paginated data');
            }
          }
          
          // Transform the data to include student names - use results array from paginated response
          const feeDetails = (response.data.results || response.data).map((fee) => {
            // Try to find student in allStudentsData
            const student = allStudentsData.find(s => s.id === fee.student);
            let studentName = 'Unknown Student';
            let studentId = fee.student || 'N/A';
            
            if (student) {
              studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
              studentId = student.student_profile?.student_id || student.id;
            } else {
              // If student not found, show student ID
              studentName = `Student ID: ${fee.student}`;
              studentId = fee.student;
            }
            
            return {
              ...fee,
              student: studentName,
              student_id: studentId
            };
          });
          console.log('Setting fee details:', feeDetails); // Debug log
          setFeeDetails(feeDetails);
        } else {
          messageApi.error(response.error || 'Failed to load fee details');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      messageApi.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      class: undefined,
      status: undefined,
      payment_mode: undefined,
      start_date: undefined,
      end_date: undefined,
      amount_min: undefined,
      amount_max: undefined
    });
    setSearchText('');
  };

  const handleViewHistory = async (student) => {
    try {
      setLoading(true);
      // Use the Get Fee Payments endpoint to get all payments for this student
      const response = await api.fee.getPayments(`?student=${student.id}`);
      if (response.success) {
        // Transform the data to match the expected format
        const paymentHistory = response.data.results.map(payment => ({
          ...payment,
          payment_date: payment.date || payment.payment_date,
          transaction_id: payment.transaction_id || `TXN${payment.id}`,
          status: payment.status || 'successful'
        }));
        
        setSelectedStudent({
          ...student,
          payment_history: paymentHistory
        });
        setHistoryDrawerVisible(true);
      } else {
        messageApi.error(response.error || 'Failed to load payment history');
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
      messageApi.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPayment = async () => {
    // Ensure fee details are loaded for payment creation
    if (feeDetails.length === 0) {
      try {
        setLoading(true);
        const response = await api.fee.getFeeDues('');
        if (response.success) {
          // Transform the data to include student names
          const transformedFeeDetails = await Promise.all(response.data.map(async (fee) => {
            const student = allStudents.find(s => s.id === fee.student_id);
            return {
              ...fee,
              student: student ? `${student.first_name} ${student.last_name}` : 'Unknown Student',
              student_id: student?.student_profile?.student_id || 'N/A'
            };
          }));
          setFeeDetails(transformedFeeDetails);
        } else {
          messageApi.error(response.error || 'Failed to load fee details');
        }
      } catch (error) {
        console.error('Error loading fee details:', error);
        messageApi.error('Failed to load fee details');
      } finally {
        setLoading(false);
      }
    }
    setPaymentModalVisible(true);
  };

  const handlePaymentSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Find the fee due record from payment fee dues
      const feeDue = paymentFeeDues.find(fee => fee.id === values.fee_due);
      if (!feeDue) {
        messageApi.error('Fee due record not found');
        return;
      }

      // Validate that fee due has required fields
      if (!feeDue.fee_type) {
        messageApi.error('Fee due record is missing fee_type');
        console.error('Invalid fee due record:', feeDue);
        return;
      }

      const paymentData = {
        student: values.student_id,
        fee: feeDue.id,
        fee_type: feeDue.fee_type, // Add fee_type from selected fee due
        amount: parseFloat(values.amount),
        date: values.payment_date.format('YYYY-MM-DD'),
        payment_mode: values.payment_mode.toLowerCase(),
        remarks: values.remarks
      };

      console.log('Creating payment with data:', paymentData); // Debug log
      console.log('Selected fee due:', feeDue); // Debug log
      const response = await api.fee.createPayment(paymentData);
      console.log('Payment API response:', response); // Debug log
      
      if (response.success) {
        console.log('Payment created successfully:', response.data); // Debug log
        messageApi.success('Payment recorded successfully');
        setPaymentModalVisible(false);
        paymentForm.resetFields();
        setSelectedPaymentClass(null);
        setSelectedPaymentStudent(null);
        setPaymentClassStudents([]);
        setPaymentFeeDues([]);
        // Ensure data refresh happens after modal is closed
        setTimeout(() => {
          console.log('Refreshing data after payment creation...'); // Debug log
          loadData();
        }, 100);
      } else {
        console.error('Failed to create payment:', response.error); // Debug log
        messageApi.error(response.error || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      if (error.message && error.message.includes('transaction id already exists')) {
        messageApi.error('A payment with this transaction ID already exists. Please try again.');
      } else if (error.message && error.message.includes('No matching fee record')) {
        messageApi.error('No matching fee record found for this student and fee type.');
      } else if (error.message && error.message.includes('Fee type does not match')) {
        messageApi.error('Fee type does not match with the requested fee.');
      } else {
        messageApi.error('Failed to record payment');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditPayment = async (payment) => {
    try {
      setLoading(true);
      // First fetch the payment details using the GET endpoint
      const response = await api.fee.getPaymentById(payment.id);
      if (response.success) {
        const paymentDetails = response.data;
        console.log('Fetched payment data:', paymentDetails); // Debug log
        setEditingPayment(paymentDetails);
        
        // Set form values for editing
        const formValues = {
          amount: parseFloat(paymentDetails.amount),
          payment_mode: paymentDetails.payment_mode,
          payment_date: moment(paymentDetails.date || paymentDetails.payment_date),
          remarks: paymentDetails.remarks,
          transaction_id: paymentDetails.transaction_id || `TXN${Date.now()}`,
          status: paymentDetails.status || 'successful'
        };
        console.log('Setting payment form values:', formValues); // Debug log
        form.setFieldsValue(formValues);
        setEditPaymentModalVisible(true);
      } else {
        messageApi.error(response.error || 'Failed to fetch payment details');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      messageApi.error('Failed to fetch payment details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = (payment) => {
    confirm({
      title: 'Are you sure you want to delete this payment?',
      icon: <ExclamationCircleOutlined />,
      content: `This will delete the payment record of ₹${payment.amount} made on ${moment(payment.payment_date).format('DD MMM YYYY')}.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await api.fee.deletePayment(payment.id);
          // Handle 204 No Content response for successful deletion
          if (response.success || response.status === 204) {
            messageApi.success('Payment deleted successfully');
            loadData();
          } else {
            messageApi.error(response.error || 'Failed to delete payment');
          }
        } catch (error) {
          console.error('Error deleting payment:', error);
          if (error.message && error.message.includes('404')) {
            messageApi.error('Payment not found or already deleted');
          } else if (error.message && error.message.includes('403')) {
            messageApi.error('You do not have permission to delete this payment');
          } else {
            messageApi.error('Failed to delete payment');
          }
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleEditSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Validate that all required fields are present
      const requiredFields = ['amount', 'payment_mode', 'payment_date', 'remarks', 'transaction_id', 'status'];
      const missingFields = requiredFields.filter(field => !values[field]);
      
      if (missingFields.length > 0) {
        messageApi.error(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      const updateData = {
        amount: parseFloat(values.amount),
        status: values.status,
        payment_date: values.payment_date.format('YYYY-MM-DD'),
        payment_mode: values.payment_mode.toLowerCase(),
        remarks: values.remarks,
        transaction_id: values.transaction_id
      };
      
      console.log('Updating payment with data:', updateData); // Debug log
      const response = await api.fee.updatePayment(editingPayment.id, updateData);
      
      if (response.success) {
        console.log('Payment updated successfully:', response.data); // Debug log
        messageApi.success(`Payment updated successfully! Amount: ₹${response.data.amount}, Status: ${response.data.status}`);
        setEditPaymentModalVisible(false);
        setEditingPayment(null);
        form.resetFields();
        // Ensure data refresh happens after modal is closed
        setTimeout(() => {
          console.log('Refreshing data after payment update...'); // Debug log
          loadData();
        }, 100);
      } else {
        console.error('Failed to update payment:', response.error); // Debug log
        messageApi.error(response.error || 'Failed to update payment');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      if (error.message && error.message.includes('Transaction ID is invalid')) {
        messageApi.error('Transaction ID is invalid for this payment.');
      } else if (error.message && error.message.includes('This field is required')) {
        messageApi.error('All fields are required for payment updates.');
      } else if (error.message && error.message.includes('Method not allowed')) {
        messageApi.error('Update method not allowed. Please try again.');
      } else {
        messageApi.error('Failed to update payment');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewFeeDetails = () => {
    setIsEditMode(false);
    setEditingFee(null);
    setFeeDetailsModalVisible(true);
  };

  const handleFeeDetailsSubmit = async (values) => {
    try {
      setLoading(true);
      
      if (isEditMode && editingFee) {
        // Update existing fee record (only editable fields)
        const response = await api.fee.updateFeeDue(editingFee.id, {
          total_amount: parseFloat(values.amount),
          scholarship_amount: parseFloat(values.scholarship_amount || 0),
          fee_period: values.period.toLowerCase(),
          number_of_terms: parseInt(values.terms),
          term_start: parseInt(values.term_start),
          term_end: parseInt(values.term_end || 3),
          remarks: values.remarks
        });
        
        if (response.success) {
          messageApi.success('Fee record updated successfully');
          setFeeDetailsModalVisible(false);
          feeDetailsForm.resetFields();
          setSelectedClass(null);
          setSelectedStudentForFee(null);
          setClassStudents([]);
          setIsEditMode(false);
          setEditingFee(null);
          loadData();
        } else {
          messageApi.error(response.error || 'Failed to update fee record');
        }
      } else {
        // Create new fee record
        const response = await api.fee.createFeeDue({
          student: values.student_id,
          fee_type: values.fee_type,
          total_amount: parseFloat(values.amount),
          scholarship_amount: parseFloat(values.scholarship_amount || 0),
          fee_period: values.period.toLowerCase(),
          number_of_terms: parseInt(values.terms),
          term_start: parseInt(values.term_start),
          term_end: parseInt(values.term_end || 3), // Default to March if not set
          remarks: values.remarks
        });
        
        if (response.success) {
          console.log('Fee record created successfully:', response.data); // Debug log
          messageApi.success('Fee record created successfully');
          setFeeDetailsModalVisible(false);
          feeDetailsForm.resetFields();
          setSelectedClass(null);
          setSelectedStudentForFee(null);
          setClassStudents([]);
          // Ensure data refresh happens after modal is closed
          setTimeout(() => {
            console.log('Refreshing data after fee creation...'); // Debug log
            loadData();
          }, 100);
        } else {
          console.error('Failed to create fee record:', response.error); // Debug log
          messageApi.error(response.error || 'Failed to create fee record');
        }
      }
    } catch (error) {
      console.error('Error processing fee record:', error);
      if (error.message.includes('unique set')) {
        messageApi.error('A fee record already exists for this student and fee type combination.');
      } else {
        messageApi.error(`Failed to ${isEditMode ? 'update' : 'create'} fee record`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    setSelectedStudentForFee(null);
    setClassStudents([]);
    
    if (classId) {
      await loadStudentsByClass(classId);
    }
  };

  const loadStudentsByClass = async (classId) => {
    try {
      setLoadingClassStudents(true);
      const response = await api.class.getClass(classId);
      if (response.success) {
        const classData = response.data;
        const students = classData.students || [];
        
        if (students.length === 0) {
          setClassStudents([]);
          messageApi.info('No students found in this class.');
        } else {
          // Transform the students data to match the expected format
          const transformedStudents = students.map(student => ({
            id: student.id,
            user_id: student.user?.id,
            first_name: student.user?.first_name || student.first_name,
            last_name: student.user?.last_name || student.last_name,
            name: `${student.user?.first_name || student.first_name} ${student.user?.last_name || student.last_name}`,
            student_profile: {
              student_id: student.student_profile?.student_id || student.id.toString()
            },
            profile: {
              classroom_id: classId,
              class: `${classData.class_name} - ${classData.section}`,
              section: classData.section
            },
            gender: student.user?.gender || student.gender,
            status: "Active",
            roll_no: student.roll_no || 1,
            photo: student.user?.photo || student.photo
          }));
          setClassStudents(transformedStudents);
        }
      } else {
        messageApi.error(response.error || 'Failed to load class details');
        setClassStudents([]);
      }
    } catch (error) {
      console.error('Error loading class details:', error);
      messageApi.error('Failed to load class details');
      setClassStudents([]);
    } finally {
      setLoadingClassStudents(false);
    }
  };

  const handleStudentChange = (studentId) => {
    setSelectedStudentForFee(studentId);
  };

  const handlePaymentClassChange = async (classId) => {
    setSelectedPaymentClass(classId);
    setSelectedPaymentStudent(null);
    setPaymentClassStudents([]);
    
    if (classId) {
      await loadPaymentStudentsByClass(classId);
    }
  };

  const loadPaymentStudentsByClass = async (classId) => {
    try {
      setLoadingPaymentClassStudents(true);
      const response = await api.class.getClass(classId);
      if (response.success) {
        const classData = response.data;
        const students = classData.students || [];
        
        if (students.length === 0) {
          setPaymentClassStudents([]);
          messageApi.info('No students found in this class.');
        } else {
          // Transform the students data to match the expected format
          const transformedStudents = students.map(student => ({
            id: student.id,
            user_id: student.user?.id,
            first_name: student.user?.first_name || student.first_name,
            last_name: student.user?.last_name || student.last_name,
            name: `${student.user?.first_name || student.first_name} ${student.user?.last_name || student.last_name}`,
            student_profile: {
              student_id: student.student_profile?.student_id || student.id.toString()
            },
            profile: {
              classroom_id: classId,
              class: `${classData.class_name} - ${classData.section}`,
              section: classData.section
            },
            gender: student.user?.gender || student.gender,
            status: "Active",
            roll_no: student.roll_no || 1,
            photo: student.user?.photo || student.photo
          }));
          setPaymentClassStudents(transformedStudents);
        }
      } else {
        messageApi.error(response.error || 'Failed to load class details');
        setPaymentClassStudents([]);
      }
    } catch (error) {
      console.error('Error loading class details:', error);
      messageApi.error('Failed to load class details');
      setPaymentClassStudents([]);
    } finally {
      setLoadingPaymentClassStudents(false);
    }
  };

  const handlePaymentStudentChange = (studentId) => {
    setSelectedPaymentStudent(studentId);
    // Load fee dues for the selected student
    if (studentId) {
      loadPaymentFeeDues(studentId);
    } else {
      setPaymentFeeDues([]);
    }
  };

  const loadPaymentFeeDues = async (studentId) => {
    try {
      setLoadingPaymentFeeDues(true);
      // First get student details to find their classroom
      const student = paymentClassStudents.find(s => s.id === studentId);
      if (!student) {
        setPaymentFeeDues([]);
        return;
      }

      // Use the classroom_id to fetch fee dues
      const classroomId = student.profile?.classroom_id;
      if (!classroomId) {
        setPaymentFeeDues([]);
        return;
      }

      const response = await api.fee.getFeeDues(`?classroom_id=${classroomId}`);
      if (response.success) {
        // Filter fee dues for the selected student and unpaid status
        const studentFeeDues = (response.data.results || response.data).filter(fee => 
          fee.student === studentId && fee.fee_status !== 'paid'
        );
        
        // Transform the data to include student names
        const transformedFeeDues = studentFeeDues.map(fee => {
          const student = paymentClassStudents.find(s => s.id === fee.student);
          return {
            ...fee,
            student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'
          };
        });
        
        // Debug log to check fee due structure
        console.log('Transformed fee dues:', transformedFeeDues);
        
        console.log('Loaded payment fee dues:', transformedFeeDues); // Debug log
        setPaymentFeeDues(transformedFeeDues);
      } else {
        console.error('Failed to load fee dues:', response.error); // Debug log
        messageApi.error(response.error || 'Failed to load fee dues');
        setPaymentFeeDues([]);
      }
    } catch (error) {
      console.error('Error loading payment fee dues:', error);
      messageApi.error('Failed to load fee dues');
      setPaymentFeeDues([]);
    } finally {
      setLoadingPaymentFeeDues(false);
    }
  };

  const handleViewFee = async (fee) => {
    setLoading(true);
    try {
      const response = await api.fee.getFeeDueById(fee.id);
      if (response.success) {
        setViewingFee(response.data);
        setViewFeeModalVisible(true);
      } else {
        messageApi.error(response.error || 'Failed to fetch fee details');
      }
    } catch (error) {
      messageApi.error('Failed to fetch fee details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayment = async (payment) => {
    setLoading(true);
    try {
      // Use the Get Fee Payment Detail endpoint for individual payment details
      const response = await api.fee.getPaymentById(payment.id);
      if (response.success) {
        setViewingPayment(response.data);
        setViewPaymentModalVisible(true);
      } else {
        messageApi.error(response.error || 'Failed to fetch payment details');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      messageApi.error('Failed to fetch payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPaymentFromHistory = async (payment) => {
    setLoading(true);
    try {
      // Use the Get Fee Payment Detail endpoint for payment history details
      const response = await api.fee.getPaymentById(payment.id);
      if (response.success) {
        setViewingPayment(response.data);
        setViewPaymentModalVisible(true);
      } else {
        messageApi.error(response.error || 'Failed to fetch payment details');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      messageApi.error('Failed to fetch payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeeDetails = (fee) => {
    confirm({
      title: 'Are you sure you want to delete this fee detail?',
      icon: <ExclamationCircleOutlined />,
      content: `This will delete the fee detail of ₹${fee.total_amount} for ID: ${fee.student}.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          setLoading(true);
          // Use new endpoint
          const response = await api.fee.deleteFeeDue(fee.id, true);
          if (response.success) {
            messageApi.success('Fee detail deleted successfully');
            loadData();
          } else if (response.status === 405) {
            messageApi.error('Delete operation is disabled for this record.');
          } else {
            messageApi.error(response.error || 'Failed to delete fee detail');
          }
        } catch (error) {
          if (error.message && error.message.includes('disabled')) {
            messageApi.error('Delete operation is disabled for this record.');
          } else {
            messageApi.error('Failed to delete fee detail');
          }
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleEditFee = async (fee) => {
    try {
      setLoading(true);
      setIsEditMode(true);
      
      // Fetch the complete fee details from API
      const response = await api.fee.getFeeDueById(fee.id);
      if (response.success) {
        const feeData = response.data;
        console.log('Fetched fee data:', feeData); // Debug log
        setEditingFee(feeData);
        
        // Set form values for editing with API data (only editable fields)
        const formValues = {
          amount: parseFloat(feeData.total_amount), // Map total_amount to amount field
          scholarship_amount: parseFloat(feeData.scholarship_amount || 0),
          period: feeData.fee_period, // Map fee_period to period field
          fee_type: feeData.fee_type,
          remarks: feeData.remarks,
          term_start: feeData.term_start,
          term_end: feeData.term_end,
          terms: feeData.number_of_terms, // Map number_of_terms to terms field
          amount_per_term: parseFloat(feeData.amount_per_term), // Set amount per term
        };
        console.log('Setting form values:', formValues); // Debug log
        feeDetailsForm.setFieldsValue(formValues);
        
        // For edit mode, we don't need to set class and student fields
        // Just set the state for display purposes
        let classId = fee.classroom_id || fee.class;
        
        // If no class info in fee data, try to find it from student data
        if (!classId) {
          const student = allStudents.find(s => s.id === feeData.student);
          if (student && student.profile?.classroom_id) {
            classId = student.profile.classroom_id;
          }
        }
        
        console.log('Class ID found:', classId); // Debug log
        console.log('Student ID:', feeData.student); // Debug log
        
        setSelectedClass(classId);
        setSelectedStudentForFee(feeData.student);
        
        setFeeDetailsModalVisible(true);
      } else {
        messageApi.error(response.error || 'Failed to fetch fee details');
      }
    } catch (error) {
      console.error('Error fetching fee details:', error);
      messageApi.error('Failed to fetch fee details');
    } finally {
      setLoading(false);
    }
  };


  const studentColumns = [
    {
      title: 'Student Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary">ID: {record.student_id}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
      render: (text) => (
        <Tag 
          style={{ 
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: '#f5f5f5',
            color: '#595959',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '24px',
            lineHeight: '1',
            margin: 0
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      render: (text) => (
        <Tag 
          style={{ 
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: 'linear-gradient(45deg, #f5f5f5, #fafafa)',
            color: '#595959',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '24px',
            lineHeight: '1',
            margin: 0
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'Due Months',
      dataIndex: 'due_months',
      key: 'due_months',
      render: (text) => (
        <Tag 
          style={{ 
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: '#f5f5f5',
            color: '#595959',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '24px',
            lineHeight: '1',
            margin: 0
          }}
        >
          {text} months
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          style={{ 
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: status === 'Paid' ? '#f6ffed' : '#fff2f0',
            color: status === 'Paid' ? '#52c41a' : '#ff4d4f',
            border: `1px solid ${status === 'Paid' ? '#b7eb8f' : '#ffccc7'}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '24px',
            lineHeight: '1',
            margin: 0
          }}
        >
          {status === 'Paid' ? (
            <CheckCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#52c41a' }} />
          ) : (
            <CloseCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#ff4d4f' }} />
          )} 
          {status}
        </Tag>
      ),
    },
    {
      title: 'Total Due',
      dataIndex: 'total_due',
      key: 'total_due',
      render: (amount) => (
        <Text strong style={{ color: amount > 0 ? '#ff4d4f' : '#52c41a' }}>
          ₹{amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Payment History">
            <Button
              type="primary"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record)}
              size="small"
            >
              History
            </Button>
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteFeeDetails(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const paymentColumns = [
    {
      title: 'Student',
      dataIndex: 'student',
      key: 'student',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary">ID: {record.student_id}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Class/Section',
      key: 'class_section',
      render: (_, record) => (
        <Space>
          <Tag 
            style={{ 
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              background: '#f5f5f5',
              color: '#595959',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '24px',
              lineHeight: '1',
              margin: 0
            }}
          >
            {record.class}
          </Tag>
          <Tag 
            style={{ 
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              background: 'linear-gradient(45deg, #f5f5f5, #fafafa)',
              color: '#595959',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '24px',
              lineHeight: '1',
              margin: 0
            }}
          >
            {record.section}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Fee Type',
      dataIndex: 'fee_type',
      key: 'fee_type',
      render: (type) => (
        <Tag 
          style={{ 
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: '#f5f5f5',
            color: '#595959',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '24px',
            lineHeight: '1',
            margin: 0
          }}
        >
          <MoneyCollectOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#7B83EB' }} />
          {type}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          ₹{amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Payment Mode',
      dataIndex: 'payment_mode',
      key: 'payment_mode',
      render: (mode) => {
        const icons = {
          'Cash': <MoneyCollectOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#7B83EB' }} />,
          'UPI': <CreditCardOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#7B83EB' }} />,
          'Card': <BankOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#7B83EB' }} />,
          'Bank Transfer': <WalletOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#7B83EB' }} />
        };
        return (
          <Tag 
            style={{ 
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              background: '#f5f5f5',
              color: '#595959',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '24px',
              lineHeight: '1',
              margin: 0
            }}
          >
            {icons[mode]}
            {mode}
          </Tag>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {moment(date).format('DD MMM YYYY')}
        </Space>
      ),
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      render: (id) => (
        <Tag 
          style={{ 
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: '#f0f8ff',
            color: '#1890ff',
            border: '1px solid #d6e4ff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '24px',
            lineHeight: '1',
            margin: 0
          }}
        >
          {id || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          style={{ 
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: status === 'successful' ? '#f6ffed' : '#fff2f0',
            color: status === 'successful' ? '#52c41a' : '#ff4d4f',
            border: `1px solid ${status === 'successful' ? '#b7eb8f' : '#ffccc7'}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '24px',
            lineHeight: '1',
            margin: 0
          }}
        >
          {status === 'successful' ? (
            <CheckCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#52c41a' }} />
          ) : (
            <CloseCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#ff4d4f' }} />
          )} 
          {status || 'pending'}
        </Tag>
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 150 }}>
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => handleViewPayment(record)}
              size="small"
            >
              View
            </Button>
          </Tooltip>
          <Tooltip title="Edit Payment">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEditPayment(record)}
              size="small"
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip title="Delete Payment">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeletePayment(record)}
              size="small"
            >
              Delete
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="fee-management-page" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '0', 
      overflow: 'hidden', 
      margin: '0',
      borderRadius: '16px',
      background: '#ffffff',
      boxShadow: '0 4px 20px rgba(159, 179, 223, 0.15)',
      border: '1px solid rgba(159, 179, 223, 0.2)'
    }}>
      <div className="fee-management-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0',
        background: '#ffffff'
      }}>
        <Title level={3} className="page-title">
          <img src="/charge.png" alt="Fee Management" style={{ width: '40px', height: '40px' }} />
          Fee Management
        </Title>
        <Space>
          <Search
            placeholder="Search..."
            allowClear
            onSearch={handleSearch}
            style={{ 
              width: 250,
              borderRadius: '6px',
              boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
              border: '1px solid rgba(159, 179, 223, 0.3)'
            }}
            prefix={<SearchOutlined style={{ color: '#7B83EB' }} />}
          />
          <Select
            placeholder="Filter by Class"
            allowClear
            style={{ 
              width: 150,
              borderRadius: '6px',
              boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
              border: '1px solid rgba(159, 179, 223, 0.3)'
            }}
            onChange={(value) => handleFilterChange('class', value)}
            suffixIcon={<FilterOutlined style={{ color: '#7B83EB' }} />}
          >
            {classes.map(cls => (
              <Option key={cls.id} value={cls.id}>
                {cls.class_name} - Section {cls.section}
              </Option>
            ))}
          </Select>
          {activeTab === '1' && (
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ 
                width: 150,
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
              onChange={(value) => handleFilterChange('status', value)}
              suffixIcon={<FilterOutlined style={{ color: '#7B83EB' }} />}
            >
              <Option value="Paid">Paid</Option>
              <Option value="Unpaid">Unpaid</Option>
            </Select>
          )}
          {activeTab === '2' && (
            <>
              <Button
                type="default"
                icon={<FilterOutlined />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '6px',
                  border: '1px solid rgba(159, 179, 223, 0.3)',
                  color: '#7B83EB',
                  fontWeight: 500
                }}
              >
                {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleNewPayment}
                style={{
                  background: '#7B83EB',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '6px',
                  color: 'white',
                  fontWeight: 500
                }}
              >
                New Payment
              </Button>
            </>
          )}
          {activeTab === '3' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleNewFeeDetails}
              style={{
                background: '#7B83EB',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                height: '36px',
                padding: '0 16px',
                borderRadius: '6px',
                color: 'white',
                fontWeight: 500
              }}
            >
              Add Fee Details
            </Button>
          )}
        </Space>
      </div>

      {/* Advanced Filters Panel */}
      {activeTab === '2' && showAdvancedFilters && (
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa',
          borderLeft: '3px solid #7B83EB'
        }}>
          <Row gutter={16} align="middle">
            <Col span={4}>
              <Text strong>Payment Mode:</Text>
              <Select
                placeholder="All modes"
                allowClear
                style={{ width: '100%', marginTop: 4 }}
                value={filters.payment_mode}
                onChange={(value) => handleFilterChange('payment_mode', value)}
              >
                <Option value="upi">UPI</Option>
                <Option value="cash">Cash</Option>
                <Option value="bank_transfer">Bank Transfer</Option>
                <Option value="card">Card</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Text strong>Status:</Text>
              <Select
                placeholder="All statuses"
                allowClear
                style={{ width: '100%', marginTop: 4 }}
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
              >
                <Option value="successful">Successful</Option>
                <Option value="pending">Pending</Option>
                <Option value="failed">Failed</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Text strong>Start Date:</Text>
              <DatePicker
                style={{ width: '100%', marginTop: 4 }}
                placeholder="From date"
                value={filters.start_date ? moment(filters.start_date) : null}
                onChange={(date) => handleFilterChange('start_date', date ? date.format('YYYY-MM-DD') : undefined)}
              />
            </Col>
            <Col span={4}>
              <Text strong>End Date:</Text>
              <DatePicker
                style={{ width: '100%', marginTop: 4 }}
                placeholder="To date"
                value={filters.end_date ? moment(filters.end_date) : null}
                onChange={(date) => handleFilterChange('end_date', date ? date.format('YYYY-MM-DD') : undefined)}
              />
            </Col>
            <Col span={4}>
              <Text strong>Amount Range:</Text>
              <div style={{ marginTop: 4 }}>
                <Input
                  placeholder="Min amount"
                  prefix="₹"
                  style={{ marginBottom: 4 }}
                  value={filters.amount_min}
                  onChange={(e) => handleFilterChange('amount_min', e.target.value)}
                />
                <Input
                  placeholder="Max amount"
                  prefix="₹"
                  value={filters.amount_max}
                  onChange={(e) => handleFilterChange('amount_max', e.target.value)}
                />
              </div>
            </Col>
            <Col span={4}>
              <Space direction="vertical" style={{ width: '100%', marginTop: 24 }}>
                <Button
                  type="primary"
                  onClick={loadData}
                  style={{
                    background: '#7B83EB',
                    border: 'none',
                    width: '100%'
                  }}
                >
                  Apply Filters
                </Button>
                <Button
                  onClick={clearAllFilters}
                  style={{
                    width: '100%'
                  }}
                >
                  Clear All
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      )}

      <div style={{ 
        flex: 1, 
        overflow: 'hidden',
        padding: '0 16px 16px 16px'
      }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
            tab={
              <span>
                <TeamOutlined />
                Student Fee Tracking
              </span>
            }
            key="1"
          >
            <Table
              columns={studentColumns}
              dataSource={students}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} students`
              }}
              className="fee-management-table"
              scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
            />
          </TabPane>
        <TabPane
            tab={
              <span>
                <SettingOutlined />
                Fee Details
              </span>
            }
            key="3"
          >
            <Table
              columns={[
                {
                  title: 'Student',
                  dataIndex: 'student',
                  key: 'student',
                  width: 160,
                  fixed: 'left',
                  render: (text, record) => (
                    <Space>
                      <Avatar icon={<UserOutlined />} />
                      <div>
                        <Text strong style={{ fontSize: '12px' }}>{text}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '10px' }}>ID: {record.student_id}</Text>
                      </div>
                    </Space>
                  ),
                },
                {
                  title: 'Fee Type',
                  dataIndex: 'fee_type',
                  key: 'fee_type',
                  width: 100,
                  render: (type) => (
                    <Tag 
                      style={{ 
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500,
                        background: '#f5f5f5',
                        color: '#595959',
                        border: '1px solid #f0f0f0',
                        margin: 0
                      }}
                    >
                      <MoneyCollectOutlined style={{ fontSize: '10px', marginRight: '2px', color: '#7B83EB' }} />
                      {type}
                    </Tag>
                  ),
                },
                {
                  title: 'Total Amount',
                  dataIndex: 'total_amount',
                  key: 'total_amount',
                  width: 110,
                  render: (amount) => (
                    <Text strong style={{ color: '#52c41a', fontSize: '12px' }}>
                      ₹{parseFloat(amount).toLocaleString()}
                    </Text>
                  ),
                },
                {
                  title: 'Scholarship',
                  dataIndex: 'scholarship_amount',
                  key: 'scholarship_amount',
                  width: 100,
                  render: (amount) => (
                    <Text style={{ color: '#faad14', fontSize: '12px' }}>
                      ₹{parseFloat(amount).toLocaleString()}
                    </Text>
                  ),
                },
                {
                  title: 'Payable',
                  dataIndex: 'payable_amount',
                  key: 'payable_amount',
                  width: 110,
                  render: (amount) => (
                    <Text strong style={{ color: '#1890ff', fontSize: '12px' }}>
                      ₹{parseFloat(amount).toLocaleString()}
                    </Text>
                  ),
                },
                {
                  title: 'Total Due',
                  dataIndex: 'total_due',
                  key: 'total_due',
                  width: 100,
                  render: (amount) => (
                    <Tag color="red" style={{ fontSize: '11px', padding: '2px 6px' }}>
                      ₹{parseFloat(amount).toLocaleString()}
                    </Tag>
                  ),
                },
                {
                  title: 'Due Months',
                  dataIndex: 'due_months',
                  key: 'due_months',
                  width: 90,
                  render: (months) => (
                    <Tag color="orange" style={{ fontSize: '11px', padding: '2px 6px' }}>
                      {months} months
                    </Tag>
                  ),
                },
                {
                  title: 'Period',
                  dataIndex: 'fee_period',
                  key: 'fee_period',
                  width: 80,
                  render: (period) => (
                    <Tag color="blue" style={{ fontSize: '11px', padding: '2px 6px' }}>
                      {period}
                    </Tag>
                  ),
                },
                {
                  title: 'Terms',
                  dataIndex: 'number_of_terms',
                  key: 'number_of_terms',
                  width: 70,
                  render: (terms) => (
                    <Tag color="purple" style={{ fontSize: '11px', padding: '2px 6px' }}>
                      {terms}
                    </Tag>
                  ),
                },
                {
                  title: 'Per Term',
                  dataIndex: 'amount_per_term',
                  key: 'amount_per_term',
                  width: 90,
                  render: (amount) => (
                    <Text style={{ color: '#1890ff', fontSize: '11px' }}>
                      ₹{parseFloat(amount).toLocaleString()}
                    </Text>
                  ),
                },
                {
                  title: 'Status',
                  dataIndex: 'fee_status',
                  key: 'fee_status',
                  width: 80,
                  render: (status) => (
                    <Tag 
                      style={{ 
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500,
                        background: status === 'paid' ? '#f6ffed' : '#fff2f0',
                        color: status === 'paid' ? '#52c41a' : '#ff4d4f',
                        border: `1px solid ${status === 'paid' ? '#b7eb8f' : '#ffccc7'}`,
                        margin: 0
                      }}
                    >
                      {status === 'paid' ? (
                        <CheckCircleOutlined style={{ fontSize: '10px', marginRight: '2px', color: '#52c41a' }} />
                      ) : (
                        <CloseCircleOutlined style={{ fontSize: '10px', marginRight: '2px', color: '#ff4d4f' }} />
                      )} 
                      {status}
                    </Tag>
                  ),
                },
                {
                  title: 'Remarks',
                  dataIndex: 'remarks',
                  key: 'remarks',
                  width: 120,
                  render: (text) => (
                    <Tooltip title={text}>
                      <Text ellipsis style={{ maxWidth: 100, fontSize: '11px' }}>
                        {text || 'N/A'}
                      </Text>
                    </Tooltip>
                  ),
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  width: 100,
                  fixed: 'right',
                  render: (_, record) => (
                    <Space size="small">
                      <Tooltip title="View">
                        <Button
                          type="default"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewFee(record)}
                          size="small"
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                        />
                      </Tooltip>
                      <Tooltip title="Edit">
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => handleEditFee(record)}
                          size="small"
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                        />
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteFeeDetails(record)}
                          size="small"
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                        />
                      </Tooltip>
                    </Space>
                  ),
                }
              ]}
              dataSource={feeDetails}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} fee details`
              }}
              className="fee-management-table"
              scroll={{ x: 1400, y: 'calc(100vh - 280px)' }}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <MoneyCollectOutlined />
                Payment Records
              </span>
            }
            key="2"
          >
            <Table
              columns={paymentColumns}
              dataSource={payments}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} payments`
              }}
              className="fee-management-table"
              scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
            />
          </TabPane>
        </Tabs>
      </div>

      {/* Payment History Drawer */}
      <Drawer
        title={
          <Space>
            <HistoryOutlined />
            Payment History
            {selectedStudent && (
              <Text type="secondary">
                - {selectedStudent.name}
              </Text>
            )}
          </Space>
        }
        placement="right"
        width={800}
        onClose={() => setHistoryDrawerVisible(false)}
        visible={historyDrawerVisible}
      >
        {selectedStudent && (
          <>
            <Card className="student-summary-card">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Total Due"
                    value={selectedStudent.total_due}
                    prefix="₹"
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Total Paid"
                    value={selectedStudent.total_paid || 0}
                    prefix="₹"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Due Months"
                    value={selectedStudent.due_months}
                    suffix="months"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Total Payments"
                    value={selectedStudent.payment_history?.length || 0}
                    suffix="payments"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>
            </Card>
            <Divider />
            <Title level={5}>Payment Transactions</Title>
            <Table
              columns={[
                {
                  title: 'Date',
                  dataIndex: 'payment_date',
                  key: 'payment_date',
                  render: (date) => (
                    <Space>
                      <CalendarOutlined />
                      {moment(date).format('DD MMM YYYY')}
                    </Space>
                  ),
                },
                {
                  title: 'Fee Type',
                  dataIndex: 'fee_type',
                  key: 'fee_type',
                  render: (type) => (
                    <Tag 
                      style={{ 
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        background: '#f5f5f5',
                        color: '#595959',
                        border: '1px solid #f0f0f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '24px',
                        lineHeight: '1',
                        margin: 0
                      }}
                    >
                      <MoneyCollectOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#7B83EB' }} />
                      {type}
                    </Tag>
                  ),
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: (amount) => (
                    <Text strong style={{ color: '#52c41a' }}>
                      ₹{amount.toLocaleString()}
                    </Text>
                  ),
                },
                {
                  title: 'Payment Mode',
                  dataIndex: 'payment_mode',
                  key: 'payment_mode',
                  render: (mode) => {
                    const icons = {
                      'Cash': <MoneyCollectOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#7B83EB' }} />,
                      'UPI': <CreditCardOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#7B83EB' }} />,
                      'Card': <BankOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#7B83EB' }} />,
                      'Bank Transfer': <WalletOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#7B83EB' }} />
                    };
                    return (
                      <Tag 
                        style={{ 
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 500,
                          background: '#f5f5f5',
                          color: '#595959',
                          border: '1px solid #f0f0f0',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '24px',
                          lineHeight: '1',
                          margin: 0
                        }}
                      >
                        {icons[mode]}
                        {mode}
                      </Tag>
                    );
                  },
                },
                {
                  title: 'Transaction ID',
                  dataIndex: 'transaction_id',
                  key: 'transaction_id',
                  render: (id) => (
                    <Tag 
                      style={{ 
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        background: '#f0f8ff',
                        color: '#1890ff',
                        border: '1px solid #d6e4ff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '24px',
                        lineHeight: '1',
                        margin: 0
                      }}
                    >
                      {id || 'N/A'}
                    </Tag>
                  ),
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag 
                      style={{ 
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        background: status === 'successful' ? '#f6ffed' : '#fff2f0',
                        color: status === 'successful' ? '#52c41a' : '#ff4d4f',
                        border: `1px solid ${status === 'successful' ? '#b7eb8f' : '#ffccc7'}`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '24px',
                        lineHeight: '1',
                        margin: 0
                      }}
                    >
                      {status === 'successful' ? (
                        <CheckCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#52c41a' }} />
                      ) : (
                        <CloseCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#ff4d4f' }} />
                      )} 
                      {status || 'pending'}
                    </Tag>
                  ),
                },
                {
                  title: 'Remarks',
                  dataIndex: 'remarks',
                  key: 'remarks',
                  render: (text) => (
                    <Tooltip title={text}>
                      <Text ellipsis style={{ maxWidth: 150 }}>
                        {text}
                      </Text>
                    </Tooltip>
                  ),
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <Tooltip title="View Details">
                      <Button
                        type="default"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewPaymentFromHistory(record)}
                        size="small"
                      >
                        View
                      </Button>
                    </Tooltip>
                  ),
                }
              ]}
              dataSource={selectedStudent.payment_history || []}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} payments`
              }}
            />
          </>
        )}
      </Drawer>

      {/* New Payment Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            New Payment Entry
          </Space>
        }
        visible={paymentModalVisible}
        onCancel={() => {
          setPaymentModalVisible(false);
          paymentForm.resetFields();
          setSelectedPaymentClass(null);
          setSelectedPaymentStudent(null);
          setPaymentClassStudents([]);
          setPaymentFeeDues([]);
        }}
        width={800}
        footer={null}
      >
        <Form 
          form={paymentForm}
          layout="vertical"
          onFinish={handlePaymentSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Class"
                name="class_id"
                rules={[{ required: true, message: 'Please select class' }]}
              >
                <Select
                  placeholder="Select class"
                  loading={classesLoading}
                  onChange={handlePaymentClassChange}
                  notFoundContent={classesLoading ? <span>Loading classes...</span> : <span>No classes found</span>}
                >
                  {classes.map(cls => (
                    <Option key={cls.id} value={cls.id}>
                      {cls.class_name} - Section {cls.section}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Student"
                name="student_id"
                rules={[{ required: true, message: 'Please select student' }]}
              >
                <Select
                  placeholder={
                    selectedPaymentClass ? 
                      (loadingPaymentClassStudents ? "Loading students..." : `Select student (${paymentClassStudents.length} available)`) : 
                      "Please select a class first"
                  }
                  loading={loadingPaymentClassStudents}
                  disabled={!selectedPaymentClass}
                  onChange={handlePaymentStudentChange}
                  notFoundContent={
                    !selectedPaymentClass ? 
                      <span>Please select a class first</span> : 
                      loadingPaymentClassStudents ? 
                        <span>Loading students...</span> : 
                        <span>No students found in this class</span>
                  }
                >
                  {loadingPaymentClassStudents ? (
                    <Option disabled>
                      <span style={{ color: '#999' }}>Loading students...</span>
                    </Option>
                  ) : (
                    paymentClassStudents.map(student => (
                      <Option key={student.id} value={student.id}>
                        {`${student.first_name} ${student.last_name} - ${student.student_profile?.student_id || student.id}`}
                      </Option>
                    ))
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Fee Due"
                name="fee_due"
                rules={[{ required: true, message: 'Please select fee due' }]}
              >
                <Select
                  showSearch
                  placeholder={
                    !selectedPaymentStudent ? 
                      "Please select a student first" :
                      loadingPaymentFeeDues ? 
                        "Loading fee dues..." : 
                        `Select fee due (${paymentFeeDues.length} available)`
                  }
                  optionFilterProp="children"
                  loading={loadingPaymentFeeDues}
                  disabled={!selectedPaymentStudent}
                  onChange={(value) => {
                    const selectedFee = paymentFeeDues.find(fee => fee.id === value);
                    if (selectedFee) {
                      // Auto-fill the amount with the payable amount
                      paymentForm.setFieldsValue({
                        amount: parseFloat(selectedFee.payable_amount)
                      });
                    }
                  }}
                  notFoundContent={
                    !selectedPaymentStudent ? 
                      <span>Please select a student first</span> : 
                      loadingPaymentFeeDues ? 
                        <span>Loading fee dues...</span> : 
                        <span>No unpaid fee dues found for this student</span>
                  }
                >
                  {loadingPaymentFeeDues ? (
                    <Option disabled>
                      <span style={{ color: '#999' }}>Loading fee dues...</span>
                    </Option>
                  ) : (
                    paymentFeeDues.map(fee => (
                      <Option key={fee.id} value={fee.id}>
                        {fee.student_name} - {fee.fee_type} - ₹{parseFloat(fee.payable_amount).toLocaleString()}
                      </Option>
                    ))
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Amount"
                name="amount"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <Input 
                  prefix="₹" 
                  type="number" 
                  step="0.01"
                  placeholder="Enter amount"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Payment Mode"
                name="payment_mode"
                rules={[{ required: true, message: 'Please select payment mode' }]}
              >
                <Select>
                  <Option value="UPI">UPI</Option>
                  <Option value="Cash">Cash</Option>
                  <Option value="Bank Transfer">Bank Transfer</Option>
                  <Option value="Card">Card</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Payment Date"
                name="payment_date"
                rules={[{ required: true, message: 'Please select payment date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Transaction ID"
                name="transaction_id"
                rules={[{ required: true, message: 'Please enter transaction ID' }]}
              >
                <Input placeholder="Enter transaction ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                initialValue="successful"
              >
                <Select>
                  <Option value="successful">Successful</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="failed">Failed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Remarks"
            name="remarks"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Submit Payment
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Payment Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Edit Payment
          </Space>
        }
        visible={editPaymentModalVisible}
        onCancel={() => {
          setEditPaymentModalVisible(false);
          setEditingPayment(null);
          form.resetFields();
        }}
        width={800}
        footer={null}
      >
        <Form 
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Amount"
                name="amount"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <Input prefix="₹" type="number" step="0.01" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Payment Mode"
                name="payment_mode"
                rules={[{ required: true, message: 'Please select payment mode' }]}
              >
                <Select>
                  <Option value="UPI">UPI</Option>
                  <Option value="Cash">Cash</Option>
                  <Option value="Bank Transfer">Bank Transfer</Option>
                  <Option value="Card">Card</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Payment Date"
                name="payment_date"
                rules={[{ required: true, message: 'Please select payment date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Transaction ID"
                name="transaction_id"
                rules={[{ required: true, message: 'Please enter transaction ID' }]}
              >
                <Input placeholder="Enter transaction ID" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select>
                  <Option value="successful">Successful</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="failed">Failed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Remarks"
            name="remarks"
            rules={[{ required: true, message: 'Please enter remarks' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter payment remarks" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Payment
              </Button>
              <Button 
                onClick={() => {
                  setEditPaymentModalVisible(false);
                  setEditingPayment(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Fee Details Modal */}
      <Modal
        title={
          <Space>
            {isEditMode ? <EditOutlined /> : <SettingOutlined />}
            {isEditMode ? 'Edit Fee Details' : 'Add Fee Details'}
          </Space>
        }
        visible={feeDetailsModalVisible}
        onCancel={() => {
          setFeeDetailsModalVisible(false);
          feeDetailsForm.resetFields();
          setSelectedClass(null);
          setSelectedStudentForFee(null);
          setClassStudents([]);
          setIsEditMode(false);
          setEditingFee(null);
        }}
        width={800}
        footer={null}
      >
        <Form 
          form={feeDetailsForm}
          layout="vertical"
          onFinish={handleFeeDetailsSubmit}
        >
          {/* Show class and student info in edit mode */}
          {isEditMode && (
            <div style={{ 
              background: '#f5f5f5', 
              padding: '12px 16px', 
              borderRadius: '6px', 
              marginBottom: '16px',
              border: '1px solid #d9d9d9'
            }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Class: </Text>
                  <Text>{selectedClass ? classes.find(c => c.id === selectedClass)?.class_name + ' - Section ' + classes.find(c => c.id === selectedClass)?.section : 'N/A'}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Student: </Text>
                  <Text>{selectedStudentForFee ? allStudents.find(s => s.id === selectedStudentForFee)?.first_name + ' ' + allStudents.find(s => s.id === selectedStudentForFee)?.last_name : 'N/A'}</Text>
                </Col>
              </Row>
            </div>
          )}
          
          <Row gutter={16}>
            {!isEditMode && (
              <Col span={12}>
                <Form.Item
                  label="Class"
                  name="class_id"
                  rules={[{ required: true, message: 'Please select class' }]}
                >
                  <Select
                    placeholder="Select class"
                    loading={classesLoading}
                    onChange={handleClassChange}
                    notFoundContent={classesLoading ? <span>Loading classes...</span> : <span>No classes found</span>}
                  >
                    {classes.map(cls => (
                      <Option key={cls.id} value={cls.id}>
                        {cls.class_name} - Section {cls.section}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}
            <Col span={isEditMode ? 24 : 12}>
              <Form.Item
                label="Student"
                name="student_id"
                rules={[{ required: !isEditMode, message: 'Please select student' }]}
              >
                <Select
                  placeholder={
                    isEditMode ? 
                      "Student (cannot be changed)" :
                      selectedClass ? 
                        (loadingClassStudents ? "Loading students..." : `Select student (${classStudents.length} available)`) : 
                        "Please select a class first"
                  }
                  loading={loadingClassStudents}
                  disabled={!selectedClass || isEditMode}
                  onChange={handleStudentChange}
                  notFoundContent={
                    isEditMode ?
                      <span>Student information</span> :
                    !selectedClass ? 
                      <span>Please select a class first</span> : 
                      loadingClassStudents ? 
                        <span>Loading students...</span> : 
                        <span>No students found in this class</span>
                  }
                >
                  {isEditMode ? (
                    <Option disabled value={selectedStudentForFee}>
                      Student (cannot be changed)
                    </Option>
                  ) : loadingClassStudents ? (
                    <Option disabled>
                      <span style={{ color: '#999' }}>Loading students...</span>
                    </Option>
                  ) : (
                    classStudents.map(student => (
                      <Option key={student.id} value={student.id}>
                        {`${student.first_name} ${student.last_name} - ${student.student_profile?.student_id || student.id}`}
                      </Option>
                    ))
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fee_type"
                label="Fee Type"
                rules={[{ required: true, message: 'Please select or enter fee type!' }]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Select or enter fee type"
                  dropdownRender={menu => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Form.Item
                        style={{ margin: '0 8px 4px' }}
                      >
                        <Input
                          placeholder="Add new fee type"
                          onPressEnter={e => {
                            e.preventDefault();
                            const value = e.target.value;
                            if (value) {
                              const newOption = { value, label: value };
                              // Add to options if not exists
                              const options = feeDetailsForm.getFieldValue('fee_type_options') || [];
                              if (!options.find(opt => opt.value === value)) {
                                feeDetailsForm.setFieldsValue({
                                  fee_type_options: [...options, newOption]
                                });
                              }
                              feeDetailsForm.setFieldsValue({
                                fee_type: value
                              });
                            }
                          }}
                        />
                      </Form.Item>
                    </>
                  )}
                >
                  <Option value="tuition">Tuition Fee</Option>
                  <Option value="transport">Transport Fee</Option>
                  <Option value="library">Library Fee</Option>
                  <Option value="sports">Sports Fee</Option>
                  <Option value="books">Books Fee</Option>
                  <Option value="joining">Joining Fee</Option>
                  <Option value="anniversary">Anniversary Fee</Option>
                  <Option value="special">Special Fee</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Total Amount"
                rules={[{ required: true, message: 'Please enter amount!' }]}
              >
                <Input prefix="₹" type="number" step="0.01" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="scholarship_amount"
                label="Scholarship Amount"
                initialValue={0}
              >
                <Input 
                  prefix="₹" 
                  type="number" 
                  step="0.01" 
                  onChange={(e) => {
                    const amount = feeDetailsForm.getFieldValue('amount');
                    const period = feeDetailsForm.getFieldValue('period');
                    const scholarship = parseFloat(e.target.value) || 0;
                    if (amount && period) {
                      let terms = 1;
                      switch(period) {
                        case 'monthly':
                          terms = 12;
                          break;
                        case 'quarterly':
                          terms = 4;
                          break;
                        case 'half_yearly':
                          terms = 2;
                          break;
                        case 'yearly':
                          terms = 1;
                          break;
                      }
                      const payableAmount = amount - scholarship;
                      const amountPerTerm = (payableAmount / terms).toFixed(2);
                      feeDetailsForm.setFieldsValue({
                        terms,
                        amount_per_term: amountPerTerm
                      });
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="term_start"
                label="Term Start Month"
                initialValue={4}
                rules={[{ required: true, message: 'Please select term start month!' }]}
              >
                <Select>
                  <Option value={1}>January</Option>
                  <Option value={2}>February</Option>
                  <Option value={3}>March</Option>
                  <Option value={4}>April</Option>
                  <Option value={5}>May</Option>
                  <Option value={6}>June</Option>
                  <Option value={7}>July</Option>
                  <Option value={8}>August</Option>
                  <Option value={9}>September</Option>
                  <Option value={10}>October</Option>
                  <Option value={11}>November</Option>
                  <Option value={12}>December</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="term_end"
                label="Term End Month"
                initialValue={3}
                rules={[{ required: true, message: 'Please select term end month!' }]}
              >
                <Select>
                  <Option value={1}>January</Option>
                  <Option value={2}>February</Option>
                  <Option value={3}>March</Option>
                  <Option value={4}>April</Option>
                  <Option value={5}>May</Option>
                  <Option value={6}>June</Option>
                  <Option value={7}>July</Option>
                  <Option value={8}>August</Option>
                  <Option value={9}>September</Option>
                  <Option value={10}>October</Option>
                  <Option value={11}>November</Option>
                  <Option value={12}>December</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="period"
                label="Fee Period"
                rules={[{ required: true, message: 'Please select period!' }]}
              >
                <Select onChange={(value) => {
                  const amount = feeDetailsForm.getFieldValue('amount');
                  const scholarship = feeDetailsForm.getFieldValue('scholarship_amount') || 0;
                  if (amount) {
                    let terms = 1;
                    switch(value) {
                      case 'monthly':
                        terms = 12;
                        break;
                      case 'quarterly':
                        terms = 4;
                        break;
                      case 'half_yearly':
                        terms = 2;
                        break;
                      case 'yearly':
                        terms = 1;
                        break;
                    }
                    const payableAmount = amount - scholarship;
                    const amountPerTerm = (payableAmount / terms).toFixed(2);
                    feeDetailsForm.setFieldsValue({
                      terms,
                      amount_per_term: amountPerTerm
                    });
                  }
                }}>
                  <Option value="monthly">Monthly</Option>
                  <Option value="quarterly">Quarterly</Option>
                  <Option value="half_yearly">Half Yearly</Option>
                  <Option value="yearly">Yearly</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount_per_term"
                label="Amount per Term"
              >
                <Input prefix="₹" type="number" step="0.01" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="terms"
                label="Number of Terms"
              >
                <Input type="number" disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount_per_term"
                label="Amount per Term"
              >
                <Input prefix="₹" type="number" step="0.01" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="remarks"
            label="Remarks"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditMode ? 'Update Fee Details' : 'Add Fee Details'}
              </Button>
              <Button 
                onClick={() => {
                  setFeeDetailsModalVisible(false);
                  feeDetailsForm.resetFields();
                  setSelectedClass(null);
                  setSelectedStudentForFee(null);
                  setClassStudents([]);
                  setIsEditMode(false);
                  setEditingFee(null);
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>


      {/* View Fee Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Fee Record Details
          </Space>
        }
        visible={viewFeeModalVisible}
        onCancel={() => {
          setViewFeeModalVisible(false);
          setViewingFee(null);
        }}
        width={700}
        footer={null}
      >
        {viewingFee ? (
          <div style={{ padding: 8 }}>
            <Row gutter={16}>
              <Col span={12}><b>Fee Type:</b> {viewingFee.fee_type}</Col>
              <Col span={12}><b>Status:</b> {viewingFee.fee_status}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>Period:</b> {viewingFee.fee_period}</Col>
              <Col span={12}><b>Number of Terms:</b> {viewingFee.number_of_terms}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>Total Amount:</b> ₹{parseFloat(viewingFee.total_amount).toLocaleString()}</Col>
              <Col span={12}><b>Scholarship Amount:</b> ₹{parseFloat(viewingFee.scholarship_amount).toLocaleString()}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>Payable Amount:</b> ₹{parseFloat(viewingFee.payable_amount).toLocaleString()}</Col>
              <Col span={12}><b>Amount per Term:</b> ₹{parseFloat(viewingFee.amount_per_term).toLocaleString()}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>Term Start:</b> {viewingFee.term_start}</Col>
              <Col span={12}><b>Term End:</b> {viewingFee.term_end}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>Remarks:</b> {viewingFee.remarks}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>Created At:</b> {viewingFee.created_at}</Col>
              <Col span={12}><b>Updated At:</b> {viewingFee.updated_at}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>Student ID:</b> {viewingFee.student}</Col>
              <Col span={12}><b>User ID:</b> {viewingFee.user}</Col>
            </Row>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </Modal>

      {/* View Payment Details Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Payment Details
          </Space>
        }
        visible={viewPaymentModalVisible}
        onCancel={() => {
          setViewPaymentModalVisible(false);
          setViewingPayment(null);
        }}
        width={700}
        footer={[
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setViewPaymentModalVisible(false);
              if (viewingPayment) {
                handleEditPayment(viewingPayment);
              }
            }}
          >
            Edit Payment
          </Button>,
          <Button
            key="close"
            onClick={() => {
              setViewPaymentModalVisible(false);
              setViewingPayment(null);
            }}
          >
            Close
          </Button>
        ]}
      >
        {viewingPayment ? (
          <div style={{ padding: 8 }}>
            <Row gutter={16}>
              <Col span={12}><b>Payment ID:</b> {viewingPayment.id}</Col>
              <Col span={12}><b>Student ID:</b> {viewingPayment.student}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>Student Name:</b> {viewingPayment.student_name}</Col>
              <Col span={12}><b>Fee ID:</b> {viewingPayment.fee}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>Fee Type:</b> {viewingPayment.fee_type}</Col>
              <Col span={12}><b>Amount:</b> ₹{parseFloat(viewingPayment.amount).toLocaleString()}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>Payment Mode:</b> {viewingPayment.payment_mode}</Col>
              <Col span={12}><b>Date:</b> {viewingPayment.date || viewingPayment.payment_date}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>Transaction ID:</b> {viewingPayment.transaction_id || 'N/A'}</Col>
              <Col span={12}><b>Status:</b> {viewingPayment.status || 'N/A'}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}><b>Remarks:</b> {viewingPayment.remarks || 'No remarks'}</Col>
            </Row>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </Modal>

      <style>
        {`
          .fee-management-page {
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 0;
            overflow: hidden;
            margin: 0;
            border-radius: 16px;
            background: #ffffff;
            box-shadow: 0 4px 20px rgba(159, 179, 223, 0.15);
            border: 1px solid rgba(159, 179, 223, 0.2);
          }

          .fee-management-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            border-bottom: 1px solid #f0f0f0;
            background: #ffffff;
          }

          .page-title {
            margin: 0 !important;
            color: #7B83EB !important;
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 20px;
            font-weight: 600;
            padding-top: 2px;
          }

          .fee-management-table {
            flex: 1;
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #f0f0f0;
            height: 100%;
          }

          .fee-management-table .ant-table {
            border-radius: 8px;
            overflow: visible;
          }

          .fee-management-table .ant-table-container {
            border-radius: 8px;
            overflow: visible;
          }

          .fee-management-table .ant-table-body {
            overflow-y: auto !important;
            overflow-x: auto !important;
            margin-right: 1px;
          }

          .fee-management-table .ant-spin-nested-loading {
            height: 100%;
          }

          .fee-management-table .ant-spin-container {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .fee-management-table .ant-table-placeholder {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .fee-management-table .ant-spin {
            max-height: none;
          }

          .fee-management-table .ant-spin-blur {
            opacity: 0.5;
            filter: blur(1px);
            pointer-events: none;
          }

          .fee-management-table .ant-spin-blur::after {
            opacity: 0.4;
            background: #fff;
          }

          .fee-management-table .ant-table-thead > tr > th {
            background: rgba(123, 131, 235, 0.1) !important;
            color: #7B83EB !important;
            font-weight: 600;
            border-bottom: 1px solid #f0f0f0;
            padding: 8px 12px !important;
            white-space: nowrap;
            height: 40px;
            line-height: 1.2;
            font-size: 12px;
            min-width: 100px;
          }

          .fee-management-table .ant-table-tbody > tr > td {
            padding: 8px 12px !important;
            white-space: nowrap;
            border-bottom: 1px solid #f0f0f0;
            height: 50px;
            line-height: 1.3;
            font-size: 12px;
            vertical-align: top;
          }

          .fee-management-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none;
          }

          .fee-management-table .ant-table-cell {
            padding: 8px 12px !important;
          }

          /* Specific styling for fee details table */
          .fee-management-table .ant-table-tbody > tr > td .ant-tag {
            margin: 1px 2px;
            font-size: 10px;
            padding: 1px 4px;
            line-height: 1.2;
          }

          .fee-management-table .ant-table-tbody > tr > td div {
            line-height: 1.3;
          }

          .fee-management-table .ant-table-tbody > tr > td .ant-space {
            display: flex;
            align-items: center;
          }

          .fee-management-table .ant-table-cell .ant-tag {
            margin: 0;
            padding: 4px 8px;
            font-size: 13px;
            height: 24px;
            line-height: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
          }

          .fee-management-table .ant-table-cell .ant-btn {
            padding: 0 4px;
            height: 22px;
            font-size: 12px;
          }

          .fee-management-table .ant-table-cell .ant-avatar {
            width: 22px;
            height: 22px;
            line-height: 22px;
            font-size: 12px;
          }

          .fee-management-table .ant-table-pagination {
            margin: 16px 0 !important;
            padding: 8px 8px !important;
            height: 32px;
            border-top: 1px solid #f0f0f0;
            background: #ffffff;
          }

          .fee-management-table .ant-pagination-item {
            min-width: 24px;
            height: 24px;
            line-height: 22px;
            font-size: 12px;
            margin: 0 4px;
          }

          .fee-management-table .ant-pagination-prev .ant-pagination-item-link,
          .fee-management-table .ant-pagination-next .ant-pagination-item-link {
            min-width: 24px;
            height: 24px;
            line-height: 22px;
            font-size: 12px;
          }

          .fee-management-table .ant-pagination-options {
            margin-left: 8px;
          }

          .fee-management-table .ant-pagination-options-size-changer {
            margin-right: 0;
          }

          .fee-management-table .ant-select-selector {
            height: 24px !important;
            line-height: 22px !important;
            padding: 0 8px !important;
          }

          .fee-management-table .ant-select-selection-item {
            line-height: 22px !important;
            font-size: 12px;
          }

          .fee-management-table .ant-pagination-item-active {
            background: #7B83EB !important;
            border-color: #7B83EB !important;
          }

          .fee-management-table .ant-pagination-item-active a {
            color: white !important;
          }

          .fee-management-table .ant-pagination-item:hover {
            border-color: #7B83EB !important;
          }

          .fee-management-table .ant-pagination-prev:hover .ant-pagination-item-link,
          .fee-management-table .ant-pagination-next:hover .ant-pagination-item-link {
            border-color: #7B83EB !important;
            color: #7B83EB !important;
          }

          .fee-management-table .ant-tabs-nav {
            background: #ffffff;
            border-bottom: 1px solid rgba(0, 0, 0, 0.04);
            margin-bottom: 16px;
            padding: 0 4px;
            position: relative;
          }

          .fee-management-table .ant-tabs-tab {
            color: #666666;
            font-weight: 500;
            padding: 12px 20px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 15px;
            position: relative;
            margin: 0 2px;
            border-radius: 8px 8px 0 0;
          }

          .fee-management-table .ant-tabs-tab:hover {
            color: #7B83EB;
            background: rgba(123, 131, 235, 0.04);
          }

          .fee-management-table .ant-tabs-tab-active {
            color: #7B83EB;
            font-weight: 600;
            background: rgba(123, 131, 235, 0.08);
          }

          .fee-management-table .ant-tabs-ink-bar {
            display: none;
          }

          .fee-management-table .ant-tabs-tab-active::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            box-shadow: 0 -4px 12px rgba(123, 131, 235, 0.1);
            border-radius: 8px 8px 0 0;
            pointer-events: none;
          }

          .fee-management-table .ant-tabs-nav-wrap::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 100%;
            background: linear-gradient(90deg, 
              rgba(123, 131, 235, 0.03) 0%, 
              rgba(123, 131, 235, 0) 50%, 
              rgba(123, 131, 235, 0.03) 100%
            );
            pointer-events: none;
          }

          @media (max-width: 768px) {
            .fee-management-header {
              flex-direction: column;
              align-items: stretch;
              gap: 16px;
            }

            .fee-management-table .ant-tabs-tab {
              padding: 10px 16px;
              font-size: 14px;
            }
            
            .fee-management-table .ant-tabs-nav {
              margin-bottom: 16px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default FeeManagement; 
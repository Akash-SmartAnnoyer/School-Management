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
    status: undefined
  });
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
  const [editFeeModalVisible, setEditFeeModalVisible] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [editFeeForm] = Form.useForm();
  const [viewFeeModalVisible, setViewFeeModalVisible] = useState(false);
  const [viewingFee, setViewingFee] = useState(null);

  // Get unique classes from students
  const uniqueClasses = [...new Set(allStudents.map(student => student.profile?.classroom_id))];

  useEffect(() => {
    loadData();
  }, [activeTab, searchText, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === '1') {
        // Load student fee tracking data
        const response = await feeService.getStudentFees({
          search: searchText,
          class: filters.class,
          status: filters.status
        });
        if (response.success) {
          setStudents(response.data);
        } else {
          messageApi.error(response.error || 'Failed to load student fees');
        }
      } else if (activeTab === '2') {
        // Load payment records
        const response = await feeService.getPayments({
          search: searchText,
          class: filters.class
        });
        if (response.success) {
          setPayments(response.data);
        } else {
          messageApi.error(response.error || 'Failed to load payments');
        }
      } else if (activeTab === '3') {
        // Load fee details
        const response = await api.fee.getFeeDues(searchText ? `?search=${searchText}` : '');
        if (response.success) {
          // Transform the data to include student names
          const feeDetails = await Promise.all(response.data.map(async (fee) => {
            const student = allStudents.find(s => s.id === fee.student_id);
            return {
              ...fee,
              student: student ? `${student.first_name} ${student.last_name}` : 'Unknown Student',
              student_id: student?.student_profile?.student_id || 'N/A'
            };
          }));
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

  const handleViewHistory = async (student) => {
    try {
      setLoading(true);
      const response = await feeService.getStudentPaymentHistory(student.id);
      if (response.success) {
        setSelectedStudent({
          ...student,
          payment_history: response.data
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

  const handleNewPayment = () => {
    setPaymentModalVisible(true);
  };

  const handlePaymentSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await feeService.createPayment({
        fee_due: values.fee_due,
        amount: parseFloat(values.amount),
        payment_mode: values.payment_mode.toLowerCase(),
        payment_date: values.payment_date.format('YYYY-MM-DD'),
        remarks: values.remarks
      });
      
      if (response.success) {
        messageApi.success('Payment recorded successfully');
        setPaymentModalVisible(false);
        loadData(); // Reload both tables
      } else {
        messageApi.error(response.error || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      if (error.response?.data?.non_field_errors) {
        messageApi.error(error.response.data.non_field_errors[0]);
      } else {
        messageApi.error('Failed to record payment');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    form.setFieldsValue({
      ...payment,
      payment_date: moment(payment.payment_date)
    });
    setEditPaymentModalVisible(true);
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
          const response = await feeService.deletePayment(payment.id);
          if (response.success) {
            messageApi.success('Payment deleted successfully');
            loadData();
          } else {
            messageApi.error(response.error || 'Failed to delete payment');
          }
        } catch (error) {
          console.error('Error deleting payment:', error);
          messageApi.error('Failed to delete payment');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleEditSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await feeService.updatePayment(editingPayment.id, {
        ...values,
        payment_date: values.payment_date.format('YYYY-MM-DD')
      });
      
      if (response.success) {
        messageApi.success('Payment updated successfully');
        setEditPaymentModalVisible(false);
        loadData();
      } else {
        messageApi.error(response.error || 'Failed to update payment');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      messageApi.error('Failed to update payment');
    } finally {
      setLoading(false);
    }
  };

  const handleNewFeeDetails = () => {
    setFeeDetailsModalVisible(true);
  };

  const handleFeeDetailsSubmit = async (values) => {
    try {
      setLoading(true);
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
        messageApi.success('Fee record created successfully');
        setFeeDetailsModalVisible(false);
        feeDetailsForm.resetFields();
        setSelectedClass(null);
        setSelectedStudentForFee(null);
        setClassStudents([]);
        loadData();
      } else {
        messageApi.error(response.error || 'Failed to create fee record');
      }
    } catch (error) {
      console.error('Error creating fee record:', error);
      if (error.message.includes('unique set')) {
        messageApi.error('A fee record already exists for this student and fee type combination.');
      } else {
        messageApi.error('Failed to create fee record');
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
      const response = await api.student.getStudentsByClass(classId);
      if (response.success) {
        const students = response.data.results || response.data || [];
        setClassStudents(students);
        if (students.length === 0) {
          messageApi.warning('No students found in this class');
        }
      } else {
        messageApi.error(response.error || 'Failed to load students for this class');
        setClassStudents([]);
      }
    } catch (error) {
      console.error('Error loading students by class:', error);
      messageApi.error('Failed to load students for this class. Please try again.');
      setClassStudents([]);
    } finally {
      setLoadingClassStudents(false);
    }
  };

  const handleStudentChange = (studentId) => {
    setSelectedStudentForFee(studentId);
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

  const handleEditFee = (fee) => {
    setEditingFee(fee);
    editFeeForm.setFieldsValue({
      total_amount: parseFloat(fee.total_amount),
      scholarship_amount: parseFloat(fee.scholarship_amount),
      fee_period: fee.fee_period,
      remarks: fee.remarks,
      term_start: fee.term_start,
      term_end: fee.term_end,
    });
    setEditFeeModalVisible(true);
  };

  const handleEditFeeSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await api.fee.updateFeeDue(editingFee.id, values);
      if (response.success) {
        messageApi.success('Fee record updated successfully');
        setEditFeeModalVisible(false);
        setEditingFee(null);
        editFeeForm.resetFields();
        loadData();
      } else {
        messageApi.error(response.error || 'Failed to update fee record');
      }
    } catch (error) {
      messageApi.error('Failed to update fee record');
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
                  title: 'Total Amount',
                  dataIndex: 'total_amount',
                  key: 'total_amount',
                  render: (amount) => (
                    <Text strong style={{ color: '#52c41a' }}>
                      ₹{parseFloat(amount).toLocaleString()}
                    </Text>
                  ),
                },
                {
                  title: 'Scholarship Amount',
                  dataIndex: 'scholarship_amount',
                  key: 'scholarship_amount',
                  render: (amount) => (
                    <Text strong style={{ color: '#faad14' }}>
                      ₹{parseFloat(amount).toLocaleString()}
                    </Text>
                  ),
                },
                {
                  title: 'Payable Amount',
                  dataIndex: 'payable_amount',
                  key: 'payable_amount',
                  render: (amount) => (
                    <Text strong style={{ color: '#1890ff' }}>
                      ₹{parseFloat(amount).toLocaleString()}
                    </Text>
                  ),
                },
                {
                  title: 'Period',
                  dataIndex: 'fee_period',
                  key: 'fee_period',
                  render: (period) => (
                    <Tag color="blue">{period}</Tag>
                  ),
                },
                {
                  title: 'Terms',
                  dataIndex: 'number_of_terms',
                  key: 'number_of_terms',
                  render: (terms) => (
                    <Tag color="purple">{terms} terms</Tag>
                  ),
                },
                {
                  title: 'Amount per Term',
                  dataIndex: 'amount_per_term',
                  key: 'amount_per_term',
                  render: (amount) => (
                    <Text strong style={{ color: '#1890ff' }}>
                      ₹{parseFloat(amount).toLocaleString()}
                    </Text>
                  ),
                },
                {
                  title: 'Status',
                  dataIndex: 'fee_status',
                  key: 'fee_status',
                  render: (status) => (
                    <Tag 
                      style={{ 
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        background: status === 'paid' ? '#f6ffed' : '#fff2f0',
                        color: status === 'paid' ? '#52c41a' : '#ff4d4f',
                        border: `1px solid ${status === 'paid' ? '#b7eb8f' : '#ffccc7'}`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '24px',
                        lineHeight: '1',
                        margin: 0
                      }}
                    >
                      {status === 'paid' ? (
                        <CheckCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#52c41a' }} />
                      ) : (
                        <CloseCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#ff4d4f' }} />
                      )} 
                      {status}
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
                      <Tooltip title="View">
                        <Button
                          type="default"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewFee(record)}
                          size="small"
                        >
                          View
                        </Button>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => handleEditFee(record)}
                          size="small"
                        >
                          Edit
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
                <Col span={8}>
                  <Statistic
                    title="Total Due"
                    value={selectedStudent.total_due}
                    prefix="₹"
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Due Months"
                    value={selectedStudent.due_months}
                    suffix="months"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Class/Section"
                    value={`${selectedStudent.class} - ${selectedStudent.section}`}
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
                  title: 'Period',
                  dataIndex: 'period',
                  key: 'period',
                  render: (text) => (
                    <Tag color="blue">
                      {text}
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
        onCancel={() => setPaymentModalVisible(false)}
        width={800}
        footer={null}
      >
        <Form 
          layout="vertical"
          onFinish={handlePaymentSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Fee Due"
                name="fee_due"
                rules={[{ required: true, message: 'Please select fee due' }]}
              >
                <Select
                  showSearch
                  placeholder="Select fee due"
                  optionFilterProp="children"
                >
                  {students
                    .filter(student => student.status === 'Unpaid')
                    .map(student => (
                      <Option key={student.id} value={student.id}>
                        {student.name} - ₹{student.total_due} ({student.due_months} months)
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Amount"
                name="amount"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <Input prefix="₹" type="number" step="0.01" />
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
                label="Period"
                name="period"
                rules={[{ required: true, message: 'Please enter period' }]}
              >
                <Input placeholder="e.g., January 2024" />
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
            <SettingOutlined />
            Add Fee Details
          </Space>
        }
        visible={feeDetailsModalVisible}
        onCancel={() => {
          setFeeDetailsModalVisible(false);
          feeDetailsForm.resetFields();
          setSelectedClass(null);
          setSelectedStudentForFee(null);
          setClassStudents([]);
        }}
        width={800}
        footer={null}
      >
        <Form 
          form={feeDetailsForm}
          layout="vertical"
          onFinish={handleFeeDetailsSubmit}
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
            <Col span={12}>
              <Form.Item
                label="Student"
                name="student_id"
                rules={[{ required: true, message: 'Please select student' }]}
              >
                <Select
                  placeholder={
                    selectedClass ? 
                      (loadingClassStudents ? "Loading students..." : `Select student (${classStudents.length} available)`) : 
                      "Please select a class first"
                  }
                  loading={loadingClassStudents}
                  disabled={!selectedClass}
                  onChange={handleStudentChange}
                  notFoundContent={
                    !selectedClass ? 
                      <span>Please select a class first</span> : 
                      loadingClassStudents ? 
                        <span>Loading students...</span> : 
                        <span>No students found in this class</span>
                  }
                >
                  {loadingClassStudents ? (
                    <Option disabled>
                      <span style={{ color: '#999' }}>Loading students...</span>
                    </Option>
                  ) : (
                    classStudents.map(student => (
                      <Option key={student.id} value={student.id}>
                        {student.user ? 
                          `${student.user.first_name} ${student.user.last_name} - ${student.student_profile?.student_id || student.user.id}` :
                          `${student.first_name} ${student.last_name} - ${student.student_profile?.student_id || student.id}`
                        }
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
                Add Fee Details
              </Button>
              <Button 
                onClick={() => {
                  setFeeDetailsModalVisible(false);
                  feeDetailsForm.resetFields();
                  setSelectedClass(null);
                  setSelectedStudentForFee(null);
                  setClassStudents([]);
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Fee Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Edit Fee Record
          </Space>
        }
        visible={editFeeModalVisible}
        onCancel={() => {
          setEditFeeModalVisible(false);
          setEditingFee(null);
          editFeeForm.resetFields();
        }}
        width={800}
        footer={null}
      >
        <Form
          form={editFeeForm}
          layout="vertical"
          onFinish={handleEditFeeSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="total_amount"
                label="Total Amount"
                rules={[{ required: true, message: 'Please enter amount!' }]}
              >
                <Input prefix="₹" type="number" step="0.01" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="scholarship_amount"
                label="Scholarship Amount"
                initialValue={0}
              >
                <Input prefix="₹" type="number" step="0.01" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fee_period"
                label="Fee Period"
                rules={[{ required: true, message: 'Please select period!' }]}
              >
                <Select>
                  <Option value="monthly">Monthly</Option>
                  <Option value="quarterly">Quarterly</Option>
                  <Option value="half yearly">Half Yearly</Option>
                  <Option value="yearly">Yearly</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="remarks"
                label="Remarks"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="term_start"
                label="Term Start Month"
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
            <Col span={12}>
              <Form.Item
                name="term_end"
                label="Term End Month"
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
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Fee Record
              </Button>
              <Button
                onClick={() => {
                  setEditFeeModalVisible(false);
                  setEditingFee(null);
                  editFeeForm.resetFields();
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
            padding: 4px 12px !important;
            white-space: nowrap;
            height: 32px;
            line-height: 1.2;
            font-size: 13px;
          }

          .fee-management-table .ant-table-tbody > tr > td {
            padding: 4px 12px !important;
            white-space: nowrap;
            border-bottom: 1px solid #f0f0f0;
            height: 32px;
            line-height: 1.2;
            font-size: 13px;
          }

          .fee-management-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none;
          }

          .fee-management-table .ant-table-cell {
            padding: 4px 12px !important;
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
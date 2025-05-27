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
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { MessageContext } from '../App';
import moment from 'moment';
import feeService from '../services/feeService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;

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
  const messageApi = useContext(MessageContext);

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
      } else {
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
        <Tag color="blue" icon={<TeamOutlined />}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      render: (text) => (
        <Tag color="cyan" icon={<FileTextOutlined />}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Due Months',
      dataIndex: 'due_months',
      key: 'due_months',
      render: (text) => (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
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
          color={status === 'Paid' ? 'success' : 'error'}
          icon={status === 'Paid' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
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
          <Tag color="blue">{record.class}</Tag>
          <Tag color="cyan">{record.section}</Tag>
        </Space>
      ),
    },
    {
      title: 'Fee Type',
      dataIndex: 'fee_type',
      key: 'fee_type',
      render: (type) => (
        <Tag color="purple" icon={<MoneyCollectOutlined />}>
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
          'Cash': <MoneyCollectOutlined />,
          'UPI': <CreditCardOutlined />,
          'Card': <BankOutlined />,
          'Bank Transfer': <WalletOutlined />
        };
        return (
          <Tag color="green" icon={icons[mode]}>
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
  ];

  return (
    <div className="fee-management-page">
      <Card className="fee-management-card">
        <div className="page-header">
          <Title level={3}>
            <DollarOutlined /> Fee Management
          </Title>
          <Space>
            <Search
              placeholder="Search..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="Filter by Class"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange('class', value)}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="1">Class 1</Option>
              <Option value="2">Class 2</Option>
              {/* Add more classes */}
            </Select>
            {activeTab === '1' && (
              <Select
                placeholder="Filter by Status"
                allowClear
                style={{ width: 150 }}
                onChange={(value) => handleFilterChange('status', value)}
                suffixIcon={<FilterOutlined />}
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
              >
                New Payment
              </Button>
            )}
          </Space>
        </div>

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
            />
          </TabPane>
        </Tabs>
      </Card>

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
        width={600}
        onClose={() => setHistoryDrawerVisible(false)}
        visible={historyDrawerVisible}
      >
        {selectedStudent && (
          <>
            <Card className="student-summary-card">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Total Due"
                    value={selectedStudent.total_due}
                    prefix="₹"
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Due Months"
                    value={selectedStudent.due_months}
                    suffix="months"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
              </Row>
            </Card>
            <Divider />
            <Timeline>
              {selectedStudent.payment_history?.map((payment, index) => (
                <Timeline.Item
                  key={index}
                  color="green"
                  dot={<CheckCircleOutlined />}
                >
                  <Card size="small" className="payment-history-card">
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text strong>{payment.fee_type}</Text>
                        <br />
                        <Text type="secondary">
                          Period: {payment.period}
                        </Text>
                        <br />
                        <Text type="secondary">
                          {moment(payment.payment_date).format('DD MMM YYYY')}
                        </Text>
                      </Col>
                      <Col>
                        <Text strong style={{ color: '#52c41a' }}>
                          ₹{parseFloat(payment.amount).toLocaleString()}
                        </Text>
                        <br />
                        <Tag color="green" icon={payment.payment_mode === 'upi' ? <CreditCardOutlined /> : <MoneyCollectOutlined />}>
                          {payment.payment_mode.toUpperCase()}
                        </Tag>
                      </Col>
                    </Row>
                    {payment.remarks && (
                      <Row style={{ marginTop: 8 }}>
                        <Col>
                          <Text type="secondary">
                            Remarks: {payment.remarks}
                          </Text>
                        </Col>
                      </Row>
                    )}
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
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
                  <Option value="upi">UPI</Option>
                  <Option value="netbanking">Net Banking</Option>
                  <Option value="cheque">Cheque</Option>
                  <Option value="creditcard">Credit Card</Option>
                  <Option value="cash">Cash</Option>
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

      <style>
        {`
          .fee-management-page {
            padding: 24px;
            background: #f0f2f5;
            min-height: 100vh;
          }

          .fee-management-card {
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }

          .page-header .ant-typography {
            margin: 0 !important;
          }

          .student-summary-card {
            margin-bottom: 24px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .payment-history-card {
            margin-bottom: 8px;
            border-radius: 4px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          }

          .ant-timeline-item-content {
            margin-left: 28px;
          }

          .ant-table-thead > tr > th {
            background: #fafafa;
            font-weight: 600;
          }

          .ant-tag {
            margin: 0;
          }

          .ant-drawer-header {
            background: #fafafa;
          }

          .ant-modal-header {
            background: #fafafa;
          }
        `}
      </style>
    </div>
  );
};

export default FeeManagement; 
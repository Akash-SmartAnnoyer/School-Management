import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  message,
  Tag,
  Statistic,
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { feeAPI } from '../../services/api';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const PaymentHistory = () => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [selectedFeeType, setSelectedFeeType] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await feeAPI.getPayments();
      setPayments(response.data.results || []);
    } catch (error) {
      message.error('Failed to fetch payment history');
      console.error('Error fetching payment history:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await feeAPI.getStudents();
      setStudents(response.data);
    } catch (error) {
      message.error('Failed to fetch students');
    }
  };

  const handleExportExcel = () => {
    message.info('Excel export functionality will be implemented soon');
  };

  const handleExportPDF = () => {
    message.info('PDF export functionality will be implemented soon');
  };

  const calculateTotalAmount = () => {
    return (filteredPayments || []).reduce((total, payment) => total + parseFloat(payment.amount), 0);
  };

  const calculatePaymentsByMode = (mode) => {
    return (filteredPayments || []).reduce((total, payment) => 
      payment.payment_mode === mode ? total + parseFloat(payment.amount) : total, 0);
  };

  const columns = [
    {
      title: 'Student',
      dataIndex: 'student',
      key: 'student',
      render: (studentId) => {
        const student = students.find(s => s.id === studentId);
        return student ? `${student.name} - ${student.class}` : 'N/A';
      }
    },
    {
      title: 'Fee Type',
      dataIndex: 'fee_type',
      key: 'fee_type'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₹${amount}`
    },
    {
      title: 'Payment Mode',
      dataIndex: 'payment_mode',
      key: 'payment_mode'
    },
    {
      title: 'Payment Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks'
    }
  ];

  const filteredPayments = (payments || []).filter(payment => {
    const matchesSearch = !searchText || 
      payment.student_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.fee_type?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesMode = !selectedPaymentMode || payment.payment_mode === selectedPaymentMode;
    
    const matchesDateRange = !dateRange || (
      moment(payment.payment_date).isSameOrAfter(dateRange[0], 'day') &&
      moment(payment.payment_date).isSameOrBefore(dateRange[1], 'day')
    );
    
    return matchesSearch && matchesMode && matchesDateRange;
  });

  return (
    <div>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col>
            <Input
              placeholder="Search by student name"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
          </Col>
          <Col>
            <Select
              placeholder="Filter by payment mode"
              style={{ width: 200 }}
              onChange={setSelectedPaymentMode}
              allowClear
            >
              <Option value="upi">UPI</Option>
              <Option value="net_banking">Net Banking</Option>
              <Option value="cheque">Cheque</Option>
              <Option value="credit_card">Credit Card</Option>
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="Filter by fee type"
              style={{ width: 200 }}
              onChange={setSelectedFeeType}
              allowClear
            >
              <Option value="tuition">Tuition</Option>
              <Option value="transport">Transport</Option>
              <Option value="library">Library</Option>
              <Option value="computer">Computer</Option>
              <Option value="sports">Sports</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker
              onChange={setDateRange}
              style={{ width: 300 }}
            />
          </Col>
          <Col>
            <Space>
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
              >
                Export to Excel
              </Button>
              <Button
                icon={<FilePdfOutlined />}
                onClick={handleExportPDF}
              >
                Export to PDF
              </Button>
            </Space>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Amount"
                value={calculateTotalAmount()}
                precision={2}
                prefix="₹"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Payments"
                value={filteredPayments.length}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="UPI Payments"
                value={calculatePaymentsByMode('upi')}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Other Payments"
                value={filteredPayments.length - calculatePaymentsByMode('upi')}
              />
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredPayments}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} payments`,
          }}
        />
      </Card>
    </div>
  );
};

export default PaymentHistory; 
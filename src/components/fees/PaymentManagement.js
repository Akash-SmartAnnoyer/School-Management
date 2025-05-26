import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Space,
  message,
  Card,
  Row,
  Col,
  Tag,
  Popconfirm,
} from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { feeAPI } from '../../services/api';
import moment from 'moment';
import { classAPI } from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const PaymentManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [unpaidFeeDues, setUnpaidFeeDues] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    fetchPayments();
    fetchUnpaidFeeDues();
    fetchStudents();
    fetchClassrooms();
  }, [selectedClass, selectedMonth]);

  const fetchPayments = async () => {
    try {
      const response = await feeAPI.getPayments();
      setPayments(response.data.results || []);
    } catch (error) {
      message.error('Failed to fetch payments');
      console.error('Error fetching payments:', error);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const response = await classAPI.getClasses();
      setClassrooms(response.data.results || []);
    } catch (error) {
      message.error('Failed to fetch classrooms');
      console.error('Error fetching classrooms:', error);
    }
  };

  const fetchUnpaidFeeDues = async () => {
    try {
      let queryParams = '';
      if (selectedClass) {
        queryParams += `classroom_id=${selectedClass}`;
      }
      if (selectedMonth) {
        queryParams += queryParams ? '&' : '';
        queryParams += `period=${selectedMonth.format('YYYY-MM')}`;
      }
      queryParams += queryParams ? '&' : '';
      queryParams += 'is_paid=false';
      const response = await feeAPI.getFeeDues(queryParams ? `?${queryParams}` : '');
      setUnpaidFeeDues(response.data.results || []);
    } catch (error) {
      message.error('Failed to fetch unpaid fee dues');
      console.error('Error fetching unpaid fee dues:', error);
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

  const handleCreatePayment = async (values) => {
    try {
      setLoading(true);
      const response = await feeAPI.createPayment({
        fee_due: values.fee_due,
        amount: values.amount,
        payment_mode: values.payment_mode,
        payment_date: values.payment_date.format('YYYY-MM-DD'),
        remarks: values.remarks
      });
      if (response.success) {
        message.success('Payment recorded successfully');
        setModalVisible(false);
        form.resetFields();
        fetchPayments();
        fetchUnpaidFeeDues();
      }
    } catch (error) {
      message.error(error.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (id) => {
    try {
      setLoading(true);
      const response = await feeAPI.deletePayment(id);
      if (response.success) {
        message.success('Payment deleted successfully');
        fetchPayments();
        fetchUnpaidFeeDues();
      }
    } catch (error) {
      message.error('Failed to delete payment');
    } finally {
      setLoading(false);
    }
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
      key: 'payment_date'
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to delete this payment?"
            onConfirm={() => handleDeletePayment(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const filteredPayments = (payments || []).filter(payment => {
    const matchesSearch = !searchText || 
      payment.student_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.fee_type?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesMode = !selectedPaymentMode || payment.payment_mode === selectedPaymentMode;
    
    return matchesSearch && matchesMode;
  });

  return (
    <div>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col>
            <Input
              placeholder="Search by student name or fee type"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
          </Col>
          <Col>
            <Select
              placeholder="Filter by classroom"
              style={{ width: 200 }}
              onChange={setSelectedClass}
              allowClear
            >
              {classrooms.map(classroom => (
                <Option key={classroom.id} value={classroom.id}>
                  {classroom.class_name} - {classroom.section}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <DatePicker.MonthPicker
              placeholder="Filter by month"
              onChange={setSelectedMonth}
              style={{ width: 200 }}
            />
          </Col>
          <Col>
            <Select
              placeholder="Payment Mode"
              value={selectedPaymentMode}
              onChange={setSelectedPaymentMode}
              style={{ width: 200 }}
              allowClear
            >
              <Option value="upi">UPI</Option>
              <Option value="net_banking">Net Banking</Option>
              <Option value="cheque">Cheque</Option>
              <Option value="credit_card">Credit Card</Option>
            </Select>
          </Col>
          <Col>
            <DatePicker.RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: 300 }}
            />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              Record Payment
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredPayments}
          loading={loading}
          rowKey="id"
        />
      </Card>

      <Modal
        title="Record Payment"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleCreatePayment}
          layout="vertical"
        >
          <Form.Item
            name="fee_due"
            label="Fee Due"
            rules={[{ required: true, message: 'Please select a fee due' }]}
          >
            <Select placeholder="Select fee due">
              {unpaidFeeDues.map(feeDue => (
                <Option key={feeDue.id} value={feeDue.id}>
                  {`${feeDue.student_first_name} ${feeDue.student_last_name} - ${feeDue.fee_type} (₹${parseFloat(feeDue.amount).toFixed(2)})`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter an amount' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="payment_mode"
            label="Payment Mode"
            rules={[{ required: true, message: 'Please select a payment mode' }]}
          >
            <Select placeholder="Select payment mode">
              <Option value="upi">UPI</Option>
              <Option value="net_banking">Net Banking</Option>
              <Option value="cheque">Cheque</Option>
              <Option value="credit_card">Credit Card</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="payment_date"
            label="Payment Date"
            rules={[{ required: true, message: 'Please select a payment date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="remarks"
            label="Remarks"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Record Payment
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaymentManagement; 
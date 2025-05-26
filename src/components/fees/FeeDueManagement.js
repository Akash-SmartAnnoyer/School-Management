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
  Popconfirm,
} from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { feeAPI, studentAPI } from '../../services/api';
import moment from 'moment';

const { Option } = Select;

const FeeDueManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [feeDues, setFeeDues] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    fetchFeeDues();
    fetchStudents();
  }, []);

  const fetchFeeDues = async () => {
    try {
      const response = await feeAPI.getFeeDues();
      setFeeDues(response.data.results || []);
    } catch (error) {
      message.error('Failed to fetch fee dues');
      console.error('Error fetching fee dues:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getStudents();
      setStudents(response.data.results || []);
    } catch (error) {
      message.error('Failed to fetch students');
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateFeeDue = async (values) => {
    try {
      setLoading(true);
      const response = await feeAPI.createFeeDue({
        student: values.student,
        period: values.period.format('YYYY-MM'),
        fee_type: values.fee_type,
        amount: values.amount
      });
      if (response.success) {
        message.success('Fee due created successfully');
        setModalVisible(false);
        form.resetFields();
        fetchFeeDues();
      }
    } catch (error) {
      message.error(error.message || 'Failed to create fee due');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeeDue = async (id) => {
    try {
      setLoading(true);
      const response = await feeAPI.deleteFeeDue(id);
      if (response.success) {
        message.success('Fee due deleted successfully');
        fetchFeeDues();
      }
    } catch (error) {
      message.error('Failed to delete fee due');
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
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      sorter: (a, b) => moment(a.period).unix() - moment(b.period).unix()
    },
    {
      title: 'Fee Type',
      dataIndex: 'fee_type',
      key: 'fee_type',
      render: (text) => text.charAt(0).toUpperCase() + text.slice(1)
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₹${parseFloat(amount).toFixed(2)}`,
      sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount)
    },
    {
      title: 'Status',
      dataIndex: 'is_paid',
      key: 'is_paid',
      render: (isPaid) => (
        <span style={{ color: isPaid ? 'green' : 'red' }}>
          {isPaid ? 'Paid' : 'Unpaid'}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteFeeDue(record.id)}
            disabled={record.is_paid}
          />
        </Space>
      )
    }
  ];

  const filteredFeeDues = (feeDues || []).filter(feeDue => {
    const matchesSearch = !searchText || 
      feeDue.student_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      feeDue.fee_type?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || feeDue.is_paid === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col>
            <Input
              placeholder="Search by student name or fee type"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
          </Col>
          <Col>
            <Select
              placeholder="Filter by status"
              style={{ width: 200 }}
              onChange={(value) => setStatusFilter(value)}
              allowClear
            >
              <Option value={true}>Paid</Option>
              <Option value={false}>Unpaid</Option>
            </Select>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              Create Fee Due
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredFeeDues}
          loading={loading}
          rowKey="id"
        />
      </Card>

      <Modal
        title="Create Fee Due"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateFeeDue}
        >
          <Form.Item
            name="student"
            label="Student"
            rules={[{ required: true, message: 'Please select a student' }]}
          >
            <Select placeholder="Select student">
              {students.map(student => (
                <Option key={student.id} value={student.id}>
                  {student.name} - {student.class}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="period"
            label="Period"
            rules={[{ required: true, message: 'Please select a period' }]}
          >
            <DatePicker.MonthPicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="fee_type"
            label="Fee Type"
            rules={[{ required: true, message: 'Please select a fee type' }]}
          >
            <Select placeholder="Select fee type">
              <Option value="tuition">Tuition</Option>
              <Option value="transport">Transport</Option>
              <Option value="library">Library</Option>
              <Option value="computer">Computer</Option>
              <Option value="sports">Sports</Option>
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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FeeDueManagement; 
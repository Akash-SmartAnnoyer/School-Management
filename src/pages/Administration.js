import React, { useState, useEffect } from 'react';
import { Tabs, Card, Table, Button, Space, Form, Input, Select, DatePicker, List, Tag, Upload, Modal, message, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, CarOutlined, BookOutlined, HomeOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { subscribeToCollection, getStudents, getClasses, getTeachers, addUser, updateUser, deleteUser } from '../firebase/services';

const { TabPane } = Tabs;
const { Dragger } = Upload;
const { Option } = Select;

const Administration = () => {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const unsubscribeUsers = subscribeToCollection('users', (data) => {
      setUsers(data);
    });
    const unsubscribeStudents = subscribeToCollection('students', (data) => {
      setStudents(data);
    });
    const unsubscribeClasses = subscribeToCollection('classes', (data) => {
      setClasses(data);
    });
    const unsubscribeTeachers = subscribeToCollection('teachers', (data) => {
      setTeachers(data);
    });
    return () => {
      unsubscribeUsers();
      unsubscribeStudents();
      unsubscribeClasses();
      unsubscribeTeachers();
    };
  }, []);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      message.success('User deleted successfully');
    } catch (error) {
      message.error('Error deleting user');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const userData = {
        ...values,
        createdAt: new Date().toISOString()
      };

      if (editingUser) {
        await updateUser(editingUser.id, userData);
        message.success('User updated successfully');
      } else {
        await addUser(userData);
        message.success('User added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Error saving user');
    }
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={
          role === 'Admin' ? 'red' :
          role === 'Teacher' ? 'blue' :
          role === 'Staff' ? 'green' :
          'orange'
        }>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  // Fee Management
  const feeColumns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Fee Type',
      dataIndex: 'feeType',
      key: 'feeType',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} />
          <Button icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  // Inventory Management
  const inventoryColumns = [
    {
      title: 'Item ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'in_stock' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} />
          <Button icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  // Transport Routes
  const routes = [
    {
      id: 1,
      name: 'Route A',
      driver: 'John Smith',
      vehicle: 'Bus 101',
      capacity: 40,
      status: 'active',
    },
    {
      id: 2,
      name: 'Route B',
      driver: 'Sarah Johnson',
      vehicle: 'Bus 102',
      capacity: 35,
      status: 'active',
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Users"
              value={users.length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Users"
              value={users.filter(u => u.status === 'Active').length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Administrators"
              value={users.filter(u => u.role === 'Admin').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="User Management"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add User
          </Button>
        }
      >
        <Table columns={columns} dataSource={users} rowKey="id" />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input full name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role!' }]}
          >
            <Select>
              <Option value="Admin">Administrator</Option>
              <Option value="Teacher">Teacher</Option>
              <Option value="Staff">Staff</Option>
              <Option value="Parent">Parent</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[{ required: true, message: 'Please select permissions!' }]}
          >
            <Select mode="multiple" placeholder="Select permissions">
              <Option value="manage_users">Manage Users</Option>
              <Option value="manage_students">Manage Students</Option>
              <Option value="manage_teachers">Manage Teachers</Option>
              <Option value="manage_classes">Manage Classes</Option>
              <Option value="manage_attendance">Manage Attendance</Option>
              <Option value="manage_finance">Manage Finance</Option>
              <Option value="view_reports">View Reports</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Fee Management" key="1">
          <Card
            title="Fee Records"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Add Fee Record
              </Button>
            }
          >
            <Table columns={feeColumns} dataSource={[]} rowKey="studentId" />
          </Card>
        </TabPane>

        <TabPane tab="Inventory Management" key="2">
          <Card
            title="Inventory"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Add Item
              </Button>
            }
          >
            <Table columns={inventoryColumns} dataSource={[]} rowKey="id" />
          </Card>
        </TabPane>

        <TabPane tab="Transport Management" key="3">
          <Card
            title="Transport Routes"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Add Route
              </Button>
            }
          >
            <List
              dataSource={routes}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button key="edit" icon={<EditOutlined />} />,
                    <Button key="delete" icon={<DeleteOutlined />} danger />,
                  ]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={`Driver: ${item.driver} | Vehicle: ${item.vehicle} | Capacity: ${item.capacity}`}
                    avatar={<CarOutlined style={{ fontSize: 24 }} />}
                  />
                  <Tag color={item.status === 'active' ? 'green' : 'red'}>
                    {item.status}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="Library Management" key="4">
          <Card title="Library">
            <Form layout="vertical">
              <Form.Item label="Book Title">
                <Input />
              </Form.Item>
              <Form.Item label="Author">
                <Input />
              </Form.Item>
              <Form.Item label="ISBN">
                <Input />
              </Form.Item>
              <Form.Item label="Category">
                <Select>
                  <Select.Option value="fiction">Fiction</Select.Option>
                  <Select.Option value="non-fiction">Non-Fiction</Select.Option>
                  <Select.Option value="textbook">Textbook</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Quantity">
                <Input type="number" />
              </Form.Item>
              <Form.Item>
                <Button type="primary">Add Book</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Hostel Management" key="5">
          <Card title="Hostel">
            <Form layout="vertical">
              <Form.Item label="Room Number">
                <Input />
              </Form.Item>
              <Form.Item label="Capacity">
                <Input type="number" />
              </Form.Item>
              <Form.Item label="Type">
                <Select>
                  <Select.Option value="boys">Boys Hostel</Select.Option>
                  <Select.Option value="girls">Girls Hostel</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Facilities">
                <Select mode="multiple">
                  <Select.Option value="ac">AC</Select.Option>
                  <Select.Option value="heater">Heater</Select.Option>
                  <Select.Option value="wifi">WiFi</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary">Add Room</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Calendar & Events" key="6">
          <Card title="Event Calendar">
            <Form layout="vertical">
              <Form.Item label="Event Title">
                <Input />
              </Form.Item>
              <Form.Item label="Event Type">
                <Select>
                  <Select.Option value="academic">Academic</Select.Option>
                  <Select.Option value="sports">Sports</Select.Option>
                  <Select.Option value="cultural">Cultural</Select.Option>
                  <Select.Option value="holiday">Holiday</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Description">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item>
                <Button type="primary">Add Event</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Administration; 
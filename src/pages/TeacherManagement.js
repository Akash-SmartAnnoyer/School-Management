import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Typography,
  Popconfirm,
  Tag,
  Tooltip,
  Drawer,
  Descriptions,
  Avatar
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, KeyOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const TeacherDetailsDrawer = ({ visible, onClose, teacher }) => {
  if (!teacher) return null;

  return (
    <Drawer
      title="Teacher Details"
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar size={80} src={teacher.profilePic} />
        <Title level={4} style={{ marginTop: 16 }}>{teacher.name}</Title>
        <Tag color={teacher.status === 'active' ? 'green' : 'red'}>
          {teacher.status.toUpperCase()}
        </Tag>
      </div>

      <Descriptions column={1}>
        <Descriptions.Item label="Username">{teacher.username}</Descriptions.Item>
        <Descriptions.Item label="Email">{teacher.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{teacher.phone}</Descriptions.Item>
        <Descriptions.Item label="Subjects">
          {teacher.subjects?.map(subject => (
            <Tag key={subject} style={{ margin: '2px' }}>{subject}</Tag>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="Classes">
          {teacher.classes?.map(cls => (
            <Tag key={cls} style={{ margin: '2px' }}>{cls}</Tag>
          ))}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

const TeacherManagement = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [showCredentials, setShowCredentials] = useState(false);
  const [newTeacherCredentials, setNewTeacherCredentials] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      message.warning('Please login to access teacher management');
      navigate('/login');
      return;
    }

    // Check if user has admin privileges
    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'PRINCIPAL') {
      message.error('You do not have permission to access this page');
      navigate('/dashboard');
      return;
    }

    loadTeachers();
  }, [isAuthenticated, currentUser, navigate]);

  const loadTeachers = async () => {
    // TODO: Implement with new database
    setTeachers([]);
  };

  const handleAddTeacher = async (values) => {
    // TODO: Implement with new database
    message.success('Teacher added successfully');
    setIsModalVisible(false);
    form.resetFields();
    loadTeachers();
  };

  const handleEditTeacher = async (values) => {
    // TODO: Implement with new database
    message.success('Teacher updated successfully');
    setIsModalVisible(false);
    form.resetFields();
    setEditingTeacher(null);
    loadTeachers();
  };

  const handleDeleteTeacher = async (username) => {
    // TODO: Implement with new database
    message.success('Teacher deleted successfully');
    loadTeachers();
  };

  const showTeacherDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setDrawerVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
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
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showTeacherDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingTeacher(record);
                form.setFieldsValue(record);
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Reset Password">
            <Button
              type="text"
              icon={<KeyOutlined />}
              onClick={() => {
                // Implement password reset logic
                message.info('Password reset functionality to be implemented');
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this teacher?"
            onConfirm={() => handleDeleteTeacher(record.username)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Title level={2}>Teacher Management</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTeacher(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Add Teacher
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={teachers}
          rowKey="username"
          loading={loading}
        />

        <Modal
          title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
          open={isModalVisible}
          onOk={form.submit}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
            setEditingTeacher(null);
          }}
          confirmLoading={loading}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={editingTeacher ? handleEditTeacher : handleAddTeacher}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter teacher name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Please enter username' }]}
              disabled={!!editingTeacher}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[{ required: true, message: 'Please enter phone number' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: !editingTeacher, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Form>
        </Modal>

        <TeacherDetailsDrawer
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          teacher={selectedTeacher}
        />
      </Space>
    </Card>
  );
};

export default TeacherManagement; 
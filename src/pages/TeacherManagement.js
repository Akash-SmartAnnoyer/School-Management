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
  Drawer
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, KeyOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { getSchoolById, addTeacherToSchool, updateTeacher, deleteTeacher } from '../firebase/organizationService';
import TeacherDetailsDrawer from '../components/TeacherDetailsDrawer';

const { Title } = Typography;

const TeacherManagement = () => {
  const { currentUser } = useAuth();
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
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const school = await getSchoolById(currentUser.schoolId);
      if (school && school.teachers) {
        setTeachers(school.teachers);
      }
    } catch (error) {
      message.error('Failed to load teachers');
    }
  };

  const handleAddTeacher = async (values) => {
    try {
      setLoading(true);
      const teacherData = {
        ...values,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      await addTeacherToSchool(currentUser.schoolId, teacherData);
      message.success('Teacher added successfully');
      setIsModalVisible(false);
      form.resetFields();
      loadTeachers();
    } catch (error) {
      message.error('Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeacher = async (values) => {
    try {
      setLoading(true);
      await updateTeacher(currentUser.schoolId, editingTeacher.username, values);
      message.success('Teacher updated successfully');
      setIsModalVisible(false);
      form.resetFields();
      setEditingTeacher(null);
      loadTeachers();
    } catch (error) {
      message.error('Failed to update teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (username) => {
    try {
      setLoading(true);
      await deleteTeacher(currentUser.schoolId, username);
      message.success('Teacher deleted successfully');
      loadTeachers();
    } catch (error) {
      message.error('Failed to delete teacher');
    } finally {
      setLoading(false);
    }
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
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
import { addTeacherToSchool, getOrganizations } from '../config/organizations';
import { useAuth } from '../contexts/AuthContext';
import { addTeacher, getTeachers, updateTeacher, deleteTeacher } from '../firebase/services';
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
      const teachersData = await getTeachers();
      setTeachers(teachersData);
    } catch (error) {
      message.error('Failed to load teachers');
    }
  };

  const handleAddTeacher = async (values) => {
    try {
      setLoading(true);
      
      // Generate a random password
      const password = Math.random().toString(36).slice(-8);
      
      // Create teacher data with credentials
      const teacherData = {
        ...values,
        role: 'TEACHER',
        password,
        schoolId: currentUser.schoolId,
        schoolName: currentUser.schoolName,
        schoolLogo: currentUser.schoolLogo,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to Firebase
      const teacherId = await addTeacher(teacherData);
      
      // Add to school's teachers array
      const success = addTeacherToSchool(currentUser.schoolId, {
        ...teacherData,
        id: teacherId
      });

      if (success) {
        message.success('Teacher added successfully');
        setIsModalVisible(false);
        form.resetFields();
        setNewTeacherCredentials({
          username: values.username,
          password: password
        });
        setShowCredentials(true);
        loadTeachers();
      } else {
        message.error('Failed to add teacher');
      }
    } catch (error) {
      message.error('Error adding teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    try {
      await deleteTeacher(teacherId);
      message.success('Teacher deleted successfully');
      loadTeachers();
    } catch (error) {
      message.error('Failed to delete teacher');
    }
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
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
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
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedTeacher(record);
                setDrawerVisible(true);
              }}
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
              onClick={() => handleResetPassword(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this teacher?"
            onConfirm={() => handleDeleteTeacher(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleResetPassword = async (teacher) => {
    try {
      const newPassword = Math.random().toString(36).slice(-8);
      await updateTeacher(teacher.id, { password: newPassword });
      setNewTeacherCredentials({
        username: teacher.username,
        password: newPassword
      });
      setShowCredentials(true);
      message.success('Password reset successfully');
    } catch (error) {
      message.error('Failed to reset password');
    }
  };

  return (
    <div className="teacher-management">
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        </div>

        <Table
          columns={columns}
          dataSource={teachers}
          rowKey="id"
        />

        <Modal
          title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
          open={isModalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          confirmLoading={loading}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddTeacher}
            initialValues={editingTeacher}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter teacher\'s name' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Please enter username' }]}
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
              name="subject"
              label="Subject"
              rules={[{ required: true, message: 'Please enter subject' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="qualification"
              label="Qualification"
              rules={[{ required: true, message: 'Please enter qualification' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: 'Please enter phone number' }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Teacher Credentials"
          open={showCredentials}
          onCancel={() => setShowCredentials(false)}
          footer={[
            <Button key="close" onClick={() => setShowCredentials(false)}>
              Close
            </Button>
          ]}
        >
          {newTeacherCredentials && (
            <div>
              <p><strong>Username:</strong> {newTeacherCredentials.username}</p>
              <p><strong>Password:</strong> {newTeacherCredentials.password}</p>
              <p style={{ color: 'red' }}>Please share these credentials with the teacher securely.</p>
            </div>
          )}
        </Modal>
      </Card>

      <TeacherDetailsDrawer
        visible={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setSelectedTeacher(null);
        }}
        teacher={selectedTeacher}
      />
    </div>
  );
};

export default TeacherManagement; 
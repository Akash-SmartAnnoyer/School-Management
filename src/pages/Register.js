import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined, TeamOutlined, BookOutlined, CalendarOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import SchoolLogo from '../components/SchoolLogo';
import './Login.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register(values);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      message.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <TeamOutlined />,
      title: 'Student Management',
      description: 'Efficiently manage student records, attendance, and academic progress'
    },
    {
      icon: <BookOutlined />,
      title: 'Academic Tracking',
      description: 'Monitor grades, assignments, and overall academic performance'
    },
    {
      icon: <CalendarOutlined />,
      title: 'Schedule Management',
      description: 'Create and manage class schedules, exams, and events'
    },
    {
      icon: <BarChartOutlined />,
      title: 'Performance Analytics',
      description: 'Track and analyze student and class performance metrics'
    }
  ];

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-left-content">
          <Title level={1} className="login-left-title">School Management System</Title>
          <Text className="login-left-subtitle">Create your account to get started</Text>
          
          <div className="feature-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-title">{feature.title}</div>
                <div className="feature-description">{feature.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-content">
          <Card className="login-card">
            <div className="login-header">
              <SchoolLogo />
              <Title level={3}>Create Account</Title>
              <Text>Please fill in your details</Text>
            </div>

            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="role"
                rules={[{ required: true, message: 'Please select your role!' }]}
              >
                <Select
                  size="large"
                  placeholder="Select Role"
                  suffixIcon={<UserOutlined style={{ color: '#3b82f6' }} />}
                >
                  <Option value={ROLES.PRINCIPAL}>Principal</Option>
                  <Option value={ROLES.TEACHER}>Teacher</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="username"
                rules={[
                  { required: true, message: 'Please input your username!' },
                  { min: 3, message: 'Username must be at least 3 characters!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#3b82f6' }} />}
                  placeholder="Username"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#3b82f6' }} />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#3b82f6' }} />}
                  placeholder="Confirm Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Please input your name!' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#3b82f6' }} />}
                  placeholder="Full Name"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#3b82f6' }} />}
                  placeholder="Email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                rules={[{ required: true, message: 'Please input your phone number!' }]}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: '#3b82f6' }} />}
                  placeholder="Phone Number"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="address"
                rules={[{ required: true, message: 'Please input your address!' }]}
              >
                <Input
                  prefix={<HomeOutlined style={{ color: '#3b82f6' }} />}
                  placeholder="Address"
                  size="large"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                >
                  Register
                </Button>
              </Form.Item>

              <Form.Item style={{ marginTop: 16, marginBottom: 0, textAlign: 'center' }}>
                <Text>
                  Already have an account?{' '}
                  <Button type="link" onClick={() => navigate('/login')} style={{ padding: 0 }}>
                    Sign In
                  </Button>
                </Text>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register; 
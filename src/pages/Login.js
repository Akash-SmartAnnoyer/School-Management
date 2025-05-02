import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, TeamOutlined, BookOutlined, CalendarOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SchoolLogo from '../components/SchoolLogo';
import './Login.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email_or_phone, values.password, values.role);
      
      // Redirect to the page they tried to visit or home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      // Error message is already shown by the login function
      console.error('Login error:', error);
      
      // Clear password field on error
      form.setFieldsValue({ password: '' });
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
          <Text className="login-left-subtitle">Welcome back! Please login to your account</Text>
          
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
              <Title level={3}>Sign In</Title>
              <Text>Please enter your credentials</Text>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
              validateMessages={{
                required: '${label} is required',
                types: {
                  email: 'Please enter a valid email address'
                }
              }}
            >
              <Form.Item
                name="email_or_phone"
                label="Email or Phone Number"
                rules={[
                  { required: true },
                  { 
                    type: 'email',
                    message: 'Please enter a valid email address'
                  }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter your email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select your role" size="large">
                  <Option value="principal">Principal</Option>
                  <Option value="teacher">Teacher</Option>
                  <Option value="student">Student</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                >
                  Log in
                </Button>
              </Form.Item>

              {/* <Form.Item style={{ marginTop: 16, marginBottom: 0, textAlign: 'center' }}>
                <Text>
                  Don't have an account?{' '}
                  <Button type="link" onClick={() => navigate('/register')} style={{ padding: 0 }}>
                    Sign Up
                  </Button>
                </Text>
              </Form.Item> */}
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login; 
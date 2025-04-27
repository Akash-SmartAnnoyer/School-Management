import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, TeamOutlined, BookOutlined, CalendarOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SchoolLogo from '../components/SchoolLogo';
import './Login.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      message.error('Login failed. Please check your credentials and try again.');
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
                  <Option value="PRINCIPAL">Principal</Option>
                  <Option value="TEACHER">Teacher</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#3b82f6' }} />}
                  placeholder="Username"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#3b82f6' }} />}
                  placeholder="Password"
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
                  Sign In
                </Button>
              </Form.Item>

              <Form.Item style={{ marginTop: 16, marginBottom: 0, textAlign: 'center' }}>
                <Text>
                  Don't have an account?{' '}
                  <Button type="link" onClick={() => navigate('/register')} style={{ padding: 0 }}>
                    Sign Up
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

export default Login; 
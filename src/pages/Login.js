import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, message, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, BankOutlined, TeamOutlined, BookOutlined, TrophyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import SchoolLogo from '../components/SchoolLogo';
import './Login.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.username, values.password, values.role);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      message.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-left-content">
          <Title level={1} className="login-left-title">
            Welcome to School Management
          </Title>
          <Text className="login-left-subtitle">
            Experience the future of education management with our comprehensive platform designed to streamline your school's operations.
          </Text>
          
          <div className="feature-grid">
            <div className="feature-item">
              <TeamOutlined className="feature-icon" />
              <Title level={4} className="feature-title">Smart Management</Title>
              <Text className="feature-description">
                Efficiently manage students, teachers, and administrative tasks in one place.
              </Text>
            </div>
            
            <div className="feature-item">
              <BookOutlined className="feature-icon" />
              <Title level={4} className="feature-title">Digital Learning</Title>
              <Text className="feature-description">
                Access course materials, assignments, and grades anytime, anywhere.
              </Text>
            </div>
            
            <div className="feature-item">
              <TrophyOutlined className="feature-icon" />
              <Title level={4} className="feature-title">Performance Analytics</Title>
              <Text className="feature-description">
                Track progress with detailed reports and insights for better decision-making.
              </Text>
            </div>
            
            <div className="feature-item">
              <SafetyCertificateOutlined className="feature-icon" />
              <Title level={4} className="feature-title">Secure Platform</Title>
              <Text className="feature-description">
                Your data is protected with enterprise-grade security and privacy measures.
              </Text>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-content">
          <Card 
            className="login-card"
            title={
              <div className="login-header">
                <Space direction="vertical" size="middle" align="center" style={{ width: '100%' }}>
                  <SchoolLogo size="large" />
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1e293b', fontWeight: 'bold' }}>
                      Sign In
                    </Title>
                    <Text type="secondary" style={{ fontSize: '14px', color: '#64748b' }}>
                      Enter your credentials to access your account
                    </Text>
                  </div>
                </Space>
              </div>
            }
          >
            <Form
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
                  <Option value={ROLES.PRINCIPAL}>Principal</Option>
                  <Option value={ROLES.TEACHER}>Teacher</Option>
                  <Option value={ROLES.PARENT}>Parent</Option>
                  <Option value={ROLES.STUDENT}>Student</Option>
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
                  icon={<LoginOutlined />}
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login; 
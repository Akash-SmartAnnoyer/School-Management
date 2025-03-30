import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
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
  const [form] = Form.useForm();

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
          <Title level={1} className="login-left-title">School Management System</Title>
          <Text className="login-left-subtitle">Streamline your school administration with our comprehensive management solution</Text>
        </div>
      </div>

      <div className="login-right">
        <div className="login-content">
          <Card className="login-card">
            <div className="login-header">
              <SchoolLogo />
              <Title level={3}>Welcome Back</Title>
              <Text>Please sign in to your account</Text>
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
                  <Option value={ROLES.PRINCIPAL}>Principal</Option>
                  <Option value={ROLES.TEACHER}>Teacher</Option>
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
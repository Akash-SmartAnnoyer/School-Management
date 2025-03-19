import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <Card 
          className="login-card"
          title={
            <div className="login-header">
              <img 
                src="https://via.placeholder.com/80" 
                alt="School Logo" 
                className="school-logo"
              />
              <Title level={3}>School Management System</Title>
              <Text type="secondary">Sign in to continue</Text>
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
                suffixIcon={<UserOutlined />}
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
                prefix={<UserOutlined />}
                placeholder="Username"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
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

            <div className="login-footer">
              <Text type="secondary">
                Demo Credentials:
              </Text>
              <Text type="secondary" className="demo-credentials">
                Principal: username: principal / password: admin
              </Text>
              <Text type="secondary" className="demo-credentials">
                Teacher: username: teacher1 / password: teacher123
              </Text>
              <Text type="secondary" className="demo-credentials">
                Parent: username: parent1 / password: parent123
              </Text>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login; 
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Upload, 
  message, 
  Row, 
  Col, 
  Divider,
  Typography,
  Space,
  Switch,
  Select,
  Alert
} from 'antd';
import { 
  UploadOutlined, 
  SaveOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;
const { Option } = Select;

const AccountSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [passwordForm] = Form.useForm();
  const { currentUser } = useAuth();

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    // TODO: Implement with new database
    setLoading(false);
  };

  const handleUpdateSettings = async (values) => {
    // TODO: Implement with new database
    message.success('Settings updated successfully');
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // TODO: Implement with new database
      message.success('Account settings updated successfully');
    } catch (error) {
      message.error('Failed to update account settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setLoading(true);
      // TODO: Implement password change logic here
      message.success('Password changed successfully');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setImageLoading(true);
      // TODO: Implement image upload logic here
      message.success('Profile picture uploaded successfully');
    } catch (error) {
      message.error('Failed to upload profile picture');
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '0', 
      overflow: 'hidden', 
      margin: '0',
      borderRadius: '16px',
      background: '#ffffff',
      boxShadow: '0 4px 20px rgba(159, 179, 223, 0.15)',
      border: '1px solid rgba(159, 179, 223, 0.2)'
    }}>
      <Row justify="space-between" align="middle" style={{ padding: '16px 24px' }}>
        <Col>
          <Title level={3} style={{ 
            color: '#7B83EB',
            margin: 0,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <SettingOutlined style={{ fontSize: '24px', color: '#7B83EB' }} />
            Account Settings
          </Title>
        </Col>
      </Row>

      <Card
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
          overflow: 'hidden',
          background: '#ffffff',
          border: '1px solid rgba(159, 179, 223, 0.3)',
          margin: '0 16px 16px 16px',
          padding: 0
        }}
        bodyStyle={{ padding: 0, height: '100%' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ padding: '24px' }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Card 
                title="Profile Picture"
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                  border: '1px solid rgba(159, 179, 223, 0.3)',
                  marginBottom: 24
                }}
              >
                <Form.Item
                  name="photoURL"
                  label="Profile Picture"
                >
                  <Upload
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleImageUpload(file);
                      return false;
                    }}
                    accept="image/*"
                    maxCount={1}
                  >
                    <Button 
                      icon={<UploadOutlined />} 
                      loading={imageLoading}
                      style={{
                        height: '32px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                        background: '#7B83EB',
                        border: 'none',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.3s ease',
                        padding: '0 12px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(159, 179, 223, 0.25)';
                        e.currentTarget.style.background = '#8ba1d1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(159, 179, 223, 0.15)';
                        e.currentTarget.style.background = '#7B83EB';
                      }}
                    >
                      Upload Picture
                    </Button>
                  </Upload>
                </Form.Item>
              </Card>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter your name' }]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  style={{
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(159, 179, 223, 0.1)'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />}
                  style={{
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(159, 179, 223, 0.1)'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input 
                  prefix={<PhoneOutlined />}
                  style={{
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(159, 179, 223, 0.1)'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Security Settings</Divider>

          <Row gutter={24}>
            <Col span={24}>
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handlePasswordChange}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="currentPassword"
                      label="Current Password"
                      rules={[{ required: true, message: 'Please enter your current password' }]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined />}
                        style={{
                          borderRadius: '6px',
                          boxShadow: '0 2px 6px rgba(159, 179, 223, 0.1)'
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="newPassword"
                      label="New Password"
                      rules={[{ required: true, message: 'Please enter your new password' }]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined />}
                        style={{
                          borderRadius: '6px',
                          boxShadow: '0 2px 6px rgba(159, 179, 223, 0.1)'
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm New Password"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm your new password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />}
                    style={{
                      borderRadius: '6px',
                      boxShadow: '0 2px 6px rgba(159, 179, 223, 0.1)'
                    }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SafetyCertificateOutlined />}
                    loading={loading}
                    style={{
                      height: '32px',
                      borderRadius: '6px',
                      boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                      background: '#7B83EB',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.3s ease',
                      padding: '0 12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(159, 179, 223, 0.25)';
                      e.currentTarget.style.background = '#8ba1d1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(159, 179, 223, 0.15)';
                      e.currentTarget.style.background = '#7B83EB';
                    }}
                  >
                    Change Password
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>

          <Divider>Notification Settings</Divider>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="emailNotifications"
                label="Email Notifications"
                valuePropName="checked"
              >
                <Switch 
                  style={{
                    backgroundColor: '#7B83EB'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="smsNotifications"
                label="SMS Notifications"
                valuePropName="checked"
              >
                <Switch 
                  style={{
                    backgroundColor: '#7B83EB'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="notificationPreferences"
                label="Notification Preferences"
              >
                <Select 
                  mode="multiple"
                  style={{
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(159, 179, 223, 0.1)'
                  }}
                >
                  <Option value="attendance">Attendance Updates</Option>
                  <Option value="exams">Exam Results</Option>
                  <Option value="events">School Events</Option>
                  <Option value="announcements">Announcements</Option>
                  <Option value="fees">Fee Reminders</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Language & Region</Divider>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="language"
                label="Preferred Language"
              >
                <Select
                  style={{
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(159, 179, 223, 0.1)'
                  }}
                >
                  <Option value="en">English</Option>
                  <Option value="hi">Hindi</Option>
                  <Option value="ta">Tamil</Option>
                  <Option value="te">Telugu</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="timezone"
                label="Timezone"
              >
                <Select
                  style={{
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(159, 179, 223, 0.1)'
                  }}
                >
                  <Option value="IST">India Standard Time (IST)</Option>
                  <Option value="UTC">UTC</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={loading}
                style={{
                  height: '32px',
                  borderRadius: '6px',
                  boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                  background: '#7B83EB',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.3s ease',
                  padding: '0 12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(159, 179, 223, 0.25)';
                  e.currentTarget.style.background = '#8ba1d1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(159, 179, 223, 0.15)';
                  e.currentTarget.style.background = '#7B83EB';
                }}
              >
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <style>
        {`
          .ant-card-head {
            border-bottom: 1px solid rgba(159, 179, 223, 0.2);
            padding: 16px 24px;
          }

          .ant-card-head-title {
            color: #7B83EB;
            font-weight: 600;
          }

          .ant-form-item-label > label {
            color: #666;
            font-weight: 500;
          }

          .ant-input-affix-wrapper {
            border-color: rgba(159, 179, 223, 0.3);
          }

          .ant-input-affix-wrapper:hover,
          .ant-input-affix-wrapper:focus {
            border-color: #7B83EB;
            box-shadow: 0 0 0 2px rgba(159, 179, 223, 0.2);
          }

          .ant-select-selector {
            border-color: rgba(159, 179, 223, 0.3) !important;
            border-radius: 6px !important;
          }

          .ant-select-selector:hover,
          .ant-select-focused .ant-select-selector {
            border-color: #7B83EB !important;
            box-shadow: 0 0 0 2px rgba(159, 179, 223, 0.2) !important;
          }

          .ant-switch-checked {
            background-color: #7B83EB !important;
          }

          .ant-divider {
            border-color: rgba(159, 179, 223, 0.2);
            margin: 24px 0;
          }

          .ant-divider-inner-text {
            color: #7B83EB;
            font-weight: 500;
          }
        `}
      </style>
    </div>
  );
};

export default AccountSettings; 
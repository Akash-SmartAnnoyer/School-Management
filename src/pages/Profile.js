import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  message,
  Avatar,
  Typography,
  Divider,
  Row,
  Col,
  Space,
  Switch,
  Select,
  Alert,
  Tag,
  Descriptions
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  UploadOutlined,
  SaveOutlined,
  BankOutlined,
  LockOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  BookOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { getSchoolById, updatePrincipal, updateTeacher, updateSchool } from '../firebase/organizationService';
import { ROLES } from '../contexts/AuthContext';
import api from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [school, setSchool] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadUserProfile();
    }
  }, [currentUser]);

  const loadUserProfile = async () => {
    try {
      const response = await api.user.getUserById(currentUser.id);
      if (response.data) {
        const userData = response.data;
        // Format the data for the form
        form.setFieldsValue({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone: userData.phone,
          profilePic: userData.profile?.photo
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      message.error('Failed to load profile data');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Create FormData object
      const formData = new FormData();
      
      // Add basic user fields
      formData.append('first_name', values.first_name);
      formData.append('last_name', values.last_name);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('role', 'principal');

      // Make API call
      const response = await api.user.updateUser(currentUser.id, formData);

      if (response.status === 200) {
        message.success('Profile updated successfully');
        // Refresh user data
        await loadUserProfile();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      message.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicUpload = async (file) => {
    try {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        return false;
      }

      // Create FormData
      const formData = new FormData();
      formData.append('photo', file);

      // Make API call
      const response = await api.user.uploadUserPhoto(currentUser.id, formData);

      if (response.status === 200) {
        message.success('Profile picture updated successfully');
        // Refresh user data
        await loadUserProfile();
      } else {
        throw new Error('Failed to upload profile picture');
      }

      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      message.error(error.message || 'Failed to upload profile picture');
      return false;
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
            <UserOutlined style={{ fontSize: '24px', color: '#7B83EB' }} />
            Profile Settings
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
        <Row gutter={[24, 24]} style={{ padding: '24px' }}>
          <Col span={8}>
            <Card
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.1)',
                border: '1px solid rgba(159, 179, 223, 0.2)',
                background: '#ffffff',
                color: '#333333'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Avatar
                    size={120}
                    src={currentUser?.profilePic}
                    icon={<UserOutlined />}
                    style={{ 
                      border: '4px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Upload
                    showUploadList={false}
                    beforeUpload={handleProfilePicUpload}
                    accept="image/*"
                  >
                    <Button 
                      icon={<UploadOutlined />}
                      style={{
                        height: '32px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.3s ease',
                        padding: '0 12px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      }}
                    >
                      Change Profile Picture
                    </Button>
                  </Upload>
                  <Title level={4} style={{ margin: 0, color: '#333333' }}>
                    {currentUser?.name}
                  </Title>
                  <Tag 
                    color={currentUser?.role === ROLES.PRINCIPAL ? '#7B83EB' : '#52c41a'}
                    style={{
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '14px',
                      fontWeight: 500
                    }}
                  >
                    {currentUser?.role}
                  </Tag>
                </Space>
              </div>
            </Card>
          </Col>

          <Col span={16}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Personal Profile Section */}
              <Card 
                title="Personal Profile"
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                  border: '1px solid rgba(159, 179, 223, 0.3)'
                }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  initialValues={currentUser}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="first_name"
                        label="First Name"
                        rules={[{ required: true, message: 'Please enter your first name' }]}
                      >
                        <Input 
                          prefix={<UserOutlined />}
                          style={{
                            borderRadius: '6px',
                            boxShadow: '0 2px 6px rgba(159, 179, 223, 0.1)'
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="last_name"
                        label="Last Name"
                        rules={[{ required: true, message: 'Please enter your last name' }]}
                      >
                        <Input 
                          prefix={<UserOutlined />}
                          style={{
                            borderRadius: '6px',
                            boxShadow: '0 2px 6px rgba(159, 179, 223, 0.1)'
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
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
                    </Col>
                    <Col span={12}>
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

                  <Form.Item>
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
                      Save Profile
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Space>
          </Col>
        </Row>
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

          .ant-descriptions-item-label {
            background: rgba(159, 179, 223, 0.1);
            color: #7B83EB;
            font-weight: 500;
          }

          .ant-descriptions-item-content {
            background: #fff;
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

export default Profile; 
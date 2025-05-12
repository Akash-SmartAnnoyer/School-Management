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

const { Title, Text } = Typography;
const { Option } = Select;

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [form] = Form.useForm();
  const [schoolForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [school, setSchool] = useState(null);

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        address: currentUser.address,
        profilePic: currentUser.profilePic
      });
      loadSchoolData();
    }
  }, [currentUser]);

  const loadSchoolData = async () => {
    try {
      const schoolData = await getSchoolById(currentUser.schoolId);
      setSchool(schoolData);
      if (currentUser.role === ROLES.PRINCIPAL && schoolData) {
        schoolForm.setFieldsValue({
          name: schoolData.name,
          email: schoolData.email,
          phone: schoolData.phone,
          address: schoolData.address,
          logo: schoolData.logo
        });
      }
    } catch (error) {
      message.error('Failed to load school data');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Remove any undefined values
      const cleanValues = Object.keys(values).reduce((acc, key) => {
        if (values[key] !== undefined) {
          acc[key] = values[key];
        }
        return acc;
      }, {});

      if (currentUser.role === ROLES.PRINCIPAL) {
        // For principal, update both personal profile and principal data
        await Promise.all([
          updateProfile(cleanValues),
          updatePrincipal(currentUser.schoolId, {
            name: cleanValues.name,
            email: cleanValues.email,
            phone: cleanValues.phone,
            address: cleanValues.address
          })
        ]);
      } else {
        // For teachers, just update personal profile
        await updateProfile(cleanValues);
      }
      
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSubmit = async (values) => {
    try {
      setLoading(true);
      await updateSchool(currentUser.schoolId, values);
      message.success('School profile updated successfully');
      loadSchoolData();
    } catch (error) {
      message.error('Failed to update school profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setLoading(true);
      if (currentUser.role === ROLES.PRINCIPAL) {
        await updatePrincipal(currentUser.schoolId, {
          password: values.newPassword
        });
      } else {
        await updateTeacher(currentUser.schoolId, currentUser.username, {
          password: values.newPassword
        });
      }
      message.success('Password updated successfully');
      form.resetFields(['oldPassword', 'newPassword', 'confirmPassword']);
    } catch (error) {
      message.error('Failed to update password');
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

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        await updateProfile({ profilePic: base64Image });
        message.success('Profile picture updated successfully');
      };
      return false; // Prevent default upload behavior
    } catch (error) {
      message.error('Failed to upload profile picture');
      return false;
    }
  };

  const handleSchoolPicUpload = async (file) => {
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

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        await updateSchool(currentUser.schoolId, { logo: base64Image });
        message.success('School logo updated successfully');
        loadSchoolData();
      };
      return false; // Prevent default upload behavior
    } catch (error) {
      message.error('Failed to upload school logo');
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
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)',
                background: 'linear-gradient(135deg, #7B83EB 0%, #8ba1d1 100%)',
                color: 'white'
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
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
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
                  <Title level={4} style={{ margin: 0, color: 'white' }}>
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
                    </Col>
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
                  </Row>

                  <Row gutter={16}>
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
                    <Col span={12}>
                      <Form.Item
                        name="address"
                        label="Address"
                        rules={[{ required: true, message: 'Please enter your address' }]}
                      >
                        <Input 
                          prefix={<HomeOutlined />}
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

              {/* School Profile Section - Only visible for Principal */}
              {currentUser?.role === ROLES.PRINCIPAL && (
                <Card 
                  title="School Profile"
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                    border: '1px solid rgba(159, 179, 223, 0.3)'
                  }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Space direction="vertical" size="large">
                      <Avatar
                        size={120}
                        src={school?.logo}
                        icon={<BankOutlined />}
                        style={{ 
                          border: '4px solid rgba(159, 179, 223, 0.2)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Upload
                        showUploadList={false}
                        beforeUpload={handleSchoolPicUpload}
                        accept="image/*"
                      >
                        <Button 
                          icon={<UploadOutlined />}
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
                          Change School Logo
                        </Button>
                      </Upload>
                    </Space>
                  </div>

                  <Form
                    form={schoolForm}
                    layout="vertical"
                    onFinish={handleSchoolSubmit}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="name"
                          label="School Name"
                          rules={[{ required: true, message: 'Please enter school name' }]}
                        >
                          <Input 
                            prefix={<BankOutlined />}
                            style={{
                              borderRadius: '6px',
                              boxShadow: '0 2px 6px rgba(159, 179, 223, 0.1)'
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="email"
                          label="School Email"
                          rules={[
                            { required: true, message: 'Please enter school email' },
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
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="phone"
                          label="School Phone"
                          rules={[{ required: true, message: 'Please enter school phone number' }]}
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
                      <Col span={12}>
                        <Form.Item
                          name="address"
                          label="School Address"
                          rules={[{ required: true, message: 'Please enter school address' }]}
                        >
                          <Input 
                            prefix={<HomeOutlined />}
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
                        Save School Profile
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              )}

              {/* Teacher Profile Section - Only visible for Teachers */}
              {currentUser?.role === ROLES.TEACHER && school && (
                <Card 
                  title="School Information"
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                    border: '1px solid rgba(159, 179, 223, 0.3)'
                  }}
                >
                  <Descriptions 
                    bordered
                    style={{
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <Descriptions.Item label="School Name">
                      {school.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="School Email">
                      {school.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="School Phone">
                      {school.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="School Address">
                      {school.address}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}

              {/* Change Password Section */}
              <Card 
                title="Change Password"
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                  border: '1px solid rgba(159, 179, 223, 0.3)'
                }}
              >
                <Form
                  layout="vertical"
                  onFinish={handlePasswordChange}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="oldPassword"
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
                      icon={<LockOutlined />}
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
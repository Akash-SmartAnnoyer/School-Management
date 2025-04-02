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
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={[24, 24]}>
          <Col span={8}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Avatar
                  size={120}
                  src={currentUser?.profilePic}
                  icon={<UserOutlined />}
                />
                <Upload
                  showUploadList={false}
                  beforeUpload={handleProfilePicUpload}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Change Profile Picture</Button>
                </Upload>
                <Title level={4} style={{ margin: 0 }}>
                  {currentUser?.name}
                </Title>
                <Tag color={currentUser?.role === ROLES.PRINCIPAL ? 'blue' : 'green'}>
                  {currentUser?.role}
                </Tag>
              </Space>
            </div>
          </Col>
          <Col span={16}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Personal Profile Section */}
              <Card title="Personal Profile">
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
                        <Input prefix={<UserOutlined />} />
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
                        <Input prefix={<MailOutlined />} />
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
                        <Input prefix={<PhoneOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="address"
                        label="Address"
                        rules={[{ required: true, message: 'Please enter your address' }]}
                      >
                        <Input prefix={<HomeOutlined />} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                    >
                      Save Profile
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              {/* School Profile Section - Only visible for Principal */}
              {currentUser?.role === ROLES.PRINCIPAL && (
                <Card title="School Profile">
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Space direction="vertical" size="large">
                      <Avatar
                        size={120}
                        src={school?.logo}
                        icon={<BankOutlined />}
                      />
                      <Upload
                        showUploadList={false}
                        beforeUpload={handleSchoolPicUpload}
                        accept="image/*"
                      >
                        <Button icon={<UploadOutlined />}>Change School Logo</Button>
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
                          <Input prefix={<BankOutlined />} />
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
                          <Input prefix={<MailOutlined />} />
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
                          <Input prefix={<PhoneOutlined />} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="address"
                          label="School Address"
                          rules={[{ required: true, message: 'Please enter school address' }]}
                        >
                          <Input prefix={<HomeOutlined />} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loading}
                      >
                        Save School Profile
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              )}

              {/* Teacher Profile Section - Only visible for Teachers */}
              {currentUser?.role === ROLES.TEACHER && school && (
                <Card title="School Information">
                  <Descriptions bordered>
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
              <Card title="Change Password">
                <Form
                  layout="vertical"
                  onFinish={handlePasswordChange}
                >
                  <Form.Item
                    name="oldPassword"
                    label="Current Password"
                    rules={[{ required: true, message: 'Please enter your current password' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                      { required: true, message: 'Please enter a new password' },
                      { min: 6, message: 'Password must be at least 6 characters' }
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>

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
                          return Promise.reject(new Error('Passwords do not match'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<LockOutlined />}
                      loading={loading}
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
    </div>
  );
};

export default Profile; 
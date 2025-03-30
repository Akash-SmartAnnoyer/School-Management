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
import { getOrganizations, updateSchool, updatePrincipal, updateTeacher } from '../utils/organizationStorage';
import { ROLES } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [form] = Form.useForm();
  const [schoolForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue(currentUser);
      // Load school data for principal
      if (currentUser.role === ROLES.PRINCIPAL) {
        const organizations = getOrganizations();
        const school = organizations.schools[currentUser.schoolId];
        if (school) {
          schoolForm.setFieldsValue(school);
        }
      }
    }
  }, [currentUser]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await updateProfile(values);
      messageApi.success('Profile updated successfully');
    } catch (error) {
      messageApi.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onSchoolFinish = async (values) => {
    try {
      setLoading(true);
      await updateSchool(currentUser.schoolId, values);
      messageApi.success('School profile updated successfully');
    } catch (error) {
      messageApi.error('Failed to update school profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicUpload = async (file) => {
    try {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        messageApi.error('You can only upload image files!');
        return false;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        messageApi.error('Image must be smaller than 2MB!');
        return false;
      }

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        await updateProfile({ profilePic: base64Image });
        messageApi.success('Profile picture updated successfully');
      };
      return false; // Prevent default upload behavior
    } catch (error) {
      messageApi.error('Failed to upload profile picture');
      return false;
    }
  };

  const handleSchoolPicUpload = async (file) => {
    try {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        messageApi.error('You can only upload image files!');
        return false;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        messageApi.error('Image must be smaller than 2MB!');
        return false;
      }

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        await updateSchool(currentUser.schoolId, { logo: base64Image });
        messageApi.success('School logo updated successfully');
      };
      return false; // Prevent default upload behavior
    } catch (error) {
      messageApi.error('Failed to upload school logo');
      return false;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {contextHolder}
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
                  onFinish={onFinish}
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
                      Save Changes
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
                        src={currentUser?.schoolLogo}
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
                    onFinish={onSchoolFinish}
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
              {currentUser?.role === ROLES.TEACHER && (
                <Card title="Teacher Profile">
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="subject"
                          label="Subject"
                          rules={[{ required: true, message: 'Please enter your subject' }]}
                        >
                          <Input prefix={<BookOutlined />} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="qualification"
                          label="Qualification"
                          rules={[{ required: true, message: 'Please enter your qualification' }]}
                        >
                          <Input prefix={<SafetyCertificateOutlined />} />
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
                        Save Teacher Profile
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              )}
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Profile; 
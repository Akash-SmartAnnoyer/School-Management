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
  Tabs,
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
  BookOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { getOrganizations, updateSchool, updatePrincipal, updateTeacher } from '../utils/organizationStorage';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue(currentUser);
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

  return (
    <div>
      {contextHolder}
      <Card>
        <Title level={2}>Profile</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Avatar
                  size={120}
                  src={currentUser?.profilePic}
                  icon={<UserOutlined />}
                />
                <Title level={4} style={{ marginTop: 16 }}>
                  {currentUser?.name}
                </Title>
                <Tag color="blue">{currentUser?.role}</Tag>
              </div>

              {/* School Information (Read-only for teachers) */}
              <Card 
                title={
                  <Space>
                    <BankOutlined style={{ color: '#1890ff' }} />
                    <span>School Information</span>
                  </Space>
                }
                style={{ marginBottom: '16px' }}
              >
                <Descriptions column={1}>
                  <Descriptions.Item label="School Name">
                    {currentUser?.schoolName}
                  </Descriptions.Item>
                  <Descriptions.Item label="School Address">
                    {currentUser?.schoolAddress}
                  </Descriptions.Item>
                  <Descriptions.Item label="School Phone">
                    {currentUser?.schoolPhone}
                  </Descriptions.Item>
                  <Descriptions.Item label="School Email">
                    {currentUser?.schoolEmail}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Card 
                title={
                  <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <span>Personal Information</span>
                  </Space>
                }
                style={{ marginBottom: '16px' }}
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
                      label="Phone Number"
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
              </Card>

              {currentUser?.role === 'TEACHER' && (
                <Card 
                  title={
                    <Space>
                      <BookOutlined style={{ color: '#1890ff' }} />
                      <span>Professional Information</span>
                    </Space>
                  }
                  style={{ marginBottom: '16px' }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="subject"
                        label="Subject"
                        rules={[{ required: true, message: 'Please enter your subject' }]}
                      >
                        <Input prefix={<SafetyCertificateOutlined />} />
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
                </Card>
              )}

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
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Profile; 
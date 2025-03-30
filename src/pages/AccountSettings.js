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
  GlobalOutlined
} from '@ant-design/icons';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadImage } from '../services/imageService';
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
    loadAccountSettings();
  }, []);

  const loadAccountSettings = async () => {
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        form.setFieldsValue(docSnap.data());
      }
    } catch (error) {
      message.error('Failed to load account settings');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const docRef = doc(db, 'users', currentUser.uid);
      await updateDoc(docRef, {
        ...values,
        updatedAt: new Date().toISOString()
      });
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
      // Implement password change logic here
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
      const { url, publicId } = await uploadImage(file, `users/${currentUser.uid}/profile`);
      
      const docRef = doc(db, 'users', currentUser.uid);
      await updateDoc(docRef, {
        photoURL: url,
        photoPublicId: publicId,
        updatedAt: new Date().toISOString()
      });

      form.setFieldsValue({ photoURL: url });
      message.success('Profile picture uploaded successfully');
    } catch (error) {
      message.error('Failed to upload profile picture');
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>Account Settings</Title>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Card 
                title="Profile Picture"
                style={{ marginBottom: 24 }}
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
                <Input prefix={<UserOutlined />} />
              </Form.Item>

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

              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input prefix={<PhoneOutlined />} />
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
                <Form.Item
                  name="currentPassword"
                  label="Current Password"
                  rules={[{ required: true, message: 'Please enter current password' }]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[
                    { required: true, message: 'Please enter new password' },
                    { min: 8, message: 'Password must be at least 8 characters' }
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm New Password"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm new password' },
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
                    icon={<SafetyCertificateOutlined />}
                    loading={loading}
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
                <Switch />
              </Form.Item>

              <Form.Item
                name="smsNotifications"
                label="SMS Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="notificationPreferences"
                label="Notification Preferences"
              >
                <Select mode="multiple">
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
                <Select>
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
                <Select>
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
              >
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AccountSettings; 
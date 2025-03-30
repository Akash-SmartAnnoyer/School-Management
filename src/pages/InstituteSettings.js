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
  Select
} from 'antd';
import { 
  UploadOutlined, 
  SaveOutlined, 
  BankOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  GlobalOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadImage } from '../services/imageService';

const { Title } = Typography;
const { Option } = Select;

const InstituteSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    loadInstituteSettings();
  }, []);

  const loadInstituteSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'institute');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        form.setFieldsValue(docSnap.data());
      }
    } catch (error) {
      message.error('Failed to load institute settings');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const docRef = doc(db, 'settings', 'institute');
      await updateDoc(docRef, {
        ...values,
        updatedAt: new Date().toISOString()
      });
      message.success('Institute settings updated successfully');
    } catch (error) {
      message.error('Failed to update institute settings');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setImageLoading(true);
      const { url, publicId } = await uploadImage(file, 'institute/logo');
      
      const docRef = doc(db, 'settings', 'institute');
      await updateDoc(docRef, {
        logoURL: url,
        logoPublicId: publicId,
        updatedAt: new Date().toISOString()
      });

      form.setFieldsValue({ logoURL: url });
      message.success('Logo uploaded successfully');
    } catch (error) {
      message.error('Failed to upload logo');
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>Institute Settings</Title>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Card 
                title="Institute Logo"
                style={{ marginBottom: 24 }}
              >
                <Form.Item
                  name="logoURL"
                  label="Logo"
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
                      Upload Logo
                    </Button>
                  </Upload>
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Form.Item
                name="instituteName"
                label="Institute Name"
                rules={[{ required: true, message: 'Please enter institute name' }]}
              >
                <Input prefix={<BankOutlined />} />
              </Form.Item>

              <Form.Item
                name="instituteCode"
                label="Institute Code"
                rules={[{ required: true, message: 'Please enter institute code' }]}
              >
                <Input prefix={<IdcardOutlined />} />
              </Form.Item>

              <Form.Item
                name="instituteType"
                label="Institute Type"
                rules={[{ required: true, message: 'Please select institute type' }]}
              >
                <Select>
                  <Option value="school">School</Option>
                  <Option value="college">College</Option>
                  <Option value="university">University</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Contact Information</Divider>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>

              <Form.Item
                name="website"
                label="Website"
              >
                <Input prefix={<GlobalOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please enter address' }]}
              >
                <Input.TextArea 
                  prefix={<HomeOutlined />} 
                  rows={4}
                />
              </Form.Item>

              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: 'Please enter state' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: 'Please enter country' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Additional Information</Divider>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="about"
                label="About Institute"
              >
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item
                name="mission"
                label="Mission Statement"
              >
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item
                name="vision"
                label="Vision Statement"
              >
                <Input.TextArea rows={3} />
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

export default InstituteSettings; 
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
  Select,
  Switch,
  InputNumber,
  Alert
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
      setLoading(true);
      // TODO: Implement with new database
      // const settings = await getInstituteSettings();
      
      // For now, using mock data
      const mockSettings = {
        instituteName: 'Sample School',
        instituteCode: 'SCH001',
        instituteType: 'school',
        logoURL: 'https://via.placeholder.com/150',
        email: 'school@example.com',
        phone: '1234567890',
        website: 'www.school.com',
        address: '123 School Street',
        city: 'Sample City',
        state: 'Sample State',
        country: 'Sample Country',
        about: 'About the school',
        mission: 'School mission',
        vision: 'School vision',
        studentNumberConfig: {
          admissionNumber: {
            autoGenerate: true,
            prefix: 'ADM',
            startNumber: 1,
            digits: 3,
            lastUsed: 'ADM099',
            nextAvailable: 'ADM100'
          },
          rollNumber: {
            autoGenerate: true,
            format: 'class_section',
            prefix: '',
            digits: 2,
            status: [
              { class: 1, section: 'A', lastNumber: '1A30', nextNumber: '1A31' },
              { class: 1, section: 'B', lastNumber: '1B25', nextNumber: '1B26' },
              { class: 2, section: 'A', lastNumber: '2A28', nextNumber: '2A29' }
            ]
          }
        }
      };

      form.setFieldsValue({
        ...mockSettings,
        admissionNumberAutoGenerate: mockSettings.studentNumberConfig.admissionNumber.autoGenerate,
        admissionNumberPrefix: mockSettings.studentNumberConfig.admissionNumber.prefix,
        admissionNumberStart: mockSettings.studentNumberConfig.admissionNumber.startNumber,
        admissionNumberDigits: mockSettings.studentNumberConfig.admissionNumber.digits,
        lastAdmissionNumber: mockSettings.studentNumberConfig.admissionNumber.lastUsed,
        nextAdmissionNumber: mockSettings.studentNumberConfig.admissionNumber.nextAvailable,
        rollNumberAutoGenerate: mockSettings.studentNumberConfig.rollNumber.autoGenerate,
        rollNumberFormat: mockSettings.studentNumberConfig.rollNumber.format,
        rollNumberPrefix: mockSettings.studentNumberConfig.rollNumber.prefix,
        rollNumberDigits: mockSettings.studentNumberConfig.rollNumber.digits,
        rollNumberStatus: mockSettings.studentNumberConfig.rollNumber.status
      });
    } catch (error) {
      message.error('Failed to load institute settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Prepare the configuration data
      const configData = {
        // Basic institute info
        instituteName: values.instituteName,
        instituteCode: values.instituteCode,
        instituteType: values.instituteType,
        logoURL: values.logoURL,
        
        // Contact info
        email: values.email,
        phone: values.phone,
        website: values.website,
        address: values.address,
        city: values.city,
        state: values.state,
        country: values.country,
        
        // Additional info
        about: values.about,
        mission: values.mission,
        vision: values.vision,
        
        // Student number configuration
        studentNumberConfig: {
          admissionNumber: {
            autoGenerate: values.admissionNumberAutoGenerate,
            prefix: values.admissionNumberPrefix,
            startNumber: values.admissionNumberStart,
            digits: values.admissionNumberDigits,
            lastUsed: values.lastAdmissionNumber,
            nextAvailable: values.nextAdmissionNumber
          },
          rollNumber: {
            autoGenerate: values.rollNumberAutoGenerate,
            format: values.rollNumberFormat,
            prefix: values.rollNumberPrefix,
            digits: values.rollNumberDigits,
            status: values.rollNumberStatus
          }
        }
      };

      // TODO: Implement with new database
      // await updateInstituteSettings(configData);
      
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
      // TODO: Implement with new database
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

          <Divider>Student Number Configuration</Divider>

          <Row gutter={24}>
            <Col span={24}>
              <Card title="Admission Number Configuration" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="admissionNumberAutoGenerate"
                      label="Auto-generate Admission Numbers"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="admissionNumberPrefix"
                      label="Admission Number Prefix"
                      tooltip="Optional prefix for admission numbers (e.g., 'ADM' for ADM001)"
                    >
                      <Input placeholder="e.g., ADM" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="admissionNumberStart"
                      label="Starting Number"
                      tooltip="The number from which admission numbers will start"
                    >
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="admissionNumberDigits"
                      label="Number of Digits"
                      tooltip="Number of digits in admission number (e.g., 3 for 001)"
                    >
                      <InputNumber min={1} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Alert
                      message="Last Used Admission Number"
                      description={
                        <div>
                          <p>Last Number: {form.getFieldValue('lastAdmissionNumber') || 'Not set'}</p>
                          <p>Next Available: {form.getFieldValue('nextAdmissionNumber') || 'Not set'}</p>
                        </div>
                      }
                      type="info"
                      showIcon
                    />
                  </Col>
                </Row>
              </Card>

              <Card title="Roll Number Configuration" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="rollNumberAutoGenerate"
                      label="Auto-generate Roll Numbers"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="rollNumberFormat"
                      label="Roll Number Format"
                      tooltip="Choose how roll numbers should be formatted"
                    >
                      <Select>
                        <Option value="sequential">Sequential (1, 2, 3...)</Option>
                        <Option value="class_section">Class-Section Based (1A01, 1B01...)</Option>
                        <Option value="custom">Custom Format</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => 
                    prevValues.rollNumberFormat !== currentValues.rollNumberFormat
                  }
                >
                  {({ getFieldValue }) => {
                    const format = getFieldValue('rollNumberFormat');
                    return format === 'custom' ? (
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="rollNumberPrefix"
                            label="Roll Number Prefix"
                            tooltip="Optional prefix for roll numbers"
                          >
                            <Input placeholder="e.g., R" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="rollNumberDigits"
                            label="Number of Digits"
                            tooltip="Number of digits in roll number"
                          >
                            <InputNumber min={1} max={10} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </Row>
                    ) : null;
                  }}
                </Form.Item>

                <Row>
                  <Col span={24}>
                    <Alert
                      message="Roll Number Status by Class"
                      description={
                        <div>
                          {form.getFieldValue('rollNumberStatus')?.map((status, index) => (
                            <p key={index}>
                              Class {status.class}-{status.section}: Last Number {status.lastNumber}, Next Available {status.nextNumber}
                            </p>
                          )) || 'No roll number data available'}
                        </div>
                      }
                      type="info"
                      showIcon
                    />
                  </Col>
                </Row>
              </Card>
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
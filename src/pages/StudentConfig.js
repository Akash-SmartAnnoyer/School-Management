import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  message, 
  Row, 
  Col, 
  Divider,
  Typography,
  Space,
  Select,
  Switch,
  InputNumber,
  Alert,
  Tabs
} from 'antd';
import { 
  SaveOutlined,
  UserOutlined,
  NumberOutlined,
  IdcardOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const StudentConfig = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudentConfig();
  }, []);

  const loadStudentConfig = async () => {
    try {
      setLoading(true);
      // TODO: Implement with new database
      // const config = await getStudentConfig();
      
      // For now, using mock data
      const mockConfig = {
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
      };

      form.setFieldsValue({
        admissionNumberAutoGenerate: mockConfig.admissionNumber.autoGenerate,
        admissionNumberPrefix: mockConfig.admissionNumber.prefix,
        admissionNumberStart: mockConfig.admissionNumber.startNumber,
        admissionNumberDigits: mockConfig.admissionNumber.digits,
        lastAdmissionNumber: mockConfig.admissionNumber.lastUsed,
        nextAdmissionNumber: mockConfig.admissionNumber.nextAvailable,
        rollNumberAutoGenerate: mockConfig.rollNumber.autoGenerate,
        rollNumberFormat: mockConfig.rollNumber.format,
        rollNumberPrefix: mockConfig.rollNumber.prefix,
        rollNumberDigits: mockConfig.rollNumber.digits,
        rollNumberStatus: mockConfig.rollNumber.status
      });
    } catch (error) {
      message.error('Failed to load student configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Prepare the configuration data
      const configData = {
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
      };

      // TODO: Implement with new database
      // await updateStudentConfig(configData);
      
      message.success('Student configuration updated successfully');
    } catch (error) {
      message.error('Failed to update student configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>Student Configuration</Title>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Tabs defaultActiveKey="admission">
            <TabPane 
              tab={
                <span>
                  <NumberOutlined />
                  Admission Number
                </span>
              } 
              key="admission"
            >
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
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <IdcardOutlined />
                  Roll Number
                </span>
              } 
              key="roll"
            >
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
            </TabPane>
          </Tabs>

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

export default StudentConfig; 
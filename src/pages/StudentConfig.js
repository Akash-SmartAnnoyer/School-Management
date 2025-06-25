import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  message, 
  Row, 
  Col, 
  Typography,
  Space,
  Select,
  Switch,
  InputNumber,
  Alert,
  Radio,
  Tag,
  Tooltip,
  Statistic
} from 'antd';
import { 
  SaveOutlined,
  NumberOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const StudentConfig = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Simplified mock data for admission numbers only
  const mockConfig = {
    admissionNumber: {
      autoGenerate: true,
      format: 'prefix_year_sequence',
      prefix: 'ADM',
      includeYear: true,
      yearFormat: 'YYYY',
      yearPosition: 'middle',
      startNumber: 1,
      digits: 4,
      separator: '',
      resetYearly: true,
      duplicateHandling: 'auto_increment',
      lastUsed: 'ADM2025001',
      nextAvailable: 'ADM20250002',
      totalGenerated: 156
    }
  };

  useEffect(() => {
    loadStudentConfig();
  }, []);

  const loadStudentConfig = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      form.setFieldsValue({
        admissionAutoGenerate: mockConfig.admissionNumber.autoGenerate,
        admissionFormat: mockConfig.admissionNumber.format,
        admissionPrefix: mockConfig.admissionNumber.prefix,
        admissionIncludeYear: mockConfig.admissionNumber.includeYear,
        admissionYearFormat: mockConfig.admissionNumber.yearFormat,
        admissionYearPosition: mockConfig.admissionNumber.yearPosition,
        admissionStartNumber: mockConfig.admissionNumber.startNumber,
        admissionDigits: mockConfig.admissionNumber.digits,
        admissionSeparator: mockConfig.admissionNumber.separator,
        admissionResetYearly: mockConfig.admissionNumber.resetYearly,
        admissionDuplicateHandling: mockConfig.admissionNumber.duplicateHandling
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      message.success('Admission number configuration updated successfully');
    } catch (error) {
      message.error('Failed to update admission number configuration');
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = (values) => {
    const currentYear = new Date().getFullYear();
    const examples = [];
    
    const format = values.admissionFormat || 'prefix_sequence';
    const prefix = values.admissionPrefix || 'ADM';
    const includeYear = values.admissionIncludeYear;
    const yearFormat = values.admissionYearFormat || 'YYYY';
    const digits = values.admissionDigits || 4;
    
    for (let i = 1; i <= 5; i++) {
      let number = '';
      const sequence = i.toString().padStart(digits, '0');
      const year = yearFormat === 'YYYY' ? currentYear.toString() : currentYear.toString().slice(-2);
      
      switch (format) {
        case 'prefix_sequence':
          number = `${prefix}${sequence}`;
          break;
        case 'year_sequence':
          number = includeYear ? `${year}${sequence}` : sequence;
          break;
        case 'prefix_year_sequence':
          number = includeYear ? `${prefix}${year}${sequence}` : `${prefix}${sequence}`;
          break;
        default:
          number = `${prefix}${sequence}`;
      }
      examples.push(number);
    }
    
    return examples;
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <NumberOutlined style={{ marginRight: 12, color: '#1890ff' }} />
          Admission Number Configuration
        </Title>
        <Paragraph type="secondary">
          Configure how admission numbers are generated and formatted for your institution
        </Paragraph>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="Basic Settings">
                <Form.Item
                  name="admissionAutoGenerate"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="Auto Generate" 
                    unCheckedChildren="Manual Entry"
                    style={{ marginBottom: 16 }}
                  />
                </Form.Item>
                
                <Form.Item
                  name="admissionFormat"
                  label="Number Format"
                  tooltip="Choose how admission numbers should be structured"
                >
                  <Select>
                    <Option value="prefix_sequence">Prefix + Sequence (ADM001)</Option>
                    <Option value="year_sequence">Year + Sequence (2024001)</Option>
                    <Option value="prefix_year_sequence">Prefix + Year + Sequence (ADM2024001)</Option>
                  </Select>
                </Form.Item>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      name="admissionPrefix"
                      label="Prefix"
                      tooltip="Optional prefix (e.g., ADM, STU)"
                    >
                      <Input placeholder="ADM" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="admissionDigits"
                      label="Sequence Digits"
                      tooltip="Number of digits for sequence (3 = 001, 4 = 0001)"
                    >
                      <InputNumber min={1} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={12}>
              <Card size="small" title="Year Settings">
                <Form.Item
                  name="admissionIncludeYear"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="Include Year" 
                    unCheckedChildren="No Year"
                    style={{ marginBottom: 16 }}
                  />
                </Form.Item>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      name="admissionYearFormat"
                      label="Year Format"
                    >
                      <Select>
                        <Option value="YYYY">Full Year (2024)</Option>
                        <Option value="YY">Short Year (24)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="admissionYearPosition"
                      label="Year Position"
                    >
                      <Select>
                        <Option value="start">Start (2024ADM001)</Option>
                        <Option value="middle">Middle (ADM2024001)</Option>
                        <Option value="end">End (ADM0012024)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="admissionResetYearly"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="Reset Each Year" 
                    unCheckedChildren="Continuous"
                  />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Row gutter={24} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Card size="small" title="Advanced Options">
                <Form.Item
                  name="admissionSeparator"
                  label="Separator"
                  tooltip="Character between parts (empty, -, /, _)"
                >
                  <Select allowClear>
                    <Option value="">None (ADM2024001)</Option>
                    <Option value="-">Dash (ADM-2024-001)</Option>
                    <Option value="/">Slash (ADM/2024/001)</Option>
                    <Option value="_">Underscore (ADM_2024_001)</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="admissionDuplicateHandling"
                  label="Duplicate Handling"
                >
                  <Radio.Group>
                    <Radio value="auto_increment">Auto Increment</Radio>
                    <Radio value="show_error">Show Error</Radio>
                    <Radio value="manual_resolve">Manual Resolve</Radio>
                  </Radio.Group>
                </Form.Item>
              </Card>
            </Col>

            <Col span={12}>
              <Card size="small" title="Preview & Status">
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Sample Numbers:</Text>
                  <div style={{ marginTop: 8 }}>
                    {generatePreview(form.getFieldsValue()).map((num, idx) => (
                      <Tag key={idx} color="blue" style={{ marginBottom: 4 }}>{num}</Tag>
                    ))}
                  </div>
                </div>

                <Row gutter={12}>
                  <Col span={12}>
                    <Statistic title="Last Used" value={mockConfig.admissionNumber.lastUsed} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="Next Available" value={mockConfig.admissionNumber.nextAvailable} />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Space size="large">
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
              >
                Save Configuration
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={loadStudentConfig}
                disabled={loading}
              >
                Reset to Default
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default StudentConfig;
import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Select, Input, Modal, Form, Row, Col, Tag, Space, Divider, Tooltip, message, Badge, Alert, InputNumber, Switch } from 'antd';
import { WalletOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, PercentageOutlined, SettingOutlined, CheckCircleOutlined, StarOutlined, SaveOutlined, FormOutlined } from '@ant-design/icons';
import { useClasses } from '../contexts/ClassesContext';
import feeService from '../services/feeService';
import api from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const FeeStructureManagement = () => {
  const { classes, loading: classesLoading } = useClasses();
  const [structures, setStructures] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [structureModalVisible, setStructureModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editStructure, setEditStructure] = useState(null);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [templateForm] = Form.useForm();
  const [hikeDiscount, setHikeDiscount] = useState(0);
  const [hikeType, setHikeType] = useState('hike');
  const [currentAppliedTemplate, setCurrentAppliedTemplate] = useState(null);
  const [classStructures, setClassStructures] = useState({}); // Track structures per class
  const [createFromTemplate, setCreateFromTemplate] = useState(false);
  
  // New state for enhanced functionality
  const [customFeeTypes, setCustomFeeTypes] = useState([]);
  const [feeTypeModalVisible, setFeeTypeModalVisible] = useState(false);
  const [feeTypeForm] = Form.useForm();
  const [createTemplateModalVisible, setCreateTemplateModalVisible] = useState(false);
  const [createTemplateForm] = Form.useForm();
  const [dynamicFeeFields, setDynamicFeeFields] = useState([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Default fee types with class-based amounts
  const defaultFeeTypes = [
    { key: 'tuition_fee', name: 'Tuition Fee', required: true, classBased: true },
    { key: 'transport_fee', name: 'Transport Fee', required: false, classBased: true },
    { key: 'library_fee', name: 'Library Fee', required: false, classBased: true },
    { key: 'lab_fee', name: 'Laboratory Fee', required: false, classBased: true },
    { key: 'sports_fee', name: 'Sports Fee', required: false, classBased: true },
    { key: 'exam_fee', name: 'Examination Fee', required: false, classBased: true },
    { key: 'computer_fee', name: 'Computer Fee', required: false, classBased: true },
    { key: 'activity_fee', name: 'Activity Fee', required: false, classBased: true },
    { key: 'development_fee', name: 'Development Fee', required: false, classBased: true },
    { key: 'admission_fee', name: 'Admission Fee', required: false, classBased: false },
    { key: 'annual_fee', name: 'Annual Fee', required: false, classBased: false },
  ];

  // Class-based fee amounts (example structure)
  const classBasedAmounts = {
    1: { tuition_fee: 15000, transport_fee: 1500, library_fee: 800, lab_fee: 500, sports_fee: 600, exam_fee: 1000, computer_fee: 400, activity_fee: 300, development_fee: 2000 },
    2: { tuition_fee: 16000, transport_fee: 1600, library_fee: 850, lab_fee: 550, sports_fee: 650, exam_fee: 1100, computer_fee: 450, activity_fee: 350, development_fee: 2200 },
    3: { tuition_fee: 17000, transport_fee: 1700, library_fee: 900, lab_fee: 600, sports_fee: 700, exam_fee: 1200, computer_fee: 500, activity_fee: 400, development_fee: 2400 },
    4: { tuition_fee: 18000, transport_fee: 1800, library_fee: 950, lab_fee: 650, sports_fee: 750, exam_fee: 1300, computer_fee: 550, activity_fee: 450, development_fee: 2600 },
    5: { tuition_fee: 19000, transport_fee: 1900, library_fee: 1000, lab_fee: 700, sports_fee: 800, exam_fee: 1400, computer_fee: 600, activity_fee: 500, development_fee: 2800 },
    6: { tuition_fee: 20000, transport_fee: 2000, library_fee: 1100, lab_fee: 800, sports_fee: 900, exam_fee: 1500, computer_fee: 700, activity_fee: 600, development_fee: 3000 },
    7: { tuition_fee: 21000, transport_fee: 2100, library_fee: 1200, lab_fee: 900, sports_fee: 1000, exam_fee: 1600, computer_fee: 800, activity_fee: 700, development_fee: 3200 },
    8: { tuition_fee: 22000, transport_fee: 2200, library_fee: 1300, lab_fee: 1000, sports_fee: 1100, exam_fee: 1700, computer_fee: 900, activity_fee: 800, development_fee: 3400 },
    9: { tuition_fee: 23000, transport_fee: 2300, library_fee: 1400, lab_fee: 1200, sports_fee: 1200, exam_fee: 1800, computer_fee: 1000, activity_fee: 900, development_fee: 3600 },
    10: { tuition_fee: 25000, transport_fee: 2500, library_fee: 1500, lab_fee: 1500, sports_fee: 1300, exam_fee: 2000, computer_fee: 1200, activity_fee: 1000, development_fee: 4000 },
    11: { tuition_fee: 26000, transport_fee: 2600, library_fee: 1600, lab_fee: 1800, sports_fee: 1400, exam_fee: 2200, computer_fee: 1400, activity_fee: 1100, development_fee: 4200 },
    12: { tuition_fee: 27000, transport_fee: 2700, library_fee: 1700, lab_fee: 2000, sports_fee: 1500, exam_fee: 2400, computer_fee: 1600, activity_fee: 1200, development_fee: 4400 },
  };

  useEffect(() => {
    loadStructures();
    loadTemplates();
    loadClassStructures();
    loadCustomFeeTypes();
  }, [selectedClass, selectedYear]);

  const loadStructures = async () => {
    setLoading(true);
    try {
      if (selectedClass) {
        const response = await feeService.getFeeStructure(selectedClass, selectedYear);
        if (response.success) {
          setStructures([response.data]);
          // Check which template is currently applied
          const appliedTemplate = templates.find(t => 
            JSON.stringify(t.data) === JSON.stringify(response.data)
          );
          setCurrentAppliedTemplate(appliedTemplate?.name || null);
        } else {
          setStructures([]);
          setCurrentAppliedTemplate(null);
        }
      }
    } catch (error) {
      console.error('Error loading structures:', error);
      setStructures([]);
    }
    setLoading(false);
  };

  const loadClassStructures = async () => {
    try {
      // Load structures for all classes to show which have structures defined
      const allStructures = {};
      for (const cls of classes) {
        const response = await feeService.getFeeStructure(cls.id, selectedYear);
        if (response.success && response.data) {
          allStructures[cls.id] = response.data;
        }
      }
      setClassStructures(allStructures);
    } catch (error) {
      console.error('Error loading class structures:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await feeService.getFeeTemplates();
      if (response.success) {
        setTemplates(response.data);
      } else {
        console.error('Failed to load templates:', response.error);
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
    }
  };

  const loadCustomFeeTypes = async () => {
    try {
      const response = await feeService.getCustomFeeTypes();
      if (response.success) {
        setCustomFeeTypes(response.data);
      } else {
        console.error('Failed to load custom fee types:', response.error);
        setCustomFeeTypes([]);
      }
    } catch (error) {
      console.error('Error loading custom fee types:', error);
      setCustomFeeTypes([]);
    }
  };

  const handleCreateStructure = () => {
    setEditStructure(null);
    setCreateFromTemplate(false);
    form.resetFields();
    
    // Pre-fill with class-based amounts if available
    if (selectedClass && classBasedAmounts[selectedClass]) {
      form.setFieldsValue(classBasedAmounts[selectedClass]);
    }
    
    setStructureModalVisible(true);
  };

  const handleCreateFromTemplate = () => {
    setCreateFromTemplate(true);
    setTemplateModalVisible(true);
  };

  const handleEditStructure = (record) => {
    setEditStructure(record);
    // Convert the structures array back to form format
    const formData = {};
    structures[0] && Object.entries(structures[0]).forEach(([key, value]) => {
      formData[key] = value;
    });
    form.setFieldsValue(formData);
    setStructureModalVisible(true);
  };

  const handleDeleteStructure = () => {
    Modal.confirm({
      title: 'Delete Fee Structure?',
      content: `Are you sure you want to delete the fee structure for ${getSelectedClassName()}?`,
      onOk: async () => {
        try {
          const response = await feeService.deleteFeeStructure(selectedClass, selectedYear);
          if (response.success) {
            message.success('Fee structure deleted successfully');
            loadStructures();
            loadClassStructures();
          } else {
            message.error(response.error || 'Failed to delete fee structure');
          }
        } catch (error) {
          message.error('Failed to delete fee structure');
        }
      },
    });
  };

  const handleApplyTemplate = (template) => {
    if (createFromTemplate) {
      // Apply template and open create modal
      form.setFieldsValue(template.data);
      setTemplateModalVisible(false);
      setStructureModalVisible(true);
    } else {
      // Direct template application
      Modal.confirm({
        title: 'Apply Template',
        content: `Apply "${template.name}" template to ${getSelectedClassName()}? This will replace any existing fee structure.`,
        onOk: async () => {
          try {
            // Replace with actual API call
            await feeService.createFeeStructure(selectedClass, selectedYear, template.data);
            message.success(`Template "${template.name}" applied successfully`);
            setCurrentAppliedTemplate(template.name);
            setTemplateModalVisible(false);
            loadStructures();
            loadClassStructures();
          } catch (error) {
            message.error('Failed to apply template');
          }
        }
      });
    }
  };

  const handleHikeDiscount = () => {
    const values = form.getFieldsValue();
    const factor = hikeType === 'hike' ? 1 + hikeDiscount / 100 : 1 - hikeDiscount / 100;
    const updated = {};
    Object.keys(values).forEach(key => {
      if (typeof values[key] === 'number' && values[key] > 0) {
        updated[key] = Math.round(values[key] * factor);
      } else {
        updated[key] = values[key];
      }
    });
    form.setFieldsValue(updated);
    message.success(`${hikeType === 'hike' ? 'Hike' : 'Discount'} of ${hikeDiscount}% applied`);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (editStructure) {
        await feeService.updateFeeStructure(selectedClass, selectedYear, values);
        message.success('Fee structure updated successfully');
      } else {
        await feeService.createFeeStructure(selectedClass, selectedYear, values);
        message.success('Fee structure created successfully');
      }
      setStructureModalVisible(false);
      loadStructures();
      loadClassStructures();
    } catch (error) {
      message.error('Failed to save fee structure');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeeType = async (values) => {
    try {
      const response = await feeService.createCustomFeeType({
        name: values.name,
        key: values.key.toLowerCase().replace(/\s+/g, '_'),
        description: values.description
      });
      
      if (response.success) {
        setCustomFeeTypes([...customFeeTypes, response.data]);
        setFeeTypeModalVisible(false);
        feeTypeForm.resetFields();
        message.success('Custom fee type created successfully');
      } else {
        message.error(response.error || 'Failed to create custom fee type');
      }
    } catch (error) {
      message.error('Failed to create custom fee type');
    }
  };

  const handleCreateTemplate = async (values) => {
    try {
      const response = await feeService.createFeeTemplate({
        name: values.name,
        description: values.description,
        data: values.feeStructure,
        isDefault: false
      });
      
      if (response.success) {
        setTemplates([...templates, response.data]);
        setCreateTemplateModalVisible(false);
        createTemplateForm.resetFields();
        message.success('Template created successfully');
      } else {
        message.error(response.error || 'Failed to create template');
      }
    } catch (error) {
      message.error('Failed to create template');
    }
  };

  const getSelectedClassName = () => {
    const selectedClassObj = classes.find(cls => cls.id === selectedClass);
    return selectedClassObj ? `${selectedClassObj.class_name} - ${selectedClassObj.section}` : '';
  };

  const hasStructure = (classId) => {
    return classStructures[classId] !== undefined;
  };

  const getStructureTotal = (structure) => {
    return Object.values(structure || {}).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
  };

  const getAllFeeTypes = () => {
    return [...defaultFeeTypes, ...customFeeTypes];
  };

  const columns = [
    { 
      title: 'Fee Type', 
      dataIndex: 'type', 
      key: 'type', 
      render: (text) => <Tag color="purple">{text.replace(/_/g, ' ').toUpperCase()}</Tag> 
    },
    { 
      title: 'Amount', 
      dataIndex: 'amount', 
      key: 'amount', 
      render: (amt) => <Text strong style={{ fontSize: '16px', color: '#7B83EB' }}>₹{amt?.toLocaleString()}</Text> 
    },
  ];

  const templateColumns = [
    { 
      title: 'Template', 
      dataIndex: 'name', 
      key: 'name',
      render: (name, record) => (
        <div>
          <Space>
            <Text strong>{name}</Text>
            {currentAppliedTemplate === name && selectedClass && (
              <Badge status="success" text="Currently Applied" />
            )}
            {record.isDefault && <Tag size="small" color="blue">Default</Tag>}
          </Space>
          <div><Text type="secondary" style={{ fontSize: '12px' }}>{record.description}</Text></div>
        </div>
      )
    },
    { 
      title: 'Total Amount', 
      key: 'total',
      render: (_, record) => (
        <Text strong style={{ color: '#7B83EB' }}>₹{getStructureTotal(record.data).toLocaleString()}</Text>
      )
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleApplyTemplate(record)}
            disabled={!selectedClass}
          >
            {createFromTemplate ? 'Use Template' : 'Apply'}
          </Button>
          {!record.isDefault && (
            <Button size="small" icon={<EditOutlined />}>Edit</Button>
          )}
        </Space>
      ) 
    }
  ];

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(159,179,223,0.15)', border: '1px solid rgba(159,179,223,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ color: '#7B83EB', margin: 0 }}>
          <WalletOutlined /> Fee Structure Management
        </Title>
        <Space>
          <Button 
            icon={<FormOutlined />} 
            onClick={() => setFeeTypeModalVisible(true)}
            size="small"
          >
            Manage Fee Types
          </Button>
          <Button 
            icon={<SaveOutlined />} 
            onClick={() => setCreateTemplateModalVisible(true)}
            size="small"
          >
            Create Template
          </Button>
          <Select
            placeholder="Academic Year"
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: 140 }}
          >
            {[2022, 2023, 2024, 2025].map(y => <Option key={y} value={y}>{y}-{y+1}</Option>)}
          </Select>
          <Select
            placeholder="Select Class"
            value={selectedClass}
            onChange={setSelectedClass}
            style={{ width: 200 }}
            loading={classesLoading}
          >
            {classes.map(cls => (
              <Option key={cls.id} value={cls.id}>
                <Space>
                  {cls.class_name} - {cls.section}
                  {hasStructure(cls.id) && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                </Space>
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      {selectedClass && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Alert
              message={
                <Space>
                  <Text strong>Selected: {getSelectedClassName()}</Text>
                  {currentAppliedTemplate && (
                    <Tag color="green" icon={<StarOutlined />}>Template: {currentAppliedTemplate}</Tag>
                  )}
                  {classBasedAmounts[selectedClass] && (
                    <Tag color="blue">Class-based amounts available</Tag>
                  )}
                </Space>
              }
              type="info"
              showIcon
              style={{ borderRadius: 8 }}
            />
          </Col>
        </Row>
      )}

      <Row gutter={16}>
        <Col span={16}>
          <Card 
            title={<Space><WalletOutlined />Fee Structure Details</Space>}
            bordered={false} 
            style={{ borderRadius: 12 }}
            extra={
              selectedClass && structures.length > 0 && (
                <Space>
                  <Text type="secondary">Total: </Text>
                  <Text strong style={{ fontSize: '18px', color: '#7B83EB' }}>
                    ₹{getStructureTotal(structures[0]).toLocaleString()}
                  </Text>
                </Space>
              )
            }
          >
            {!selectedClass ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <WalletOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>Please select a class to view fee structure</div>
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={structures.length ? Object.entries(structures[0]).map(([type, amount]) => ({ 
                  key: type, 
                  type: type.replace(/_/g, ' '), 
                  amount 
                })) : []}
                loading={loading}
                pagination={false}
                locale={{ emptyText: 'No fee structure defined for this class' }}
              />
            )}
            
            {selectedClass && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Space>
                  {structures.length > 0 ? (
                    <>
                      <Button icon={<EditOutlined />} onClick={() => handleEditStructure(structures[0])}>
                        Edit Structure
                      </Button>
                      <Button danger icon={<DeleteOutlined />} onClick={handleDeleteStructure}>
                        Delete Structure
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateStructure} style={{ background: '#7B83EB', border: 'none' }}>
                        Create New Structure
                      </Button>
                      <Button icon={<CopyOutlined />} onClick={handleCreateFromTemplate}>
                        Create from Template
                      </Button>
                    </>
                  )}
                </Space>
              </div>
            )}
          </Card>
        </Col>
        
        <Col span={8}>
          <Card 
            title={<Space><CopyOutlined />Quick Templates</Space>}
            bordered={false} 
            style={{ borderRadius: 12 }}
            extra={
              <Button size="small" onClick={() => setTemplateModalVisible(true)}>
                View All
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {templates.slice(0, 3).map(template => (
                <Card 
                  key={template.id}
                  size="small" 
                  style={{ backgroundColor: currentAppliedTemplate === template.name ? '#f6ffed' : '#fafafa' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>{template.name}</Text>
                      {currentAppliedTemplate === template.name && selectedClass && (
                        <div><Tag size="small" color="success">Applied</Tag></div>
                      )}
                      <div><Text type="secondary">₹{getStructureTotal(template.data).toLocaleString()}</Text></div>
                    </div>
                    <Button 
                      size="small" 
                      type={currentAppliedTemplate === template.name ? "default" : "primary"}
                      onClick={() => handleApplyTemplate(template)}
                      disabled={!selectedClass}
                    >
                      {currentAppliedTemplate === template.name ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Structure Creation/Edit Modal */}
      <Modal
        title={
          <Space>
            <SettingOutlined />
            {editStructure ? 'Edit Fee Structure' : 'Create Fee Structure'}
            {selectedClass && <Tag color="blue">{getSelectedClassName()}</Tag>}
          </Space>
        }
        visible={structureModalVisible}
        onCancel={() => setStructureModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={24}>
              <div style={{ marginBottom: 16 }}>
                <Switch 
                  checked={showAdvancedOptions} 
                  onChange={setShowAdvancedOptions}
                  checkedChildren="Advanced Options"
                  unCheckedChildren="Basic Options"
                />
              </div>
            </Col>
          </Row>

          {/* Default Fee Types */}
          <Row gutter={16}>
            {getAllFeeTypes().slice(0, showAdvancedOptions ? getAllFeeTypes().length : 6).map((feeType, index) => (
              <Col span={12} key={feeType.key}>
                <Form.Item 
                  name={feeType.key} 
                  label={feeType.name}
                  rules={feeType.required ? [{ required: true, message: `Please enter ${feeType.name.toLowerCase()}` }] : []}
                >
                  <InputNumber 
                    prefix="₹" 
                    placeholder="Enter amount" 
                    style={{ width: '100%' }}
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>

          {showAdvancedOptions && (
            <>
              <Divider>Bulk Adjustment</Divider>
              <Row gutter={16} align="middle">
                <Col span={8}>
                  <InputNumber
                    prefix={<PercentageOutlined />}
                    value={hikeDiscount}
                    onChange={setHikeDiscount}
                    placeholder="Enter %"
                    style={{ width: '100%' }}
                    min={0}
                    max={100}
                  />
                </Col>
                <Col span={8}>
                  <Select value={hikeType} onChange={setHikeType} style={{ width: '100%' }}>
                    <Option value="hike">Increase</Option>
                    <Option value="discount">Decrease</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Button onClick={handleHikeDiscount} icon={<PercentageOutlined />} block>
                    Apply {hikeDiscount}%
                  </Button>
                </Col>
              </Row>
            </>
          )}
          
          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setStructureModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editStructure ? 'Update Structure' : 'Create Structure'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Templates Modal */}
      <Modal
        title={<Space><CopyOutlined />Fee Structure Templates</Space>}
        visible={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={
          <Button onClick={() => setTemplateModalVisible(false)}>Close</Button>
        }
        width={800}
      >
        {!selectedClass && (
          <Alert 
            message="Please select a class first to apply templates" 
            type="warning" 
            style={{ marginBottom: 16 }} 
          />
        )}
        <Table
          columns={templateColumns}
          dataSource={templates}
          pagination={false}
          size="small"
        />
      </Modal>

      {/* Custom Fee Type Modal */}
      <Modal
        title={<Space><FormOutlined />Create Custom Fee Type</Space>}
        visible={feeTypeModalVisible}
        onCancel={() => setFeeTypeModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={feeTypeForm} layout="vertical" onFinish={handleCreateFeeType}>
          <Form.Item 
            name="name" 
            label="Fee Type Name" 
            rules={[{ required: true, message: 'Please enter fee type name' }]}
          >
            <Input placeholder="e.g., Music Fee, Art Fee" />
          </Form.Item>
          <Form.Item 
            name="key" 
            label="Fee Type Key" 
            rules={[{ required: true, message: 'Please enter fee type key' }]}
          >
            <Input placeholder="e.g., music_fee, art_fee" />
          </Form.Item>
          <Form.Item 
            name="description" 
            label="Description"
          >
            <TextArea rows={3} placeholder="Brief description of the fee type" />
          </Form.Item>
          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setFeeTypeModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Create Fee Type
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Template Modal */}
      <Modal
        title={<Space><SaveOutlined />Create New Template</Space>}
        visible={createTemplateModalVisible}
        onCancel={() => setCreateTemplateModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={createTemplateForm} layout="vertical" onFinish={handleCreateTemplate}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="name" 
                label="Template Name" 
                rules={[{ required: true, message: 'Please enter template name' }]}
              >
                <Input placeholder="e.g., Premium Template" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="description" 
                label="Description"
              >
                <Input placeholder="Brief description" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider>Fee Structure</Divider>
          
          <Row gutter={16}>
            {getAllFeeTypes().map((feeType) => (
              <Col span={12} key={feeType.key}>
                <Form.Item 
                  name={['feeStructure', feeType.key]} 
                  label={feeType.name}
                >
                  <InputNumber 
                    prefix="₹" 
                    placeholder="Enter amount" 
                    style={{ width: '100%' }}
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
          
          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setCreateTemplateModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Create Template
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FeeStructureManagement;
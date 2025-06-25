import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Select, Input, Modal, Form, Row, Col, Tag, Space, Divider, Tooltip, message, Badge, Alert, InputNumber, Switch, Checkbox, Tabs, Avatar, List, Empty } from 'antd';
import { WalletOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, PercentageOutlined, SettingOutlined, CheckCircleOutlined, StarOutlined, SaveOutlined, FormOutlined, UserOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons';
import { useClasses } from '../contexts/ClassesContext';
import feeService from '../services/feeService';
import api from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const FeeStructureManagement = () => {
  const { classes, loading: classesLoading } = useClasses();
  
  // State for class-based templates
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [classTemplates, setClassTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  
  // State for student management
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFeeStructure, setStudentFeeStructure] = useState(null);
  const [loadingStudentFee, setLoadingStudentFee] = useState(false);
  const [classStudents, setClassStudents] = useState([]);
  const [loadingClassStudents, setLoadingClassStudents] = useState(false);
  
  // Modal states
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [createTemplateModalVisible, setCreateTemplateModalVisible] = useState(false);
  const [applyTemplateModalVisible, setApplyTemplateModalVisible] = useState(false);
  const [studentFeeModalVisible, setStudentFeeModalVisible] = useState(false);
  
  // Form instances
  const [templateForm] = Form.useForm();
  const [createTemplateForm] = Form.useForm();
  const [applyTemplateForm] = Form.useForm();
  const [studentFeeForm] = Form.useForm();
  
  // Other states
  const [loading, setLoading] = useState(false);
  const [customFeeTypes, setCustomFeeTypes] = useState([]);
  const [feeTypeModalVisible, setFeeTypeModalVisible] = useState(false);
  const [feeTypeForm] = Form.useForm();

  // Default fee types
  const defaultFeeTypes = [
    { key: 'tuition_fee', name: 'Tuition Fee', required: true },
    { key: 'transport_fee', name: 'Transport Fee', required: false },
    { key: 'library_fee', name: 'Library Fee', required: false },
    { key: 'lab_fee', name: 'Laboratory Fee', required: false },
    { key: 'sports_fee', name: 'Sports Fee', required: false },
    { key: 'exam_fee', name: 'Examination Fee', required: false },
    { key: 'computer_fee', name: 'Computer Fee', required: false },
    { key: 'activity_fee', name: 'Activity Fee', required: false },
    { key: 'development_fee', name: 'Development Fee', required: false },
    { key: 'admission_fee', name: 'Admission Fee', required: false },
    { key: 'annual_fee', name: 'Annual Fee', required: false },
  ];

  useEffect(() => {
    if (selectedClass) {
      loadClassTemplates();
      loadClassStudents();
    }
  }, [selectedClass, selectedYear]);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentFeeStructure();
    }
  }, [selectedStudent, selectedYear]);

  const loadClassTemplates = async () => {
    if (!selectedClass) return;
    
    setLoadingTemplates(true);
    try {
      const response = await feeService.getClassTemplates(selectedClass);
      if (response.success) {
        setClassTemplates(response.data);
      } else {
        console.error('Failed to load class templates:', response.error);
        setClassTemplates([]);
      }
    } catch (error) {
      console.error('Error loading class templates:', error);
      setClassTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadClassStudents = async () => {
    if (!selectedClass) return;
    
    setLoadingClassStudents(true);
    try {
      const response = await api.class.getClass(selectedClass);
      if (response.success && response.data) {
        // Extract students from the class response
        const students = response.data.students || [];
        setClassStudents(students);
      } else {
        console.error('Failed to load class students:', response.error);
        setClassStudents([]);
      }
    } catch (error) {
      console.error('Error loading class students:', error);
      setClassStudents([]);
    } finally {
      setLoadingClassStudents(false);
    }
  };

  const loadStudentFeeStructure = async () => {
    if (!selectedStudent) return;
    
    setLoadingStudentFee(true);
    try {
      const response = await feeService.getStudentFeeStructure(selectedStudent, selectedYear);
      if (response.success) {
        setStudentFeeStructure(response.data);
      } else {
        console.error('Failed to load student fee structure:', response.error);
        setStudentFeeStructure(null);
      }
    } catch (error) {
      console.error('Error loading student fee structure:', error);
      setStudentFeeStructure(null);
    } finally {
      setLoadingStudentFee(false);
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

  const handleCreateTemplate = async (values) => {
    try {
      setLoading(true);
      const response = await feeService.createClassTemplate(selectedClass, {
        name: values.name,
        description: values.description,
        data: values.feeStructure,
        isDefault: false
      });
      
      if (response.success) {
        setClassTemplates([...classTemplates, response.data]);
        setCreateTemplateModalVisible(false);
        createTemplateForm.resetFields();
        message.success('Template created successfully');
      } else {
        message.error(response.error || 'Failed to create template');
      }
    } catch (error) {
      message.error('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplateToStudent = async (values) => {
    try {
      setLoading(true);
      const response = await feeService.applyTemplateToStudent(
        selectedStudent, 
        values.templateId, 
        selectedYear
      );
      
      if (response.success) {
        message.success('Template applied to student successfully');
        setApplyTemplateModalVisible(false);
        applyTemplateForm.resetFields();
        loadStudentFeeStructure(); // Refresh student fee structure
      } else {
        message.error(response.error || 'Failed to apply template to student');
      }
    } catch (error) {
      message.error('Failed to apply template to student');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudentFeeStructure = async (values) => {
    try {
      setLoading(true);
      const response = await feeService.updateStudentFeeStructure(
        selectedStudent,
        values.feeStructure,
        selectedYear
      );
      
      if (response.success) {
        message.success('Student fee structure updated successfully');
        setStudentFeeModalVisible(false);
        studentFeeForm.resetFields();
        loadStudentFeeStructure(); // Refresh student fee structure
      } else {
        message.error(response.error || 'Failed to update student fee structure');
      }
    } catch (error) {
      message.error('Failed to update student fee structure');
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

  const getSelectedClassName = () => {
    const selectedClassObj = classes.find(cls => cls.id === selectedClass);
    return selectedClassObj ? `${selectedClassObj.class_name} - ${selectedClassObj.section}` : '';
  };

  const getSelectedStudentName = () => {
    const selectedStudentObj = classStudents.find(student => student.id === selectedStudent);
    if (selectedStudentObj && selectedStudentObj.user) {
      return `${selectedStudentObj.user.first_name} ${selectedStudentObj.user.last_name}`;
    }
    return '';
  };

  const getStructureTotal = (structure) => {
    if (!structure) return 0;
    return Object.values(structure).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
  };

  const getAllFeeTypes = () => {
    const allTypes = [...defaultFeeTypes];
    customFeeTypes.forEach(customType => {
      allTypes.push({
        key: customType.key,
        name: customType.name,
        required: false
      });
    });
    return allTypes;
  };

  const templateColumns = [
    { 
      title: 'Template', 
      dataIndex: 'name', 
      key: 'name',
      render: (name, record) => (
        <div>
          <Space>
            <Text strong>{name}</Text>
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
        <Text strong style={{ color: '#7B83EB' }}>
          ₹{getStructureTotal(record.data).toLocaleString()}
        </Text>
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
            onClick={() => {
              setSelectedStudent(null);
              setApplyTemplateModalVisible(true);
              applyTemplateForm.setFieldsValue({ templateId: record.id });
            }}
          >
            Apply to Student
          </Button>
          {!record.isDefault && (
            <Button size="small" icon={<EditOutlined />}>Edit</Button>
          )}
        </Space>
      ) 
    }
  ];

  const studentColumns = [
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#7B83EB' }} />
          <div>
            <div><Text strong>{`${record.user?.first_name || ''} ${record.user?.last_name || ''}`}</Text></div>
            <div><Text type="secondary" style={{ fontSize: '12px' }}>ID: {record.id}</Text></div>
          </div>
        </Space>
      )
    },
    {
      title: 'Email',
      key: 'email',
      render: (_, record) => (
        <Text>{record.user?.email || 'N/A'}</Text>
      )
    },
    {
      title: 'Current Template',
      key: 'template',
      render: (_, record) => {
        // This would be fetched from student fee structure
        return <Text>Standard Template</Text>;
      }
    },
    {
      title: 'Total Fee',
      key: 'total',
      render: (_, record) => {
        // This would be calculated from student fee structure
        return <Text strong style={{ color: '#7B83EB' }}>₹16,500</Text>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            onClick={() => {
              setSelectedStudent(record.id);
              setStudentFeeModalVisible(true);
            }}
          >
            Manage Fee
          </Button>
          <Button 
            size="small" 
            type="primary"
            onClick={() => {
              setSelectedStudent(record.id);
              setApplyTemplateModalVisible(true);
            }}
          >
            Apply Template
          </Button>
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
                  <Tag size="small">{cls.total_students || 0} students</Tag>
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
                  <Tag color="blue">{classStudents.length} students</Tag>
                </Space>
              }
              type="info"
              showIcon
              style={{ borderRadius: 8 }}
            />
          </Col>
        </Row>
      )}

      {selectedClass && (
        <Tabs defaultActiveKey="templates" style={{ marginTop: 16 }}>
          <TabPane 
            tab={
              <Space>
                <BookOutlined />
                Class Templates
              </Space>
            } 
            key="templates"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Card 
                  title={
                    <Space>
                      <CopyOutlined />
                      Templates for {getSelectedClassName()}
                    </Space>
                  }
                  extra={
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setCreateTemplateModalVisible(true)}
                    >
                      Create Template
                    </Button>
                  }
                  bordered={false}
                  style={{ borderRadius: 12 }}
                >
                  <Table
                    columns={templateColumns}
                    dataSource={classTemplates}
                    loading={loadingTemplates}
                    pagination={false}
                    size="small"
                    locale={{ 
                      emptyText: (
                        <Empty
                          description="No templates found for this class"
                          style={{ padding: '40px 0' }}
                        />
                      ) 
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane 
            tab={
              <Space>
                <TeamOutlined />
                Students ({classStudents.length})
              </Space>
            } 
            key="students"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Card 
                  title={
                    <Space>
                      <UserOutlined />
                      Students in {getSelectedClassName()}
                    </Space>
                  }
                  bordered={false}
                  style={{ borderRadius: 12 }}
                >
                  <Table
                    columns={studentColumns}
                    dataSource={classStudents}
                    loading={loadingClassStudents}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} students`
                    }}
                    size="small"
                    locale={{ 
                      emptyText: (
                        <Empty
                          description="No students found in this class"
                          style={{ padding: '40px 0' }}
                        />
                      ) 
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      )}

      {!selectedClass && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
          <WalletOutlined style={{ fontSize: '64px', marginBottom: '24px' }} />
          <Title level={4} style={{ color: '#999' }}>Select a Class</Title>
          <Text>Please select a class to manage fee structures and templates</Text>
        </div>
      )}

      {/* Create Template Modal */}
      <Modal
        title={<Space><CopyOutlined />Create Template for {getSelectedClassName()}</Space>}
        visible={createTemplateModalVisible}
        onCancel={() => setCreateTemplateModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={createTemplateForm} layout="vertical" onFinish={handleCreateTemplate}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Template Name" rules={[{ required: true, message: 'Please enter template name' }]}>
                <Input placeholder="Enter template name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="description" label="Description">
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
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Template
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Apply Template to Student Modal */}
      <Modal
        title={<Space><UserOutlined />Apply Template to Student</Space>}
        visible={applyTemplateModalVisible}
        onCancel={() => setApplyTemplateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={applyTemplateForm} layout="vertical" onFinish={handleApplyTemplateToStudent}>
          <Form.Item name="templateId" label="Select Template" rules={[{ required: true, message: 'Please select a template' }]}>
            <Select placeholder="Choose a template">
              {classTemplates.map(template => (
                <Option key={template.id} value={template.id}>
                  <Space>
                    {template.name}
                    <Text type="secondary">₹{getStructureTotal(template.data).toLocaleString()}</Text>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          {selectedStudent && (
            <Alert
              message={`Applying template to: ${getSelectedStudentName()}`}
              type="info"
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setApplyTemplateModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Apply Template
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Student Fee Structure Modal */}
      <Modal
        title={<Space><WalletOutlined />Manage Student Fee Structure</Space>}
        visible={studentFeeModalVisible}
        onCancel={() => setStudentFeeModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedStudent && (
          <Alert
            message={`Managing fee structure for: ${getSelectedStudentName()}`}
            type="info"
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Form form={studentFeeForm} layout="vertical" onFinish={handleUpdateStudentFeeStructure}>
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
              <Button onClick={() => setStudentFeeModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Fee Structure
              </Button>
            </Space>
          </Form.Item>
        </Form>
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
    </div>
  );
};

export default FeeStructureManagement;
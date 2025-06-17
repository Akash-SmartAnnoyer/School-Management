// import React, { useState, useEffect } from 'react';
// import { 
//   Card, 
//   Form, 
//   Input, 
//   Button, 
//   message, 
//   Row, 
//   Col, 
//   Divider,
//   Typography,
//   Space,
//   Select,
//   Switch,
//   InputNumber,
//   Alert,
//   Tabs,
//   Table,
//   Tag,
//   Tooltip,
//   Radio,
//   Checkbox,
//   Collapse,
//   Statistic
// } from 'antd';
// import { 
//   SaveOutlined,
//   UserOutlined,
//   NumberOutlined,
//   IdcardOutlined,
//   SettingOutlined,
//   InfoCircleOutlined,
//   ReloadOutlined,
//   HistoryOutlined,
//   LockOutlined,
//   UnlockOutlined,
//   EditOutlined,
//   EyeOutlined
// } from '@ant-design/icons';

// const { Title, Text } = Typography;
// const { Option } = Select;
// const { TabPane } = Tabs;
// const { Panel } = Collapse;

// const StudentConfig = () => {
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);
//   const [previewMode, setPreviewMode] = useState(false);
//   const [historyVisible, setHistoryVisible] = useState(false);

//   useEffect(() => {
//     loadStudentConfig();
//   }, []);

//   const loadStudentConfig = async () => {
//     try {
//       setLoading(true);
//       // TODO: Implement with new database
//       // const config = await getStudentConfig();
      
//       // Enhanced mock data with more features
//       const mockConfig = {
//         admissionNumber: {
//           autoGenerate: true,
//           prefix: 'ADM',
//           startNumber: 1,
//           digits: 3,
//           lastUsed: 'ADM099',
//           nextAvailable: 'ADM100',
//           format: 'prefix_sequential',
//           yearIncluded: true,
//           yearPosition: 'prefix',
//           yearFormat: 'YY',
//           allowManual: true,
//           allowDuplicates: false,
//           validationRules: {
//             minLength: 5,
//             maxLength: 10,
//             pattern: '^[A-Z0-9]+$'
//           },
//           history: [
//             { number: 'ADM098', student: 'John Doe', date: '2024-03-15' },
//             { number: 'ADM097', student: 'Jane Smith', date: '2024-03-14' }
//           ]
//         },
//         rollNumber: {
//           autoGenerate: true,
//           format: 'class_section',
//           prefix: '',
//           digits: 2,
//           resetPerYear: true,
//           resetPerClass: true,
//           allowManual: true,
//           allowDuplicates: false,
//           validationRules: {
//             minLength: 3,
//             maxLength: 8,
//             pattern: '^[A-Z0-9]+$'
//           },
//           status: [
//             { 
//               class: 1, 
//               section: 'A', 
//               lastNumber: '1A30', 
//               nextNumber: '1A31',
//               totalStudents: 30,
//               availableNumbers: 20
//             },
//             { 
//               class: 1, 
//               section: 'B', 
//               lastNumber: '1B25', 
//               nextNumber: '1B26',
//               totalStudents: 25,
//               availableNumbers: 25
//             },
//             { 
//               class: 2, 
//               section: 'A', 
//               lastNumber: '2A28', 
//               nextNumber: '2A29',
//               totalStudents: 28,
//               availableNumbers: 22
//             }
//           ]
//         }
//       };

//       form.setFieldsValue({
//         admissionNumberAutoGenerate: mockConfig.admissionNumber.autoGenerate,
//         admissionNumberPrefix: mockConfig.admissionNumber.prefix,
//         admissionNumberStart: mockConfig.admissionNumber.startNumber,
//         admissionNumberDigits: mockConfig.admissionNumber.digits,
//         lastAdmissionNumber: mockConfig.admissionNumber.lastUsed,
//         nextAdmissionNumber: mockConfig.admissionNumber.nextAvailable,
//         admissionNumberFormat: mockConfig.admissionNumber.format,
//         yearIncluded: mockConfig.admissionNumber.yearIncluded,
//         yearPosition: mockConfig.admissionNumber.yearPosition,
//         yearFormat: mockConfig.admissionNumber.yearFormat,
//         allowManualAdmission: mockConfig.admissionNumber.allowManual,
//         allowDuplicateAdmission: mockConfig.admissionNumber.allowDuplicates,
//         rollNumberAutoGenerate: mockConfig.rollNumber.autoGenerate,
//         rollNumberFormat: mockConfig.rollNumber.format,
//         rollNumberPrefix: mockConfig.rollNumber.prefix,
//         rollNumberDigits: mockConfig.rollNumber.digits,
//         rollNumberStatus: mockConfig.rollNumber.status,
//         resetRollPerYear: mockConfig.rollNumber.resetPerYear,
//         resetRollPerClass: mockConfig.rollNumber.resetPerClass,
//         allowManualRoll: mockConfig.rollNumber.allowManual,
//         allowDuplicateRoll: mockConfig.rollNumber.allowDuplicates
//       });
//     } catch (error) {
//       message.error('Failed to load student configuration');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (values) => {
//     try {
//       setLoading(true);
      
//       // Prepare the configuration data
//       const configData = {
//         admissionNumber: {
//           autoGenerate: values.admissionNumberAutoGenerate,
//           prefix: values.admissionNumberPrefix,
//           startNumber: values.admissionNumberStart,
//           digits: values.admissionNumberDigits,
//           format: values.admissionNumberFormat,
//           yearIncluded: values.yearIncluded,
//           yearPosition: values.yearPosition,
//           yearFormat: values.yearFormat,
//           allowManual: values.allowManualAdmission,
//           allowDuplicates: values.allowDuplicateAdmission,
//           validationRules: {
//             minLength: 5,
//             maxLength: 10,
//             pattern: '^[A-Z0-9]+$'
//           }
//         },
//         rollNumber: {
//           autoGenerate: values.rollNumberAutoGenerate,
//           format: values.rollNumberFormat,
//           prefix: values.rollNumberPrefix,
//           digits: values.rollNumberDigits,
//           resetPerYear: values.resetRollPerYear,
//           resetPerClass: values.resetRollPerClass,
//           allowManual: values.allowManualRoll,
//           allowDuplicates: values.allowDuplicateRoll,
//           validationRules: {
//             minLength: 3,
//             maxLength: 8,
//             pattern: '^[A-Z0-9]+$'
//           }
//         }
//       };

//       // TODO: Implement with new database
//       // await updateStudentConfig(configData);
      
//       message.success('Student configuration updated successfully');
//     } catch (error) {
//       message.error('Failed to update student configuration');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderAdmissionNumberPreview = () => {
//     const values = form.getFieldsValue();
//     if (!values.admissionNumberPrefix && !values.admissionNumberStart) return null;

//     const prefix = values.admissionNumberPrefix || '';
//     const start = values.admissionNumberStart || 1;
//     const digits = values.admissionNumberDigits || 3;
//     const year = new Date().getFullYear().toString().slice(-2);

//     let preview = '';
//     if (values.yearIncluded) {
//       if (values.yearPosition === 'prefix') {
//         preview = `${year}${prefix}${start.toString().padStart(digits, '0')}`;
//       } else {
//         preview = `${prefix}${start.toString().padStart(digits, '0')}${year}`;
//       }
//     } else {
//       preview = `${prefix}${start.toString().padStart(digits, '0')}`;
//     }

//     return (
//       <Alert
//         message="Number Preview"
//         description={
//           <div>
//             <Text strong>Example: </Text>
//             <Text code>{preview}</Text>
//             <br />
//             <Text type="secondary">This is how the first admission number will look</Text>
//           </div>
//         }
//         type="info"
//         showIcon
//       />
//     );
//   };

//   const renderRollNumberPreview = () => {
//     const values = form.getFieldsValue();
//     if (!values.rollNumberFormat) return null;

//     let preview = '';
//     switch (values.rollNumberFormat) {
//       case 'sequential':
//         preview = `${values.rollNumberPrefix || ''}01`;
//         break;
//       case 'class_section':
//         preview = '1A01';
//         break;
//       case 'custom':
//         preview = `${values.rollNumberPrefix || ''}01`;
//         break;
//       default:
//         preview = '';
//     }

//     return (
//       <Alert
//         message="Number Preview"
//         description={
//           <div>
//             <Text strong>Example: </Text>
//             <Text code>{preview}</Text>
//             <br />
//             <Text type="secondary">This is how the first roll number will look</Text>
//           </div>
//         }
//         type="info"
//         showIcon
//       />
//     );
//   };

//   const rollNumberColumns = [
//     {
//       title: 'Class',
//       dataIndex: 'class',
//       key: 'class',
//     },
//     {
//       title: 'Section',
//       dataIndex: 'section',
//       key: 'section',
//     },
//     {
//       title: 'Last Number',
//       dataIndex: 'lastNumber',
//       key: 'lastNumber',
//     },
//     {
//       title: 'Next Available',
//       dataIndex: 'nextNumber',
//       key: 'nextNumber',
//     },
//     {
//       title: 'Total Students',
//       dataIndex: 'totalStudents',
//       key: 'totalStudents',
//     },
//     {
//       title: 'Available Numbers',
//       dataIndex: 'availableNumbers',
//       key: 'availableNumbers',
//       render: (text) => (
//         <Tag color={text > 10 ? 'green' : text > 5 ? 'orange' : 'red'}>
//           {text}
//         </Tag>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <Space style={{ marginBottom: 16 }} align="center">
//         <Title level={2} style={{ margin: 0 }}>Student Configuration</Title>
//         <Button 
//           icon={<ReloadOutlined />} 
//           onClick={loadStudentConfig}
//           loading={loading}
//         >
//           Refresh
//         </Button>
//         <Button
//           icon={previewMode ? <EditOutlined /> : <EyeOutlined />}
//           onClick={() => setPreviewMode(!previewMode)}
//         >
//           {previewMode ? 'Edit Mode' : 'Preview Mode'}
//         </Button>
//       </Space>

//       <Card>
//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={handleSubmit}
//         >
//           <Tabs defaultActiveKey="admission">
//             <TabPane 
//               tab={
//                 <span>
//                   <NumberOutlined />
//                   Admission Number
//                 </span>
//               } 
//               key="admission"
//             >
//               <Card title="Admission Number Configuration" style={{ marginBottom: 24 }}>
//                 <Row gutter={16}>
//                   <Col span={12}>
//                     <Form.Item
//                       name="admissionNumberAutoGenerate"
//                       label="Auto-generate Admission Numbers"
//                       valuePropName="checked"
//                     >
//                       <Switch />
//                     </Form.Item>
//                   </Col>
//                   <Col span={12}>
//                     <Form.Item
//                       name="allowManualAdmission"
//                       label="Allow Manual Entry"
//                       valuePropName="checked"
//                       tooltip="Allow manual entry of admission numbers when needed"
//                     >
//                       <Switch />
//                     </Form.Item>
//                   </Col>
//                 </Row>

//                 <Collapse defaultActiveKey={['1']} style={{ marginBottom: 24 }}>
//                   <Panel header="Number Format Settings" key="1">
//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item
//                           name="admissionNumberFormat"
//                           label="Number Format"
//                           tooltip="Choose how admission numbers should be formatted"
//                         >
//                           <Select>
//                             <Option value="prefix_sequential">Prefix + Sequential (ADM001)</Option>
//                             <Option value="year_prefix_sequential">Year + Prefix + Sequential (24ADM001)</Option>
//                             <Option value="prefix_year_sequential">Prefix + Year + Sequential (ADM24001)</Option>
//                             <Option value="custom">Custom Format</Option>
//                           </Select>
//                         </Form.Item>
//                       </Col>
//                       <Col span={12}>
//                         <Form.Item
//                           name="admissionNumberPrefix"
//                           label="Admission Number Prefix"
//                           tooltip="Optional prefix for admission numbers (e.g., 'ADM' for ADM001)"
//                         >
//                           <Input placeholder="e.g., ADM" />
//                         </Form.Item>
//                       </Col>
//                     </Row>

//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item
//                           name="yearIncluded"
//                           label="Include Year"
//                           valuePropName="checked"
//                         >
//                           <Switch />
//                         </Form.Item>
//                       </Col>
//                       <Col span={12}>
//                         <Form.Item
//                           noStyle
//                           shouldUpdate={(prevValues, currentValues) => 
//                             prevValues.yearIncluded !== currentValues.yearIncluded
//                           }
//                         >
//                           {({ getFieldValue }) => 
//                             getFieldValue('yearIncluded') ? (
//                               <Form.Item
//                                 name="yearPosition"
//                                 label="Year Position"
//                               >
//                                 <Radio.Group>
//                                   <Radio value="prefix">Before Prefix</Radio>
//                                   <Radio value="suffix">After Number</Radio>
//                                 </Radio.Group>
//                               </Form.Item>
//                             ) : null
//                           }
//                         </Form.Item>
//                       </Col>
//                     </Row>

//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item
//                           name="admissionNumberStart"
//                           label="Starting Number"
//                           tooltip="The number from which admission numbers will start"
//                         >
//                           <InputNumber min={1} style={{ width: '100%' }} />
//                         </Form.Item>
//                       </Col>
//                       <Col span={12}>
//                         <Form.Item
//                           name="admissionNumberDigits"
//                           label="Number of Digits"
//                           tooltip="Number of digits in admission number (e.g., 3 for 001)"
//                         >
//                           <InputNumber min={1} max={10} style={{ width: '100%' }} />
//                         </Form.Item>
//                       </Col>
//                     </Row>
//                   </Panel>

//                   <Panel header="Validation Rules" key="2">
//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item
//                           name="allowDuplicateAdmission"
//                           label="Allow Duplicate Numbers"
//                           valuePropName="checked"
//                           tooltip="Allow the same admission number to be used multiple times"
//                         >
//                           <Switch />
//                         </Form.Item>
//                       </Col>
//                     </Row>
//                   </Panel>
//                 </Collapse>

//                 {renderAdmissionNumberPreview()}

//                 <Row style={{ marginTop: 24 }}>
//                   <Col span={24}>
//                     <Alert
//                       message="Current Status"
//                       description={
//                         <div>
//                           <Row gutter={16}>
//                             <Col span={12}>
//                               <Statistic
//                                 title="Last Used Number"
//                                 value={form.getFieldValue('lastAdmissionNumber') || 'Not set'}
//                                 prefix={<HistoryOutlined />}
//                               />
//                             </Col>
//                             <Col span={12}>
//                               <Statistic
//                                 title="Next Available Number"
//                                 value={form.getFieldValue('nextAdmissionNumber') || 'Not set'}
//                                 prefix={<NumberOutlined />}
//                                 valueStyle={{ color: '#3f8600' }}
//                               />
//                             </Col>
//                           </Row>
//                         </div>
//                       }
//                       type="info"
//                       showIcon
//                     />
//                   </Col>
//                 </Row>
//               </Card>
//             </TabPane>

//             <TabPane 
//               tab={
//                 <span>
//                   <IdcardOutlined />
//                   Roll Number
//                 </span>
//               } 
//               key="roll"
//             >
//               <Card title="Roll Number Configuration" style={{ marginBottom: 24 }}>
//                 <Row gutter={16}>
//                   <Col span={12}>
//                     <Form.Item
//                       name="rollNumberAutoGenerate"
//                       label="Auto-generate Roll Numbers"
//                       valuePropName="checked"
//                     >
//                       <Switch />
//                     </Form.Item>
//                   </Col>
//                   <Col span={12}>
//                     <Form.Item
//                       name="allowManualRoll"
//                       label="Allow Manual Entry"
//                       valuePropName="checked"
//                       tooltip="Allow manual entry of roll numbers when needed"
//                     >
//                       <Switch />
//                     </Form.Item>
//                   </Col>
//                 </Row>

//                 <Collapse defaultActiveKey={['1']} style={{ marginBottom: 24 }}>
//                   <Panel header="Number Format Settings" key="1">
//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item
//                           name="rollNumberFormat"
//                           label="Roll Number Format"
//                           tooltip="Choose how roll numbers should be formatted"
//                         >
//                           <Select>
//                             <Option value="sequential">Sequential (1, 2, 3...)</Option>
//                             <Option value="class_section">Class-Section Based (1A01, 1B01...)</Option>
//                             <Option value="custom">Custom Format</Option>
//                           </Select>
//                         </Form.Item>
//                       </Col>
//                       <Col span={12}>
//                         <Form.Item
//                           noStyle
//                           shouldUpdate={(prevValues, currentValues) => 
//                             prevValues.rollNumberFormat === 'custom'
//                           }
//                         >
//                           {({ getFieldValue }) => 
//                             getFieldValue('rollNumberFormat') === 'custom' ? (
//                               <Form.Item
//                                 name="rollNumberPrefix"
//                                 label="Roll Number Prefix"
//                                 tooltip="Optional prefix for roll numbers"
//                               >
//                                 <Input placeholder="e.g., R" />
//                               </Form.Item>
//                             ) : null
//                           }
//                         </Form.Item>
//                       </Col>
//                     </Row>

//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item
//                           name="rollNumberDigits"
//                           label="Number of Digits"
//                           tooltip="Number of digits in roll number (e.g., 2 for 01)"
//                         >
//                           <InputNumber min={1} max={10} style={{ width: '100%' }} />
//                         </Form.Item>
//                       </Col>
//                     </Row>
//                   </Panel>

//                   <Panel header="Reset Settings" key="2">
//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item
//                           name="resetRollPerYear"
//                           label="Reset Numbers Each Year"
//                           valuePropName="checked"
//                           tooltip="Start roll numbers from 1 each academic year"
//                         >
//                           <Switch />
//                         </Form.Item>
//                       </Col>
//                       <Col span={12}>
//                         <Form.Item
//                           name="resetRollPerClass"
//                           label="Reset Numbers Each Class"
//                           valuePropName="checked"
//                           tooltip="Start roll numbers from 1 for each class"
//                         >
//                           <Switch />
//                         </Form.Item>
//                       </Col>
//                     </Row>
//                   </Panel>

//                   <Panel header="Validation Rules" key="3">
//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item
//                           name="allowDuplicateRoll"
//                           label="Allow Duplicate Numbers"
//                           valuePropName="checked"
//                           tooltip="Allow the same roll number to be used multiple times"
//                         >
//                           <Switch />
//                         </Form.Item>
//                       </Col>
//                     </Row>
//                   </Panel>
//                 </Collapse>

//                 {renderRollNumberPreview()}

//                 <Row style={{ marginTop: 24 }}>
//                   <Col span={24}>
//                     <Table
//                       columns={rollNumberColumns}
//                       dataSource={form.getFieldValue('rollNumberStatus') || []}
//                       rowKey={(record) => `${record.class}-${record.section}`}
//                       pagination={false}
//                       size="small"
//                     />
//                   </Col>
//                 </Row>
//               </Card>
//             </TabPane>
//           </Tabs>

//           <Divider />

//           <Form.Item>
//             <Button 
//               type="primary" 
//               htmlType="submit" 
//               icon={<SaveOutlined />}
//               loading={loading}
//             >
//               Save Configuration
//             </Button>
//           </Form.Item>
//         </Form>
//       </Card>
//     </div>
//   );
// };

// export default StudentConfig; 
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
  Tabs,
  Table,
  Modal,
  DatePicker,
  Radio,
  Tag,
  Tooltip,
  Progress,
  Statistic,
  Upload,
  Popconfirm,
  Badge
} from 'antd';
import { 
  SaveOutlined,
  UserOutlined,
  NumberOutlined,
  IdcardOutlined,
  SettingOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  CalendarOutlined,
  BankOutlined,
  BookOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const StudentConfig = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [bulkUpdateModal, setBulkUpdateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('admission');
  const [customTemplateModal, setCustomTemplateModal] = useState(false);

  // Mock data with comprehensive scenarios
  const mockConfig = {
    admissionNumber: {
      autoGenerate: true,
      format: 'prefix_year_sequence', // prefix_sequence, year_sequence, prefix_year_sequence, custom
      prefix: 'ADM',
      includeYear: true,
      yearFormat: 'YYYY', // YY, YYYY
      yearPosition: 'middle', // start, middle, end
      startNumber: 1,
      digits: 4,
      separator: '', // '', '-', '/', '_'
      resetYearly: true,
      resetOnNewSession: false,
      customFormat: '{PREFIX}{YEAR}{SEQUENCE}',
      lastUsed: 'ADM2025001',
      nextAvailable: 'ADM20250002',
      totalGenerated: 156,
      duplicateHandling: 'auto_increment', // error, auto_increment, manual_resolve
      validation: {
        checkDuplicates: true,
        allowManualEdit: true,
        requiredFormat: true
      }
    },
    rollNumber: {
      autoGenerate: true,
      format: 'class_section_sequence', // sequential, class_section_sequence, custom
      includeClass: true,
      includeSection: true,
      includeYear: false,
      classFormat: 'numeric', // numeric, roman, alpha
      sectionFormat: 'alpha', // alpha, numeric
      digits: 2,
      separator: '',
      resetYearly: true,
      resetOnPromotion: true,
      customFormat: '{CLASS}{SECTION}{SEQUENCE}',
      duplicateHandling: 'auto_increment',
      specialCases: {
        transferStudents: 'append_T',
        repeatingStudents: 'keep_previous',
        midSessionAdmissions: 'next_available'
      },
      classWiseConfig: [
        { class: '1', section: 'A', lastNumber: '1A30', nextNumber: '1A31', capacity: 40, current: 30 },
        { class: '1', section: 'B', lastNumber: '1B25', nextNumber: '1B26', capacity: 40, current: 25 },
        { class: '2', section: 'A', lastNumber: '2A28', nextNumber: '2A29', capacity: 35, current: 28 },
        { class: '2', section: 'B', lastNumber: '2B22', nextNumber: '2B23', capacity: 35, current: 22 }
      ]
    },
    studentId: {
      enable: true,
      autoGenerate: true,
      format: 'uuid', // sequential, uuid, custom
      prefix: 'STU',
      digits: 6,
      customFormat: '{PREFIX}{YEAR}{RANDOM}',
      immutable: true // Once assigned, cannot be changed
    },
    libraryCard: {
      enable: true,
      autoGenerate: true,
      format: 'LIB{ADMISSION_NO}',
      linkToAdmission: true,
      expiryTracking: true,
      defaultValidityYears: 1
    },
    examRollNumber: {
      enable: true,
      separateFromClassRoll: true,
      format: 'exam_specific',
      generationTiming: 'before_exam', // at_admission, before_exam, manual
      includeExamCode: true,
      customFormats: {
        'board_exam': 'BE{YEAR}{SEQUENCE}',
        'internal_exam': 'IE{CLASS}{SEQUENCE}',
        'competitive_exam': 'CE{YEAR}{SEQUENCE}'
      }
    },
    schoolYear: {
      currentYear: '2024-25',
      admissionYear: '2024-25',
      sessionStartMonth: 4, // April
      sessionEndMonth: 3, // March
      promotionMonth: 4,
      yearFormat: 'YYYY-YY' // YYYY, YY, YYYY-YY
    },
    validation: {
      preventDuplicates: true,
      enforceFormat: true,
      allowBulkGeneration: true,
      auditTrail: true,
      backupBeforeChanges: true
    },
    advanced: {
      multiCampusSupport: false,
      campusCode: '',
      streamBasedNumbering: false, // Science, Commerce, Arts
      categoryBasedNumbering: false, // General, SC, ST, OBC
      genderBasedNumbering: false,
      hostelNumbering: false,
      transportNumbering: false
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
        // Admission Number fields
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
        admissionCustomFormat: mockConfig.admissionNumber.customFormat,
        admissionDuplicateHandling: mockConfig.admissionNumber.duplicateHandling,
        
        // Roll Number fields
        rollAutoGenerate: mockConfig.rollNumber.autoGenerate,
        rollFormat: mockConfig.rollNumber.format,
        rollIncludeClass: mockConfig.rollNumber.includeClass,
        rollIncludeSection: mockConfig.rollNumber.includeSection,
        rollIncludeYear: mockConfig.rollNumber.includeYear,
        rollClassFormat: mockConfig.rollNumber.classFormat,
        rollSectionFormat: mockConfig.rollNumber.sectionFormat,
        rollDigits: mockConfig.rollNumber.digits,
        rollSeparator: mockConfig.rollNumber.separator,
        rollResetYearly: mockConfig.rollNumber.resetYearly,
        rollCustomFormat: mockConfig.rollNumber.customFormat,
        
        // Student ID fields
        studentIdEnable: mockConfig.studentId.enable,
        studentIdAutoGenerate: mockConfig.studentId.autoGenerate,
        studentIdFormat: mockConfig.studentId.format,
        studentIdPrefix: mockConfig.studentId.prefix,
        studentIdDigits: mockConfig.studentId.digits,
        
        // School Year
        currentYear: mockConfig.schoolYear.currentYear,
        sessionStartMonth: mockConfig.schoolYear.sessionStartMonth,
        sessionEndMonth: mockConfig.schoolYear.sessionEndMonth,
        
        // Advanced options
        multiCampusSupport: mockConfig.advanced.multiCampusSupport,
        streamBasedNumbering: mockConfig.advanced.streamBasedNumbering,
        categoryBasedNumbering: mockConfig.advanced.categoryBasedNumbering
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
      message.success('Student configuration updated successfully');
    } catch (error) {
      message.error('Failed to update student configuration');
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = (type, values) => {
    const currentYear = new Date().getFullYear();
    const examples = [];
    
    if (type === 'admission') {
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
    } else if (type === 'roll') {
      const format = values.rollFormat || 'class_section_sequence';
      const digits = values.rollDigits || 2;
      const classes = ['1', '2', '3'];
      const sections = ['A', 'B'];
      
      classes.forEach(cls => {
        sections.forEach(sec => {
          for (let i = 1; i <= 2; i++) {
            const sequence = i.toString().padStart(digits, '0');
            let number = '';
            
            switch (format) {
              case 'sequential':
                number = sequence;
                break;
              case 'class_section_sequence':
                number = `${cls}${sec}${sequence}`;
                break;
              default:
                number = `${cls}${sec}${sequence}`;
            }
            examples.push(number);
            if (examples.length >= 6) return;
          }
        });
        if (examples.length >= 6) return;
      });
    }
    
    return examples.slice(0, 5);
  };

  const classWiseColumns = [
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
      width: 80,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      width: 80,
      render: (text) => <Tag color="green">{text}</Tag>
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Current Students',
      dataIndex: 'current',
      key: 'current',
      width: 120,
      render: (current, record) => (
        <Space>
          <Text>{current}</Text>
          <Progress 
            percent={(current / record.capacity) * 100} 
            size="small" 
            status={current >= record.capacity ? 'exception' : 'active'}
            showInfo={false}
          />
        </Space>
      )
    },
    {
      title: 'Last Number',
      dataIndex: 'lastNumber',
      key: 'lastNumber',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Next Available',
      dataIndex: 'nextNumber',
      key: 'nextNumber',
      render: (text) => <Text code type="success">{text}</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Configuration">
            <Button icon={<EditOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Reset Numbers">
            <Popconfirm title="Reset all numbers for this class-section?">
              <Button icon={<ReloadOutlined />} size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  const AdmissionNumberTab = () => (
    <Card title={
      <Space>
        <NumberOutlined />
        <span>Admission Number Configuration</span>
        <Badge count={mockConfig.admissionNumber.totalGenerated} showZero color="blue" />
      </Space>
    }>
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
                <Option value="custom">Custom Format</Option>
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
                {generatePreview('admission', form.getFieldsValue()).map((num, idx) => (
                  <Tag key={idx} color="blue" style={{ marginBottom: 4 }}>{num}</Tag>
                ))}
              </div>
              <Button 
                size="small" 
                onClick={() => setPreviewModal(true)}
                style={{ marginTop: 8 }}
              >
                View More Examples
              </Button>
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

      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.admissionFormat !== curr.admissionFormat}
      >
        {({ getFieldValue }) => 
          getFieldValue('admissionFormat') === 'custom' && (
            <Card title="Custom Format" style={{ marginTop: 16 }}>
              <Form.Item
                name="admissionCustomFormat"
                label="Custom Format Pattern"
                tooltip="Use {PREFIX}, {YEAR}, {SEQUENCE} as placeholders"
              >
                <Input placeholder="{PREFIX}-{YEAR}-{SEQUENCE}" />
              </Form.Item>
              <Alert 
                message="Available Placeholders" 
                description="{PREFIX} - Your prefix, {YEAR} - Current year, {SEQUENCE} - Sequential number, {MONTH} - Current month, {CAMPUS} - Campus code"
                type="info" 
              />
            </Card>
          )
        }
      </Form.Item>
    </Card>
  );

  const RollNumberTab = () => (
    <Card title={
      <Space>
        <IdcardOutlined />
        <span>Roll Number Configuration</span>
      </Space>
    }>
      <Row gutter={24}>
        <Col span={12}>
          <Card size="small" title="Basic Settings">
            <Form.Item
              name="rollAutoGenerate"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Auto Generate" 
                unCheckedChildren="Manual Entry"
                style={{ marginBottom: 16 }}
              />
            </Form.Item>
            
            <Form.Item
              name="rollFormat"
              label="Roll Format"
            >
              <Select>
                <Option value="sequential">Sequential (1, 2, 3...)</Option>
                <Option value="class_section_sequence">Class-Section-Sequence (1A01, 1B02...)</Option>
                <Option value="class_sequence">Class-Sequence (101, 102, 201...)</Option>
                <Option value="section_sequence">Section-Sequence (A01, B01...)</Option>
                <Option value="custom">Custom Format</Option>
              </Select>
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="rollClassFormat"
                  label="Class Format"
                >
                  <Select>
                    <Option value="numeric">Numeric (1, 2, 3)</Option>
                    <Option value="roman">Roman (I, II, III)</Option>
                    <Option value="alpha">Alpha (A, B, C)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="rollSectionFormat"
                  label="Section Format"
                >
                  <Select>
                    <Option value="alpha">Alpha (A, B, C)</Option>
                    <Option value="numeric">Numeric (1, 2, 3)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          <Card size="small" title="Special Cases">
            <Form.Item label="Transfer Students">
              <Select defaultValue="append_T">
                <Option value="append_T">Append 'T' (1A01T)</Option>
                <Option value="separate_series">Separate Series (T001)</Option>
                <Option value="next_available">Next Available</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Repeating Students">
              <Select defaultValue="keep_previous">
                <Option value="keep_previous">Keep Previous Roll</Option>
                <Option value="new_number">Assign New Number</Option>
                <Option value="append_R">Append 'R' (1A01R)</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Mid-Session Admissions">
              <Select defaultValue="next_available">
                <Option value="next_available">Next Available</Option>
                <Option value="end_of_list">End of Class List</Option>
                <Option value="maintain_order">Maintain Alphabetical Order</Option>
              </Select>
            </Form.Item>
          </Card>
        </Col>
      </Row>

      <Card title="Class-wise Roll Number Status" style={{ marginTop: 16 }}>
        <Table 
          columns={classWiseColumns}
          dataSource={mockConfig.rollNumber.classWiseConfig}
          rowKey={(record) => `${record.class}-${record.section}`}
          pagination={false}
          size="small"
        />
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Button icon={<PlusOutlined />}>Add Class-Section</Button>
            <Button icon={<DownloadOutlined />}>Export Report</Button>
            <Button icon={<ReloadOutlined />} onClick={() => setBulkUpdateModal(true)}>
              Bulk Update
            </Button>
          </Space>
        </div>
      </Card>
    </Card>
  );

  const AdvancedTab = () => (
    <Row gutter={24}>
      <Col span={12}>
        <Card title="Additional ID Systems" style={{ marginBottom: 16 }}>
          <Form.Item
            name="studentIdEnable"
            valuePropName="checked"
          >
            <Switch checkedChildren="Student ID Enabled" unCheckedChildren="Disabled" />
          </Form.Item>

          <Form.Item
            name="libraryCardEnable"
            valuePropName="checked"
          >
            <Switch checkedChildren="Library Card Enabled" unCheckedChildren="Disabled" />
          </Form.Item>

          <Form.Item
            name="examRollEnable"
            valuePropName="checked"
          >
            <Switch checkedChildren="Exam Roll Number" unCheckedChildren="Disabled" />
          </Form.Item>

          <Form.Item
            name="hostelIdEnable"
            valuePropName="checked"
          >
            <Switch checkedChildren="Hostel ID" unCheckedChildren="Disabled" />
          </Form.Item>
        </Card>

        <Card title="Multi-Campus Support">
          <Form.Item
            name="multiCampusSupport"
            valuePropName="checked"
          >
            <Switch checkedChildren="Multi-Campus" unCheckedChildren="Single Campus" />
          </Form.Item>

          <Form.Item
            name="campusCode"
            label="Campus Code"
          >
            <Input placeholder="e.g., MC (Main Campus), SC (South Campus)" />
          </Form.Item>
        </Card>
      </Col>

      <Col span={12}>
        <Card title="Specialized Numbering" style={{ marginBottom: 16 }}>
          <Form.Item
            name="streamBasedNumbering"
            valuePropName="checked"
          >
            <Switch checkedChildren="Stream-based (Science/Commerce/Arts)" unCheckedChildren="Disabled" />
          </Form.Item>

          <Form.Item
            name="categoryBasedNumbering"
            valuePropName="checked"
          >
            <Switch checkedChildren="Category-based (General/SC/ST/OBC)" unCheckedChildren="Disabled" />
          </Form.Item>

          <Form.Item
            name="genderBasedNumbering"
            valuePropName="checked"
          >
            <Switch checkedChildren="Gender-based Numbering" unCheckedChildren="Disabled" />
          </Form.Item>

          <Form.Item
            name="transportNumbering"
            valuePropName="checked"
          >
            <Switch checkedChildren="Transport ID" unCheckedChildren="Disabled" />
          </Form.Item>
        </Card>

        <Card title="Session Management">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="currentYear"
                label="Current Session"
              >
                <Input placeholder="2024-25" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sessionStartMonth"
                label="Session Start Month"
              >
                <Select>
                  <Option value={1}>January</Option>
                  <Option value={4}>April</Option>
                  <Option value={6}>June</Option>
                  <Option value={7}>July</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <BankOutlined style={{ marginRight: 12, color: '#1890ff' }} />
          Student Configuration Management
        </Title>
        <Paragraph type="secondary">
          Configure admission numbers, roll numbers, and other student identification systems for your institution
        </Paragraph>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Tabs 
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            size="large"
          >
            <TabPane 
              tab={
                <span>
                  <NumberOutlined />
                  Admission Numbers
                  <Badge count="156" size="small" style={{ marginLeft: 8 }} />
                </span>
              } 
              key="admission"
            >
              <AdmissionNumberTab />
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <IdcardOutlined />
                  Roll Numbers
                  <Badge count="4 Classes" size="small" style={{ marginLeft: 8 }} />
                </span>
              } 
              key="roll"
            >
              <RollNumberTab />
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <SettingOutlined />
                  Advanced Settings
                </span>
              } 
              key="advanced"
            >
              <AdvancedTab />
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <BookOutlined />
                  Reports & Analytics
                </span>
              } 
              key="reports"
            >
              <Card title="Number Generation Analytics">
                <Row gutter={24}>
                  <Col span={6}>
                    <Statistic 
                      title="Total Admission Numbers" 
                      value={mockConfig.admissionNumber.totalGenerated}
                      prefix={<UserOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="Active Students" 
                      value={105}
                      valueStyle={{ color: '#3f8600' }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="Duplicates Resolved" 
                      value={12}
                      valueStyle={{ color: '#cf1322' }}
                      prefix={<ExclamationCircleOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="Manual Entries" 
                      value={8}
                      prefix={<EditOutlined />}
                    />
                  </Col>
                </Row>
                
                <Divider />
                
                <Row gutter={24}>
                  <Col span={12}>
                    <Card size="small" title="Recent Activities">
                      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div><Tag color="green">Generated</Tag> ADM20250156 for John Doe</div>
                          <div><Tag color="blue">Updated</Tag> Roll number format for Class 3</div>
                          <div><Tag color="orange">Resolved</Tag> Duplicate admission number ADM20250155</div>
                          <div><Tag color="purple">Reset</Tag> Roll numbers for new session</div>
                          <div><Tag color="cyan">Exported</Tag> Student list with numbers</div>
                        </Space>
                      </div>
                    </Card>
                  </Col>
                  
                  <Col span={12}>
                    <Card size="small" title="Quick Actions">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Button block icon={<DownloadOutlined />}>
                          Export All Student Numbers
                        </Button>
                        <Button block icon={<UploadOutlined />}>
                          Bulk Import Student Data
                        </Button>
                        <Button block icon={<ReloadOutlined />}>
                          Reset Sequence Numbers
                        </Button>
                        <Button block icon={<CheckCircleOutlined />}>
                          Validate All Numbers
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </TabPane>
          </Tabs>

          <Divider />

          <Form.Item>
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
              <Button 
                icon={<DownloadOutlined />}
                onClick={() => message.info('Configuration exported successfully')}
              >
                Export Settings
              </Button>
              <Button 
                icon={<UploadOutlined />}
                onClick={() => message.info('Configuration import feature coming soon')}
              >
                Import Settings
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Preview Modal */}
      <Modal
        title="Number Format Preview"
        open={previewModal}
        onCancel={() => setPreviewModal(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModal(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        <div>
          <Title level={4}>Admission Number Examples</Title>
          <div style={{ marginBottom: 20 }}>
            {generatePreview('admission', form.getFieldsValue()).concat([
              'ADM20250006', 'ADM20250007', 'ADM20250008', 'ADM20250009', 'ADM20250010'
            ]).map((num, idx) => (
              <Tag key={idx} color="blue" style={{ marginBottom: 8, marginRight: 8 }}>
                {num}
              </Tag>
            ))}
          </div>
          
          <Title level={4}>Roll Number Examples</Title>
          <div>
            {generatePreview('roll', form.getFieldsValue()).concat([
              '1A06', '1B06', '2A06', '2B06', '3A01'
            ]).map((num, idx) => (
              <Tag key={idx} color="green" style={{ marginBottom: 8, marginRight: 8 }}>
                {num}
              </Tag>
            ))}
          </div>
        </div>
      </Modal>

      {/* Bulk Update Modal */}
      <Modal
        title="Bulk Update Roll Numbers"
        open={bulkUpdateModal}
        onCancel={() => setBulkUpdateModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setBulkUpdateModal(false)}>
            Cancel
          </Button>,
          <Button key="update" type="primary" onClick={() => {
            setBulkUpdateModal(false);
            message.success('Bulk update completed successfully');
          }}>
            Update All
          </Button>
        ]}
        width={700}
      >
        <Alert
          message="Bulk Update Warning"
          description="This will update roll numbers for all selected classes. This action cannot be undone."
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />
        
        <Form layout="vertical">
          <Form.Item label="Select Classes to Update">
            <Select mode="multiple" style={{ width: '100%' }} defaultValue={['1-A', '1-B']}>
              <Option value="1-A">Class 1-A</Option>
              <Option value="1-B">Class 1-B</Option>
              <Option value="2-A">Class 2-A</Option>
              <Option value="2-B">Class 2-B</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="Update Type">
            <Radio.Group defaultValue="reset">
              <Radio value="reset">Reset to Start</Radio>
              <Radio value="continue">Continue from Last</Radio>
              <Radio value="custom">Custom Starting Number</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item label="Backup Current Numbers">
            <Switch defaultChecked />
          </Form.Item>
        </Form>
      </Modal>

      {/* Custom Template Modal */}
      <Modal
        title="Custom Format Builder"
        open={customTemplateModal}
        onCancel={() => setCustomTemplateModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setCustomTemplateModal(false)}>
            Cancel
          </Button>,
          <Button key="apply" type="primary" onClick={() => {
            setCustomTemplateModal(false);
            message.success('Custom format applied successfully');
          }}>
            Apply Format
          </Button>
        ]}
        width={800}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Card size="small" title="Available Placeholders">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Tag color="blue">{'{PREFIX}'} - Custom prefix text</Tag>
                <Tag color="green">{'{YEAR}'} - Current year (2024/24)</Tag>
                <Tag color="orange">{'{SEQUENCE}'} - Sequential number</Tag>
                <Tag color="purple">{'{CLASS}'} - Student class</Tag>
                <Tag color="cyan">{'{SECTION}'} - Student section</Tag>
                <Tag color="red">{'{MONTH}'} - Current month</Tag>
                <Tag color="lime">{'{CAMPUS}'} - Campus code</Tag>
                <Tag color="gold">{'{STREAM}'} - Academic stream</Tag>
              </Space>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card size="small" title="Format Builder">
              <Form layout="vertical">
                <Form.Item label="Custom Format">
                  <TextArea 
                    rows={3} 
                    placeholder="{PREFIX}-{YEAR}-{SEQUENCE}"
                    defaultValue="{PREFIX}{YEAR}{SEQUENCE}"
                  />
                </Form.Item>
                
                <Form.Item label="Sample Output">
                  <Input disabled value="ADM2024001, ADM2024002, ..." />
                </Form.Item>
                
                <Form.Item label="Validation Rules">
                  <Space direction="vertical">
                    <Switch defaultChecked /> Check for duplicates
                    <Switch defaultChecked /> Enforce format consistency
                    <Switch /> Allow manual override
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default StudentConfig;
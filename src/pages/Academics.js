import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Tabs,
  Statistic,
  Progress,
  Tag,
  Typography,
  DatePicker,
  Upload,
  Divider,
  Tooltip,
  TimePicker
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  PrinterOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FilterOutlined,
  SearchOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';
import api from '../services/api';
import { MessageContext } from '../App';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  Box,
  Tab,
  Container,
  Paper,
} from '@mui/material';
import ExamManagement from '../components/academics/ExamManagement';
import MarksEntry from '../components/academics/MarksEntry';
import Analytics from '../components/academics/Analytics';
import SubManagement from '../components/academics/SubManagement';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Search } = Input;

const examTypes = [
  { value: 'unit_test', label: 'Unit Test' },
  { value: 'mid_term', label: 'Mid Term' },
  { value: 'final', label: 'Final Exam' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'assignment', label: 'Assignment' }
];

const subjects = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'english', label: 'English' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'physical_education', label: 'Physical Education' },
  { value: 'art', label: 'Art' },
  { value: 'music', label: 'Music' },
  { value: 'languages', label: 'Languages' }
];

const gradingCriteria = {
  A: { min: 90, color: '#52c41a' },
  B: { min: 80, color: '#1890ff' },
  C: { min: 70, color: '#faad14' },
  D: { min: 60, color: '#ff4d4f' },
  F: { min: 0, color: '#ff0000' }
};

const MarksEntryForm = ({ visible, onCancel, onSubmit, initialValues, students, subjects, examTypes }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await onSubmit(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error('Failed to save marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <BookOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <Title level={5} style={{ margin: 0 }}>
            {initialValues ? 'Edit Marks' : 'Enter Marks'}
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          date: moment(),
          ...initialValues
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="studentId"
              label="Student"
              rules={[{ required: true, message: 'Please select student!' }]}
            >
              <Select>
                {students.map(student => (
                  <Option key={student.id} value={student.id}>
                    {student.name} - {student.rollNumber}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="subject"
              label="Subject"
              rules={[{ required: true, message: 'Please select subject!' }]}
            >
              <Select>
                {subjects.map(subject => (
                  <Option key={subject.value} value={subject.value}>
                    {subject.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="examType"
              label="Exam Type"
              rules={[{ required: true, message: 'Please select exam type!' }]}
            >
              <Select>
                {examTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="date"
              label="Exam Date"
              rules={[{ required: true, message: 'Please select exam date!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="marks"
              label="Marks Obtained"
              rules={[{ required: true, message: 'Please enter marks!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                placeholder="Enter marks (0-100)"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maxMarks"
              label="Maximum Marks"
              rules={[{ required: true, message: 'Please enter maximum marks!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                placeholder="Enter maximum marks"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="remarks"
          label="Remarks"
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialValues ? 'Update' : 'Save'}
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const PerformanceChart = ({ data, type = 'line' }) => {
  const config = {
    data,
    xField: 'date',
    yField: 'percentage',
    seriesField: 'subject',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  return type === 'line' ? <Line {...config} /> : <Column {...config} />;
};

const SubjectForm = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await onSubmit(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error('Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <BookOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <Title level={5} style={{ margin: 0 }}>
            {initialValues ? 'Edit Subject' : 'Add Subject'}
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <Form.Item
          name="code"
          label="Subject Code"
          rules={[{ required: true, message: 'Please enter subject code!' }]}
        >
          <Input placeholder="Enter subject code" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Subject Name"
          rules={[{ required: true, message: 'Please enter subject name!' }]}
        >
          <Input placeholder="Enter subject name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={4} placeholder="Enter subject description" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialValues ? 'Update' : 'Add Subject'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ExamForm = ({ visible, onCancel, onSubmit, initialValues, subjects, classes }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: moment(initialValues.date)
      });
    }
  }, [initialValues]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await onSubmit(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error('Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <TrophyOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <Title level={5} style={{ margin: 0 }}>
            {initialValues ? 'Edit Exam' : 'Add Exam'}
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          date: moment(),
          ...initialValues
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Exam Name"
              rules={[{ required: true, message: 'Please enter exam name!' }]}
            >
              <Input placeholder="Enter exam name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="subject"
              label="Subject"
              rules={[{ required: true, message: 'Please select subject!' }]}
            >
              <Select placeholder="Select subject">
                {subjects.map(subject => (
                  <Option key={subject.id} value={subject.id}>
                    {subject.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="classId"
              label="Class"
              rules={[{ required: true, message: 'Please select class!' }]}
            >
              <Select placeholder="Select class">
                {classes.map(cls => (
                  <Option key={cls.id} value={cls.id}>
                    {cls.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="date"
              label="Exam Date"
              rules={[{ required: true, message: 'Please select exam date!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startTime"
              label="Start Time"
              rules={[{ required: true, message: 'Please select start time!' }]}
            >
              <TimePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[{ required: true, message: 'Please enter duration!' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="maxScore"
              label="Maximum Score"
              rules={[{ required: true, message: 'Please enter maximum score!' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="passingScore"
              label="Passing Score"
              rules={[{ required: true, message: 'Please enter passing score!' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="instructions"
          label="Instructions"
        >
          <Input.TextArea rows={4} placeholder="Enter exam instructions" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialValues ? 'Update' : 'Add Exam'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`academics-tabpanel-${index}`}
      aria-labelledby={`academics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Academics = () => {
  const messageApi = useContext(MessageContext);
  const [activeTab, setActiveTab] = useState('1');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [marks, setMarks] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   loadInitialData();
  // }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [classesResponse, teachersResponse] = await Promise.all([
        api.class.getAll(),
        api.teacher.getAll()
      ]);
      setClasses(classesResponse.data.data);
      setTeachers(teachersResponse.data.data);
    } catch (error) {
      messageApi.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (classId) => {
    try {
      const response = await api.student.getByClass(classId);
      setStudents(response.data.data);
    } catch (error) {
      messageApi.error('Failed to load students');
    }
  };

  const loadMarks = async (examId) => {
    try {
      const response = await api.marks.getByExam(examId);
      setMarks(response.data.data);
    } catch (error) {
      messageApi.error('Failed to load marks');
    }
  };

  const loadExams = async () => {
    try {
      const response = await api.examAPI.getExams();
      setExams(response.data.data);
    } catch (error) {
      messageApi.error('Failed to load exams');
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    // if (key === '1') {
    //   loadExams();
    // }
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '0', 
      overflow: 'hidden', 
      margin: '0',
      borderRadius: '16px',
      background: '#ffffff',
      boxShadow: '0 4px 20px rgba(159, 179, 223, 0.15)',
      border: '1px solid rgba(159, 179, 223, 0.2)'
    }}>
      <Row justify="space-between" align="middle" style={{ padding: '16px 24px' }}>
        <Col>
          <Title level={3} style={{ 
            color: '#9fb3df',
            margin: 0,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <BookOutlined style={{ fontSize: '24px', color: '#9fb3df' }} />
            Academics Management
          </Title>
        </Col>
        <Col>
          <Space size="small">
            <Search
              placeholder="Search academics..."
              allowClear
              style={{ 
                width: 250,
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
              prefix={<SearchOutlined style={{ color: '#9fb3df' }} />}
            />
          </Space>
        </Col>
      </Row>

      <Card
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
          overflow: 'hidden',
          background: '#ffffff',
          border: '1px solid rgba(159, 179, 223, 0.3)',
          margin: '0 16px 16px 16px',
          padding: 0
        }}
        bodyStyle={{ padding: 0, height: '100%' }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          items={[
            {
              key: '1',
              label: (
                <span>
                  <TrophyOutlined style={{ color: '#9fb3df' }} />
                  Exam Management
                </span>
              ),
              children: <ExamManagement
                exams={exams}
                classes={classes}
                teachers={teachers}
                subjects={subjects}
                examTypes={examTypes}
              />
            },
            {
              key: '2',
              label: (
                <span>
                  <BookOutlined style={{ color: '#9fb3df' }} />
                  Subject Management
                </span>
              ),
              children: <SubManagement />
            },
            {
              key: '3',
              label: (
                <span>
                  <EditOutlined style={{ color: '#9fb3df' }} />
                  Marks Entry
                </span>
              ),
              children: <MarksEntry
                students={students}
                classes={classes}
                subjects={subjects}
                examTypes={examTypes}
                onClassSelect={loadStudents}
              />
            },
            {
              key: '4',
              label: (
                <span>
                  <BarChartOutlined style={{ color: '#9fb3df' }} />
                  Reports
                </span>
              ),
              children: <Analytics
                marks={marks}
                students={students}
                classes={classes}
                subjects={subjects}
                examTypes={examTypes}
                onExamSelect={loadMarks}
              />
            }
          ]}
          style={{
            '& .ant-tabs-nav': {
              margin: 0,
              padding: '0 16px',
              background: 'rgba(159, 179, 223, 0.05)',
              borderBottom: '1px solid rgba(159, 179, 223, 0.2)'
            },
            '& .ant-tabs-tab': {
              padding: '12px 16px',
              margin: '0 4px 0 0',
              background: 'transparent',
              border: 'none',
              color: '#9fb3df',
              transition: 'all 0.3s ease'
            },
            '& .ant-tabs-tab:hover': {
              color: '#8ba1d1'
            },
            '& .ant-tabs-tab-active': {
              background: '#9fb3df',
              color: '#ffffff'
            },
            '& .ant-tabs-content': {
              padding: '16px'
            }
          }}
        />
      </Card>

      <style>
        {`
          .ant-tabs-nav {
            margin: 0 !important;
            padding: 0 16px !important;
            background: rgba(159, 179, 223, 0.05) !important;
            border-bottom: 1px solid rgba(159, 179, 223, 0.2) !important;
          }

          .ant-tabs-tab {
            padding: 12px 16px !important;
            margin: 0 4px 0 0 !important;
            background: transparent !important;
            border: none !important;
            color: #9fb3df !important;
            transition: all 0.3s ease !important;
          }

          .ant-tabs-tab:hover {
            color: #8ba1d1 !important;
          }

          .ant-tabs-tab-active {
            background: #9fb3df !important;
            color: #ffffff !important;
          }

          .ant-tabs-content {
            padding: 16px !important;
          }

          .ant-tabs-ink-bar {
            background: #9fb3df !important;
          }

          .ant-card {
            border-radius: 12px !important;
            overflow: hidden !important;
            box-shadow: 0 4px 16px rgba(159, 179, 223, 0.2) !important;
            border: 1px solid rgba(159, 179, 223, 0.3) !important;
          }

          .ant-card-head {
            background: rgba(159, 179, 223, 0.05) !important;
            border-bottom: 1px solid rgba(159, 179, 223, 0.2) !important;
            padding: 12px 16px !important;
          }

          .ant-card-head-title {
            color: #9fb3df !important;
            font-weight: 600 !important;
          }

          .ant-card-body {
            padding: 16px !important;
          }

          .ant-table {
            border-radius: 12px !important;
            overflow: hidden !important;
          }

          .ant-table-thead > tr > th {
            background: rgba(159, 179, 223, 0.1) !important;
            color: #9fb3df !important;
            font-weight: 600 !important;
            border-bottom: 2px solid rgba(159, 179, 223, 0.2) !important;
            padding: 12px 16px !important;
          }

          .ant-table-tbody > tr > td {
            border-bottom: 1px solid rgba(159, 179, 223, 0.1) !important;
            padding: 12px 16px !important;
          }

          .ant-table-tbody > tr:hover > td {
            background: rgba(159, 179, 223, 0.05) !important;
          }

          .ant-btn-primary {
            background: #9fb3df !important;
            border-color: #9fb3df !important;
            box-shadow: 0 2px 6px rgba(159, 179, 223, 0.15) !important;
          }

          .ant-btn-primary:hover {
            background: #8ba1d1 !important;
            border-color: #8ba1d1 !important;
            box-shadow: 0 4px 12px rgba(159, 179, 223, 0.25) !important;
          }

          .ant-select-selector {
            border-color: rgba(159, 179, 223, 0.3) !important;
            box-shadow: 0 2px 6px rgba(159, 179, 223, 0.15) !important;
            border-radius: 6px !important;
          }

          .ant-select-selector:hover {
            border-color: #9fb3df !important;
          }

          .ant-select-focused .ant-select-selector {
            border-color: #9fb3df !important;
            box-shadow: 0 0 0 2px rgba(159, 179, 223, 0.2) !important;
          }

          .ant-input {
            border-color: rgba(159, 179, 223, 0.3) !important;
            box-shadow: 0 2px 6px rgba(159, 179, 223, 0.15) !important;
            border-radius: 6px !important;
          }

          .ant-input:hover {
            border-color: #9fb3df !important;
          }

          .ant-input:focus {
            border-color: #9fb3df !important;
            box-shadow: 0 0 0 2px rgba(159, 179, 223, 0.2) !important;
          }

          .ant-modal-content {
            border-radius: 12px !important;
            overflow: hidden !important;
            box-shadow: 0 4px 16px rgba(159, 179, 223, 0.2) !important;
          }

          .ant-modal-header {
            background: rgba(159, 179, 223, 0.05) !important;
            border-bottom: 1px solid rgba(159, 179, 223, 0.2) !important;
            padding: 16px 24px !important;
          }

          .ant-modal-title {
            color: #9fb3df !important;
            font-weight: 600 !important;
          }

          .ant-modal-body {
            padding: 24px !important;
          }

          .ant-modal-footer {
            border-top: 1px solid rgba(159, 179, 223, 0.2) !important;
            padding: 16px 24px !important;
          }
        `}
      </style>
    </div>
  );
};

export default Academics; 
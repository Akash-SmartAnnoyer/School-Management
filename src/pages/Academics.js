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
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MessageContext } from '../App';
import { 
  subscribeToCollection, 
  getClasses, 
  getStudents, 
  getTeachers,
  addMarks,
  getMarksByExam,
  getStudentMarks
} from '../firebase/services';
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
import Reports from '../components/academics/Reports';
import Analytics from '../components/academics/Analytics';

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
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialValues ? 'Update' : 'Save Marks'}
            </Button>
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

function Academics() {
  const [activeTab, setActiveTab] = useState('1');

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', mt: 3 }}>
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            type="card"
            items={[
              {
                key: '1',
                label: 'Exam Management',
                children: <ExamManagement />
              },
              {
                key: '2',
                label: 'Marks Entry',
                children: <MarksEntry />
              },
              {
                key: '3',
                label: 'Reports & Analytics',
                children: <Reports />
              }
            ]}
          />
        </Card>
      </Box>
    </Container>
  );
}

export default Academics; 
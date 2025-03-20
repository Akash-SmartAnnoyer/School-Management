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

const Academics = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marksModalVisible, setMarksModalVisible] = useState(false);
  const [editingMarks, setEditingMarks] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const unsubscribe = subscribeToCollection('classes', (data) => {
      setClasses(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const unsubscribe = subscribeToCollection('students', (data) => {
        const filteredStudents = data.filter(student => student.classId === selectedClass);
        setStudents(filteredStudents);
      });
      return () => unsubscribe();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass) {
      const unsubscribe = subscribeToCollection('marks', (data) => {
        const filteredMarks = data.filter(mark => 
          students.some(student => student.id === mark.studentId)
        );
        setMarks(filteredMarks);
      });
      return () => unsubscribe();
    }
  }, [selectedClass, students]);

  const handleAddMarks = () => {
    setEditingMarks(null);
    setMarksModalVisible(true);
  };

  const handleEditMarks = (marks) => {
    setEditingMarks(marks);
    setMarksModalVisible(true);
  };

  const handleDeleteMarks = async (marksId) => {
    try {
      await deleteDoc(doc(db, 'marks', marksId));
      messageApi.success('Marks deleted successfully');
    } catch (error) {
      messageApi.error('Failed to delete marks');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const marksData = {
        ...values,
        date: values.date.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingMarks) {
        await updateDoc(doc(db, 'marks', editingMarks.id), marksData);
        messageApi.success('Marks updated successfully');
      } else {
        await addMarks(marksData);
        messageApi.success('Marks added successfully');
      }
    } catch (error) {
      messageApi.error('Failed to save marks');
    }
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const getStudentPerformance = (studentId) => {
    const studentMarks = marks.filter(mark => mark.studentId === studentId);
    if (studentMarks.length === 0) return null;

    const totalMarks = studentMarks.reduce((sum, mark) => sum + mark.marks, 0);
    const maxMarks = studentMarks.reduce((sum, mark) => sum + mark.maxMarks, 0);
    const percentage = (totalMarks / maxMarks) * 100;

    return {
      totalMarks,
      maxMarks,
      percentage,
      grade: calculateGrade(percentage)
    };
  };

  const columns = [
    {
      title: 'Student',
      dataIndex: 'studentId',
      key: 'studentId',
      render: (studentId) => {
        const student = students.find(s => s.id === studentId);
        return student ? student.name : 'Unknown';
      }
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => subjects.find(s => s.value === subject)?.label || subject
    },
    {
      title: 'Exam Type',
      dataIndex: 'examType',
      key: 'examType',
      render: (examType) => examTypes.find(e => e.value === examType)?.label || examType
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
      render: (marks, record) => `${marks}/${record.maxMarks}`
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (_, record) => {
        const percentage = (record.marks / record.maxMarks) * 100;
        return `${percentage.toFixed(2)}%`;
      }
    },
    {
      title: 'Grade',
      key: 'grade',
      render: (_, record) => {
        const percentage = (record.marks / record.maxMarks) * 100;
        const grade = calculateGrade(percentage);
        const color = Object.entries(gradingCriteria).find(([_, criteria]) => percentage >= criteria.min)?.[1]?.color;
        return <Tag color={color}>{grade}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditMarks(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteMarks(record.id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div>
      {contextHolder}
      <Card>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space>
              <Select
                style={{ width: 200 }}
                placeholder="Select Class"
                onChange={setSelectedClass}
                value={selectedClass}
              >
                {classes.map(cls => (
                  <Option key={cls.id} value={cls.id}>
                    {cls.className} - {cls.section}
                  </Option>
                ))}
              </Select>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddMarks}
                disabled={!selectedClass}
              >
                Add Marks
              </Button>
            </Space>
          </Col>
          <Col span={24}>
            <Table
              columns={columns}
              dataSource={marks}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Col>
        </Row>
      </Card>

      <MarksEntryForm
        visible={marksModalVisible}
        onCancel={() => setMarksModalVisible(false)}
        onSubmit={handleSubmit}
        initialValues={editingMarks}
        students={students}
        subjects={subjects}
        examTypes={examTypes}
      />
    </div>
  );
};

export default Academics; 
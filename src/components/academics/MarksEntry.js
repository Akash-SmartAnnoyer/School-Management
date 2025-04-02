import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Tag,
  Typography,
  Tooltip,
  Row,
  Col,
  Statistic,
  Progress,
  DatePicker,
  TimePicker,
  Upload,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  TrophyOutlined,
  BarChartOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  LineChartOutlined,
  UploadOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  StarOutlined
} from '@ant-design/icons';
import { MessageContext } from '../../App';
import moment from 'moment';
import api from '../../services/api';
import { Line } from '@ant-design/plots';

const { Option } = Select;
const { Title } = Typography;

const MarksEntryForm = ({ visible, onCancel, onSubmit, initialValues, students, exam, subjects }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, visible]);

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
        <Form.Item
          name="studentId"
          label="Student"
          rules={[{ required: true, message: 'Please select student!' }]}
        >
          <Select placeholder="Select student">
            {students.map(student => (
              <Option key={student.id} value={student.id}>
                {student.name} - {student.rollNumber}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="marks"
          label={`Marks (Max: ${exam?.maxMarks || 100})`}
          rules={[{ required: true, message: 'Please enter marks!' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={exam?.maxMarks || 100}
            placeholder={`Enter marks (0-${exam?.maxMarks || 100})`}
          />
        </Form.Item>

        <Form.Item
          name="remarks"
          label="Remarks"
        >
          <Input.TextArea rows={4} placeholder="Enter remarks" />
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

const BulkMarksEntryForm = ({ visible, onCancel, onSubmit, students, exam, subjects }) => {
  const [form] = Form.useForm();
  const messageApi = useContext(MessageContext);

  useEffect(() => {
    if (visible) {
      const initialValues = {};
      students.forEach(student => {
        initialValues[`marks_${student.id}`] = undefined;
        initialValues[`remarks_${student.id}`] = '';
      });
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [visible, students]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const marksData = {};
      const remarksData = {};

      students.forEach(student => {
        marksData[student.id] = values[`marks_${student.id}`];
        remarksData[student.id] = values[`remarks_${student.id}`];
      });

      onSubmit({ marks: marksData, remarks: remarksData });
    } catch (error) {
      messageApi.error('Please fill all required fields');
    }
  };

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Roll Number',
      dataIndex: 'rollNumber',
      key: 'rollNumber',
    },
    {
      title: `Marks (Max: ${exam?.maxMarks || 100})`,
      key: 'marks',
      render: (_, record) => (
        <Form.Item
          name={`marks_${record.id}`}
          rules={[{ required: true, message: 'Required' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={exam?.maxMarks || 100}
            placeholder={`Enter marks (0-${exam?.maxMarks || 100})`}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Remarks',
      key: 'remarks',
      render: (_, record) => (
        <Form.Item name={`remarks_${record.id}`}>
          <Input placeholder="Enter remarks" />
        </Form.Item>
      ),
    },
  ];

  return (
    <Modal
      title="Bulk Marks Entry"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Submit
        </Button>,
      ]}
    >
      <Form form={form}>
        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          pagination={false}
        />
      </Form>
    </Modal>
  );
};

const MarksEntry = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [marksModalVisible, setMarksModalVisible] = useState(false);
  const [bulkMarksModalVisible, setBulkMarksModalVisible] = useState(false);
  const [editingMarks, setEditingMarks] = useState(null);
  const messageApi = useContext(MessageContext);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [examsResponse, subjectsResponse, classesResponse] = await Promise.all([
        api.exam.getAll(),
        api.subject.getAll(),
        api.class.getAll()
      ]);
      setExams(examsResponse.data.data);
      setSubjects(subjectsResponse.data.data);
      setClasses(classesResponse.data.data);
    } catch (error) {
      messageApi.error('Failed to load initial data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedExam && selectedSubject) {
      loadMarks();
    } else {
      setMarks([]);
    }
  }, [selectedClass, selectedExam, selectedSubject]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await api.student.getByClass(selectedClass);
      setStudents(response.data.data);
    } catch (error) {
      messageApi.error('Failed to load students');
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMarks = async () => {
    try {
      setLoading(true);
      if (!selectedExam || !selectedClass || !selectedSubject) {
        setMarks([]);
        return;
      }
      const response = await api.marks.getByExam(selectedExam);
      const filteredMarks = response.data.data.filter(mark => mark.subjectId === selectedSubject);
      setMarks(filteredMarks);
    } catch (error) {
      messageApi.error('Failed to load marks');
      console.error('Error loading marks:', error);
      setMarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarksSubmit = async (values) => {
    try {
      setLoading(true);
      if (!selectedExam || !selectedClass || !selectedSubject) {
        messageApi.error('Please select exam, class and subject');
        return;
      }

      const marksData = {
        studentId: values.studentId,
        examId: selectedExam,
        classId: selectedClass,
        subjectId: selectedSubject,
        marks: values.marks || 0,
        remarks: values.remarks || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingMarks) {
        await api.marks.update(editingMarks.id, marksData);
        messageApi.success('Marks updated successfully');
      } else {
        await api.marks.create(marksData);
        messageApi.success('Marks added successfully');
      }
      loadMarks();
      setMarksModalVisible(false);
      setEditingMarks(null);
    } catch (error) {
      messageApi.error('Failed to save marks');
      console.error('Error saving marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMarksSubmit = async ({ marks: marksData, remarks: remarksData }) => {
    try {
      setLoading(true);
      const bulkMarksData = students.map(student => ({
        studentId: student.id,
        examId: selectedExam,
        classId: selectedClass,
        subjectId: selectedSubject,
        marks: marksData[student.id] || 0,
        remarks: remarksData[student.id] || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      await Promise.all(bulkMarksData.map(data => api.marks.create(data)));
      messageApi.success('Bulk marks added successfully');
      setBulkMarksModalVisible(false);
      loadMarks();
    } catch (error) {
      messageApi.error('Failed to save bulk marks');
      console.error('Error saving bulk marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMarks = (record) => {
    setEditingMarks(record);
    setMarksModalVisible(true);
  };

  const handleDeleteMarks = async (id) => {
    try {
      setLoading(true);
      await api.marks.delete(id);
      messageApi.success('Marks deleted successfully');
      loadMarks();
    } catch (error) {
      messageApi.error('Failed to delete marks');
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.name} (${student.rollNumber})` : 'Unknown Student';
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const getExamName = (examId) => {
    const exam = exams.find(e => e.id === examId);
    return exam ? exam.name : 'Unknown Exam';
  };

  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `${cls.className} - Section ${cls.section}` : 'Unknown Class';
  };

  const columns = [
    {
      title: 'Student',
      dataIndex: 'studentId',
      key: 'studentId',
      render: (studentId) => getStudentName(studentId),
    },
    {
      title: 'Subject',
      dataIndex: 'subjectId',
      key: 'subjectId',
      render: (subjectId) => getSubjectName(subjectId),
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
      render: (marks) => {
        const exam = exams.find(e => e.id === selectedExam);
        return `${marks}/${exam?.maxMarks || 100}`;
      },
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEditMarks(record)}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteMarks(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="Marks Entry">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space wrap>
            <Select
              placeholder="Select Exam"
              style={{ width: 200 }}
              value={selectedExam}
              onChange={setSelectedExam}
            >
              {exams.map(exam => (
                <Option key={exam.id} value={exam.id}>
                  {exam.name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Select Class"
              style={{ width: 200 }}
              value={selectedClass}
              onChange={setSelectedClass}
            >
              {classes.map(cls => (
                <Option key={cls.id} value={cls.id}>
                  {cls.className} - Section {cls.section}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Select Subject"
              style={{ width: 200 }}
              value={selectedSubject}
              onChange={setSelectedSubject}
            >
              {selectedExam && exams.find(e => e.id === selectedExam)?.subjects.map(subjectId => {
                const subject = subjects.find(s => s.id === subjectId);
                return subject ? (
                  <Option key={subject.id} value={subject.id}>
                    {subject.name}
                  </Option>
                ) : null;
              })}
            </Select>
          </Space>

          {selectedClass && (
            <Card size="small" title="Class Statistics">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Total Students"
                    value={students.length}
                    prefix={<TeamOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Average Percentage"
                    value={marks.length > 0 ? 
                      (marks.reduce((acc, curr) => acc + (curr.marks / (exams.find(e => e.id === selectedExam)?.maxMarks || 100) * 100), 0) / marks.length).toFixed(2) 
                      : 0}
                    suffix="%"
                    prefix={<LineChartOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Passed Students"
                    value={marks.filter(m => m.marks >= ((exams.find(e => e.id === selectedExam)?.maxMarks || 100) * 0.4)).length}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
              </Row>
            </Card>
          )}

          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setBulkMarksModalVisible(true)}
              disabled={!selectedExam || !selectedClass || !selectedSubject}
            >
              Bulk Entry
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingMarks(null);
                setMarksModalVisible(true);
              }}
              disabled={!selectedExam || !selectedClass || !selectedSubject}
            >
              Single Entry
            </Button>
          </Space>

          <Table
            dataSource={marks}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </Card>

      <MarksEntryForm
        visible={marksModalVisible}
        onCancel={() => {
          setMarksModalVisible(false);
          setEditingMarks(null);
        }}
        onSubmit={handleMarksSubmit}
        initialValues={editingMarks}
        students={students}
        exam={exams.find(e => e.id === selectedExam)}
        subjects={selectedExam ? exams.find(e => e.id === selectedExam)?.subjects.map(subjectId => 
          subjects.find(s => s.id === subjectId)
        ).filter(Boolean) : []}
      />

      <BulkMarksEntryForm
        visible={bulkMarksModalVisible}
        onCancel={() => setBulkMarksModalVisible(false)}
        onSubmit={handleBulkMarksSubmit}
        students={students}
        exam={exams.find(e => e.id === selectedExam)}
        subjects={selectedExam ? exams.find(e => e.id === selectedExam)?.subjects.map(subjectId => 
          subjects.find(s => s.id === subjectId)
        ).filter(Boolean) : []}
      />
    </div>
  );
};

export default MarksEntry; 
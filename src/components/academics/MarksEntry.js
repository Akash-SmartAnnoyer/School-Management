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
  Divider,
  Popconfirm
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
  StarOutlined,
  SearchOutlined
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

const MarksEntry = ({ students, classes, subjects, examTypes, onClassSelect }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarks, setSelectedMarks] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [marks, setMarks] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [localStudents, setLocalStudents] = useState([]);
  const [localClasses, setLocalClasses] = useState([]);
  const [localSubjects, setLocalSubjects] = useState([]);

  useEffect(() => {
    setLocalStudents(students);
    setLocalClasses(classes);
    setLocalSubjects(subjects);
  }, [students, classes, subjects]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [examsResponse, subjectsResponse, classesResponse] = await Promise.all([
        api.exam.getAll(),
        api.subject.getAll(),
        api.class.getAll()
      ]);
      setLocalSubjects(subjectsResponse.data.data);
      setLocalClasses(classesResponse.data.data);
    } catch (error) {
      message.error('Failed to load initial data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    } else {
      setLocalStudents([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass) {
      loadMarks();
    } else {
      setMarks([]);
    }
  }, [selectedClass]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await api.student.getByClass(selectedClass);
      setLocalStudents(response.data.data);
    } catch (error) {
      message.error('Failed to load students');
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMarks = async () => {
    try {
      setLoading(true);
      const response = await api.marks.getByClass(selectedClass);
      setMarks(response.data.data);
    } catch (error) {
      message.error('Failed to load marks');
      console.error('Error loading marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarksSubmit = async (values) => {
    try {
      setLoading(true);
      if (!selectedClass) {
        message.error('Please select a class');
        return;
      }

      const marksData = {
        studentId: values.studentId,
        examId: selectedClass,
        classId: selectedClass,
        subjectId: selectedClass,
        marks: values.marks || 0,
        remarks: values.remarks || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (selectedMarks) {
        await api.marks.update(selectedMarks.id, marksData);
        message.success('Marks updated successfully');
      } else {
        await api.marks.create(marksData);
        message.success('Marks added successfully');
      }
      loadMarks();
      setModalVisible(false);
      setSelectedMarks(null);
    } catch (error) {
      message.error('Failed to save marks');
      console.error('Error saving marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMarksSubmit = async ({ marks: marksData, remarks: remarksData }) => {
    try {
      setLoading(true);
      const bulkMarksData = localStudents.map(student => ({
        studentId: student.id,
        examId: selectedClass,
        classId: selectedClass,
        subjectId: selectedClass,
        marks: marksData[student.id] || 0,
        remarks: remarksData[student.id] || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      await Promise.all(bulkMarksData.map(data => api.marks.create(data)));
      message.success('Bulk marks added successfully');
      loadMarks();
    } catch (error) {
      message.error('Failed to save bulk marks');
      console.error('Error saving bulk marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMarks = (record) => {
    setSelectedMarks(record);
    setModalVisible(true);
  };

  const handleDeleteMarks = async (id) => {
    try {
      setLoading(true);
      await api.marks.delete(id);
      message.success('Marks deleted successfully');
      loadMarks();
    } catch (error) {
      message.error('Failed to delete marks');
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (studentId) => {
    const student = localStudents.find(s => s.id === studentId);
    return student ? `${student.name} (${student.rollNumber})` : 'Unknown Student';
  };

  const getSubjectName = (subjectId) => {
    const subject = localSubjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const getExamName = (examId) => {
    const exam = localClasses.find(e => e.id === examId);
    return exam ? exam.name : 'Unknown Exam';
  };

  const getClassName = (classId) => {
    const cls = localClasses.find(c => c.id === classId);
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
        const exam = localClasses.find(e => e.id === selectedClass);
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
          <Popconfirm
            title="Are you sure you want to delete these marks?"
            onConfirm={() => handleDeleteMarks(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAddMarks = () => {
    setSelectedMarks(null);
    setModalVisible(true);
  };

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    onClassSelect(classId);
    await loadMarks(classId);
  };

  const filteredMarks = marks.filter(record => {
    return (
      record.studentId.toLowerCase().includes(searchText.toLowerCase()) ||
      record.subjectId.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return (
    <div>
      <Card title="Marks Entry">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space wrap>
            <Select
              placeholder="Select Class"
              style={{ width: 200 }}
              value={selectedClass}
              onChange={handleClassChange}
            >
              {localClasses.map(cls => (
                <Option key={cls.id} value={cls.id}>
                  {cls.className} - Section {cls.section}
                </Option>
              ))}
            </Select>

            <Input
              placeholder="Search marks"
              prefix={<SearchOutlined />}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
          </Space>

          {selectedClass && (
            <Card size="small" title="Class Statistics">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Total Students"
                    value={localStudents.length}
                    prefix={<TeamOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Average Percentage"
                    value={marks.length > 0 ? 
                      (marks.reduce((acc, curr) => acc + (curr.marks / (localClasses.find(e => e.id === selectedClass)?.maxMarks || 100) * 100), 0) / marks.length).toFixed(2) 
                      : 0}
                    suffix="%"
                    prefix={<LineChartOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Passed Students"
                    value={marks.filter(m => m.marks >= ((localClasses.find(e => e.id === selectedClass)?.maxMarks || 100) * 0.4)).length}
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
              onClick={handleAddMarks}
              disabled={!selectedClass}
            >
              Add Marks
            </Button>
          </Space>

          <Table
            dataSource={filteredMarks}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </Card>

      <MarksEntryForm
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedMarks(null);
        }}
        onSubmit={handleMarksSubmit}
        initialValues={selectedMarks}
        students={localStudents}
        exam={localClasses.find(e => e.id === selectedClass)}
        subjects={localClasses.find(e => e.id === selectedClass)?.subjects?.map(subjectId => 
          localSubjects.find(s => s.id === subjectId)
        ).filter(Boolean) || []}
      />

      <BulkMarksEntryForm
        visible={false}
        onCancel={() => {}}
        onSubmit={handleBulkMarksSubmit}
        students={localStudents}
        exam={localClasses.find(e => e.id === selectedClass)}
        subjects={localClasses.find(e => e.id === selectedClass)?.subjects?.map(subjectId => 
          localSubjects.find(s => s.id === subjectId)
        ).filter(Boolean) || []}
      />
    </div>
  );
};

export default MarksEntry; 
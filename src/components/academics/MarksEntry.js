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
  Popconfirm,
  Radio,
  Empty
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
  SearchOutlined,
  UserOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { useMessage } from '../../contexts/MessageContext';
import moment from 'moment';
import api from '../../services/api';
import { Line } from '@ant-design/plots';
import './AcademicsShared.css';

const { Option } = Select;
const { Title } = Typography;
const { Search } = Input;

const MarksEntryForm = ({ visible, onCancel, onSubmit, initialValues, students, exam, subjects, isBulk }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [localStudents, setLocalStudents] = useState([]);
  const [localExams, setLocalExams] = useState([]);
  const [localSubjects, setLocalSubjects] = useState([]);
  const [localClasses, setLocalClasses] = useState([]);
  const messageApi = useMessage();

  // Reset all state when modal visibility changes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedClass(null);
      setSelectedExam(null);
      setSelectedSubject(null);
      setLocalStudents([]);
    }
  }, [visible]);

  // Load initial data when modal becomes visible
  useEffect(() => {
    if (visible) {
      loadInitialData();
    }
  }, [visible]);

  // Set form values only when initialValues changes and modal is visible
  useEffect(() => {
    if (visible && initialValues) {
      const formValues = {
        classroom: initialValues.classroom,
        exam: initialValues.exam,
        subject: initialValues.subject,
        studentId: initialValues.studentId || initialValues.student,
        marks: initialValues.marks,
        remarks: initialValues.remarks || ''
      };
      form.setFieldsValue(formValues);
      setSelectedClass(initialValues.classroom);
      setSelectedExam(initialValues.exam);
      setSelectedSubject(initialValues.subject);
      loadStudentsForClass(initialValues.classroom);
    }
  }, [initialValues, visible]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [studentsResponse, classesResponse, subjectsResponse, examsResponse] = await Promise.all([
        api.student.getStudents(),
        api.class.getClasses(),
        api.subject.getSubjects(),
        api.exam.getExams()
      ]);
      
      if (studentsResponse.success) {
        setLocalStudents(studentsResponse.data.results || []);
      }
      if (classesResponse.success) {
        setLocalClasses(classesResponse.data.results || []);
      }
      if (subjectsResponse.success) {
        setLocalSubjects(subjectsResponse.data.results || []);
      }
      if (examsResponse.success) {
        setLocalExams(examsResponse.data.results || []);
      }
    } catch (error) {
      messageApi.error('Failed to load initial data');
      console.error('Error loading data:', error);
      setLocalStudents([]);
      setLocalClasses([]);
      setLocalSubjects([]);
      setLocalExams([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsForClass = async (classId) => {
    try {
      const response = await api.student.getStudentsByClass(classId);
      if (response.success) {
        setLocalStudents(prevStudents => {
          const newStudents = response.data.results || [];
          return [...prevStudents, ...newStudents];
        });
      }
    } catch (error) {
      messageApi.error('Failed to load students for class');
      console.error('Error loading students:', error);
    }
  };

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    await loadStudentsForClass(classId);
    form.setFieldsValue({ studentId: undefined });
  };

  const handleExamChange = (examId) => {
    setSelectedExam(examId);
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (!values.classroom || !values.exam || !values.subject || !values.studentId) {
        messageApi.error('Please fill all required fields');
        return;
      }

      const marksData = {
        exam: values.exam,
        classroom: values.classroom,
        subject: values.subject,
        student: values.studentId,
        roll: 100, // Default roll number, can be updated if needed
        marks: values.marks || 0,
        remarks: values.remarks || '',
        entry_type: 'single'
      };

      await onSubmit(marksData);
      form.resetFields();
      onCancel();
    } catch (error) {
      messageApi.error('Failed to save marks');
    } finally {
      setLoading(false);
    }
  };

  if (isBulk) {
    return (
      <Modal
        title="Bulk Marks Entry"
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Table
            dataSource={students}
            rowKey="id"
            pagination={false}
          >
            <Table.Column
              title="Student"
              dataIndex="name"
              key="name"
              render={(_, record) => (
                <span>{record.name} (Section {record.rollNumber})</span>
              )}
            />
            <Table.Column
              title={`Marks`}
              key="marks"
              render={(_, record) => (
                <Form.Item
                  name={['marks', record.id, 'marks']}
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={exam?.maximum_marks || 100}
                  />
                </Form.Item>
              )}
            />
            <Table.Column
              title="Remarks"
              key="remarks"
              render={(_, record) => (
                <Form.Item name={['marks', record.id, 'remarks']}>
                  <Input />
                </Form.Item>
              )}
            />
          </Table>

          <Form.Item style={{ marginTop: 16 }}>
            <Space>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save Marks
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <Space>
          <BookOutlined style={{ fontSize: '20px', color: '#7B83EB' }} />
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
              name="classroom"
              label={
                <Space>
                  <TeamOutlined style={{ color: '#7B83EB' }} />
                  <span>Class</span>
                </Space>
              }
              rules={[{ required: true, message: 'Please select class!' }]}
            >
              <Select 
                placeholder="Select class"
                onChange={handleClassChange}
              >
                {localClasses.map(cls => (
                  <Option key={cls.id} value={cls.id}>
                    {cls.class_name} - Section {cls.section}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="exam"
              label={
                <Space>
                  <TrophyOutlined style={{ color: '#7B83EB' }} />
                  <span>Exam</span>
                </Space>
              }
              rules={[{ required: true, message: 'Please select exam!' }]}
            >
              <Select 
                placeholder="Select exam"
                onChange={handleExamChange}
              >
                {localExams.map(exam => (
                  <Option key={exam.id} value={exam.id}>
                    {exam.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="subject"
              label={
                <Space>
                  <BookOutlined style={{ color: '#7B83EB' }} />
                  <span>Subject</span>
                </Space>
              }
              rules={[{ required: true, message: 'Please select subject!' }]}
            >
              <Select 
                placeholder="Select subject"
                onChange={handleSubjectChange}
              >
                {localSubjects.map(subject => (
                  <Option key={subject.id} value={subject.id}>
                    {subject.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="studentId"
              label={
                <Space>
                  <UserOutlined style={{ color: '#7B83EB' }} />
                  <span>Student</span>
                </Space>
              }
              rules={[{ required: true, message: 'Please select student!' }]}
            >
              <Select 
                placeholder="Select student"
                disabled={!selectedClass}
              >
                {localStudents.map(student => (
                  <Option key={student.id} value={student.id}>
                    {student.name} (Section {student.rollNumber})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="marks"
              label={
                <Space>
                  <BarChartOutlined style={{ color: '#7B83EB' }} />
                  <span>Marks</span>
                </Space>
              }
              rules={[{ required: true, message: 'Please enter marks!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={localExams.find(e => e.id === selectedExam)?.maximum_marks || 100}
                placeholder={`Enter marks (0-${localExams.find(e => e.id === selectedExam)?.maximum_marks || 100})`}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="remarks"
              label={
                <Space>
                  <CommentOutlined style={{ color: '#7B83EB' }} />
                  <span>Remarks</span>
                </Space>
              }
            >
              <Input.TextArea rows={4} placeholder="Enter remarks" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
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
  const messageApi = useMessage();

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
      title: `Marks`,
      key: 'marks',
      render: (_, record) => (
        <Form.Item
          name={`marks_${record.id}`}
          rules={[{ required: true, message: 'Required' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={exam?.maximum_marks || 100}
            placeholder={`Enter marks (0-${exam?.maximum_marks || 100})`}
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

const MarksEntry = ({ students = [], classes = [], subjects = [], examTypes = [] }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [selectedMarks, setSelectedMarks] = useState(null);
  const [marks, setMarks] = useState([]);
  const [allMarks, setAllMarks] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [localStudents, setLocalStudents] = useState([]);
  const [localClasses, setLocalClasses] = useState([]);
  const [localSubjects, setLocalSubjects] = useState([]);
  const [localExams, setLocalExams] = useState([]);
  const [selectedClassForBulk, setSelectedClassForBulk] = useState(null);
  const [selectedExamForBulk, setSelectedExamForBulk] = useState(null);
  const [selectedSubjectForBulk, setSelectedSubjectForBulk] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const messageApi = useMessage();

  const handleEditMarks = (record) => {
    const formattedRecord = {
      ...record,
      studentId: record.student,
      marks: parseFloat(record.marks)
    };
    setSelectedMarks(formattedRecord);
    setModalVisible(true);
  };

  const handleAddMarks = () => {
    setSelectedMarks(null);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedMarks(null);
    form.resetFields();
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [studentsResponse, classesResponse, subjectsResponse, examsResponse, marksResponse] = await Promise.all([
        api.student.getStudents(),
        api.class.getClasses(),
        api.subject.getSubjects(),
        api.exam.getExams(),
        api.marks.getAllMarks()
      ]);
      
      if (studentsResponse.success) {
        setLocalStudents(studentsResponse.data.results || []);
      }
      if (classesResponse.success) {
        setLocalClasses(classesResponse.data.results || []);
      }
      if (subjectsResponse.success) {
        setLocalSubjects(subjectsResponse.data.results || []);
      }
      if (examsResponse.success) {
        setLocalExams(examsResponse.data.results || []);
      }
      if (marksResponse.success) {
        const marksData = marksResponse.data.results || marksResponse.data || [];
        setAllMarks(marksData);
        setMarks(marksData);
        console.log(`Loaded ${marksData.length} marks entries`);
      }
    } catch (error) {
      messageApi.error('Failed to load initial data');
      console.error('Error loading data:', error);
      setLocalStudents([]);
      setLocalClasses([]);
      setLocalSubjects([]);
      setLocalExams([]);
      setAllMarks([]);
      setMarks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsForClass = async (classId) => {
    try {
      const response = await api.student.getStudentsByClass(classId);
      if (response.success) {
        setLocalStudents(prevStudents => {
          const newStudents = response.data.results || [];
          return [...prevStudents, ...newStudents];
        });
      }
    } catch (error) {
      messageApi.error('Failed to load students for class');
      console.error('Error loading students:', error);
    }
  };

  const handleMarksSubmit = async (values) => {
    try {
      setLoading(true);
      if (selectedMarks) {
        // Update existing marks
        const updateData = {
          id: selectedMarks.id,
          exam: values.exam,
          classroom: values.classroom,
          subject: values.subject,
          student: values.studentId || values.student,
          roll: 100,
          marks: values.marks,
          remarks: values.remarks || '',
          entry_type: 'single'
        };
        await api.marks.updateMarks(selectedMarks.id, updateData);
        messageApi.success('Marks updated successfully');
      } else {
        // Create new marks
        const createData = {
          exam: values.exam,
          classroom: values.classroom,
          subject: values.subject,
          student: values.studentId || values.student,
          roll: 100,
          marks: values.marks,
          remarks: values.remarks || '',
          entry_type: 'single'
        };
        await api.marks.createMarks(createData);
        messageApi.success('Marks added successfully');
      }
      setModalVisible(false);
      setSelectedMarks(null);
      loadInitialData(); // Reload the data after successful submission
    } catch (error) {
      messageApi.error(selectedMarks ? 'Failed to update marks' : 'Failed to save marks');
      console.error('Error saving/updating marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMarks = async (id) => {
    try {
      setLoading(true);
      await api.marks.deleteMarks(id);
      messageApi.success('Marks deleted successfully');
      loadInitialData();
    } catch (error) {
      messageApi.error('Failed to delete marks');
      console.error('Error deleting marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedRowKeys.map(id => api.marks.deleteMarks(id)));
      messageApi.success('Selected marks deleted successfully');
      setSelectedRowKeys([]);
      loadInitialData();
    } catch (error) {
      messageApi.error('Failed to delete selected marks');
      console.error('Error deleting marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const getStudentName = (studentId) => {
    const student = localStudents?.find(s => s.id === studentId);
    return student ? `${student.user?.first_name} ${student.user?.last_name}` : 'Unknown Student';
  };

  const getSubjectName = (subjectId) => {
    const subject = localSubjects?.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const getExamName = (examId) => {
    const exam = localExams?.find(e => e.id === examId);
    return exam ? exam.name : 'Unknown Exam';
  };

  const getClassName = (classId) => {
    const cls = localClasses?.find(c => c.id === classId);
    return cls ? `${cls.class_name} - Section ${cls.section}` : 'Unknown Class';
  };

  const columns = [
    {
      title: 'Student',
      dataIndex: 'student',
      key: 'student',
      render: (studentId) => getStudentName(studentId),
    },
    {
      title: 'Class',
      dataIndex: 'classroom',
      key: 'classroom',
      render: (classId) => getClassName(classId),
    },
    {
      title: 'Exam',
      dataIndex: 'exam',
      key: 'exam',
      render: (examId) => getExamName(examId),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (subjectId) => getSubjectName(subjectId),
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
      render: (marks, record) => {
        const exam = localExams.find(e => e.id === record.exam);
        const percentage = (marks / (exam?.maximum_marks || 100)) * 100;
        return (
          <Tag 
            style={{ 
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              background: percentage >= 90 ? '#f6ffed' :
                         percentage >= 80 ? '#e6f7ff' :
                         percentage >= 70 ? '#fff7e6' :
                         percentage >= 60 ? '#fff1f0' : '#fff1f0',
              color: percentage >= 90 ? '#389e0d' :
                     percentage >= 80 ? '#096dd9' :
                     percentage >= 70 ? '#d46b08' :
                     percentage >= 60 ? '#cf1322' : '#cf1322',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'inline-flex',
              alignItems: 'center',
              height: '24px',
              lineHeight: '1'
            }}
          >
            {`${marks}/${exam?.maximum_marks || 100}`}
          </Tag>
        );
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

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredMarks = Array.isArray(allMarks) ? allMarks.filter(record => {
    const studentName = getStudentName(record.student).toLowerCase();
    const subjectName = getSubjectName(record.subject).toLowerCase();
    const searchLower = searchText.toLowerCase();
    
    return (
      studentName.includes(searchLower) ||
      subjectName.includes(searchLower) ||
      record.marks.toString().includes(searchLower) ||
      (record.remarks || '').toLowerCase().includes(searchLower)
    );
  }) : [];

  const handleBulkMarksSubmit = async (values) => {
    try {
      setLoading(true);
      if (!selectedClassForBulk || !selectedExamForBulk || !selectedSubjectForBulk) {
        messageApi.error('Please select class, exam and subject');
        return;
      }

      if (!values.studentMarks) {
        messageApi.error('Please enter marks for at least one student');
        return;
      }

      const entries = Object.entries(values.studentMarks)
        .filter(([_, data]) => data && data.marks !== undefined && data.marks !== null)
        .map(([studentId, data]) => ({
          exam: selectedExamForBulk,
          classroom: selectedClassForBulk,
          subject: selectedSubjectForBulk,
          student: parseInt(studentId),
          roll: 100,
          marks: parseFloat(data.marks) || 0,
          remarks: data.remarks || '',
          entry_type: 'bulk'
        }));

      if (entries.length === 0) {
        messageApi.error('Please enter marks for at least one student');
        return;
      }

      const bulkData = {
        entry_type: 'bulk',
        entries
      };

      await api.marks.createBulkMarks(bulkData);
      messageApi.success('Bulk marks added successfully');
      setBulkModalVisible(false);
      form.resetFields();
      loadInitialData();
    } catch (error) {
      messageApi.error('Failed to save bulk marks');
      console.error('Error saving bulk marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChangeForBulk = async (classId) => {
    setSelectedClassForBulk(classId);
    await loadStudentsForClass(classId);
  };

  const handleExamChangeForBulk = (examId) => {
    setSelectedExamForBulk(examId);
  };

  const handleSubjectChangeForBulk = (subjectId) => {
    setSelectedSubjectForBulk(subjectId);
  };

  return (
    <div className="academics-page">
      <div className="academics-header">
        <Title level={3} className="page-title">
          <img src="/test.png" alt="Marks" style={{ width: '40px', height: '40px' }} />
          Marks Entry
        </Title>
        <Space size="small">
          <Search
            placeholder="Search marks..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ 
              width: 250,
              borderRadius: '6px',
              boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
              border: '1px solid rgba(159, 179, 223, 0.3)'
            }}
            prefix={<SearchOutlined style={{ color: '#7B83EB' }} />}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddMarks}
            className="add-button"
          >
            Add Marks
          </Button>
          <Button
            type="primary"
            icon={<TeamOutlined />}
            onClick={() => setBulkModalVisible(true)}
            className="add-button"
          >
            Bulk Entry
          </Button>
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title="Are you sure you want to delete selected marks?"
              description="This action cannot be undone."
              onConfirm={handleBulkDelete}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
              >
                Delete Selected ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredMarks}
        rowKey="id"
        loading={loading}
        className="academics-table"
        scroll={{ x: 'max-content', y: 'calc(100vh - 380px)' }}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} marks`
        }}
        locale={{
          emptyText: (
            <Empty
              description="No marks found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '20px 0' }}
            />
          ),
        }}
      />

      <style>
        {`
          .academics-table {
            flex: 1;
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #f0f0f0;
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .academics-table .ant-table {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .academics-table .ant-table-container {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .academics-table .ant-table-body {
            flex: 1;
            overflow-y: auto !important;
            overflow-x: auto !important;
          }

          .academics-table .ant-spin-nested-loading {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .academics-table .ant-spin-container {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .academics-table .ant-table-placeholder {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
          }

          .academics-table .ant-table-pagination {
            margin: 0 !important;
            padding: 8px !important;
            background: #ffffff;
            border-top: 1px solid #f0f0f0;
          }

          .academics-table .ant-table-thead > tr > th {
            background: rgba(123, 131, 235, 0.1) !important;
            color: #7B83EB !important;
            font-weight: 600;
            border-bottom: 1px solid #f0f0f0;
            padding: 8px 12px !important;
            white-space: nowrap;
            height: 40px;
            line-height: 1.2;
            font-size: 13px;
          }

          .academics-table .ant-table-tbody > tr > td {
            padding: 8px 12px !important;
            white-space: nowrap;
            border-bottom: 1px solid #f0f0f0;
            height: 40px;
            line-height: 1.2;
            font-size: 13px;
          }

          .academics-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none;
          }

          .academics-table .ant-table-cell {
            padding: 8px 12px !important;
          }

          .academics-table .ant-table-cell .ant-tag {
            margin: 0;
            padding: 4px 8px;
            font-size: 13px;
            height: 24px;
            line-height: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
          }

          .academics-table .ant-table-cell .ant-btn {
            padding: 0 4px;
            height: 24px;
            font-size: 12px;
          }

          .academics-table .ant-pagination-item {
            min-width: 32px;
            height: 32px;
            line-height: 30px;
            font-size: 13px;
            margin: 0 4px;
          }

          .academics-table .ant-pagination-prev .ant-pagination-item-link,
          .academics-table .ant-pagination-next .ant-pagination-item-link {
            min-width: 32px;
            height: 32px;
            line-height: 30px;
            font-size: 13px;
          }

          .academics-table .ant-pagination-options {
            margin-left: 8px;
          }

          .academics-table .ant-pagination-options-size-changer {
            margin-right: 0;
          }

          .academics-table .ant-select-selector {
            height: 32px !important;
            line-height: 30px !important;
            padding: 0 8px !important;
          }

          .academics-table .ant-select-selection-item {
            line-height: 30px !important;
            font-size: 13px;
          }

          .academics-table .ant-pagination-item-active {
            background: #7B83EB !important;
            border-color: #7B83EB !important;
          }

          .academics-table .ant-pagination-item-active a {
            color: white !important;
          }

          .academics-table .ant-pagination-item:hover {
            border-color: #7B83EB !important;
          }

          .academics-table .ant-pagination-prev:hover .ant-pagination-item-link,
          .academics-table .ant-pagination-next:hover .ant-pagination-item-link {
            border-color: #7B83EB !important;
            color: #7B83EB !important;
          }

          .academics-table .ant-checkbox-wrapper:hover .ant-checkbox-inner,
          .academics-table .ant-checkbox:hover .ant-checkbox-inner,
          .academics-table .ant-checkbox-input:focus + .ant-checkbox-inner {
            border-color: #7B83EB !important;
          }

          .academics-table .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #7B83EB !important;
            border-color: #7B83EB !important;
          }

          .academics-table .ant-checkbox-indeterminate .ant-checkbox-inner::after {
            background-color: #7B83EB !important;
          }
        `}
      </style>

      <MarksEntryForm
        visible={modalVisible}
        onCancel={handleModalClose}
        onSubmit={handleMarksSubmit}
        initialValues={selectedMarks}
        students={localStudents}
        exam={localExams?.find(e => e.id === selectedMarks?.exam)}
        subjects={localSubjects}
        isBulk={false}
      />

      <Modal
        title={
          <Space>
            <TeamOutlined style={{ fontSize: '20px', color: '#7B83EB' }} />
            <Title level={5} style={{ margin: 0 }}>
              Bulk Marks Entry
            </Title>
          </Space>
        }
        open={bulkModalVisible}
        onCancel={() => {
          setBulkModalVisible(false);
          setSelectedClassForBulk(null);
          setSelectedExamForBulk(null);
          setSelectedSubjectForBulk(null);
        }}
        footer={null}
        width={1000}
      >
        <Form form={form} layout="vertical" onFinish={handleBulkMarksSubmit}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="classroom"
                label={
                  <Space>
                    <TeamOutlined style={{ color: '#7B83EB' }} />
                    <span>Class</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Please select class!' }]}
              >
                <Select 
                  placeholder="Select class"
                  onChange={handleClassChangeForBulk}
                >
                  {localClasses.map(cls => (
                    <Option key={cls.id} value={cls.id}>
                      {cls.class_name} - Section {cls.section}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="exam"
                label={
                  <Space>
                    <TrophyOutlined style={{ color: '#7B83EB' }} />
                    <span>Exam</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Please select exam!' }]}
              >
                <Select 
                  placeholder="Select exam"
                  onChange={handleExamChangeForBulk}
                >
                  {localExams.map(exam => (
                    <Option key={exam.id} value={exam.id}>
                      {exam.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="subject"
                label={
                  <Space>
                    <BookOutlined style={{ color: '#7B83EB' }} />
                    <span>Subject</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Please select subject!' }]}
              >
                <Select 
                  placeholder="Select subject"
                  onChange={handleSubjectChangeForBulk}
                >
                  {localSubjects.map(subject => (
                    <Option key={subject.id} value={subject.id}>
                      {subject.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {selectedClassForBulk && selectedExamForBulk && selectedSubjectForBulk && (
            <>
              <Divider />
              <Table
                dataSource={localStudents}
                rowKey="id"
                pagination={false}
                scroll={{ y: 400 }}
              >
                <Table.Column
                  title="Student"
                  dataIndex="name"
                  key="name"
                  render={(_, record) => (
                    <span>{record.name} (Section {record.rollNumber})</span>
                  )}
                />
                <Table.Column
                  title={`Marks`}
                  key="marks"
                  render={(_, record) => (
                    <Form.Item
                      name={['studentMarks', record.id, 'marks']}
                      rules={[{ required: true, message: 'Required' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        max={100}
                      />
                    </Form.Item>
                  )}
                />
                <Table.Column
                  title="Remarks"
                  key="remarks"
                  render={(_, record) => (
                    <Form.Item name={['studentMarks', record.id, 'remarks']}>
                      <Input />
                    </Form.Item>
                  )}
                />
              </Table>

              <Form.Item style={{ marginTop: 16, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => {
                    setBulkModalVisible(false);
                    setSelectedClassForBulk(null);
                    setSelectedExamForBulk(null);
                    setSelectedSubjectForBulk(null);
                    form.resetFields();
                  }}>
                    Cancel
                  </Button>
                  <Button type="primary" onClick={() => {
                    form.validateFields().then(values => {
                      handleBulkMarksSubmit(values);
                    }).catch(error => {
                      console.error('Form validation failed:', error);
                    });
                  }} loading={loading}>
                    Save Marks
                  </Button>
                </Space>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default MarksEntry; 
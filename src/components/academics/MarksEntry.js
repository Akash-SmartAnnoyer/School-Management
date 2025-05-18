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
  SearchOutlined
} from '@ant-design/icons';
import { MessageContext } from '../../App';
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
              title={`Marks (Max: ${exam?.maxMarks || 100})`}
              key="marks"
              render={(_, record) => (
                <Form.Item
                  name={['marks', record.id, 'marks']}
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={exam?.maxMarks || 100}
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
                {student.name} (Section {student.rollNumber})
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

const MarksEntry = ({ students, classes, subjects, examTypes }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarks, setSelectedMarks] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [entryType, setEntryType] = useState('single'); // 'single' or 'bulk'
  const [marks, setMarks] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [localStudents, setLocalStudents] = useState([]);
  const [localClasses, setLocalClasses] = useState([]);
  const [localSubjects, setLocalSubjects] = useState([]);
  const [localExams, setLocalExams] = useState([]);
  const messageApi = useContext(MessageContext);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [classesResponse, subjectsResponse, examsResponse] = await Promise.all([
        api.class.getClasses(),
        api.subject.getSubjects(),
        api.exam.getExams()
      ]);
      
      setLocalClasses(classesResponse.data || []);
      setLocalSubjects(subjectsResponse.data || []);
      setLocalExams(examsResponse.data || []);
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
      setLocalStudents([]);
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
      console.log('Loading students for class:', selectedClass);
      const response = await api.class.getClass(selectedClass);
      console.log('Classroom data loaded:', response.data);

      // Transform the students data to match the expected format
      const students = response.data.students.map(student => ({
        id: student.id,
        name: `${student.user.first_name} ${student.user.last_name}`,
        rollNumber: student.section,
        user: student.user
      }));
      
      console.log('Transformed students:', students);
      setLocalStudents(students);
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
      const response = await api.marks.getByExamClass(selectedExam, selectedClass, selectedSubject);
      console.log('Marks loaded:', response.data);
      setMarks(response.data.entries || []);
    } catch (error) {
      messageApi.error('Failed to load marks');
      console.error('Error loading marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarksSubmit = async (values) => {
    try {
      setLoading(true);
      if (!selectedClass || !selectedExam || !selectedSubject) {
        messageApi.error('Please select class, exam, and subject');
        return;
      }

      const marksData = {
        exam: selectedExam,
        classroom: selectedClass,
        subject: selectedSubject,
        student: values.studentId,
        roll: 100, // Default roll number, can be updated if needed
        marks: values.marks || 0,
        remarks: values.remarks || '',
        entry_type: 'single'
      };

      if (selectedMarks) {
        // For update, we only send updatable fields
        const updateData = {
          student: values.studentId,
          roll: 100,
          marks: values.marks || 0,
          remarks: values.remarks || '',
          entry_type: 'single'
        };
        await api.marks.updateMarks(selectedMarks.id, updateData);
        messageApi.success('Marks updated successfully');
      } else {
        await api.marks.createMarks(marksData);
        messageApi.success('Marks added successfully');
      }
      loadMarks();
      setModalVisible(false);
      setSelectedMarks(null);
    } catch (error) {
      messageApi.error('Failed to save marks');
      console.error('Error saving marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMarksSubmit = async (values) => {
    try {
      setLoading(true);
      if (!selectedClass || !selectedExam || !selectedSubject) {
        messageApi.error('Please select class, exam, and subject');
        return;
      }

      const entries = Object.entries(values.marks).map(([studentId, data]) => ({
        exam: selectedExam,
        classroom: selectedClass,
        subject: selectedSubject,
        student: parseInt(studentId),
        roll: 100, // Default roll number, can be updated if needed
        marks: data.marks || 0,
        remarks: data.remarks || '',
        entry_type: 'bulk'
      }));

      const bulkData = {
        entry_type: 'bulk',
        entries: entries
      };

      await api.marks.createBulkMarks(bulkData);
      messageApi.success('Marks added successfully');
      loadMarks();
      setModalVisible(false);
    } catch (error) {
      messageApi.error('Failed to save marks');
      console.error('Error saving marks:', error);
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
      messageApi.success('Marks deleted successfully');
      loadMarks();
    } catch (error) {
      messageApi.error('Failed to delete marks');
      console.error('Error deleting marks:', error);
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
    const exam = localExams.find(e => e.id === examId);
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
        const exam = localExams.find(e => e.id === selectedExam);
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
    console.log('Class changed to:', classId);
    setSelectedClass(classId);
    await loadStudents();
  };

  const filteredMarks = marks.filter(record => {
    return (
      record.studentId.toLowerCase().includes(searchText.toLowerCase()) ||
      record.subjectId.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return (
    <div className="academics-page">
      <div className="academics-header">
        <Title level={3} className="page-title">
          <BookOutlined className="title-icon" />
          Marks Entry
        </Title>
        <Space size="small">
          <Search
            placeholder="Search marks..."
            allowClear
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
            onClick={() => setModalVisible(true)}
            className="add-button"
          >
            Add Marks
          </Button>
        </Space>
      </div>

      <div style={{ 
        flex: 1, 
        overflow: 'hidden',
        padding: '0 16px 16px 16px'
      }}>
        <Card className="filter-card" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Class">
                <Select
                  placeholder="Select Class"
                  value={selectedClass}
                  onChange={handleClassChange}
                  style={{ width: '100%' }}
                >
                  {localClasses.map(cls => (
                    <Option key={cls.id} value={cls.id}>{cls.class_name} - Section {cls.section}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Exam">
                <Select
                  placeholder="Select Exam"
                  value={selectedExam}
                  onChange={setSelectedExam}
                  style={{ width: '100%' }}
                >
                  {localExams.map(exam => (
                    <Option key={exam.id} value={exam.id}>{exam.name} - {exam.type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Subject">
                <Select
                  placeholder="Select Subject"
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  style={{ width: '100%' }}
                >
                  {localSubjects.map(subject => (
                    <Option key={subject.id} value={subject.id}>{subject.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Table
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
      </div>

      <MarksEntryForm
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedMarks(null);
        }}
        onSubmit={entryType === 'single' ? handleMarksSubmit : handleBulkMarksSubmit}
        initialValues={selectedMarks}
        students={localStudents}
        exam={localExams.find(e => e.id === selectedExam)}
        subjects={localSubjects}
        isBulk={entryType === 'bulk'}
      />

      <BulkMarksEntryForm
        visible={false}
        onCancel={() => {}}
        onSubmit={handleBulkMarksSubmit}
        students={localStudents}
        exam={localExams.find(e => e.id === selectedExam)}
        subjects={localSubjects}
      />
    </div>
  );
};

export default MarksEntry; 
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
  const [allMarks, setAllMarks] = useState([]); // Store all marks
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
      const [classesResponse, subjectsResponse, examsResponse, marksResponse] = await Promise.all([
        api.class.getClasses(),
        api.subject.getSubjects(),
        api.exam.getExams(),
        api.marks.getAllMarks()
      ]);
      
      setLocalClasses(classesResponse.data || []);
      setLocalSubjects(subjectsResponse.data || []);
      setLocalExams(examsResponse.data || []);
      setAllMarks(marksResponse.data || []);

      // Load students for all classes that have marks
      const uniqueClassIds = [...new Set(marksResponse.data.map(mark => mark.classroom))];
      for (const classId of uniqueClassIds) {
        await loadStudentsForClass(classId);
      }
    } catch (error) {
      messageApi.error('Failed to load initial data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsForClass = async (classId) => {
    try {
      const response = await api.class.getClass(classId);
      const students = response.data.students.map(student => ({
        id: student.id,
        name: `${student.user.first_name} ${student.user.last_name}`,
        rollNumber: student.section,
        user: student.user
      }));
      
      setLocalStudents(prevStudents => {
        const newStudents = [...prevStudents];
        students.forEach(student => {
          if (!newStudents.find(s => s.id === student.id)) {
            newStudents.push(student);
          }
        });
        return newStudents;
      });
    } catch (error) {
      console.error(`Error loading students for class ${classId}:`, error);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    // Filter marks based on selected filters
    let filtered = [...allMarks];
    
    if (selectedClass) {
      filtered = filtered.filter(mark => mark.classroom === selectedClass);
    }
    
    if (selectedExam) {
      filtered = filtered.filter(mark => mark.exam === selectedExam);
    }
    
    if (selectedSubject) {
      filtered = filtered.filter(mark => mark.subject === selectedSubject);
    }
    
    setMarks(filtered);
  }, [selectedClass, selectedExam, selectedSubject, allMarks]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await api.class.getClass(selectedClass);
      const students = response.data.students.map(student => ({
        id: student.id,
        name: `${student.user.first_name} ${student.user.last_name}`,
        rollNumber: student.section,
        user: student.user
      }));
      
      setLocalStudents(students);
    } catch (error) {
      messageApi.error('Failed to load students');
      console.error('Error loading students:', error);
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
      // loadMarks();
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

      const response = await api.marks.createBulkMarks(bulkData);
      
      if (response.data.success_count > 0) {
        messageApi.success(`Successfully added marks for ${response.data.success_count} students`);
      }
      if (response.data.fail_count > 0) {
        messageApi.warning(`Failed to add marks for ${response.data.fail_count} students`);
      }
      
      // loadMarks();
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
      // loadMarks();
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

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredMarks = marks.filter(record => {
    const studentName = getStudentName(record.student).toLowerCase();
    const subjectName = getSubjectName(record.subject).toLowerCase();
    const searchLower = searchText.toLowerCase();
    
    return (
      studentName.includes(searchLower) ||
      subjectName.includes(searchLower) ||
      record.marks.toString().includes(searchLower) ||
      (record.remarks || '').toLowerCase().includes(searchLower)
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
            onClick={() => setModalVisible(true)}
            className="add-button"
          >
            Add Marks
          </Button>
        </Space>
      </div>

      <div className="academics-filters">
        <Space size="middle">
          <Select
            placeholder="Select Class"
            style={{ width: 200 }}
            onChange={handleClassChange}
            value={selectedClass}
          >
            {localClasses.map(cls => (
              <Option key={cls.id} value={cls.id}>
                {cls.className} - Section {cls.section}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Select Exam"
            style={{ width: 200 }}
            onChange={(value) => setSelectedExam(value)}
            value={selectedExam}
          >
            {localExams.map(exam => (
              <Option key={exam.id} value={exam.id}>
                {exam.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Select Subject"
            style={{ width: 200 }}
            onChange={(value) => setSelectedSubject(value)}
            value={selectedSubject}
          >
            {localSubjects.map(subject => (
              <Option key={subject.id} value={subject.id}>
                {subject.name}
              </Option>
            ))}
          </Select>
        </Space>
      </div>

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
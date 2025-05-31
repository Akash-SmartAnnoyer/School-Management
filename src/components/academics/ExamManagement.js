import React, { useState, useEffect, useContext } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  message,
  Typography,
  Tag,
  Tooltip,
  Popconfirm,
  Input as AntInput,
  Empty,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useMessage } from '../../contexts/MessageContext';
import api from '../../services/api';
import moment from 'moment';
import './AcademicsShared.css';

const { Title } = Typography;
const { Option } = Select;
const { Search } = AntInput;

const examTypes = [
  { value: 'quiz', label: 'Quiz' },
  { value: 'mid_term', label: 'Mid Term' },
  { value: 'final', label: 'Final Exam' },
  { value: 'unit_test', label: 'Unit Test' },
  { value: 'assignment', label: 'Assignment' }
];

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const messageApi = useMessage();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [examsResponse, subjectsResponse, teachersResponse, classesResponse] = await Promise.all([
        api.exam.getExams(),
        api.subject.getSubjects(),
        api.teacher.getTeachers(),
        api.class.getClasses()
      ]);
      
      if (examsResponse.success) {
        setExams(examsResponse.data.results || []);
      }
      if (subjectsResponse.success) {
        setSubjects(subjectsResponse.data.results || []);
      }
      if (teachersResponse.success) {
        setTeachers(teachersResponse.data.results || []);
      }
      if (classesResponse.success) {
        setClassrooms(classesResponse.data.results || []);
      }
    } catch (error) {
      messageApi.error('Failed to load initial data');
      console.error('Error loading data:', error);
      setExams([]);
      setSubjects([]);
      setTeachers([]);
      setClassrooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExamSubmit = async (values) => {
    try {
      setSubmitLoading(true);
      const examData = {
        ...values,
        exam_date: values.date.format('YYYY-MM-DD'),
        start_time: values.startTime.format('HH:mm:ss'),
        updatedAt: new Date().toISOString(),
        classrooms: values.classrooms === 'all' ? classrooms.map(c => c.id) : values.classrooms
      };

      if (editingExam) {
        await api.exam.updateExam(editingExam.id, examData);
        messageApi.success('Exam updated successfully');
      } else {
        examData.createdAt = new Date().toISOString();
        await api.exam.createExam(examData);
        messageApi.success('Exam added successfully');
      }
      setExamModalVisible(false);
      setEditingExam(null);
      await loadInitialData();
    } catch (error) {
      messageApi.error('Failed to save exam');
      console.error('Error saving exam:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleExamDelete = async (id) => {
    try {
      setLoading(true);
      await api.exam.deleteExam(id);
      messageApi.success('Exam deleted successfully');
      await loadInitialData();
    } catch (error) {
      messageApi.error('Failed to delete exam');
      console.error('Error deleting exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedRowKeys.map(id => api.exam.deleteExam(id)));
      messageApi.success('Selected exams deleted successfully');
      setSelectedRowKeys([]);
      await loadInitialData();
    } catch (error) {
      messageApi.error('Failed to delete selected exams');
      console.error('Error deleting exams:', error);
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

  const getSubjectNames = (subjectIds) => {
    if (!subjectIds) return [];
    return subjectIds.map(id => {
      const subject = subjects.find(s => s.id === id);
      return subject ? subject.name : id;
    });
  };

  const handleEdit = (record) => {
    setEditingExam(record);
    form.setFieldsValue({
      ...record,
      date: moment(record.exam_date),
      startTime: moment(record.start_time, 'HH:mm:ss'),
      exam_code: record.exam_code,
      maxMarks: record.maximum_marks,
      classrooms: record.classrooms
    });
    setExamModalVisible(true);
  };

  const examColumns = [
    {
      title: 'Exam Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <Space>
          <TrophyOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Exam Code',
      dataIndex: 'exam_code',
      key: 'exam_code',
      width: 120,
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const examType = examTypes.find(t => t.value === type);
        return (
          <Tag color={
            type === 'final' ? 'red' :
            type === 'mid_term' ? 'orange' :
            type === 'unit_test' ? 'blue' :
            type === 'quiz' ? 'green' : 'purple'
          }>
            {examType ? examType.label : type}
          </Tag>
        );
      }
    },
    {
      title: 'Subjects',
      dataIndex: 'subjects',
      key: 'subjects',
      width: 200,
      render: (subjectIds) => (
        <Space wrap>
          {getSubjectNames(subjectIds).map((name, index) => (
            <Tag key={index} color="blue">{name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Teacher',
      dataIndex: 'teacher',
      key: 'teacher',
      width: 150,
      render: (teacherId) => {
        const teacher = teachers.find(t => t.user_id === teacherId);
        return teacher ? `${teacher.name} (${teacher.subject})` : 'Unknown Teacher';
      }
    },
    {
      title: 'Date',
      dataIndex: 'exam_date',
      key: 'exam_date',
      width: 120,
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 120,
    },
    {
      title: 'Classrooms',
      dataIndex: 'classrooms',
      key: 'classrooms',
      width: 200,
      render: (classrooms) => {
        if (!classrooms || classrooms.length === 0) {
          return <Tag color="default">No classrooms assigned</Tag>;
        }
        
        // Handle both array of IDs and array of objects
        return (
          <Space wrap>
            {classrooms.map((classroom) => {
              // If classroom is an object with classroom_name and classroom_section
              if (classroom.classroom_name) {
                return (
                  <Tag key={classroom.id} color="green">
                    {classroom.classroom_name} {classroom.classroom_section}
                  </Tag>
                );
              }
              
              // If classroom is just an ID
              const classroomObj = classrooms.find(c => c.id === classroom);
              return classroomObj ? (
                <Tag key={classroom} color="green">
                  {classroomObj.class_name} {classroomObj.section}
                </Tag>
              ) : null;
            })}
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Exam">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
              loading={loading}
            />
          </Tooltip>
          <Tooltip title="Delete Exam">
            <Popconfirm
              title="Are you sure you want to delete this exam?"
              description="This action cannot be undone."
              onConfirm={() => handleExamDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="academics-page">
      <div className="academics-header">
        <Title level={3} className="page-title">
          {/* <TrophyOutlined className="title-icon" /> */}
          <img src="/exam.png" alt="Exam Management" style={{ width: '40px', height: '40px' }} />
          Exam Management
        </Title>
        <Space size="small">
          <Search
            placeholder="Search exams..."
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
            onClick={() => {
              setEditingExam(null);
              form.resetFields();
              setExamModalVisible(true);
            }}
            className="add-button"
          >
            Add Exam
          </Button>
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title="Are you sure you want to delete selected exams?"
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

      <div style={{ 
        flex: 1, 
        overflow: 'hidden',
        padding: '0 16px 16px 16px'
      }}>
        <Table
          rowSelection={rowSelection}
          columns={examColumns}
          dataSource={exams}
          rowKey="id"
          loading={loading}
          className="academics-table"
          scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} exams`
          }}
          locale={{
            emptyText: (
              <Empty
                description="No exams found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '20px 0' }}
              />
            ),
          }}
        />
      </div>

      <Modal
        title={
          <Space>
            <TrophyOutlined style={{ fontSize: '20px', color: '#7B83EB' }} />
            <Title level={5} style={{ margin: 0 }}>
              {editingExam ? 'Edit Exam' : 'Add Exam'}
            </Title>
          </Space>
        }
        open={examModalVisible}
        onCancel={() => {
          setExamModalVisible(false);
          setEditingExam(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={submitLoading}
        width={800}
        className="academics-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleExamSubmit}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Exam Name"
                rules={[{ required: true, message: 'Please enter exam name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="exam_code"
                label="Exam Code"
                rules={[{ required: true, message: 'Please enter exam code' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Exam Type"
                rules={[{ required: true, message: 'Please select exam type' }]}
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
                name="teacher"
                label="Teacher"
                rules={[{ required: true, message: 'Please select a teacher' }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {teachers.map(teacher => (
                    <Option key={teacher.user_id} value={teacher.user_id}>
                      {teacher.name} ({teacher.subject})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Exam Date"
                rules={[{ required: true, message: 'Please select exam date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="Start Time"
                rules={[{ required: true, message: 'Please select start time' }]}
              >
                <TimePicker format="HH:mm:ss" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Duration"
                rules={[
                  { required: true, message: 'Please enter duration' },
                  { 
                    pattern: /^(\d{2}:)?\d{2}:\d{2}$/, 
                    message: 'Duration must be in format HH:MM:SS (e.g., 02:00:00)' 
                  }
                ]}
                extra="Format: HH:MM:SS (e.g., 02:00:00 for 2 hours)"
              >
                <Input 
                  placeholder="HH:MM:SS" 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxMarks"
                label="Maximum Marks"
                rules={[{ required: true, message: 'Please enter maximum marks' }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="subjects"
            label="Subjects"
            rules={[{ required: true, message: 'Please select at least one subject' }]}
          >
            <Select mode="multiple">
              {subjects.map(subject => (
                <Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="classrooms"
            label="Classrooms"
            rules={[{ required: true, message: 'Please select at least one classroom' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select classrooms"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value="all">All Classrooms</Option>
              {classrooms.map(classroom => (
                <Option key={classroom.id} value={classroom.id}>
                  {classroom.class_name} {classroom.section}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="instructions"
            label="Instructions"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamManagement; 
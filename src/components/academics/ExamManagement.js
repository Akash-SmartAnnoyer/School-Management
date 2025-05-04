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
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { MessageContext } from '../../App';
import api from '../../services/api';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

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
  const [loading, setLoading] = useState(false);
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const messageApi = useContext(MessageContext);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [examsResponse, subjectsResponse, teachersResponse] = await Promise.all([
        api.exam.getExams(),
        api.subject.getSubjects(),
        api.teacher.getTeachers()
      ]);
      
      setExams(examsResponse.data || []);
      setSubjects(subjectsResponse.data || []);
      setTeachers(teachersResponse.data || []);
    } catch (error) {
      messageApi.error('Failed to load initial data');
      console.error('Error loading data:', error);
      setExams([]);
      setSubjects([]);
      setTeachers([]);
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
        updatedAt: new Date().toISOString()
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

  const getSubjectNames = (subjectIds) => {
    if (!subjectIds) return [];
    return subjectIds.map(id => {
      const subject = subjects.find(s => s.id === id);
      return subject ? subject.name : id;
    });
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);
      setEditingExam(record);
      form.setFieldsValue({
        ...record,
        date: moment(record.exam_date),
        startTime: moment(record.start_time, 'HH:mm:ss'),
        exam_code: record.exam_code,
        maxMarks: record.maximum_marks
      });
      setExamModalVisible(true);
    } catch (error) {
      messageApi.error('Failed to load exam details');
      console.error('Error loading exam:', error);
    } finally {
      setLoading(false);
    }
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
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher ? teacher.name : teacherId;
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
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4}>Exam Management</Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingExam(null);
              form.resetFields();
              setExamModalVisible(true);
            }}
          >
            Add Exam
          </Button>
        </Col>
      </Row>

      <Table
        columns={examColumns}
        dataSource={exams}
        rowKey="id"
        loading={loading}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} exams`
        }}
        scroll={{ x: 1300 }}
      />

      <Modal
        title={editingExam ? 'Edit Exam' : 'Add Exam'}
        open={examModalVisible}
        onCancel={() => {
          setExamModalVisible(false);
          setEditingExam(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={submitLoading}
        width={800}
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
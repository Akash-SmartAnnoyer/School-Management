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
  DatePicker,
  TimePicker,
  InputNumber,
  message,
  Tag,
  Typography,
  Tooltip,
  Popconfirm,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
  BookOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { MessageContext } from '../../App';
import { 
  subscribeToCollection,
  addExam,
  updateExam,
  deleteExam,
  getSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
  getExams,
  getClasses
} from '../../firebase/services';
import moment from 'moment';

const { Option } = Select;
const { Title } = Typography;

const examTypes = [
  { value: 'unit_test', label: 'Unit Test' },
  { value: 'mid_term', label: 'Mid Term' },
  { value: 'final', label: 'Final Exam' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'assignment', label: 'Assignment' }
];

const ExamForm = ({ visible, onCancel, onSubmit, initialValues, subjects, classes }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: moment(initialValues.date),
        startTime: moment(initialValues.startTime)
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
          startTime: moment(),
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
              name="type"
              label="Exam Type"
              rules={[{ required: true, message: 'Please select exam type!' }]}
            >
              <Select placeholder="Select exam type">
                {examTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="subjects"
              label="Subjects"
              rules={[{ required: true, message: 'Please select subjects!' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select subjects"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {subjects.map(subject => (
                  <Option key={subject.id} value={subject.id}>
                    {subject.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="classes"
              label="Classes"
              rules={[{ required: true, message: 'Please select classes!' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select classes"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {classes.map(cls => (
                  <Option key={cls.id} value={cls.id}>
                    {cls.className} - Section {cls.section}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date"
              label="Exam Date"
              rules={[{ required: true, message: 'Please select exam date!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="startTime"
              label="Start Time"
              rules={[{ required: true, message: 'Please select start time!' }]}
            >
              <TimePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[{ required: true, message: 'Please enter duration!' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maxMarks"
              label="Maximum Marks"
              rules={[{ required: true, message: 'Please enter maximum marks!' }]}
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

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm] = Form.useForm();
  const messageApi = useContext(MessageContext);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [examsData, subjectsData, classesData] = await Promise.all([
        getExams(),
        getSubjects(),
        getClasses()
      ]);
      setExams(examsData);
      setSubjects(subjectsData);
      setClasses(classesData);
    } catch (error) {
      messageApi.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const handleExamSubmit = async (values) => {
    try {
      setLoading(true);
      // Convert Moment objects to ISO strings and handle undefined values
      const examData = {
        name: values.name,
        type: values.type,
        subjects: values.subjects || [],
        classes: values.classes || [],
        date: values.date.toISOString(),
        startTime: values.startTime.toISOString(),
        duration: values.duration || 0,
        maxMarks: values.maxMarks || 0,
        instructions: values.instructions || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingExam) {
        await updateExam(editingExam.id, examData);
        messageApi.success('Exam updated successfully');
      } else {
        await addExam(examData);
        messageApi.success('Exam added successfully');
      }
      loadInitialData();
      setExamModalVisible(false);
      setEditingExam(null);
    } catch (error) {
      messageApi.error('Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  const handleExamDelete = async (id) => {
    try {
      setLoading(true);
      await deleteExam(id);
      messageApi.success('Exam deleted successfully');
      loadInitialData();
    } catch (error) {
      messageApi.error('Failed to delete exam');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingSubject) {
        await updateSubject(editingSubject.id, values);
        messageApi.success('Subject updated successfully');
      } else {
        await addSubject(values);
        messageApi.success('Subject added successfully');
      }
      loadInitialData();
      setSubjectModalVisible(false);
      setEditingSubject(null);
    } catch (error) {
      messageApi.error('Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectDelete = async (id) => {
    try {
      setLoading(true);
      await deleteSubject(id);
      messageApi.success('Subject deleted successfully');
      loadInitialData();
    } catch (error) {
      messageApi.error('Failed to delete subject');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectNames = (subjectIds) => {
    if (!subjectIds) return '';
    return subjectIds.map(id => {
      const subject = subjects.find(s => s.id === id);
      return subject ? subject.name : id;
    }).join(', ');
  };

  const getClassNames = (classIds) => {
    if (!classIds) return '';
    return classIds.map(id => {
      const cls = classes.find(c => c.id === id);
      return cls ? `${cls.className} - Section ${cls.section}` : id;
    }).join(', ');
  };

  const examColumns = [
    {
      title: 'Exam Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const examType = examTypes.find(t => t.value === type);
        return examType ? examType.label : type;
      }
    },
    {
      title: 'Subjects',
      dataIndex: 'subjects',
      key: 'subjects',
      render: (subjectIds) => getSubjectNames(subjectIds),
    },
    {
      title: 'Classes',
      dataIndex: 'classes',
      key: 'classes',
      render: (classIds) => getClassNames(classIds),
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, record) => (
        <Space direction="vertical">
          <span>{moment(record.date).format('DD MMM YYYY')}</span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {moment(record.startTime).format('hh:mm A')}
          </span>
        </Space>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} mins`,
    },
    {
      title: 'Max Marks',
      dataIndex: 'maxMarks',
      key: 'maxMarks',
      render: (maxMarks) => `${maxMarks} marks`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingExam(record);
              setExamModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleExamDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const subjectColumns = [
    {
      title: 'Subject Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingSubject(record);
              setSubjectModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleSubjectDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card 
            title="Exam Management"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingExam(null);
                  setExamModalVisible(true);
                }}
              >
                Add Exam
              </Button>
            }
          >
            <Table
              dataSource={exams}
              columns={examColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card 
            title="Subject Management"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingSubject(null);
                  subjectForm.resetFields();
                  setSubjectModalVisible(true);
                }}
              >
                Add Subject
              </Button>
            }
          >
            <Table
              dataSource={subjects}
              columns={subjectColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>

      <ExamForm
        visible={examModalVisible}
        onCancel={() => {
          setExamModalVisible(false);
          setEditingExam(null);
        }}
        onSubmit={handleExamSubmit}
        initialValues={editingExam}
        subjects={subjects}
        classes={classes}
      />

      <Modal
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
        open={subjectModalVisible}
        onOk={subjectForm.submit}
        onCancel={() => {
          setSubjectModalVisible(false);
          subjectForm.resetFields();
          setEditingSubject(null);
        }}
      >
        <Form
          form={subjectForm}
          layout="vertical"
          onFinish={handleSubjectSubmit}
          initialValues={editingSubject}
        >
          <Form.Item
            name="name"
            label="Subject Name"
            rules={[{ required: true, message: 'Please enter subject name!' }]}
          >
            <Input placeholder="Enter subject name" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Subject Code"
            rules={[{ required: true, message: 'Please enter subject code!' }]}
          >
            <Input placeholder="Enter subject code" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} placeholder="Enter subject description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamManagement; 
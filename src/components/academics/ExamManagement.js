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
  Col,
  Tabs,
  Divider,
  Badge,
  Statistic,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
  BookOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FileTextOutlined
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
const { TabPane } = Tabs;

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
          <TrophyOutlined />
          {initialValues ? 'Edit Exam' : 'Add New Exam'}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
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
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Exam Name"
              rules={[{ required: true, message: 'Please enter exam name!' }]}
            >
              <Input 
                placeholder="Enter exam name" 
                prefix={<FileTextOutlined />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Exam Type"
              rules={[{ required: true, message: 'Please select exam type!' }]}
            >
              <Select 
                placeholder="Select exam type"
                prefix={<TrophyOutlined />}
              >
                {examTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
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
                prefix={<BookOutlined />}
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
                prefix={<TeamOutlined />}
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

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="date"
              label="Exam Date"
              rules={[{ required: true, message: 'Please select exam date!' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                prefix={<CalendarOutlined />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="startTime"
              label="Start Time"
              rules={[{ required: true, message: 'Please select start time!' }]}
            >
              <TimePicker 
                style={{ width: '100%' }} 
                prefix={<ClockCircleOutlined />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[{ required: true, message: 'Please enter duration!' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={1} 
                prefix={<ClockCircleOutlined />}
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
                min={1} 
                prefix={<TrophyOutlined />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="instructions"
          label="Instructions"
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Enter exam instructions"
            prefix={<InfoCircleOutlined />}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialValues ? 'Update Exam' : 'Add Exam'}
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
    if (!subjectIds) return [];
    return subjectIds.map(id => {
      const subject = subjects.find(s => s.id === id);
      return subject ? subject.name : id;
    });
  };

  const getClassNames = (classIds) => {
    if (!classIds) return [];
    return classIds.map(id => {
      const cls = classes.find(c => c.id === id);
      return cls ? `${cls.className} - Section ${cls.section}` : id;
    });
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
      title: 'Classes',
      dataIndex: 'classes',
      key: 'classes',
      width: 200,
      render: (classIds) => (
        <Space wrap>
          {getClassNames(classIds).map((name, index) => (
            <Tag key={index} color="green">{name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical">
          <Badge 
            status={moment(record.date).isBefore(moment(), 'day') ? 'default' : 'success'} 
            text={moment(record.date).format('DD MMM YYYY')}
          />
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
      width: 120,
      render: (duration) => (
        <Space>
          <ClockCircleOutlined />
          {duration} mins
        </Space>
      ),
    },
    {
      title: 'Max Marks',
      dataIndex: 'maxMarks',
      key: 'maxMarks',
      width: 120,
      render: (maxMarks) => (
        <Space>
          <TrophyOutlined />
          {maxMarks} marks
        </Space>
      ),
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
              onClick={() => {
                setEditingExam(record);
                setExamModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this exam?"
            onConfirm={() => handleExamDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Exam">
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

  const subjectColumns = [
    {
      title: 'Subject Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text) => (
        <Space>
          <BookOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Subject">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => {
                setEditingSubject(record);
                setSubjectModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this subject?"
            onConfirm={() => handleSubjectDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Subject">
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

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Tabs defaultActiveKey="1">
              <TabPane 
                tab={
                  <span>
                    <TrophyOutlined />
                    Exam Management
                  </span>
                } 
                key="1"
              >
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Space style={{ marginBottom: 16 }}>
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
                    </Space>
                    <Table
                      dataSource={exams}
                      columns={examColumns}
                      rowKey="id"
                      loading={loading}
                      pagination={{ 
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Total ${total} exams`
                      }}
                      scroll={{ x: 1300 }}
                      locale={{
                        emptyText: (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No exams found"
                          />
                        )
                      }}
                    />
                  </Col>
                </Row>
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <BookOutlined />
                    Subject Management
                  </span>
                } 
                key="2"
              >
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Space style={{ marginBottom: 16 }}>
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
                    </Space>
                    <Table
                      dataSource={subjects}
                      columns={subjectColumns}
                      rowKey="id"
                      loading={loading}
                      pagination={{ 
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Total ${total} subjects`
                      }}
                      scroll={{ x: 800 }}
                      locale={{
                        emptyText: (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No subjects found"
                          />
                        )
                      }}
                    />
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
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
        title={
          <Space>
            <BookOutlined />
            {editingSubject ? 'Edit Subject' : 'Add Subject'}
          </Space>
        }
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
            <Input 
              placeholder="Enter subject name"
              prefix={<BookOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="code"
            label="Subject Code"
            rules={[{ required: true, message: 'Please enter subject code!' }]}
          >
            <Input 
              placeholder="Enter subject code"
              prefix={<FileTextOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Enter subject description"
              prefix={<InfoCircleOutlined />}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamManagement; 
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
  Popover,
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
        classrooms: values.classrooms.includes('all') ? classrooms.map(c => c.id) : values.classrooms
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
      maximum_marks: record.maximum_marks,
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
        <Tag 
          style={{ 
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: '#f5f5f5',
            color: '#595959',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            height: '24px',
            lineHeight: '1'
          }}
        >
          {text}
        </Tag>
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
          <Tag 
            style={{ 
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              background: type === 'final' ? '#fff1f0' : 
                         type === 'mid_term' ? '#fff7e6' :
                         type === 'unit_test' ? '#e6f7ff' :
                         type === 'quiz' ? '#f6ffed' : '#f9f0ff',
              color: type === 'final' ? '#cf1322' :
                     type === 'mid_term' ? '#d46b08' :
                     type === 'unit_test' ? '#096dd9' :
                     type === 'quiz' ? '#389e0d' : '#531dab',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'inline-flex',
              alignItems: 'center',
              height: '24px',
              lineHeight: '1'
            }}
          >
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
      render: (subjectIds) => {
        if (!subjectIds || subjectIds.length === 0) {
          return (
            <Tag 
              style={{ 
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                background: '#f5f5f5',
                color: '#595959',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'inline-flex',
                alignItems: 'center',
                height: '24px',
                lineHeight: '1'
              }}
            >
              No subjects assigned
            </Tag>
          );
        }
        
        const subjectNames = getSubjectNames(subjectIds);
        const MAX_VISIBLE_TAGS = 2;
        const visibleSubjects = subjectNames.slice(0, MAX_VISIBLE_TAGS);
        const remainingCount = subjectNames.length - MAX_VISIBLE_TAGS;
        
        const renderSubjectTag = (name, index) => (
          <Tag 
            key={index}
            style={{ 
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              background: '#e6f7ff',
              color: '#096dd9',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'inline-flex',
              alignItems: 'center',
              height: '24px',
              lineHeight: '1',
              margin: 0
            }}
          >
            {name}
          </Tag>
        );

        const remainingSubjects = subjectNames.slice(MAX_VISIBLE_TAGS);
        
        return (
          <Space wrap size={[4, 4]}>
            {visibleSubjects.map(renderSubjectTag)}
            {remainingCount > 0 && (
              <Popover
                content={
                  <div style={{ maxWidth: '300px' }}>
                    <Space wrap size={[4, 4]}>
                      {remainingSubjects.map(renderSubjectTag)}
                    </Space>
                  </div>
                }
                title="All Subjects"
                trigger="hover"
              >
                <Tag
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    background: '#f0f0f0',
                    color: '#595959',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: '24px',
                    lineHeight: '1',
                    margin: 0
                  }}
                >
                  +{remainingCount} more
                </Tag>
              </Popover>
            )}
          </Space>
        );
      },
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
          return (
            <Tag 
              style={{ 
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                background: '#f5f5f5',
                color: '#595959',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'inline-flex',
                alignItems: 'center',
                height: '24px',
                lineHeight: '1'
              }}
            >
              No classrooms assigned
            </Tag>
          );
        }
        
        const MAX_VISIBLE_TAGS = 2;
        const visibleClassrooms = classrooms.slice(0, MAX_VISIBLE_TAGS);
        const remainingCount = classrooms.length - MAX_VISIBLE_TAGS;
        
        const renderClassroomTag = (classroom) => {
          if (classroom.classroom_name) {
            return (
              <Tag 
                key={classroom.id}
                style={{ 
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  background: '#f6ffed',
                  color: '#389e0d',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: '24px',
                  lineHeight: '1',
                  margin: 0
                }}
              >
                {classroom.classroom_name} {classroom.classroom_section}
              </Tag>
            );
          }
          
          const classroomObj = classrooms.find(c => c.id === classroom);
          return classroomObj ? (
            <Tag 
              key={classroom}
              style={{ 
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                background: '#f6ffed',
                color: '#389e0d',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'inline-flex',
                alignItems: 'center',
                height: '24px',
                lineHeight: '1',
                margin: 0
              }}
            >
              {classroomObj.class_name} {classroomObj.section}
            </Tag>
          ) : null;
        };

        const remainingClassrooms = classrooms.slice(MAX_VISIBLE_TAGS);
        
        return (
          <Space wrap size={[4, 4]}>
            {visibleClassrooms.map(renderClassroomTag)}
            {remainingCount > 0 && (
              <Popover
                content={
                  <div style={{ maxWidth: '300px' }}>
                    <Space wrap size={[4, 4]}>
                      {remainingClassrooms.map(renderClassroomTag)}
                    </Space>
                  </div>
                }
                title="All Classrooms"
                trigger="hover"
              >
                <Tag
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    background: '#f0f0f0',
                    color: '#595959',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: '24px',
                    lineHeight: '1',
                    margin: 0
                  }}
                >
                  +{remainingCount} more
                </Tag>
              </Popover>
            )}
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

      <style>
        {`
          .academics-table {
            flex: 1;
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #f0f0f0;
            height: 100%;
          }

          .academics-table .ant-table {
            border-radius: 8px;
            overflow: visible;
          }

          .academics-table .ant-table-container {
            border-radius: 8px;
            overflow: visible;
          }

          .academics-table .ant-table-body {
            overflow-y: auto !important;
            overflow-x: auto !important;
            margin-right: 1px;
          }

          .academics-table .ant-spin-nested-loading {
            height: 100%;
          }

          .academics-table .ant-spin-container {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .academics-table .ant-table-placeholder {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .academics-table .ant-spin {
            max-height: none;
          }

          .academics-table .ant-spin-blur {
            opacity: 0.5;
            filter: blur(1px);
            pointer-events: none;
          }

          .academics-table .ant-spin-blur::after {
            opacity: 0.4;
            background: #fff;
          }

          .academics-table .ant-table-thead > tr > th {
            background: rgba(123, 131, 235, 0.1) !important;
            color: #7B83EB !important;
            font-weight: 600;
            border-bottom: 1px solid #f0f0f0;
            padding: 4px 12px !important;
            white-space: nowrap;
            height: 32px;
            line-height: 1.2;
            font-size: 13px;
          }

          .academics-table .ant-table-tbody > tr > td {
            padding: 4px 12px !important;
            white-space: nowrap;
            border-bottom: 1px solid #f0f0f0;
            height: 32px;
            line-height: 1.2;
            font-size: 13px;
          }

          .academics-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none;
          }

          .academics-table .ant-table-cell {
            padding: 4px 12px !important;
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
            height: 22px;
            font-size: 12px;
          }

          .academics-table .ant-table-pagination {
            margin: 16px 0 !important;
            padding: 8px 8px !important;
            height: 32px;
            border-top: 1px solid #f0f0f0;
            background: #ffffff;
          }

          .academics-table .ant-pagination-item {
            min-width: 24px;
            height: 24px;
            line-height: 22px;
            font-size: 12px;
            margin: 0 4px;
          }

          .academics-table .ant-pagination-prev .ant-pagination-item-link,
          .academics-table .ant-pagination-next .ant-pagination-item-link {
            min-width: 24px;
            height: 24px;
            line-height: 22px;
            font-size: 12px;
          }

          .academics-table .ant-pagination-options {
            margin-left: 8px;
          }

          .academics-table .ant-pagination-options-size-changer {
            margin-right: 0;
          }

          .academics-table .ant-select-selector {
            height: 24px !important;
            line-height: 22px !important;
            padding: 0 8px !important;
          }

          .academics-table .ant-select-selection-item {
            line-height: 22px !important;
            font-size: 12px;
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
                name="maximum_marks"
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
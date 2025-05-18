import React, { useState, useEffect, useContext } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Card,
  Row,
  Col,
  Select,
  Typography,
  Tooltip,
  Popconfirm,
  Input as AntInput,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { MessageContext } from '../../App';
import api from '../../services/api';
import './AcademicsShared.css';

const { Title } = Typography;
const { Option } = Select;
const { Search } = AntInput;

const SubManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const messageApi = useContext(MessageContext);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.subject.getSubjects();
      setSubjects(response.data || []);
    } catch (error) {
      messageApi.error('Failed to load subjects');
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSubject(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    form.setFieldsValue(subject);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.subject.deleteSubject(id);
      messageApi.success('Subject deleted successfully');
      loadSubjects();
    } catch (error) {
      messageApi.error('Failed to delete subject');
      console.error('Error deleting subject:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitLoading(true);
      const subjectData = {
        ...values,
        updatedAt: new Date().toISOString()
      };

      if (editingSubject) {
        await api.subject.updateSubject(editingSubject.id, subjectData);
        messageApi.success('Subject updated successfully');
      } else {
        subjectData.createdAt = new Date().toISOString();
        await api.subject.createSubject(subjectData);
        messageApi.success('Subject added successfully');
      }
      setModalVisible(false);
      setEditingSubject(null);
      await loadSubjects();
    } catch (error) {
      messageApi.error('Failed to save subject');
      console.error('Error saving subject:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    {
      title: 'Subject Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Subject Name',
      dataIndex: 'name',
      key: 'name',
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
          <Tooltip title="Edit Subject">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              loading={editLoading}
            />
          </Tooltip>
          <Tooltip title="Delete Subject">
            <Popconfirm
              title="Are you sure you want to delete this subject?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
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
          <BookOutlined className="title-icon" />
          Subject Management
        </Title>
        <Space size="small">
          <Search
            placeholder="Search subjects..."
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
              setEditingSubject(null);
              form.resetFields();
              setModalVisible(true);
            }}
            className="add-button"
          >
            Add Subject
          </Button>
        </Space>
      </div>

      <div style={{ 
        flex: 1, 
        overflow: 'hidden',
        padding: '0 16px 16px 16px'
      }}>
        <Table
          columns={columns}
          dataSource={subjects}
          rowKey="id"
          loading={loading}
          className="academics-table"
          scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} subjects`
          }}
          locale={{
            emptyText: (
              <Empty
                description="No subjects found"
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
            <BookOutlined style={{ fontSize: '20px', color: '#7B83EB' }} />
            <Title level={5} style={{ margin: 0 }}>
              {editingSubject ? 'Edit Subject' : 'Add Subject'}
            </Title>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingSubject(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={600}
        className="academics-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="code"
            label="Subject Code"
            rules={[{ required: true, message: 'Please enter subject code' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="Subject Name"
            rules={[{ required: true, message: 'Please enter subject name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubManagement; 
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
  message,
  Tag,
  Typography,
  Tooltip,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined
} from '@ant-design/icons';
import { MessageContext } from '../../App';
import api from '../../services/api';

const { Option } = Select;
const { Title } = Typography;

const SubjectForm = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await onSubmit(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error('Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <BookOutlined />
          {initialValues ? 'Edit Subject' : 'Add Subject'}
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
        initialValues={initialValues}
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

        <Form.Item>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialValues ? 'Update' : 'Add Subject'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const SubjectManagement = () => {
  const messageApi = useContext(MessageContext);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.subject.getAll();
      setSubjects(response.data.data);
    } catch (error) {
      messageApi.error('Failed to load subjects');
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSubject(null);
    setModalVisible(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setModalVisible(true);
  };

  const handleDelete = async (subjectId) => {
    try {
      await api.subject.delete(subjectId);
      messageApi.success('Subject deleted successfully');
      loadSubjects();
    } catch (error) {
      messageApi.error('Failed to delete subject');
      console.error('Error deleting subject:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const subjectData = {
        ...values,
        updatedAt: new Date().toISOString()
      };

      if (editingSubject) {
        await api.subject.update(editingSubject.id, subjectData);
        messageApi.success('Subject updated successfully');
      } else {
        subjectData.createdAt = new Date().toISOString();
        await api.subject.create(subjectData);
        messageApi.success('Subject added successfully');
      }
      loadSubjects();
      setModalVisible(false);
      setEditingSubject(null);
    } catch (error) {
      messageApi.error('Failed to save subject');
      console.error('Error saving subject:', error);
    }
  };

  const columns = [
    {
      title: 'Subject Name',
      dataIndex: 'name',
      key: 'name',
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
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
            />
          </Tooltip>
          <Tooltip title="Delete Subject">
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="Subject Management">
        <Space style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Subject
          </Button>
        </Space>
        <Table
          dataSource={subjects}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <SubjectForm
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingSubject(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editingSubject}
      />
    </div>
  );
};

export default SubjectManagement; 
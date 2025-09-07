import React, { useState, useEffect, useContext } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { MessageContext } from '../../App';
import api from '../../services/api';

const SubManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form] = Form.useForm();
  const messageApi = useContext(MessageContext);

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
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSubject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSubject(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.subject.delete(id);
      messageApi.success('Subject deleted successfully');
      loadSubjects();
    } catch (error) {
      messageApi.error('Failed to delete subject');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingSubject) {
        await api.subject.update(editingSubject.id, values);
        messageApi.success('Subject updated successfully');
      } else {
        await api.subject.create(values);
        messageApi.success('Subject created successfully');
      }
      setIsModalVisible(false);
      loadSubjects();
    } catch (error) {
      messageApi.error('Failed to save subject');
    }
  };

  const columns = [
    {
      title: 'Subject Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Subject Code',
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
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this subject?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Subject
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={subjects}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Subject Name"
            rules={[{ required: true, message: 'Please input subject name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="Subject Code"
            rules={[{ required: true, message: 'Please input subject code!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubManagement; 
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
import { useMessage } from '../../contexts/MessageContext';
import api from '../../services/api';
import './AcademicsShared.css';

const { Title } = Typography;
const { Option } = Select;
const { Search } = AntInput;

const SubManagement = ({ subjects, loading, currentPage, totalSubjects, onPageChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingSubject, setEditingSubject] = useState(null);
  const messageApi = useMessage();

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
      await api.subject.deleteSubject(id);
      messageApi.success('Subject deleted successfully');
      onPageChange(currentPage);
    } catch (error) {
      messageApi.error('Failed to delete subject');
      console.error('Error deleting subject:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingSubject) {
        await api.subject.updateSubject(editingSubject.id, values);
        messageApi.success('Subject updated successfully');
      } else {
        await api.subject.createSubject(values);
        messageApi.success('Subject added successfully');
      }
      setIsModalVisible(false);
      onPageChange(currentPage);
    } catch (error) {
      messageApi.error(editingSubject ? 'Failed to update subject' : 'Failed to add subject');
      console.error('Error saving subject:', error);
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
          {/* <BookOutlined className="title-icon" /> */}
          <img src="/text-books.png" alt="Subjects" style={{ width: '40px', height: '40px' }} />
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
            onClick={handleAdd}
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
            current: currentPage,
            total: totalSubjects,
            pageSize: 10,
            onChange: onPageChange,
            showSizeChanger: false,
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
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
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

          <Form.Item>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingSubject ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubManagement; 
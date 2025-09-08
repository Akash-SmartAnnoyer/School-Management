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
  Tag,
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

const SubManagement = ({ subjects, loading, currentPage, totalSubjects, onPageChange, onRefresh }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingSubject, setEditingSubject] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const messageApi = useMessage();

  // Debug logging
  console.log('SubManagement props:', { subjects, loading, currentPage, totalSubjects });

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
      // Refresh the data by calling onRefresh
      await onRefresh();
    } catch (error) {
      messageApi.error('Failed to delete subject');
      console.error('Error deleting subject:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map(id => api.subject.deleteSubject(id)));
      messageApi.success('Selected subjects deleted successfully');
      setSelectedRowKeys([]);
      // Refresh the data by calling onRefresh
      await onRefresh();
    } catch (error) {
      messageApi.error('Failed to delete selected subjects');
      console.error('Error deleting subjects:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitLoading(true);
      if (editingSubject) {
        await api.subject.updateSubject(editingSubject.id, values);
        messageApi.success('Subject updated successfully');
      } else {
        await api.subject.createSubject(values);
        messageApi.success('Subject added successfully');
      }
      form.resetFields();
      setIsModalVisible(false);
      setEditingSubject(null);
      // Refresh the data by calling onRefresh
      await onRefresh();
    } catch (error) {
      messageApi.error(editingSubject ? 'Failed to update subject' : 'Failed to add subject');
      console.error('Error saving subject:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const columns = [
    {
      title: 'Subject Code',
      dataIndex: 'code',
      key: 'code',
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
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title="Are you sure you want to delete selected subjects?"
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
          columns={columns}
          dataSource={subjects}
          rowKey={(record) => record.id || record.code || Math.random()}
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

      <style>
        {`
          .academics-table {
            flex: 1;
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #f0f0f0;
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .academics-table .ant-table {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .academics-table .ant-table-container {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .academics-table .ant-table-body {
            flex: 1;
            overflow-y: auto !important;
            overflow-x: auto !important;
          }

          .academics-table .ant-spin-nested-loading {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .academics-table .ant-spin-container {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .academics-table .ant-table-placeholder {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
          }

          .academics-table .ant-table-pagination {
            margin: 0 !important;
            padding: 8px !important;
            background: #ffffff;
            border-top: 1px solid #f0f0f0;
          }

          .academics-table .ant-table-thead > tr > th {
            background: rgba(123, 131, 235, 0.1) !important;
            color: #7B83EB !important;
            font-weight: 600;
            border-bottom: 1px solid #f0f0f0;
            padding: 8px 12px !important;
            white-space: nowrap;
            height: 40px;
            line-height: 1.2;
            font-size: 13px;
          }

          .academics-table .ant-table-tbody > tr > td {
            padding: 8px 12px !important;
            white-space: nowrap;
            border-bottom: 1px solid #f0f0f0;
            height: 40px;
            line-height: 1.2;
            font-size: 13px;
          }

          .academics-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none;
          }

          .academics-table .ant-table-cell {
            padding: 8px 12px !important;
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
            height: 24px;
            font-size: 12px;
          }

          .academics-table .ant-pagination-item {
            min-width: 32px;
            height: 32px;
            line-height: 30px;
            font-size: 13px;
            margin: 0 4px;
          }

          .academics-table .ant-pagination-prev .ant-pagination-item-link,
          .academics-table .ant-pagination-next .ant-pagination-item-link {
            min-width: 32px;
            height: 32px;
            line-height: 30px;
            font-size: 13px;
          }

          .academics-table .ant-pagination-options {
            margin-left: 8px;
          }

          .academics-table .ant-pagination-options-size-changer {
            margin-right: 0;
          }

          .academics-table .ant-select-selector {
            height: 32px !important;
            line-height: 30px !important;
            padding: 0 8px !important;
          }

          .academics-table .ant-select-selection-item {
            line-height: 30px !important;
            font-size: 13px;
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
            <BookOutlined style={{ fontSize: '20px', color: '#7B83EB' }} />
            <Title level={5} style={{ margin: 0 }}>
              {editingSubject ? 'Edit Subject' : 'Add Subject'}
            </Title>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          if (!submitLoading) {
            setIsModalVisible(false);
            setEditingSubject(null);
            form.resetFields();
          }
        }}
        footer={null}
        width={600}
        className="academics-modal"
        maskClosable={!submitLoading}
        closable={!submitLoading}
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
            <Input disabled={submitLoading} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Subject Name"
            rules={[{ required: true, message: 'Please enter subject name' }]}
          >
            <Input disabled={submitLoading} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} disabled={submitLoading} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingSubject(null);
                  form.resetFields();
                }}
                disabled={submitLoading}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitLoading}
                disabled={submitLoading}
              >
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
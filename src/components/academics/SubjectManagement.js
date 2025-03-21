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
import { 
  subscribeToCollection,
  addSubject,
  updateSubject,
  deleteSubject
} from '../../firebase/services';

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
          <BookOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <Title level={5} style={{ margin: 0 }}>
            {initialValues ? 'Edit Subject' : 'Add Subject'}
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <Form.Item
          name="code"
          label="Subject Code"
          rules={[{ required: true, message: 'Please enter subject code!' }]}
        >
          <Input placeholder="Enter subject code" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Subject Name"
          rules={[{ required: true, message: 'Please enter subject name!' }]}
        >
          <Input placeholder="Enter subject name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={4} placeholder="Enter subject description" />
        </Form.Item>

        <Form.Item
          name="gradeLevels"
          label="Applicable Grade Levels"
          rules={[{ required: true, message: 'Please select grade levels!' }]}
        >
          <Select mode="multiple" placeholder="Select grade levels">
            {Array.from({ length: 12 }, (_, i) => (
              <Option key={i + 1} value={i + 1}>
                Grade {i + 1}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status!' }]}
        >
          <Select>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
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
    const unsubscribe = subscribeToCollection('subjects', (data) => {
      setSubjects(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      await deleteSubject(subjectId);
      messageApi.success('Subject deleted successfully');
    } catch (error) {
      messageApi.error('Failed to delete subject');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const subjectData = {
        ...values,
        updatedAt: new Date().toISOString()
      };

      if (editingSubject) {
        await updateSubject(editingSubject.id, subjectData);
        messageApi.success('Subject updated successfully');
      } else {
        subjectData.createdAt = new Date().toISOString();
        await addSubject(subjectData);
        messageApi.success('Subject added successfully');
      }
    } catch (error) {
      messageApi.error('Failed to save subject');
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
      title: 'Grade Levels',
      dataIndex: 'gradeLevels',
      key: 'gradeLevels',
      render: (gradeLevels) => (
        <Space>
          {gradeLevels.map(level => (
            <Tag key={level} color="blue">Grade {level}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Subject">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Subject">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4}>Subject Management</Title>
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
      </Card>

      <SubjectForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialValues={editingSubject}
      />
    </div>
  );
};

export default SubjectManagement; 
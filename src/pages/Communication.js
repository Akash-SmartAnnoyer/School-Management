import React, { useState } from 'react';
import { Card, Table, Button, Form, Input, Select, Modal, Space, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const Communication = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

  // Sample data - replace with actual data from Firestore
  const messages = [
    {
      key: '1',
      id: 'MSG001',
      title: 'Parent-Teacher Meeting',
      content: 'Dear Parents, We are pleased to invite you to the upcoming Parent-Teacher Meeting...',
      recipients: ['All Parents'],
      date: '2024-03-20',
      status: 'Scheduled',
      type: 'Announcement',
    },
    {
      key: '2',
      id: 'MSG002',
      title: 'Sports Day Event',
      content: 'Students are requested to wear their sports uniforms for the upcoming Sports Day...',
      recipients: ['All Students'],
      date: '2024-03-25',
      status: 'Sent',
      type: 'Event',
    },
  ];

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'Announcement' ? 'blue' : 'green'}>{type}</Tag>
      ),
    },
    {
      title: 'Recipients',
      dataIndex: 'recipients',
      key: 'recipients',
      render: (recipients) => recipients.join(', '),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Sent' ? 'green' : 'orange'}>{status}</Tag>
      ),
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
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleSend(record)}
          >
            Send
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingMessage(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    form.setFieldsValue(message);
    setIsModalVisible(true);
  };

  const handleDelete = (message) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this message?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        // Implement delete functionality
        message.success('Message deleted successfully');
      },
    });
  };

  const handleSend = (message) => {
    Modal.confirm({
      title: 'Send Message',
      content: 'Are you sure you want to send this message?',
      okText: 'Yes',
      cancelText: 'No',
      onOk() {
        // Implement send functionality
        message.success('Message sent successfully');
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      // Implement save functionality
      setIsModalVisible(false);
      message.success(editingMessage ? 'Message updated successfully' : 'Message created successfully');
    });
  };

  return (
    <div className="communication-page">
      <Card title="Communication Management" className="communication-card">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ marginBottom: 16 }}
        >
          New Message
        </Button>

        <Table
          columns={columns}
          dataSource={messages}
          scroll={{ x: true }}
        />

        <Modal
          title={editingMessage ? 'Edit Message' : 'New Message'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please enter the title' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please select the type' }]}
            >
              <Select>
                <Option value="Announcement">Announcement</Option>
                <Option value="Event">Event</Option>
                <Option value="Emergency">Emergency</Option>
                <Option value="General">General</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="recipients"
              label="Recipients"
              rules={[{ required: true, message: 'Please select recipients' }]}
            >
              <Select mode="multiple">
                <Option value="All Parents">All Parents</Option>
                <Option value="All Students">All Students</Option>
                <Option value="All Teachers">All Teachers</Option>
                <Option value="Specific Classes">Specific Classes</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="content"
              label="Content"
              rules={[{ required: true, message: 'Please enter the message content' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select the date' }]}
            >
              <Input type="date" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default Communication; 
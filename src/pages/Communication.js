import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, Card, message, List, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { addMessage, updateMessage, deleteMessage, subscribeToCollection, getStudents, getParents, getTeachers } from '../firebase/services';

const { Option } = Select;

const Communication = () => {
  const [messages, setMessages] = useState([]);
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingMessage, setEditingMessage] = useState(null);

  useEffect(() => {
    const unsubscribeMessages = subscribeToCollection('messages', (data) => {
      setMessages(data);
    });
    const unsubscribeStudents = subscribeToCollection('students', (data) => {
      setStudents(data);
    });
    const unsubscribeParents = subscribeToCollection('parents', (data) => {
      setParents(data);
    });
    const unsubscribeTeachers = subscribeToCollection('teachers', (data) => {
      setTeachers(data);
    });
    return () => {
      unsubscribeMessages();
      unsubscribeStudents();
      unsubscribeParents();
      unsubscribeTeachers();
    };
  }, []);

  const handleAdd = () => {
    setEditingMessage(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingMessage(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (messageId) => {
    try {
      await deleteMessage(messageId);
      message.success('Message deleted successfully');
    } catch (error) {
      message.error('Error deleting message');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const messageData = {
        ...values,
        createdAt: new Date().toISOString()
      };

      if (editingMessage) {
        await updateMessage(editingMessage.id, messageData);
        message.success('Message updated successfully');
      } else {
        await addMessage(messageData);
        message.success('Message sent successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Error sending message');
    }
  };

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'Announcement' ? 'blue' : type === 'Notification' ? 'green' : 'orange'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Recipients',
      dataIndex: 'recipients',
      key: 'recipients',
      render: (recipients) => {
        if (!recipients) return 'All';
        return recipients.map(id => {
          const student = students.find(s => s.id === id);
          const parent = parents.find(p => p.id === id);
          const teacher = teachers.find(t => t.id === id);
          return student ? student.name : parent ? parent.name : teacher ? teacher.name : 'N/A';
        }).join(', ');
      }
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Communication Management"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            New Message
          </Button>
        }
      >
        <Table columns={columns} dataSource={messages} rowKey="id" />
      </Card>

      <Modal
        title={editingMessage ? 'Edit Message' : 'New Message'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="Message Type"
            rules={[{ required: true, message: 'Please select message type!' }]}
          >
            <Select>
              <Option value="Announcement">Announcement</Option>
              <Option value="Notification">Notification</Option>
              <Option value="Message">Message</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please input subject!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="recipients"
            label="Recipients"
            rules={[{ required: true, message: 'Please select recipients!' }]}
          >
            <Select mode="multiple" placeholder="Select recipients">
              <Select.OptGroup label="Students">
                {students.map(student => (
                  <Option key={`student-${student.id}`} value={student.id}>
                    {student.name}
                  </Option>
                ))}
              </Select.OptGroup>
              <Select.OptGroup label="Parents">
                {parents.map(parent => (
                  <Option key={`parent-${parent.id}`} value={parent.id}>
                    {parent.name}
                  </Option>
                ))}
              </Select.OptGroup>
              <Select.OptGroup label="Teachers">
                {teachers.map(teacher => (
                  <Option key={`teacher-${teacher.id}`} value={teacher.id}>
                    {teacher.name}
                  </Option>
                ))}
              </Select.OptGroup>
            </Select>
          </Form.Item>
          <Form.Item
            name="content"
            label="Message Content"
            rules={[{ required: true, message: 'Please input message content!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Communication; 
import React, { useState, useEffect } from 'react';
import { Tabs, Card, Table, Button, Space, Form, Input, Select, DatePicker, List, Tag, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MessageOutlined, CalendarOutlined } from '@ant-design/icons';
import { addParent, updateParent, deleteParent, subscribeToCollection, getStudents } from '../firebase/services';

const { TabPane } = Tabs;
const { Option } = Select;

const Parents = () => {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingParent, setEditingParent] = useState(null);

  useEffect(() => {
    const unsubscribeParents = subscribeToCollection('parents', (data) => {
      setParents(data);
    });
    const unsubscribeStudents = subscribeToCollection('students', (data) => {
      setStudents(data);
    });
    return () => {
      unsubscribeParents();
      unsubscribeStudents();
    };
  }, []);

  const handleAdd = () => {
    setEditingParent(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingParent(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (parentId) => {
    try {
      await deleteParent(parentId);
      message.success('Parent deleted successfully');
    } catch (error) {
      message.error('Error deleting parent');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const parentData = {
        ...values,
        createdAt: new Date().toISOString()
      };

      if (editingParent) {
        await updateParent(editingParent.id, parentData);
        message.success('Parent updated successfully');
      } else {
        await addParent(parentData);
        message.success('Parent added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Error saving parent');
    }
  };

  // Parent Information
  const parentColumns = [
    {
      title: 'Parent Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Students',
      dataIndex: 'studentIds',
      key: 'studentIds',
      render: (studentIds) => {
        if (!studentIds) return 'N/A';
        return studentIds.map(id => {
          const student = students.find(s => s.id === id);
          return student ? student.name : 'N/A';
        }).join(', ');
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
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

  // Parent-Teacher Meeting Schedule
  const meetings = [
    {
      id: 1,
      date: '2024-03-20',
      time: '10:00 AM',
      teacher: 'John Smith',
      subject: 'Mathematics',
      status: 'scheduled',
    },
    {
      id: 2,
      date: '2024-03-22',
      time: '2:00 PM',
      teacher: 'Sarah Johnson',
      subject: 'Science',
      status: 'completed',
    },
  ];

  // Announcements
  const announcements = [
    {
      id: 1,
      title: 'Parent-Teacher Meeting',
      content: 'Annual parent-teacher meeting scheduled for next week.',
      date: '2024-03-15',
      priority: 'high',
    },
    {
      id: 2,
      title: 'School Holiday',
      content: 'School will be closed for spring break from March 25-29.',
      date: '2024-03-10',
      priority: 'medium',
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Parent Information" key="1">
          <Card
            title="Parent Directory"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Add Parent
              </Button>
            }
          >
            <Table columns={parentColumns} dataSource={parents} rowKey="id" />
          </Card>
        </TabPane>

        <TabPane tab="Parent-Teacher Meetings" key="2">
          <Card
            title="Meeting Schedule"
            extra={
              <Button type="primary" icon={<CalendarOutlined />}>
                Schedule Meeting
              </Button>
            }
          >
            <List
              dataSource={meetings}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button key="edit" icon={<EditOutlined />} />,
                    <Button key="delete" icon={<DeleteOutlined />} danger />,
                  ]}
                >
                  <List.Item.Meta
                    title={`Meeting with ${item.teacher}`}
                    description={`Date: ${item.date} | Time: ${item.time} | Subject: ${item.subject}`}
                    avatar={<CalendarOutlined style={{ fontSize: 24 }} />}
                  />
                  <Tag color={item.status === 'scheduled' ? 'blue' : 'green'}>
                    {item.status}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="Announcements" key="3">
          <Card
            title="Announcements"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                New Announcement
              </Button>
            }
          >
            <List
              dataSource={announcements}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={`${item.content} | Date: ${item.date}`}
                    avatar={<MessageOutlined style={{ fontSize: 24 }} />}
                  />
                  <Tag color={item.priority === 'high' ? 'red' : 'orange'}>
                    {item.priority}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="Progress Reports" key="4">
          <Card title="Student Progress">
            <Form layout="vertical">
              <Form.Item label="Select Student">
                <Select>
                  <Select.Option value="1">John Doe</Select.Option>
                  <Select.Option value="2">Jane Smith</Select.Option>
                  <Select.Option value="3">Mike Johnson</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Academic Year">
                <Select>
                  <Select.Option value="2024-25">2024-25</Select.Option>
                  <Select.Option value="2023-24">2023-24</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary">View Progress Report</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Communication" key="5">
          <Card title="Send Message">
            <Form layout="vertical">
              <Form.Item label="To">
                <Select mode="multiple">
                  <Select.Option value="teacher1">John Smith (Math Teacher)</Select.Option>
                  <Select.Option value="teacher2">Sarah Johnson (Science Teacher)</Select.Option>
                  <Select.Option value="admin">Administration</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Subject">
                <Input />
              </Form.Item>
              <Form.Item label="Message">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item>
                <Button type="primary">Send Message</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={editingParent ? 'Edit Parent' : 'Add Parent'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Parent Name"
            rules={[{ required: true, message: 'Please input parent name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contact"
            label="Contact Number"
            rules={[{ required: true, message: 'Please input contact number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="studentIds"
            label="Students"
            rules={[{ required: true, message: 'Please select students!' }]}
          >
            <Select mode="multiple" placeholder="Select students">
              {students.map(student => (
                <Option key={student.id} value={student.id}>
                  {student.name}
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
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Parents; 
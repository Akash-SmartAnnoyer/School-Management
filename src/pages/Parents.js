import React from 'react';
import { Tabs, Card, Table, Button, Space, Form, Input, Select, DatePicker, List, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MessageOutlined, CalendarOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const Parents = () => {
  // Parent Information
  const parentColumns = [
    {
      title: 'Parent ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
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
      title: 'Children',
      dataIndex: 'children',
      key: 'children',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} />
          <Button icon={<DeleteOutlined />} danger />
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
              <Button type="primary" icon={<PlusOutlined />}>
                Add Parent
              </Button>
            }
          >
            <Table columns={parentColumns} dataSource={[]} rowKey="id" />
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
    </div>
  );
};

export default Parents; 
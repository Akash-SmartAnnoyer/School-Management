import React from 'react';
import { Tabs, Card, Table, Button, Space, Modal, Form, Input, Select, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const Academics = () => {
  // Course Management
  const courseColumns = [
    {
      title: 'Course Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Course Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Teacher',
      dataIndex: 'teacher',
      key: 'teacher',
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

  // Examination Management
  const examColumns = [
    {
      title: 'Exam Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
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

  // Homework Management
  const homeworkColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
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

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Course Management" key="1">
          <Card
            title="Courses"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Add Course
              </Button>
            }
          >
            <Table columns={courseColumns} dataSource={[]} rowKey="code" />
          </Card>
        </TabPane>

        <TabPane tab="Examination Management" key="2">
          <Card
            title="Examinations"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Add Examination
              </Button>
            }
          >
            <Table columns={examColumns} dataSource={[]} rowKey="id" />
          </Card>
        </TabPane>

        <TabPane tab="Homework & Assignments" key="3">
          <Card
            title="Homework & Assignments"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Add Homework
              </Button>
            }
          >
            <Table columns={homeworkColumns} dataSource={[]} rowKey="id" />
          </Card>
        </TabPane>

        <TabPane tab="Curriculum Planning" key="4">
          <Card title="Curriculum Planning">
            <Form layout="vertical">
              <Form.Item label="Academic Year">
                <Select>
                  <Select.Option value="2024-25">2024-25</Select.Option>
                  <Select.Option value="2023-24">2023-24</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Class">
                <Select>
                  <Select.Option value="1">Class 1</Select.Option>
                  <Select.Option value="2">Class 2</Select.Option>
                  <Select.Option value="3">Class 3</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Subject">
                <Select>
                  <Select.Option value="math">Mathematics</Select.Option>
                  <Select.Option value="science">Science</Select.Option>
                  <Select.Option value="english">English</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Curriculum Content">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item>
                <Button type="primary">Save Curriculum</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Report Cards" key="5">
          <Card title="Report Card Generation">
            <Form layout="vertical">
              <Form.Item label="Class">
                <Select>
                  <Select.Option value="1">Class 1</Select.Option>
                  <Select.Option value="2">Class 2</Select.Option>
                  <Select.Option value="3">Class 3</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Term">
                <Select>
                  <Select.Option value="1">First Term</Select.Option>
                  <Select.Option value="2">Second Term</Select.Option>
                  <Select.Option value="3">Final Term</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary">Generate Report Cards</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Academics; 
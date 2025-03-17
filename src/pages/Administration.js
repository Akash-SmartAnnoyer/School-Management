import React from 'react';
import { Tabs, Card, Table, Button, Space, Form, Input, Select, DatePicker, List, Tag, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, CarOutlined, BookOutlined, HomeOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Dragger } = Upload;

const Administration = () => {
  // Fee Management
  const feeColumns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Fee Type',
      dataIndex: 'feeType',
      key: 'feeType',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
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

  // Inventory Management
  const inventoryColumns = [
    {
      title: 'Item ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'in_stock' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
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

  // Transport Routes
  const routes = [
    {
      id: 1,
      name: 'Route A',
      driver: 'John Smith',
      vehicle: 'Bus 101',
      capacity: 40,
      status: 'active',
    },
    {
      id: 2,
      name: 'Route B',
      driver: 'Sarah Johnson',
      vehicle: 'Bus 102',
      capacity: 35,
      status: 'active',
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Fee Management" key="1">
          <Card
            title="Fee Records"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Add Fee Record
              </Button>
            }
          >
            <Table columns={feeColumns} dataSource={[]} rowKey="studentId" />
          </Card>
        </TabPane>

        <TabPane tab="Inventory Management" key="2">
          <Card
            title="Inventory"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Add Item
              </Button>
            }
          >
            <Table columns={inventoryColumns} dataSource={[]} rowKey="id" />
          </Card>
        </TabPane>

        <TabPane tab="Transport Management" key="3">
          <Card
            title="Transport Routes"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Add Route
              </Button>
            }
          >
            <List
              dataSource={routes}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button key="edit" icon={<EditOutlined />} />,
                    <Button key="delete" icon={<DeleteOutlined />} danger />,
                  ]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={`Driver: ${item.driver} | Vehicle: ${item.vehicle} | Capacity: ${item.capacity}`}
                    avatar={<CarOutlined style={{ fontSize: 24 }} />}
                  />
                  <Tag color={item.status === 'active' ? 'green' : 'red'}>
                    {item.status}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="Library Management" key="4">
          <Card title="Library">
            <Form layout="vertical">
              <Form.Item label="Book Title">
                <Input />
              </Form.Item>
              <Form.Item label="Author">
                <Input />
              </Form.Item>
              <Form.Item label="ISBN">
                <Input />
              </Form.Item>
              <Form.Item label="Category">
                <Select>
                  <Select.Option value="fiction">Fiction</Select.Option>
                  <Select.Option value="non-fiction">Non-Fiction</Select.Option>
                  <Select.Option value="textbook">Textbook</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Quantity">
                <Input type="number" />
              </Form.Item>
              <Form.Item>
                <Button type="primary">Add Book</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Hostel Management" key="5">
          <Card title="Hostel">
            <Form layout="vertical">
              <Form.Item label="Room Number">
                <Input />
              </Form.Item>
              <Form.Item label="Capacity">
                <Input type="number" />
              </Form.Item>
              <Form.Item label="Type">
                <Select>
                  <Select.Option value="boys">Boys Hostel</Select.Option>
                  <Select.Option value="girls">Girls Hostel</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Facilities">
                <Select mode="multiple">
                  <Select.Option value="ac">AC</Select.Option>
                  <Select.Option value="heater">Heater</Select.Option>
                  <Select.Option value="wifi">WiFi</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary">Add Room</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Calendar & Events" key="6">
          <Card title="Event Calendar">
            <Form layout="vertical">
              <Form.Item label="Event Title">
                <Input />
              </Form.Item>
              <Form.Item label="Event Type">
                <Select>
                  <Select.Option value="academic">Academic</Select.Option>
                  <Select.Option value="sports">Sports</Select.Option>
                  <Select.Option value="cultural">Cultural</Select.Option>
                  <Select.Option value="holiday">Holiday</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Description">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item>
                <Button type="primary">Add Event</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Administration; 
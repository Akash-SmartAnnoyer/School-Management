import React from 'react';
import { Tabs, Card, Table, Button, Space, Form, Input, Select, DatePicker, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const Finance = () => {
  // Income Records
  const incomeColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₹${amount.toLocaleString()}`,
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

  // Expense Records
  const expenseColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₹${amount.toLocaleString()}`,
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

  // Payroll Records
  const payrollColumns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Basic Salary',
      dataIndex: 'basicSalary',
      key: 'basicSalary',
      render: (amount) => `₹${amount.toLocaleString()}`,
    },
    {
      title: 'Allowances',
      dataIndex: 'allowances',
      key: 'allowances',
      render: (amount) => `₹${amount.toLocaleString()}`,
    },
    {
      title: 'Deductions',
      dataIndex: 'deductions',
      key: 'deductions',
      render: (amount) => `₹${amount.toLocaleString()}`,
    },
    {
      title: 'Net Salary',
      dataIndex: 'netSalary',
      key: 'netSalary',
      render: (amount) => `₹${amount.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ color: status === 'paid' ? 'green' : 'red' }}>
          {status}
        </span>
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

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Income"
              value={250000}
              precision={2}
              prefix="₹"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Expenses"
              value={180000}
              precision={2}
              prefix="₹"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Net Balance"
              value={70000}
              precision={2}
              prefix="₹"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Income Management" key="1">
          <Card
            title="Income Records"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Add Income
              </Button>
            }
          >
            <Table columns={incomeColumns} dataSource={[]} rowKey="id" />
          </Card>
        </TabPane>

        <TabPane tab="Expense Management" key="2">
          <Card
            title="Expense Records"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Add Expense
              </Button>
            }
          >
            <Table columns={expenseColumns} dataSource={[]} rowKey="id" />
          </Card>
        </TabPane>

        <TabPane tab="Payroll Management" key="3">
          <Card
            title="Payroll Records"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Add Payroll
              </Button>
            }
          >
            <Table columns={payrollColumns} dataSource={[]} rowKey="employeeId" />
          </Card>
        </TabPane>

        <TabPane tab="Budget Planning" key="4">
          <Card title="Budget Planning">
            <Form layout="vertical">
              <Form.Item label="Academic Year">
                <Select>
                  <Select.Option value="2024-25">2024-25</Select.Option>
                  <Select.Option value="2023-24">2023-24</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Department">
                <Select>
                  <Select.Option value="academic">Academic</Select.Option>
                  <Select.Option value="administrative">Administrative</Select.Option>
                  <Select.Option value="maintenance">Maintenance</Select.Option>
                  <Select.Option value="sports">Sports</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Budget Amount">
                <Input type="number" prefix="₹" />
              </Form.Item>
              <Form.Item label="Description">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item>
                <Button type="primary">Add Budget</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Financial Reports" key="5">
          <Card title="Generate Reports">
            <Form layout="vertical">
              <Form.Item label="Report Type">
                <Select>
                  <Select.Option value="income">Income Statement</Select.Option>
                  <Select.Option value="expense">Expense Report</Select.Option>
                  <Select.Option value="payroll">Payroll Report</Select.Option>
                  <Select.Option value="budget">Budget Report</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Date Range">
                <DatePicker.RangePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item>
                <Button type="primary">Generate Report</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Finance; 
import React, { useState, useEffect } from 'react';
import { Tabs, Card, Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, Row, Col, Statistic, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { addTransaction, updateTransaction, deleteTransaction, subscribeToCollection } from '../firebase/services';

const { TabPane } = Tabs;
const { Option } = Select;

const Finance = () => {
  const [transactions, setTransactions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    const unsubscribe = subscribeToCollection('finance', (data) => {
      setTransactions(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    setEditingTransaction(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTransaction(record);
    form.setFieldsValue({
      ...record,
      date: record.date ? new Date(record.date) : null
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (transactionId) => {
    try {
      await deleteTransaction(transactionId);
      message.success('Transaction deleted successfully');
    } catch (error) {
      message.error('Error deleting transaction');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const transactionData = {
        ...values,
        date: values.date ? values.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionData);
        message.success('Transaction updated successfully');
      } else {
        await addTransaction(transactionData);
        message.success('Transaction added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Error saving transaction');
    }
  };

  const calculateTotals = () => {
    const income = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expenses, balance: income - expenses };
  };

  const { income, expenses, balance } = calculateTotals();

  const getFilteredTransactions = (type) => {
    return transactions.filter(t => t.type === type);
  };

  const columns = [
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
      render: (amount) => `₹${Number(amount).toLocaleString()}`,
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
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Income"
              value={income}
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
              value={expenses}
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
              value={balance}
              precision={2}
              prefix="₹"
              valueStyle={{ color: balance >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1" onChange={setActiveTab}>
        <TabPane tab="Income Management" key="1">
          <Card
            title="Income Records"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Add Income
              </Button>
            }
          >
            <Table columns={columns} dataSource={getFilteredTransactions('Income')} rowKey="id" />
          </Card>
        </TabPane>

        <TabPane tab="Expense Management" key="2">
          <Card
            title="Expense Records"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Add Expense
              </Button>
            }
          >
            <Table columns={columns} dataSource={getFilteredTransactions('Expense')} rowKey="id" />
          </Card>
        </TabPane>

        <TabPane tab="Financial Reports" key="3">
          <Card title="Generate Reports">
            <Form layout="vertical">
              <Form.Item label="Report Type">
                <Select>
                  <Option value="income">Income Statement</Option>
                  <Option value="expense">Expense Report</Option>
                  <Option value="balance">Balance Sheet</Option>
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

      <Modal
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type!' }]}
          >
            <Select>
              <Option value="Income">Income</Option>
              <Option value="Expense">Expense</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please input category!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please input amount!' }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Finance; 
import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { addClass, updateClass, deleteClass, subscribeToCollection } from '../firebase/services';

const { Option } = Select;

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingClass, setEditingClass] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToCollection('classes', (data) => {
      setClasses(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    setEditingClass(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingClass(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (classId) => {
    try {
      await deleteClass(classId);
      message.success('Class deleted successfully');
    } catch (error) {
      message.error('Error deleting class');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingClass) {
        await updateClass(editingClass.id, values);
        message.success('Class updated successfully');
      } else {
        await addClass(values);
        message.success('Class added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Error saving class');
    }
  };

  const columns = [
    {
      title: 'Class ID',
      dataIndex: 'classId',
      key: 'classId',
    },
    {
      title: 'Class Name',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
    },
    {
      title: 'Teacher',
      dataIndex: 'teacher',
      key: 'teacher',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
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

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Class
        </Button>
      </div>
      <Table columns={columns} dataSource={classes} rowKey="id" />

      <Modal
        title={editingClass ? 'Edit Class' : 'Add Class'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="classId"
            label="Class ID"
            rules={[{ required: true, message: 'Please input class ID!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="className"
            label="Class Name"
            rules={[{ required: true, message: 'Please input class name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="section"
            label="Section"
            rules={[{ required: true, message: 'Please input section!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="teacher"
            label="Teacher"
            rules={[{ required: true, message: 'Please input teacher name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Capacity"
            rules={[{ required: true, message: 'Please input capacity!' }]}
          >
            <Input type="number" />
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

export default Classes; 
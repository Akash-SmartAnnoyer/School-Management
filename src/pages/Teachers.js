import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  addTeacher, 
  getTeachers, 
  updateTeacher, 
  deleteTeacher, 
  subscribeToCollection,
  getClasses 
} from '../firebase/services';

const { Option } = Select;

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    // Subscribe to real-time updates for teachers
    const unsubscribeTeachers = subscribeToCollection('teachers', (data) => {
      setTeachers(data);
    });

    // Subscribe to real-time updates for classes
    const unsubscribeClasses = subscribeToCollection('classes', (data) => {
      setClasses(data);
    });

    return () => {
      unsubscribeTeachers();
      unsubscribeClasses();
    };
  }, []);

  const handleAdd = () => {
    setEditingTeacher(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTeacher(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (teacherId) => {
    try {
      await deleteTeacher(teacherId);
      message.success('Teacher deleted successfully');
    } catch (error) {
      message.error('Error deleting teacher');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, values);
        message.success('Teacher updated successfully');
      } else {
        await addTeacher(values);
        message.success('Teacher added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Error saving teacher');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => `TCH${id.slice(-6)}`,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Qualification',
      dataIndex: 'qualification',
      key: 'qualification',
    },
    {
      title: 'Class',
      dataIndex: 'classId',
      key: 'classId',
      render: (classId) => {
        const classInfo = classes.find(c => c.id === classId);
        return classInfo ? `${classInfo.className} - ${classInfo.section}` : '-';
      },
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
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Teacher
        </Button>
      </div>
      <Table columns={columns} dataSource={teachers} rowKey="id" />

      <Modal
        title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input teacher name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please input subject!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="qualification"
            label="Qualification"
            rules={[{ required: true, message: 'Please input qualification!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="classId"
            label="Class"
            rules={[{ required: true, message: 'Please select class!' }]}
          >
            <Select>
              {classes.map(cls => (
                <Option key={cls.id} value={cls.id}>
                  {cls.className} - {cls.section}
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

export default Teachers; 
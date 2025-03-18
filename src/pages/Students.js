import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  addStudent, 
  getStudents, 
  updateStudent, 
  deleteStudent, 
  subscribeToCollection,
  getClasses 
} from '../firebase/services';

const { Option } = Select;

const Students = () => {
  const [students, setStudents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingStudent, setEditingStudent] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    // Subscribe to real-time updates for students
    const unsubscribeStudents = subscribeToCollection('students', (data) => {
      setStudents(data);
    });

    // Subscribe to real-time updates for classes
    const unsubscribeClasses = subscribeToCollection('classes', (data) => {
      setClasses(data);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeClasses();
    };
  }, []);

  const handleAdd = () => {
    setEditingStudent(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingStudent(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (studentId) => {
    try {
      await deleteStudent(studentId);
      message.success('Student deleted successfully');
    } catch (error) {
      message.error('Error deleting student');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingStudent) {
        await updateStudent(editingStudent.id, values);
        message.success('Student updated successfully');
      } else {
        // Generate roll number based on class and section
        const classInfo = classes.find(c => c.id === values.classId);
        if (classInfo) {
          // Get existing students in the same class to determine next roll number
          const classStudents = students.filter(s => s.classId === values.classId);
          const nextRollNumber = classStudents.length + 1;
          values.rollNumber = `${classInfo.className.slice(-1)}${classInfo.section}${String(nextRollNumber).padStart(2, '0')}`;
        }
        await addStudent(values);
        message.success('Student added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Error saving student');
    }
  };

  const columns = [
    {
      title: 'Roll Number',
      dataIndex: 'rollNumber',
      key: 'rollNumber',
      width: 100,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
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
          Add Student
        </Button>
      </div>
      <Table columns={columns} dataSource={students} rowKey="id" />

      <Modal
        title={editingStudent ? 'Edit Student' : 'Add Student'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input student name!' }]}
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
            name="rollNumber"
            label="Roll Number"
            rules={[{ required: true, message: 'Please input roll number!' }]}
          >
            <Input disabled={!editingStudent} />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: 'Please select gender!' }]}
          >
            <Select>
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
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

export default Students; 
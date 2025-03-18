import React, { useState, useEffect } from 'react';
import { Tabs, Card, Table, Button, Space, Modal, Form, Input, Select, DatePicker, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { addExam, updateExam, deleteExam, subscribeToCollection, getStudents, getClasses } from '../firebase/services';

const { TabPane } = Tabs;
const { Option } = Select;

const Academics = () => {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingExam, setEditingExam] = useState(null);

  useEffect(() => {
    const unsubscribeExams = subscribeToCollection('exams', (data) => {
      setExams(data);
    });
    const unsubscribeStudents = subscribeToCollection('students', (data) => {
      setStudents(data);
    });
    const unsubscribeClasses = subscribeToCollection('classes', (data) => {
      setClasses(data);
    });
    return () => {
      unsubscribeExams();
      unsubscribeStudents();
      unsubscribeClasses();
    };
  }, []);

  const handleAdd = () => {
    setEditingExam(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingExam(record);
    form.setFieldsValue({
      ...record,
      date: record.date ? new Date(record.date) : null
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (examId) => {
    try {
      await deleteExam(examId);
      message.success('Exam deleted successfully');
    } catch (error) {
      message.error('Error deleting exam');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const examData = {
        ...values,
        date: values.date ? values.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      if (editingExam) {
        await updateExam(editingExam.id, examData);
        message.success('Exam updated successfully');
      } else {
        await addExam(examData);
        message.success('Exam added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Error saving exam');
    }
  };

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
  const columns = [
    {
      title: 'Exam Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Class',
      dataIndex: 'classId',
      key: 'classId',
      render: (classId) => {
        const classInfo = classes.find(c => c.id === classId);
        return classInfo ? `${classInfo.className} - ${classInfo.section}` : 'N/A';
      }
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
      render: (duration) => `${duration} minutes`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Scheduled' ? 'blue' : status === 'Completed' ? 'green' : 'red'}>
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
            title="Exams Management"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Add Exam
              </Button>
            }
          >
            <Table columns={columns} dataSource={exams} rowKey="id" />
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

      <Modal
        title={editingExam ? 'Edit Exam' : 'Add Exam'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Exam Name"
            rules={[{ required: true, message: 'Please input exam name!' }]}
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
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please input subject!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[{ required: true, message: 'Please input duration!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select>
              <Option value="Scheduled">Scheduled</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Academics; 
import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Typography, Tabs, Row, Col, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../services/api';
import { MessageContext } from '../App';
import ClassDetailsDrawer from '../components/ClassDetailsDrawer';
import { useAuth } from '../contexts/AuthContext';
import Timetable from './Timetable';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const sections = ['A', 'B', 'C', 'D', 'E', 'F'];

const Classes = () => {
  const messageApi = useContext(MessageContext);
  const [classes, setClasses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingClass, setEditingClass] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await api.class.getAll();
      setClasses(response.data.data);
    } catch (error) {
      messageApi.error('Failed to load classes');
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await api.teacher.getAll();
      setTeachers(response.data.data);
    } catch (error) {
      messageApi.error('Failed to load teachers');
    }
  };

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
      setLoading(true);
      // Before deleting the class, clear the teacher's classId
      const classToDelete = classes.find(c => c.id === classId);
      if (classToDelete?.teacherId) {
        const teacher = teachers.find(t => t.id === classToDelete.teacherId);
        if (teacher) {
          await api.teacher.update(teacher.id, { classId: null });
        }
      }
      await api.class.delete(classId);
      messageApi.success('Class deleted successfully');
      loadClasses();
    } catch (error) {
      messageApi.error('Error deleting class');
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const classData = {
        ...values,
        updatedAt: new Date().toISOString()
      };

      if (editingClass) {
        // If teacher is being changed, update both old and new teacher's classId
        if (editingClass.teacherId !== values.teacherId) {
          // Clear classId from old teacher if it exists
          if (editingClass.teacherId) {
            const oldTeacher = teachers.find(t => t.id === editingClass.teacherId);
            if (oldTeacher) {
              await api.teacher.update(oldTeacher.id, { classId: null });
            }
          }
          
          // Set classId in new teacher if selected
          if (values.teacherId) {
            const newTeacher = teachers.find(t => t.id === values.teacherId);
            if (newTeacher) {
              await api.teacher.update(newTeacher.id, { classId: editingClass.id });
            }
          }
        }
        await api.class.update(editingClass.id, classData);
        messageApi.success('Class updated successfully');
      } else {
        classData.createdAt = new Date().toISOString();
        await api.class.create(classData);
        messageApi.success('Class added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      loadClasses();
    } catch (error) {
      messageApi.error('Error saving class');
    } finally {
      setLoading(false);
    }
  };

  const renderTimetable = (classId) => {
    return (
      <div style={{ marginTop: '20px' }}>
        <Timetable classId={classId} />
      </div>
    );
  };

  const expandedRowRender = (record) => {
    return (
      <Tabs defaultActiveKey="1">
        <TabPane tab="Class Details" key="1">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Descriptions bordered>
                <Descriptions.Item label="Class Name">{record.className}</Descriptions.Item>
                <Descriptions.Item label="Section">{record.section}</Descriptions.Item>
                <Descriptions.Item label="Class Teacher">
                  {teachers.find(t => t.id === record.teacherId)?.name || 'Not Assigned'}
                </Descriptions.Item>
                <Descriptions.Item label="Total Students">{record.totalStudents || 0}</Descriptions.Item>
                <Descriptions.Item label="Room Number">{record.roomNumber}</Descriptions.Item>
                <Descriptions.Item label="Capacity">{record.capacity}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Timetable" key="2">
          {renderTimetable(record.id)}
        </TabPane>
      </Tabs>
    );
  };

  const columns = [
    {
      title: 'Class Name',
      dataIndex: 'className',
      key: 'className',
      render: (text, record) => (
        <Button type="link" onClick={() => {
          setSelectedClass(record);
          setDrawerVisible(true);
        }}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      render: (section) => `Section ${section}`,
    },
    {
      title: 'Teacher',
      dataIndex: 'teacherId',
      key: 'teacherId',
      render: (teacherId) => {
        if (!teacherId) return 'Not Assigned';
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher ? teacher.name : '-';
      },
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity) => `${capacity} students`,
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
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: '8px' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Class
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={classes} 
        rowKey="id"
        expandable={{
          expandedRowRender,
        }}
        loading={loading}
      />

      <Modal
        title={editingClass ? 'Edit Class' : 'Add Class'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingClass(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalOk}
        >
          <Form.Item
            name="className"
            label="Class Name"
            rules={[{ required: true, message: 'Please enter class name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="section"
            label="Section"
            rules={[{ required: true, message: 'Please select section' }]}
          >
            <Select>
              {sections.map(section => (
                <Option key={section} value={section}>Section {section}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="teacherId"
            label="Class Teacher"
          >
            <Select allowClear>
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Capacity"
            rules={[{ required: true, message: 'Please enter capacity' }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="roomNumber"
            label="Room Number"
            rules={[{ required: true, message: 'Please enter room number' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingClass ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setEditingClass(null);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <ClassDetailsDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        classData={selectedClass}
        teachers={teachers}
      />
    </div>
  );
};

export default Classes; 
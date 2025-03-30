import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Typography, Tabs, Row, Col, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { addClass, getClasses, updateClass, deleteClass, subscribeToCollection, getTeachers, updateTeacher } from '../firebase/services';
import { initializeSchoolData } from '../utils/initializeSchoolData';
import { MessageContext } from '../App';
import ClassDetailsDrawer from '../components/ClassDetailsDrawer';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
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

  useEffect(() => {
    // Subscribe to real-time updates for classes
    const unsubscribeClasses = subscribeToCollection('classes', (data) => {
      setClasses(data);
    });

    // Subscribe to real-time updates for teachers
    const unsubscribeTeachers = subscribeToCollection('teachers', (data) => {
      setTeachers(data);
    });

    return () => {
      unsubscribeClasses();
      unsubscribeTeachers();
    };
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
      // Before deleting the class, clear the teacher's classId
      const classToDelete = classes.find(c => c.id === classId);
      if (classToDelete?.teacherId) {
        const teacher = teachers.find(t => t.id === classToDelete.teacherId);
        if (teacher) {
          await updateTeacher(teacher.id, { classId: null });
        }
      }
      await deleteClass(classId);
      messageApi.success('Class deleted successfully');
    } catch (error) {
      messageApi.error('Error deleting class');
    }
  };

  const handleModalOk = async () => {
    try {
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
              await updateTeacher(oldTeacher.id, { classId: null });
            }
          }
          
          // Set classId in new teacher if selected
          if (values.teacherId) {
            const newTeacher = teachers.find(t => t.id === values.teacherId);
            if (newTeacher) {
              await updateTeacher(newTeacher.id, { classId: editingClass.id });
            }
          }
        }
        await updateClass(editingClass.id, classData);
        messageApi.success('Class updated successfully');
      } else {
        classData.createdAt = new Date().toISOString();
        const newClassRef = await addClass(classData);
        
        // If teacher is selected for new class, update the teacher's classId
        if (values.teacherId) {
          const selectedTeacher = teachers.find(t => t.id === values.teacherId);
          if (selectedTeacher) {
            await updateTeacher(selectedTeacher.id, { classId: newClassRef.id });
          }
        }
        messageApi.success('Class added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      messageApi.error('Error saving class');
    }
  };

  const handleInitializeDB = async () => {
    try {
      await initializeSchoolData();
      messageApi.success('School data initialized successfully');
    } catch (error) {
      messageApi.error('Error initializing school data');
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
                <Descriptions.Item label="Class Name">{record.name}</Descriptions.Item>
                <Descriptions.Item label="Section">{record.section}</Descriptions.Item>
                <Descriptions.Item label="Class Teacher">
                  {teachers.find(t => t.id === record.classTeacherId)?.name || 'Not Assigned'}
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
        <Button 
          type="default" 
          icon={<ReloadOutlined />} 
          onClick={handleInitializeDB}
          danger
        >
          Reset Database
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
            name="className"
            label="Class Name"
            rules={[{ required: true, message: 'Please input class name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="section"
            label="Section"
            rules={[{ required: true, message: 'Please select section!' }]}
          >
            <Select>
              {sections.map(section => (
                <Option key={section} value={section}>
                  Section {section}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="teacherId"
            label="Teacher"
            rules={[{ required: false }]}
          >
            <Select allowClear>
              <Option value="">Not Assigned</Option>
              {teachers
                .filter(teacher => teacher.status === 'Active')
                .map(teacher => (
                  <Option key={teacher.id} value={teacher.id}>
                    {teacher.name} - {teacher.subject}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Capacity"
            rules={[
              { required: true, message: 'Please input capacity!' },
              { type: 'number', min: 1, message: 'Capacity must be at least 1!' }
            ]}
          >
            <Input type="number" min={1} />
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
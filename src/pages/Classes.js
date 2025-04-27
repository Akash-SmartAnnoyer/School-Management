import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Typography, Tabs, Row, Col, Descriptions, Transfer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, UserAddOutlined } from '@ant-design/icons';
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
  const [students, setStudents] = useState([]);
  const [studentTransferVisible, setStudentTransferVisible] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    loadClasses();
    loadTeachers();
    loadStudents();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await api.class.getClasses();
      if (response) {
        setClasses(response);
      }
    } catch (error) {
      messageApi.error('Failed to load classes');
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.teacher.getTeachers();
      if (response) {
        setTeachers(response);
      }
    } catch (error) {
      messageApi.error('Failed to load teachers');
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await api.student.getStudents();
      if (response) {
        setStudents(response);
      }
    } catch (error) {
      messageApi.error('Failed to load students');
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingClass(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingClass(record);
    form.setFieldsValue({
      className: record.class_name,
      section: record.section,
      teacherId: record.teacher?.id,
      capacity: record.capacity,
      status: record.status.charAt(0).toUpperCase() + record.status.slice(1)
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (classId) => {
    try {
      setLoading(true);
      await api.class.deleteClass(classId);
      messageApi.success('Class deleted successfully');
      loadClasses();
    } catch (error) {
      messageApi.error('Failed to delete class');
      console.error('Error deleting class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const classData = {
        className: values.className,
        section: values.section,
        teacherId: values.teacherId,
        capacity: values.capacity,
        status: values.status
      };

      if (editingClass) {
        await api.class.updateClass(editingClass.id, classData);
        messageApi.success('Class updated successfully');
      } else {
        await api.class.createClass(classData);
        messageApi.success('Class added successfully');
      }
      setIsModalVisible(false);
      loadClasses();
    } catch (error) {
      messageApi.error(editingClass ? 'Failed to update class' : 'Failed to add class');
      console.error('Error saving class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudents = (record) => {
    setSelectedClass(record);
    setSelectedStudents(record.students?.map(s => s.id) || []);
    setStudentTransferVisible(true);
  };

  const handleStudentTransferChange = async (targetKeys) => {
    try {
      setLoading(true);
      await api.class.addStudentsToClass(selectedClass.id, targetKeys);
      messageApi.success('Students added to class successfully');
      loadClasses();
      setStudentTransferVisible(false);
    } catch (error) {
      messageApi.error('Failed to add students to class');
      console.error('Error adding students to class:', error);
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
                <Descriptions.Item label="Class Name">{record.class_name}</Descriptions.Item>
                <Descriptions.Item label="Section">{record.section}</Descriptions.Item>
                <Descriptions.Item label="Class Teacher">
                  {record.teacher ? teachers.find(t => t.id === record.teacher)?.name || 'Not Assigned' : 'Not Assigned'}
                </Descriptions.Item>
                <Descriptions.Item label="Capacity">{record.capacity}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={record.status === 'active' ? 'green' : 'red'}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Tag>
                </Descriptions.Item>
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
      dataIndex: 'class_name',
      key: 'class_name',
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
      dataIndex: 'teacher',
      key: 'teacher',
      render: (teacherId) => {
        if (!teacherId) return 'Not Assigned';
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher ? teacher.name : 'Not Assigned';
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
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<UserAddOutlined />}
            size="small"
            onClick={() => handleAddStudents(record)}
          />
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

      <Modal
        title="Add Students to Class"
        open={studentTransferVisible}
        onCancel={() => setStudentTransferVisible(false)}
        footer={null}
        width={800}
      >
        <Transfer
          dataSource={students.map(student => ({
            key: student.id,
            title: `${student.first_name} ${student.last_name}`,
            description: `Roll No: ${student.roll_no || 'N/A'}`
          }))}
          targetKeys={selectedStudents}
          onChange={handleStudentTransferChange}
          render={item => item.title}
          listStyle={{
            width: 300,
            height: 400,
          }}
        />
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
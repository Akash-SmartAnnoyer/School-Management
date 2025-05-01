import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Typography, Row, Col, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../services/api';
import { MessageContext } from '../App';
import ClassDetailsDrawer from '../components/ClassDetailsDrawer';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

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
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await api.class.getClasses();
      if (response) {
        setClasses(response.data);
      }
    } catch (error) {
      messageApi.error('Failed to load classes');
      console.error('Error loading classes:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const response = await api.teacher.getTeachers();
      if (response) {
        setTeachers(response.data);
      }
    } catch (error) {
      messageApi.error('Failed to load teachers');
      console.error('Error loading teachers:', error);
    } finally {
      setLoadingTeachers(false);
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
      setLoadingClasses(true);
      await api.class.deleteClass(classId);
      messageApi.success('Class deleted successfully');
      loadClasses();
    } catch (error) {
      messageApi.error('Failed to delete class');
      console.error('Error deleting class:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleModalOk = async () => {
    try {
      setLoadingModal(true);
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
      setLoadingModal(false);
    }
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

  const filteredClasses = classes.filter(cls =>
    cls.class_name.toLowerCase().includes(searchText.toLowerCase()) ||
    cls.section.toLowerCase().includes(searchText.toLowerCase()) ||
    (cls.teacher?.name?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2}>Classes</Title>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Search classes..."
              allowClear
              onSearch={setSearchText}
              style={{ width: 300 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} loading={loadingClasses}>
              Add Class
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table 
          columns={columns} 
          dataSource={filteredClasses} 
          rowKey="id"
          loading={loadingClasses}
        />
      </Card>

      <Modal
        title={editingClass ? 'Edit Class' : 'Add Class'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingClass(null);
        }}
        footer={null}
        confirmLoading={loadingModal}
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
              <Button type="primary" htmlType="submit" loading={loadingModal}>
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
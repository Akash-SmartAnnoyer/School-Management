import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Typography, Row, Col, Card, Checkbox, Popconfirm, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined, SearchOutlined, SwapOutlined, DeleteFilled } from '@ant-design/icons';
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
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkStatusModalVisible, setBulkStatusModalVisible] = useState(false);
  const [bulkStatusForm] = Form.useForm();

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
      teacherId: record.teacher?.id || null,
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

  const handleBulkStatusChange = async () => {
    try {
      const values = await bulkStatusForm.validateFields();
      console.log('Bulk status change for classes:', {
        ids: selectedRowKeys,
        status: values.status
      });
      // TODO: Implement bulk status change API
      messageApi.success('Status update simulated for selected classes');
      setBulkStatusModalVisible(false);
      setSelectedRowKeys([]);
    } catch (error) {
      messageApi.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      console.log('Bulk delete for classes:', {
        ids: selectedRowKeys
      });
      // TODO: Implement bulk delete API
      messageApi.success('Delete simulated for selected classes');
      setSelectedRowKeys([]);
    } catch (error) {
      messageApi.error('Failed to delete classes');
      console.error('Error deleting classes:', error);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
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
      render: (teacher) => {
        if (!teacher) return 'Not Assigned';
        return `${teacher.first_name} ${teacher.last_name}`;
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
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '0', 
      overflow: 'hidden', 
      margin: '0',
      borderRadius: '16px',
      background: '#ffffff',
      boxShadow: '0 4px 20px rgba(159, 179, 223, 0.15)',
      border: '1px solid rgba(159, 179, 223, 0.2)'
    }}>
      <Row justify="space-between" align="middle" style={{ padding: '16px 24px' }}>
        <Col>
          <Title level={3} style={{ 
            color: '#9fb3df',
            margin: 0,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <BookOutlined style={{ fontSize: '24px', color: '#9fb3df' }} />
            Classes
          </Title>
        </Col>
        <Col>
          <Space size="small">
            <Search
              placeholder="Search classes..."
              allowClear
              onSearch={setSearchText}
              style={{ 
                width: 250,
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
              prefix={<SearchOutlined style={{ color: '#9fb3df' }} />}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{
                height: '32px',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                background: '#9fb3df',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.3s ease',
                padding: '0 12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(159, 179, 223, 0.25)';
                e.currentTarget.style.background = '#8ba1d1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(159, 179, 223, 0.15)';
                e.currentTarget.style.background = '#9fb3df';
              }}
            >
              Add Class
            </Button>
          </Space>
        </Col>
      </Row>

      <Card
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
          overflow: 'hidden',
          background: '#ffffff',
          border: '1px solid rgba(159, 179, 223, 0.3)',
          margin: '0 16px 16px 16px',
          padding: 0
        }}
        bodyStyle={{ padding: 0, height: '100%' }}
      >
        <Table 
          rowSelection={rowSelection}
          columns={columns} 
          dataSource={filteredClasses} 
          rowKey="id"
          loading={loadingClasses}
          scroll={{ y: 'calc(100vh - 280px)' }}
          className="custom-table"
          locale={{
            emptyText: (
              <Empty
                description="No classes found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '20px 0' }}
              />
            ),
          }}
        />
      </Card>

      {selectedRowKeys.length > 0 && (
        <Card
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            boxShadow: '0 -2px 8px rgba(159, 179, 223, 0.2)',
            background: 'white',
            borderTop: '1px solid rgba(159, 179, 223, 0.3)'
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <span style={{ color: '#9fb3df', fontWeight: 500 }}>{selectedRowKeys.length} classes selected</span>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  onClick={() => setBulkStatusModalVisible(true)}
                  style={{
                    background: '#9fb3df',
                    borderColor: '#9fb3df',
                    boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  icon={<SwapOutlined />}
                >
                  Change Status
                </Button>
                <Popconfirm
                  title="Are you sure you want to delete selected classes?"
                  onConfirm={handleBulkDelete}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button 
                    danger
                    style={{
                      background: '#fff1f0',
                      borderColor: '#ffa39e',
                      color: '#ff4d4f',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    icon={<DeleteFilled />}
                  >
                    Delete Selected
                  </Button>
                </Popconfirm>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

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
            <Select allowClear placeholder="Select teacher">
              {teachers.map(teacher => (
                <Option key={teacher.user_id} value={teacher.user_id}>
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

      <Modal
        title="Change Status"
        open={bulkStatusModalVisible}
        onOk={handleBulkStatusChange}
        onCancel={() => setBulkStatusModalVisible(false)}
        confirmLoading={loadingClasses}
      >
        <Form form={bulkStatusForm} layout="vertical">
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
        </Form>
      </Modal>

      <ClassDetailsDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        classData={selectedClass}
        teachers={teachers}
      />

      <style>
        {`
          .custom-table .ant-table {
            border-radius: 12px;
            overflow: hidden;
            height: 100%;
          }
          
          .custom-table .ant-table-container {
            overflow: hidden !important;
            height: 100%;
            border-radius: 12px;
          }
          
          .custom-table .ant-table-body {
            overflow-y: auto !important;
            overflow-x: hidden !important;
            height: calc(100% - 32px) !important;
            border-radius: 0 0 12px 12px;
          }

          .custom-table .ant-table-body::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          .custom-table .ant-table-body::-webkit-scrollbar-thumb {
            background: rgba(159, 179, 223, 0.3);
            border-radius: 3px;
          }

          .custom-table .ant-table-body::-webkit-scrollbar-track {
            background: rgba(159, 179, 223, 0.1);
            border-radius: 3px;
          }
          
          .custom-table .ant-table-thead > tr > th:first-child {
            border-top-left-radius: 12px;
          }
          
          .custom-table .ant-table-thead > tr > th:last-child {
            border-top-right-radius: 12px;
          }

          .custom-table .ant-table-tbody > tr > td:last-child {
            position: sticky;
            right: 0;
            background: white;
            z-index: 1;
            box-shadow: -2px 0 8px rgba(159, 179, 223, 0.1);
          }

          .custom-table .ant-table-thead > tr > th:last-child {
            position: sticky;
            right: 0;
            background: rgba(159, 179, 223, 0.1) !important;
            z-index: 2;
            box-shadow: -2px 0 8px rgba(159, 179, 223, 0.1);
          }

          .custom-table .ant-table-tbody > tr:hover > td:last-child {
            background: rgba(159, 179, 223, 0.05) !important;
          }

          .custom-table .ant-table-tbody > tr.ant-table-row-selected > td:last-child {
            background: rgba(159, 179, 223, 0.1) !important;
          }

          .custom-table .ant-table-tbody > tr.ant-table-row-selected:hover > td:last-child {
            background: rgba(159, 179, 223, 0.15) !important;
          }
          
          .custom-table .ant-table-thead > tr > th {
            background: rgba(159, 179, 223, 0.1) !important;
            color: #9fb3df !important;
            font-weight: 600;
            border-bottom: 2px solid rgba(159, 179, 223, 0.2);
            padding: 2px 12px !important;
            position: sticky;
            top: 0;
            z-index: 2;
            height: 28px;
            font-size: 13px;
          }
          
          .custom-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid rgba(159, 179, 223, 0.1);
            padding: 2px 12px !important;
            height: 28px;
            font-size: 13px;
          }
          
          .custom-table .ant-table-tbody > tr:hover > td {
            background: rgba(159, 179, 223, 0.05) !important;
          }

          .custom-table .ant-table-tbody > tr.ant-table-row-selected > td {
            background: rgba(159, 179, 223, 0.1) !important;
          }

          .custom-table .ant-table-tbody > tr.ant-table-row-selected:hover > td {
            background: rgba(159, 179, 223, 0.15) !important;
          }
          
          .custom-table .ant-table-pagination {
            border-top: 1px solid rgba(159, 179, 223, 0.2);
            margin: 0 !important;
            padding: 2px 12px !important;
            position: sticky;
            bottom: 0;
            background: white;
            z-index: 2;
            height: 32px;
          }
          
          .custom-table .ant-pagination-item {
            border: 1px solid rgba(159, 179, 223, 0.3);
            min-width: 22px;
            height: 22px;
            line-height: 20px;
            font-size: 12px;
          }
          
          .custom-table .ant-pagination-item-active {
            background: #9fb3df !important;
            border-color: #9fb3df !important;
          }
          
          .custom-table .ant-pagination-item-active a {
            color: white !important;
          }
          
          .custom-table .ant-pagination-item:hover {
            border-color: #9fb3df !important;
          }
          
          .custom-table .ant-pagination-prev .ant-pagination-item-link,
          .custom-table .ant-pagination-next .ant-pagination-item-link {
            border: 1px solid rgba(159, 179, 223, 0.3);
            min-width: 22px;
            height: 22px;
            line-height: 20px;
            font-size: 12px;
          }
          
          .custom-table .ant-pagination-prev:hover .ant-pagination-item-link,
          .custom-table .ant-pagination-next:hover .ant-pagination-item-link {
            border-color: #9fb3df !important;
            color: #9fb3df !important;
          }

          .custom-table .ant-table-cell {
            white-space: nowrap;
          }

          .custom-table .ant-table-cell .ant-tag {
            margin: 0;
            padding: 0 6px;
            font-size: 12px;
            height: 20px;
            line-height: 18px;
          }

          .custom-table .ant-table-cell .ant-btn {
            padding: 0 6px;
            height: 22px;
            font-size: 12px;
          }

          .custom-table .ant-table-cell .ant-avatar {
            width: 24px;
            height: 24px;
            line-height: 24px;
            font-size: 12px;
          }

          .custom-table .ant-checkbox-wrapper:hover .ant-checkbox-inner,
          .custom-table .ant-checkbox:hover .ant-checkbox-inner,
          .custom-table .ant-checkbox-input:focus + .ant-checkbox-inner {
            border-color: #9fb3df !important;
          }

          .custom-table .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #9fb3df !important;
            border-color: #9fb3df !important;
          }

          .custom-table .ant-checkbox-indeterminate .ant-checkbox-inner::after {
            background-color: #9fb3df !important;
          }
        `}
      </style>
    </div>
  );
};

export default Classes; 
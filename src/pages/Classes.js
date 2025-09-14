import React, { useState, useEffect, useContext, forwardRef, useImperativeHandle } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Typography, Row, Col, Card, Checkbox, Popconfirm, Empty, Tooltip, Upload, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined, SearchOutlined, SwapOutlined, DeleteFilled, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined, SettingOutlined, ExportOutlined, DownloadOutlined, FileExcelOutlined, FilePdfOutlined, SendOutlined } from '@ant-design/icons';
import { DragHandleOutlined } from '@mui/icons-material';
import api from '../services/api';
import { MessageContext } from '../App';
import ClassDetailsDrawer from '../components/ClassDetailsDrawer';
import { useAuth } from '../contexts/AuthContext';
import { useClasses } from '../contexts/ClassesContext';
import { useMessage } from '../contexts/MessageContext';
import { useTeachers } from '../contexts/TeachersContext';
import StyledModal from '../components/StyledModal';
import ColumnSettingsDrawer from '../components/ColumnSettingsDrawer';
import useColumnSettings from '../hooks/useColumnSettings';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const sections = ['A', 'B', 'C', 'D', 'E', 'F'];

const Classes = forwardRef((props, ref) => {
  const messageApi = useMessage();
  const { 
    classes, 
    loading: classesLoading, 
    currentPage, 
    totalClasses, 
    loadClasses, 
    refreshClasses,
    createClass,
    updateClass,
    deleteClass
  } = useClasses();
  const {
    teachers,
    loading: teachersLoading,
    loadTeachers
  } = useTeachers();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingClass, setEditingClass] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkStatusModalVisible, setBulkStatusModalVisible] = useState(false);
  const [bulkStatusForm] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportType, setExportType] = useState('excel');
  const [exportEmails, setExportEmails] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportMode, setExportMode] = useState('download');
  const [classCount, setClassCount] = useState(classes.length);

  const {
    columnSettingsVisible,
    setColumnSettingsVisible,
    columnSettings,
    handleColumnVisibilityChange,
    handleColumnReorder,
    handleCheckAll,
    getVisibleColumns
  } = useColumnSettings([
    { key: 'class_name', title: 'Class', visible: true, order: 0 },
    { key: 'section', title: 'Section', visible: true, order: 1 },
    { key: 'teacher', title: 'Class Teacher', visible: true, order: 2 },
    { key: 'students', title: 'Students', visible: true, order: 3 },
    { key: 'status', title: 'Status', visible: true, order: 4 },
    { key: 'actions', title: 'Actions', visible: true, order: 5 }
  ]);

  // Expose handleAdd function through ref
  useImperativeHandle(ref, () => ({
    handleAdd: () => {
      setEditingClass(null);
      form.resetFields();
      setIsModalVisible(true);
    }
  }));

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
      setActionLoading(true);
      const success = await deleteClass(classId);
      if (success) {
        messageApi.success('Class deleted successfully');
      }
    } catch (error) {
      messageApi.error('Failed to delete class');
      console.error('Error deleting class:', error);
    } finally {
      setActionLoading(false);
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

      let success;
      if (editingClass) {
        success = await updateClass(editingClass.id, classData);
      } else {
        success = await createClass(classData);
      }

      if (success) {
        setIsModalVisible(false);
      }
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
      title: 'Class',
      dataIndex: 'class_name',
      key: 'class_name',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => {
            setSelectedClass(record);
            setDrawerVisible(true);
          }}
          style={{ 
            padding: 0, 
            height: 'auto',
            fontSize: '15px',
            fontWeight: 500,
            color: '#595959',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#8c8c8c';
            e.currentTarget.style.transform = 'translateX(5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#595959';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      render: (section) => (
        <Tag 
          style={{ 
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: '#f5f5f5',
            color: '#595959',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          Section {section}
        </Tag>
      ),
    },
    {
      title: 'Teacher',
      dataIndex: 'teacher',
      key: 'teacher',
      render: (teacher) => {
        if (!teacher) return (
          <Tag 
            style={{ 
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              background: '#fff1f0',
              color: '#ff4d4f',
              border: '1px solid #ffccc7',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            Not Assigned
          </Tag>
        );
        return (
          <Tag 
            style={{ 
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              background: 'linear-gradient(45deg, #f5f5f5, #fafafa)',
              color: '#595959',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            {teacher.first_name} {teacher.last_name}
          </Tag>
        );
      },
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity) => (
        <Tag 
          style={{ 
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: '#f5f5f5',
            color: '#595959',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          {capacity} students
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          style={{ 
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: '#f5f5f5',
            color: status === 'active' ? '#73d13d' : '#ffa940',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'inline-flex',
            alignItems: 'center',
            height: '24px',
            lineHeight: '1'
          }}
        >
          {status === 'active' ? (
            <CheckCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#73d13d' }} />
          ) : (
            <CloseCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#ffa940' }} />
          )} 
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle" style={{ justifyContent: 'flex-end', width: '100%' }}>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined style={{ fontSize: '16px', color: '#8c8c8c' }} />}
              onClick={() => handleEdit(record)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                background: '#f5f5f5'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this class?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  background: '#fff1f0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ffccc7';
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff1f0';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleSearch = (value) => {
    setSearchText(value);
    loadClasses(1, 10, value);
  };

  useEffect(() => { setClassCount(classes.length); }, [classes]);

  return (
    <div className="classes-page" style={{ 
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '24px 24px 0 24px',
        background: '#fff',
      }}>
        <Input.Search
          placeholder="Search classes..."
          allowClear
          onSearch={handleSearch}
          style={{ width: 250, borderRadius: '6px', boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)', border: '1px solid rgba(159, 179, 223, 0.3)' }}
          prefix={<SearchOutlined style={{ color: '#49e7f5' }} />}
        />
        <Space size="small">
          <Tooltip title="Total Classes">
            <div className="class-count-badge" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f5f5f5', border: '1px solid #f0f0f0', borderRadius: '20px', cursor: 'default', transition: 'all 0.3s ease' }}>
              <BookOutlined style={{ fontSize: '16px', color: '#49e7f5' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#49e7f5' }}>{classCount}+</span>
            </div>
          </Tooltip>
          <Tooltip title="Export Classes">
            <Button
              type="text"
              icon={<ExportOutlined />}
              onClick={() => setExportModalVisible(true)}
              style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', border: '1px solid #f0f0f0', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </Tooltip>
          <Tooltip title="Column Settings">
            <img src="/checklist.png" alt="Settings" style={{ width: '24px', height: '24px', cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => setColumnSettingsVisible(true)} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.filter = 'brightness(0.9)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)'; }} />
          </Tooltip>
        </Space>
      </div>

      <div style={{ 
        flex: 1, 
        overflow: 'hidden',
        padding: '0 16px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 180px)'
      }}>
        <Table
          columns={getVisibleColumns().map(col => {
            const column = columns.find(c => c.key === col.key);
            return column || { title: col.title, dataIndex: col.key, key: col.key };
          })}
          dataSource={classes}
          rowKey="id"
          loading={classesLoading || actionLoading}
          pagination={{
            current: currentPage,
            total: totalClasses,
            pageSize: 10,
            onChange: (page) => loadClasses(page),
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} classes`
          }}
          onChange={(pagination, filters, sorter) => {
            // Handle table change
          }}
          rowSelection={rowSelection}
          className="classes-table"
          scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
        />
      </div>

      {selectedRowKeys.length > 0 && (
        <div className="bulk-actions-bar">
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <span className="selected-count">{selectedRowKeys.length} classes selected</span>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  onClick={() => setBulkStatusModalVisible(true)}
                  className="bulk-action-btn"
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
                    className="bulk-delete-btn"
                    icon={<DeleteFilled />}
                  >
                    Delete Selected
                  </Button>
                </Popconfirm>
              </Space>
            </Col>
          </Row>
        </div>
      )}

      <StyledModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingClass(null);
        }}
        width={800}
      >
        <div className="class-form-container">
          <div className="form-header">
            <Space>
              <BookOutlined style={{ fontSize: '20px', color: '#7B83EB' }} />
              <Typography.Title level={5} style={{ margin: 0 }}>
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </Typography.Title>
            </Space>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleModalOk}
            className="class-form"
          >
            <Row gutter={24}>
              <Col span={12}>
                <Card 
                  title={
                    <Space>
                      <BookOutlined style={{ color: '#7B83EB' }} />
                      <span>Basic Information</span>
                    </Space>
                  }
                  className="info-card"
                >
                  <Form.Item
                    name="className"
                    label="Class"
                    rules={[{ required: true, message: 'Please enter class name' }]}
                  >
                    <Input prefix={<BookOutlined style={{ color: '#bfbfbf' }} />} />
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
                    name="capacity"
                    label="Capacity"
                    rules={[{ required: true, message: 'Please enter capacity' }]}
                  >
                    <Input type="number" prefix={<TeamOutlined style={{ color: '#bfbfbf' }} />} />
                  </Form.Item>
                </Card>
              </Col>

              <Col span={12}>
                <Card 
                  title={
                    <Space>
                      <TeamOutlined style={{ color: '#7B83EB' }} />
                      <span>Class Details</span>
                    </Space>
                  }
                  className="info-card"
                >
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
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select>
                      <Option value="Active">Active</Option>
                      <Option value="Inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </Card>
              </Col>
            </Row>

            <div className="form-actions">
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
            </div>
          </Form>
        </div>
      </StyledModal>

      <StyledModal
        visible={bulkStatusModalVisible}
        onClose={() => setBulkStatusModalVisible(false)}
        width={400}
      >
        <div className="bulk-status-container">
          <div className="form-header">
            <Space>
              <SwapOutlined style={{ fontSize: '20px', color: '#7B83EB' }} />
              <Typography.Title level={5} style={{ margin: 0 }}>
                Change Status
              </Typography.Title>
            </Space>
          </div>

          <Form form={bulkStatusForm} layout="vertical" className="bulk-status-form">
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

            <div className="form-actions">
              <Space>
                <Button type="primary" onClick={handleBulkStatusChange} loading={teachersLoading}>
                  Update Status
                </Button>
                <Button onClick={() => setBulkStatusModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </div>
          </Form>
        </div>
      </StyledModal>

      <StyledModal
        visible={exportModalVisible}
        onClose={() => { setExportModalVisible(false); setExportType('excel'); setExportEmails([]); setExportMode('download'); }}
        title={<Space><ExportOutlined style={{ color: '#49e7f5' }} /><span>Export Classes</span></Space>}
        width={400}
        className="export-modal"
      >
        <div className="export-modal-content">
          <Form layout="vertical">
            <Form.Item label="Export Format" className="export-format-item">
              <div className="format-options">
                <div className={`format-option ${exportType === 'excel' ? 'active' : ''}`} onClick={() => setExportType('excel')}>
                  <FileExcelOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                  <span>Excel</span>
                </div>
                <div className={`format-option ${exportType === 'pdf' ? 'active' : ''}`} onClick={() => setExportType('pdf')}>
                  <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                  <span>PDF</span>
                </div>
              </div>
            </Form.Item>
            <Form.Item label="Export Mode" className="export-mode-item">
              <div className="mode-options">
                <div className={`mode-option ${exportMode === 'download' ? 'active' : ''}`} onClick={() => setExportMode('download')}>
                  <DownloadOutlined style={{ fontSize: '18px' }} />
                  <span>Download</span>
                </div>
                <div className={`mode-option ${exportMode === 'send' ? 'active' : ''}`} onClick={() => setExportMode('send')}>
                  <SendOutlined style={{ fontSize: '18px' }} />
                  <span>Send via Email</span>
                </div>
              </div>
            </Form.Item>
            {exportMode === 'send' && (
              <Form.Item label="Email Addresses" className="email-item">
                <Select mode="tags" style={{ width: '100%' }} placeholder="Enter email addresses" value={exportEmails} onChange={setExportEmails} tokenSeparators={[',']} className="email-select" maxTagCount={3} maxTagTextLength={20} dropdownStyle={{ maxHeight: '200px', overflow: 'auto' }} />
              </Form.Item>
            )}
            <Form.Item className="export-submit-item">
              <Button type="primary" onClick={() => { setExportLoading(true); setTimeout(() => { setExportLoading(false); setExportModalVisible(false); }, 1000); }} loading={exportLoading} block className="export-submit-button">
                {exportMode === 'download' ? 'Download' : 'Send'}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </StyledModal>

      <ClassDetailsDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        classData={selectedClass}
        teachers={teachers}
      />

      <ColumnSettingsDrawer
        visible={columnSettingsVisible}
        onClose={() => setColumnSettingsVisible(false)}
        columnSettings={columnSettings}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        onColumnReorder={handleColumnReorder}
        onCheckAll={handleCheckAll}
      />

      <style>
        {`
          .classes-page {
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 0;
            overflow: hidden;
            margin: 0;
            border-radius: 16px;
            background: #ffffff;
            box-shadow: 0 4px 20px rgba(159, 179, 223, 0.15);
            border: 1px solid rgba(159, 179, 223, 0.2);
          }

          .classes-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            border-bottom: 1px solid #f0f0f0;
            background: #ffffff;
          }

          .page-title {
            margin: 0 !important;
            color: #7B83EB !important;
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 20px;
            font-weight: 600;
            padding-top: 2px;
          }

          .page-title .ant-typography {
            color: #7B83EB !important;
            margin: 0 !important;
          }

          .title-icon {
            font-size: 20px;
            color: #7B83EB;
          }

          .classes-table {
            flex: 1;
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #f0f0f0;
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .classes-table .ant-table {
            flex: 1;
            display: flex;
            flex-direction: column;
            border-radius: 8px;
            overflow: hidden;
          }

          .classes-table .ant-table-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            border-radius: 8px;
            overflow: hidden;
          }

          .classes-table .ant-table-body {
            flex: 1;
            overflow-y: auto !important;
            overflow-x: auto !important;
            margin-right: 1px;
          }

          .classes-table .ant-spin-nested-loading {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .classes-table .ant-spin-container {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .classes-table .ant-table-placeholder {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .classes-table .ant-spin {
            max-height: none;
          }

          .classes-table .ant-spin-blur {
            opacity: 0.5;
            filter: blur(1px);
            pointer-events: none;
          }

          .classes-table .ant-spin-blur::after {
            opacity: 0.4;
            background: #fff;
          }

          .classes-table .ant-table-thead > tr > th {
            background: rgba(123, 131, 235, 0.1) !important;
            color: #7B83EB !important;
            font-weight: 600;
            border-bottom: 1px solid #f0f0f0;
            padding: 4px 12px !important;
            white-space: nowrap;
            height: 32px;
            line-height: 1.2;
            font-size: 13px;
          }

          .classes-table .ant-table-tbody > tr > td {
            padding: 4px 12px !important;
            white-space: nowrap;
            border-bottom: 1px solid #f0f0f0;
            height: 32px;
            line-height: 1.2;
            font-size: 13px;
          }

          .classes-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none;
          }

          .classes-table .ant-table-cell {
            padding: 4px 12px !important;
          }

          .classes-table .ant-table-cell .ant-tag {
            margin: 0;
            padding: 0 4px;
            font-size: 12px;
            height: 18px;
            line-height: 16px;
          }

          .classes-table .ant-table-cell .ant-btn {
            padding: 0 4px;
            height: 22px;
            font-size: 12px;
          }

          .classes-table .ant-table-cell .ant-avatar {
            width: 22px;
            height: 22px;
            line-height: 22px;
            font-size: 12px;
          }

          .classes-table .ant-table-pagination {
            margin: 16px 0 !important;
            padding: 8px 8px !important;
            height: 32px;
            border-top: 1px solid #f0f0f0;
            background: #ffffff;
            flex-shrink: 0;
          }

          .classes-table .ant-pagination-item {
            min-width: 24px;
            height: 24px;
            line-height: 22px;
            font-size: 12px;
            margin: 0 4px;
          }

          .classes-table .ant-pagination-prev .ant-pagination-item-link,
          .classes-table .ant-pagination-next .ant-pagination-item-link {
            min-width: 24px;
            height: 24px;
            line-height: 22px;
            font-size: 12px;
          }

          .classes-table .ant-pagination-options {
            margin-left: 8px;
          }

          .classes-table .ant-pagination-options-size-changer {
            margin-right: 0;
          }

          .classes-table .ant-select-selector {
            height: 24px !important;
            line-height: 22px !important;
            padding: 0 8px !important;
          }

          .classes-table .ant-select-selection-item {
            line-height: 22px !important;
            font-size: 12px;
          }

          .add-class-btn {
            background: #7B83EB;
            border: none;
            display: flex;
            align-items: center;
            gap: 4px;
            height: 36px;
            padding: 0 16px;
            border-radius: 6px;
            color: white !important;
            font-weight: 500;
          }

          .add-class-btn:hover {
            background: #7B83EB;
            opacity: 0.9;
            color: white !important;
          }
          
          .add-class-btn .anticon {
            color: white;
            font-size: 16px;
          }

          .bulk-actions-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 12px 24px;
            background: white;
            border-top: 1px solid #7B83EB;
            box-shadow: 0 -2px 8px rgba(123, 131, 235, 0.2);
            z-index: 1000;
          }

          .selected-count {
            color: #7B83EB;
            font-weight: 500;
          }

          .bulk-action-btn {
            background: #7B83EB;
            border-color: #7B83EB;
          }

          .bulk-action-btn:hover {
            background: #7B83EB;
            border-color: #7B83EB;
            opacity: 0.9;
          }

          .bulk-delete-btn {
            background: #fff1f0;
            border-color: #ffa39e;
            color: #ff4d4f;
          }

          .bulk-delete-btn:hover {
            background: #ffccc7;
            border-color: #ff7875;
            color: #ff4d4f;
          }

          .classes-table .ant-pagination-item-active {
            background: #7B83EB !important;
            border-color: #7B83EB !important;
          }

          .classes-table .ant-pagination-item-active a {
            color: white !important;
          }

          .classes-table .ant-pagination-item:hover {
            border-color: #7B83EB !important;
          }

          .classes-table .ant-pagination-prev:hover .ant-pagination-item-link,
          .classes-table .ant-pagination-next:hover .ant-pagination-item-link {
            border-color: #7B83EB !important;
            color: #7B83EB !important;
          }

          .classes-table .ant-checkbox-wrapper:hover .ant-checkbox-inner,
          .classes-table .ant-checkbox:hover .ant-checkbox-inner,
          .classes-table .ant-checkbox-input:focus + .ant-checkbox-inner {
            border-color: #7B83EB !important;
          }

          .classes-table .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #7B83EB !important;
            border-color: #7B83EB !important;
          }

          .classes-table .ant-checkbox-indeterminate .ant-checkbox-inner::after {
            background-color: #7B83EB !important;
          }

          .class-form-modal .modal-icon {
            font-size: 20px;
            color: #7B83EB;
          }

          .class-form-modal .modal-title {
            margin: 0;
            color: #7B83EB;
          }

          .class-form-modal .info-card {
            margin-bottom: 16px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }

          .class-form-modal .card-icon {
            color: #7B83EB;
          }

          .class-form-modal .ant-card-head {
            border-bottom: 1px solid #f0f0f0;
            padding: 12px 16px;
          }

          .class-form-modal .ant-card-head-title {
            padding: 0;
          }

          .class-form-modal .ant-form-item-label > label {
            color: #595959;
            font-weight: 500;
          }

          .class-form-modal .ant-input-affix-wrapper:hover,
          .class-form-modal .ant-input-affix-wrapper:focus,
          .class-form-modal .ant-input-affix-wrapper-focused {
            border-color: #7B83EB;
          }

          .class-form-modal .ant-select:hover .ant-select-selector,
          .class-form-modal .ant-select-focused .ant-select-selector {
            border-color: #7B83EB !important;
          }

          .class-form-modal .ant-btn-primary {
            background: #7B83EB;
            border-color: #7B83EB;
          }

          .class-form-modal .ant-btn-primary:hover {
            background: #8ba1d1;
            border-color: #8ba1d1;
          }

          .export-modal .export-format-item {
            margin-bottom: 16px;
          }

          .export-modal .format-options {
            display: flex;
            gap: 8px;
          }

          .export-modal .format-option {
            padding: 8px;
            border: 1px solid #f0f0f0;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .export-modal .format-option.active {
            background: #f0f0f0;
          }

          .export-modal .export-mode-item {
            margin-bottom: 16px;
          }

          .export-modal .mode-options {
            display: flex;
            gap: 8px;
          }

          .export-modal .mode-option {
            padding: 8px;
            border: 1px solid #f0f0f0;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .export-modal .mode-option.active {
            background: #f0f0f0;
          }

          .export-modal .email-item {
            margin-bottom: 16px;
          }

          .export-modal .email-select {
            width: 100%;
          }

          .export-modal .export-submit-item {
            margin-top: 16px;
          }

          .export-modal .export-submit-button {
            width: 100%;
          }
        `}
      </style>
    </div>
  );
});

export default Classes; 
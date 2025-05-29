import React, { useState, useEffect } from 'react';
import { Table, Button, Space, DatePicker, Card, message, Row, Col, Statistic, Typography, Select, Modal, Form, Input } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, TeamOutlined, CalendarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../services/api';
import moment from 'moment';

const { Option } = Select;
const { Title } = Typography;
const { TextArea } = Input;

const TeacherAttendanceView = () => {
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [loading, setLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadAttendance();
    }
  }, [selectedDate, selectedTeacher]);

  const loadTeachers = async () => {
    setTeachersLoading(true);
    try {
      const response = await api.teacher.getTeachers();
      if (response && response.data && response.data.results) {
        setTeachers(response.data.results || []);
      } else {
        console.error('Unexpected API response structure:', response);
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
      message.error('Failed to load teachers');
      setTeachers([]);
    } finally {
      setTeachersLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      let url = `?date=${dateStr}`;
      if (selectedTeacher) {
        url += `&teacher=${selectedTeacher}`;
      }
      const response = await api.attendance.getTeacherAttendance(url);
      setAttendance(response.data || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
      message.error('Failed to load attendance');
    }
  };

  const handleUpdate = (record) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      status: record.status,
      details: record.details
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.attendance.deleteTeacherAttendance(id);
      message.success('Attendance record deleted successfully');
      loadAttendance();
    } catch (error) {
      console.error('Error deleting attendance:', error);
      message.error('Failed to delete attendance record');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      await api.attendance.updateTeacherAttendance(selectedRecord.id, {
        ...selectedRecord,
        ...values
      });
      message.success('Attendance updated successfully');
      setIsModalVisible(false);
      loadAttendance();
    } catch (error) {
      console.error('Error updating attendance:', error);
      message.error('Failed to update attendance');
    }
  };

  const columns = [
    {
      title: 'Teacher',
      dataIndex: 'teacher',
      key: 'teacher',
      render: (teacherId) => {
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher ? teacher.name : `Teacher ${teacherId}`;
      }
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('YYYY-MM-DD')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ 
          color: status === 'present' ? '#52c41a' : 
                 status === 'absent' ? '#ff4d4f' : '#faad14',
          textTransform: 'capitalize'
        }}>
          {status}
        </span>
      )
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
            size="small"
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  const presentCount = attendance.filter(record => record.status === 'present').length;
  const totalCount = attendance.length;
  const absentCount = totalCount - presentCount;

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
            color: '#7B83EB',
            margin: 0,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <img src="/business.png" alt="Attendance" style={{ width: '40px', height: '40px' }} />
            Teacher Attendance Records
          </Title>
        </Col>
        <Col>
          <Space size="small">
            <Select
              style={{ width: 200 }}
              placeholder="Select Teacher"
              onChange={setSelectedTeacher}
              value={selectedTeacher}
              allowClear
            >
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </Option>
              ))}
            </Select>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              format="YYYY-MM-DD"
              style={{ 
                width: 200,
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
            />
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
        <Card 
          style={{ 
            margin: '0 16px 16px 16px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
            border: '1px solid rgba(159, 179, 223, 0.3)'
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8}>
              <Statistic
                title="Present"
                value={presentCount}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={12} sm={8}>
              <Statistic
                title="Absent"
                value={absentCount}
                prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Total"
                value={totalCount}
                prefix={<TeamOutlined style={{ color: '#7B83EB' }} />}
                valueStyle={{ color: '#7B83EB' }}
              />
            </Col>
          </Row>
        </Card>

        <Card 
          style={{ 
            margin: '0 16px 16px 16px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
            border: '1px solid rgba(159, 179, 223, 0.3)'
          }}
        >
          <Table
            columns={columns}
            dataSource={attendance}
            rowKey="id"
            pagination={false}
            scroll={{ x: true }}
            className="custom-table"
            loading={loading}
          />
        </Card>
      </Card>

      <Modal
        title="Update Attendance"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Update"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="present">Present</Option>
              <Option value="absent">Absent</Option>
              <Option value="leave">Leave</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="details"
            label="Details"
            rules={[{ required: true, message: 'Please enter details' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <style>
        {`
          .custom-table .ant-table {
            border-radius: 12px;
            overflow: hidden;
          }
          
          .custom-table .ant-table-container {
            overflow: hidden !important;
            border-radius: 12px;
          }
          
          .custom-table .ant-table-body {
            overflow-y: auto !important;
            overflow-x: hidden !important;
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

          .custom-table .ant-table-thead > tr > th {
            background: rgba(159, 179, 223, 0.1) !important;
            color: #7B83EB !important;
            font-weight: 600;
            border-bottom: 2px solid rgba(159, 179, 223, 0.2);
            padding: 12px 16px !important;
          }
          
          .custom-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid rgba(159, 179, 223, 0.1);
            padding: 12px 16px !important;
          }
          
          .custom-table .ant-table-tbody > tr:hover > td {
            background: rgba(159, 179, 223, 0.05) !important;
          }

          .custom-table .ant-btn {
            border-radius: 6px;
            transition: all 0.3s ease;
          }

          .custom-table .ant-btn-primary {
            background: #7B83EB !important;
            border-color: #7B83EB !important;
            box-shadow: 0 2px 6px rgba(159, 179, 223, 0.15) !important;
          }

          .custom-table .ant-btn-primary:hover {
            background: #8ba1d1 !important;
            border-color: #8ba1d1 !important;
            box-shadow: 0 4px 12px rgba(159, 179, 223, 0.25) !important;
          }

          .custom-table .ant-btn-default {
            border-color: rgba(159, 179, 223, 0.3) !important;
            color: #7B83EB !important;
          }

          .custom-table .ant-btn-default:hover {
            border-color: #7B83EB !important;
            color: #8ba1d1 !important;
            background: rgba(159, 179, 223, 0.05) !important;
          }

          .ant-picker {
            border-color: rgba(159, 179, 223, 0.3) !important;
            box-shadow: 0 2px 6px rgba(159, 179, 223, 0.15) !important;
            border-radius: 6px !important;
          }

          .ant-picker:hover {
            border-color: #7B83EB !important;
          }

          .ant-picker-focused {
            border-color: #7B83EB !important;
            box-shadow: 0 0 0 2px rgba(159, 179, 223, 0.2) !important;
          }
        `}
      </style>
    </div>
  );
};

export default TeacherAttendanceView; 
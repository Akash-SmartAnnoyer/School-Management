import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Select,
  Button,
  Table,
  message,
  Modal,
  Space,
  Typography,
  Row,
  Col,
  TimePicker,
  Input,
  Spin,
  Empty,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  SearchOutlined
} from '@ant-design/icons';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

// Add CSS styles
const styles = {
  theoryRow: {
    backgroundColor: '#e6f7ff',
    '&:hover': {
      backgroundColor: '#bae7ff',
    },
  },
  practicalRow: {
    backgroundColor: '#f6ffed',
    '&:hover': {
      backgroundColor: '#d9f7be',
    },
  },
};

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;

const Timetable = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [activeTab, setActiveTab] = useState('1');
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const { currentUser } = useAuth();

  const days = [
    { value: 'mon', label: 'Monday' },
    { value: 'tue', label: 'Tuesday' },
    { value: 'wed', label: 'Wednesday' },
    { value: 'thu', label: 'Thursday' },
    { value: 'fri', label: 'Friday' },
    { value: 'sat', label: 'Saturday' }
  ];

  const classTypes = [
    { value: 'theory', label: 'Theory' },
    { value: 'practical', label: 'Practical' }
  ];

  // Remove static timeSlots state and add function to get unique time slots
  const getUniqueTimeSlots = () => {
    if (!timetables.length) return [];
    
    // Get all unique start times and sort them
    const timeSlots = [...new Set(timetables.map(t => t.start_time))].sort();
    return timeSlots;
  };

  // Load classes only when the component mounts
  useEffect(() => {
    loadClasses();
  }, []);

  // Load subjects and teachers when component mounts
  useEffect(() => {
    loadSubjects();
    loadTeachers();
  }, []);

  // Load timetables only when a class is selected
  useEffect(() => {
    if (selectedClass) {
      loadTimetables();
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const response = await api.class.getClasses();
      setClasses(response.data);
    } catch (error) {
      message.error('Failed to load classes');
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await api.subject.getSubjects();
      setSubjects(response.data);
    } catch (error) {
      message.error('Failed to load subjects');
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await api.teacher.getTeachers();
      setTeachers(response.data);
    } catch (error) {
      message.error('Failed to load teachers');
    }
  };

  const loadTimetables = async () => {
    try {
      setLoadingTimetable(true);
      const response = await api.timetable.getByClass(selectedClass);
      // Filter timetables to only show entries for the selected class
      const filteredTimetables = response.data.filter(timetable => 
        timetable.classroom === selectedClass
      );
      setTimetables(filteredTimetables);
    } catch (error) {
      message.error('Failed to load timetables');
    } finally {
      setLoadingTimetable(false);
    }
  };

  // Add function to get subject name
  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : `Subject (${subjectId})`;
  };

  // Add function to get teacher name
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : `Teacher (${teacherId})`;
  };

  // Add function to get teachers for a subject
  const getTeachersForSubject = async (subjectId) => {
    try {
      setLoadingTeachers(true);
      // Get all teachers
      const response = await api.teacher.getTeachers();
      const allTeachers = response.data;
      
      // Get the subject name for the given subjectId
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) {
        console.error('Subject not found:', subjectId);
        return [];
      }

      // Filter teachers who teach this subject
      const subjectTeachers = allTeachers.filter(teacher => 
        teacher.subject === subject.name
      );
      
      return subjectTeachers;
    } catch (error) {
      console.error('Error fetching teachers for subject:', error);
      message.error('Failed to fetch teachers for this subject');
      return [];
    } finally {
      setLoadingTeachers(false);
    }
  };

  // Update handleSubjectChange to be async
  const handleSubjectChange = async (subjectId) => {
    setLoadingTeachers(true);
    try {
      const subjectTeachers = await getTeachersForSubject(subjectId);
      if (subjectTeachers.length === 1) {
        // If there's only one teacher for this subject, auto-select them
        form.setFieldsValue({ teacher: subjectTeachers[0].id });
      } else if (subjectTeachers.length > 0) {
        // If there are multiple teachers, show a message
        message.info('Please select a teacher for this subject');
      } else {
        // If no teachers are found for this subject
        message.warning('No teachers found for this subject');
        form.setFieldsValue({ teacher: undefined });
      }
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleAddTimeSlot = () => {
    loadSubjects();
    loadTeachers();
    setEditingTimetable(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = async (timetable) => {
    await Promise.all([loadSubjects(), loadTeachers()]);
    setEditingTimetable(timetable);
    
    // Convert time strings to moment objects for TimePicker
    const formData = {
      ...timetable,
      start_time: moment(timetable.start_time, 'HH:mm:ss'),
      end_time: moment(timetable.end_time, 'HH:mm:ss'),
      duration: timetable.duration // Keep the original duration
    };
    
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Get the raw time values from the TimePicker
      const startTime = values.start_time;
      const endTime = values.end_time;
      
      // Debug logs to check the values
      console.log('Raw start time:', startTime);
      console.log('Raw end time:', endTime);
      
      // Calculate duration in seconds
      const durationInSeconds = endTime.diff(startTime, 'seconds');
      console.log('Duration in seconds:', durationInSeconds);
      
      // Convert seconds to HH:mm:ss format
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      const seconds = durationInSeconds % 60;
      const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      console.log('Formatted duration:', duration);

      const timetableData = {
        classroom: selectedClass,
        day: values.day,
        start_time: startTime.format('HH:mm:ss'),
        end_time: endTime.format('HH:mm:ss'),
        duration: duration,
        subject: values.subject,
        teacher: values.teacher,
        class_type: values.class_type
      };

      console.log('Submitting timetable data:', timetableData);

      if (editingTimetable) {
        await api.timetable.update(editingTimetable.id, timetableData);
        message.success('Timetable updated successfully');
      } else {
        await api.timetable.create(timetableData);
        message.success('Timetable created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingTimetable(null);
      loadTimetables();
    } catch (error) {
      console.error('Error submitting timetable:', error);
      if (error.response?.data?.non_field_errors) {
        message.error(error.response.data.non_field_errors[0]);
      } else if (error.response?.data?.duration) {
        message.error(error.response.data.duration[0]);
      } else {
        message.error('Failed to save timetable');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (timetableId) => {
    try {
      await api.timetable.delete(timetableId);
      message.success('Timetable deleted successfully');
      loadTimetables();
    } catch (error) {
      message.error('Failed to delete timetable');
    }
  };

  // Add function to get class details for a specific time slot and day
  const getClassDetails = (day, timeSlot) => {
    return timetables.find(t => 
      t.day === day && 
      t.start_time === timeSlot
    );
  };

  // Add function to format time for display (remove seconds)
  const formatTime = (timeString) => {
    return timeString.split(':').slice(0, 2).join(':');
  };

  // Add function to render a timetable cell
  const renderTimetableCell = (day, timeSlot) => {
    const classDetails = getClassDetails(day, timeSlot);
    if (!classDetails) return (
      <div style={{ 
        padding: '8px',
        backgroundColor: '#fafafa',
        borderRadius: '4px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#999'
      }}>
        No Class
      </div>
    );

    return (
      <div style={{ 
        padding: '8px',
        backgroundColor: classDetails.class_type === 'theory' ? '#e6f7ff' : '#f6ffed',
        borderRadius: '4px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        border: '1px solid #1890ff',
        boxShadow: '0 2px 4px rgba(24, 144, 255, 0.1)'
      }}>
        <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{getSubjectName(classDetails.subject)}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{getTeacherName(classDetails.teacher)}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {formatTime(classDetails.start_time)} - {formatTime(classDetails.end_time)}
        </div>
      </div>
    );
  };

  const columns = [
    {
      title: 'Day',
      dataIndex: 'day',
      key: 'day',
      render: (day) => days.find(d => d.value === day)?.label || day
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
    },
    {
      title: 'End Time',
      dataIndex: 'end_time',
      key: 'end_time',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
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
      title: 'Type',
      dataIndex: 'class_type',
      key: 'class_type',
      render: (type) => type.charAt(0).toUpperCase() + type.slice(1)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            style={{ color: '#1890ff' }}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            style={{ color: '#ff4d4f' }}
          />
        </Space>
      ),
    },
  ];

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
            <CalendarOutlined style={{ fontSize: '24px', color: '#9fb3df' }} />
            Timetable Management
          </Title>
        </Col>
        <Col>
          <Space size="small">
            <Search
              placeholder="Search timetable..."
              allowClear
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
              onClick={handleAddTimeSlot}
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
              Add Time Slot
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
        <Tabs defaultActiveKey="1" onChange={setActiveTab}>
          <TabPane tab="Set Timetable" key="1">
            <Row gutter={[16, 16]} style={{ padding: '16px' }}>
              <Col span={24}>
                <Select
                  style={{ 
                    width: '100%',
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                    border: '1px solid rgba(159, 179, 223, 0.3)'
                  }}
                  placeholder="Select Class"
                  onChange={setSelectedClass}
                  value={selectedClass}
                >
                  {classes.map(cls => (
                    <Option key={cls.id} value={cls.id}>
                      {cls.class_name} - Section {cls.section}
                    </Option>
                  ))}
                </Select>
              </Col>
              {selectedClass && (
                  <Col span={24}>
                    <Table
                      columns={columns}
                      dataSource={timetables}
                      rowKey="id"
                      loading={loadingTimetable}
                      locale={{
                        emptyText: loadingTimetable ? 'Loading...' : 'No timetable set for this class'
                      }}
                    rowClassName={(record) => record.class_type === 'theory' ? 'theory-row' : 'practical-row'}
                    onRow={(record) => ({
                      onClick: () => handleEdit(record),
                      style: { cursor: 'pointer' }
                    })}
                    className="custom-table"
                    scroll={{ y: 'calc(100vh - 250px)' }}
                    />
                  </Col>
              )}
            </Row>
          </TabPane>

          <TabPane tab="View Timetable" key="2">
            <Row gutter={[16, 16]} style={{ padding: '16px' }}>
              <Col span={24}>
                <Select
                  style={{ 
                    width: '100%',
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                    border: '1px solid rgba(159, 179, 223, 0.3)'
                  }}
                  placeholder="Select Class"
                  onChange={setSelectedClass}
                  value={selectedClass}
                >
                  {classes.map(cls => (
                    <Option key={cls.id} value={cls.id}>
                      {cls.class_name} - Section {cls.section}
                    </Option>
                  ))}
                </Select>
              </Col>
              {selectedClass && (
                <Col span={24}>
                  {loadingTimetable ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Spin size="large" />
                      <div style={{ marginTop: '10px' }}>Loading timetable...</div>
                    </div>
                  ) : timetables.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px',
                      backgroundColor: '#fafafa',
                      borderRadius: '4px',
                      border: '1px dashed #d9d9d9'
                    }}>
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No timetable set for this class"
                      />
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ 
                              padding: '12px',
                              backgroundColor: 'rgba(159, 179, 223, 0.1)',
                              border: '1px solid rgba(159, 179, 223, 0.2)',
                              minWidth: '120px',
                              color: '#9fb3df',
                              fontWeight: 600
                            }}>Day</th>
                            {getUniqueTimeSlots().map(timeSlot => (
                              <th key={timeSlot} style={{ 
                                padding: '12px',
                                backgroundColor: 'rgba(159, 179, 223, 0.1)',
                                border: '1px solid rgba(159, 179, 223, 0.2)',
                                minWidth: '180px',
                                color: '#9fb3df',
                                fontWeight: 600
                              }}>
                                {formatTime(timeSlot)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {days.map(day => (
                            <tr key={day.value}>
                              <td style={{ 
                                padding: '12px',
                                border: '1px solid rgba(159, 179, 223, 0.2)',
                                backgroundColor: 'rgba(159, 179, 223, 0.05)',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: '#9fb3df'
                              }}>
                                {day.label}
                              </td>
                              {getUniqueTimeSlots().map(timeSlot => (
                                <td key={`${day.value}-${timeSlot}`} style={{ 
                                  padding: '8px',
                                  border: '1px solid rgba(159, 179, 223, 0.2)',
                                  height: '100px'
                                }}>
                                  {renderTimetableCell(day.value, timeSlot)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Col>
              )}
            </Row>
          </TabPane>
        </Tabs>
      </Card>

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

          .theory-row {
            background-color: rgba(159, 179, 223, 0.05) !important;
          }

          .theory-row:hover {
            background-color: rgba(159, 179, 223, 0.1) !important;
          }

          .practical-row {
            background-color: rgba(159, 179, 223, 0.02) !important;
          }

          .practical-row:hover {
            background-color: rgba(159, 179, 223, 0.07) !important;
          }
        `}
      </style>
    </div>
  );
};

export default Timetable; 
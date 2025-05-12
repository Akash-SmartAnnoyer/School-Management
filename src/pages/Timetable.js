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
import './Timetable.css';

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
    <div className="timetable-container">
      <div className="timetable-header">
        <Title level={4}>Timetable Management</Title>
        <Space>
          <Select
            placeholder="Select Class"
            value={selectedClass}
            onChange={setSelectedClass}
            style={{ width: 200 }}
          >
            {classes.map(cls => (
              <Option key={cls.id} value={cls.id}>{cls.name}</Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTimetable(null);
              setModalVisible(true);
            }}
            disabled={!selectedClass}
          >
            Add Time Slot
          </Button>
        </Space>
      </div>

      <Card className="timetable-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="View Timetable" key="1">
            {loadingTimetable ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
              </div>
            ) : !selectedClass ? (
              <Empty description="Please select a class to view timetable" />
            ) : (
              <Table
                className="timetable-table"
                dataSource={getUniqueTimeSlots().map(time => ({
                  key: time,
                  time: formatTime(time),
                  ...days.reduce((acc, day) => ({
                    ...acc,
                    [day.value]: getClassDetails(day.value, time)
                  }), {})
                }))}
                columns={[
                  {
                    title: 'Time',
                    dataIndex: 'time',
                    key: 'time',
                    width: 100,
                    fixed: 'left'
                  },
                  ...days.map(day => ({
                    title: day.label,
                    dataIndex: day.value,
                    key: day.value,
                    render: (text, record) => renderTimetableCell(day.value, record.time)
                  }))
                ]}
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        className="timetable-modal"
        title={
          <Space>
            <CalendarOutlined />
            <span>{editingTimetable ? 'Edit Time Slot' : 'Add Time Slot'}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          className="timetable-form"
          onFinish={handleSubmit}
          initialValues={editingTimetable}
        >
          <Form.Item
            name="day"
            label="Day"
            rules={[{ required: true, message: 'Please select a day' }]}
          >
            <Select placeholder="Select Day">
              {days.map(day => (
                <Option key={day.value} value={day.value}>{day.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="start_time"
            label="Start Time"
            rules={[{ required: true, message: 'Please select start time' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="end_time"
            label="End Time"
            rules={[{ required: true, message: 'Please select end time' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please select a subject' }]}
          >
            <Select
              placeholder="Select Subject"
              onChange={handleSubjectChange}
              loading={loadingTeachers}
            >
              {subjects.map(subject => (
                <Option key={subject.id} value={subject.id}>{subject.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="teacher"
            label="Teacher"
            rules={[{ required: true, message: 'Please select a teacher' }]}
          >
            <Select placeholder="Select Teacher" loading={loadingTeachers}>
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id}>{teacher.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Class Type"
            rules={[{ required: true, message: 'Please select class type' }]}
          >
            <Select placeholder="Select Class Type">
              {classTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingTimetable ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Timetable; 
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
  Input
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

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
      const response = await api.timetable.getByClass(selectedClass);
      setTimetables(response.data);
    } catch (error) {
      message.error('Failed to load timetables');
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
    }
  };

  // Update handleSubjectChange to be async
  const handleSubjectChange = async (subjectId) => {
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
    if (!classDetails) return null;

    return (
      <div style={{ 
        padding: '8px',
        backgroundColor: classDetails.class_type === 'theory' ? '#e6f7ff' : '#f6ffed',
        borderRadius: '4px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ fontWeight: 'bold' }}>{getSubjectName(classDetails.subject)}</div>
        <div style={{ fontSize: '12px' }}>{getTeacherName(classDetails.teacher)}</div>
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
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Timetable Management</Title>
      <Card>
        <Tabs defaultActiveKey="1" onChange={setActiveTab}>
          <TabPane tab="Set Timetable" key="1">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Select
                  style={{ width: '100%' }}
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
                <>
                  <Col span={24}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddTimeSlot}
                    >
                      Add Time Slot
                    </Button>
                  </Col>
                  <Col span={24}>
                    <Table
                      columns={columns}
                      dataSource={timetables}
                      rowKey="id"
                    />
                  </Col>
                </>
              )}
            </Row>
          </TabPane>

          <TabPane tab="View Timetable" key="2">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Select
                  style={{ width: '100%' }}
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
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ 
                            padding: '12px',
                            backgroundColor: '#fafafa',
                            border: '1px solid #f0f0f0',
                            minWidth: '120px'
                          }}>Day</th>
                          {getUniqueTimeSlots().map(timeSlot => (
                            <th key={timeSlot} style={{ 
                              padding: '12px',
                              backgroundColor: '#fafafa',
                              border: '1px solid #f0f0f0',
                              minWidth: '180px'
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
                              border: '1px solid #f0f0f0',
                              backgroundColor: '#fafafa',
                              textAlign: 'center',
                              fontWeight: 'bold'
                            }}>
                              {day.label}
                            </td>
                            {getUniqueTimeSlots().map(timeSlot => (
                              <td key={`${day.value}-${timeSlot}`} style={{ 
                                padding: '8px',
                                border: '1px solid #f0f0f0',
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
                </Col>
              )}
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingTimetable ? 'Edit Time Slot' : 'Add Time Slot'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingTimetable(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={(changedValues, allValues) => {
            // If start_time or end_time changes, calculate duration
            if (changedValues.start_time || changedValues.end_time) {
              const startTime = allValues.start_time;
              const endTime = allValues.end_time;
              
              if (startTime && endTime) {
                const durationInSeconds = endTime.diff(startTime, 'seconds');
                const hours = Math.floor(durationInSeconds / 3600);
                const minutes = Math.floor((durationInSeconds % 3600) / 60);
                const seconds = durationInSeconds % 60;
                const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                // Update the form's duration field
                form.setFieldsValue({ duration });
              }
            }

            // If subject changes, update teacher options
            if (changedValues.subject) {
              handleSubjectChange(changedValues.subject);
            }
          }}
        >
          <Form.Item
            name="day"
            label="Day"
            rules={[{ required: true, message: 'Please select day' }]}
          >
            <Select>
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
            <TimePicker format="HH:mm:ss" />
          </Form.Item>

          <Form.Item
            name="end_time"
            label="End Time"
            rules={[{ required: true, message: 'Please select end time' }]}
          >
            <TimePicker format="HH:mm:ss" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration"
            rules={[{ required: true, message: 'Duration is required' }]}
          >
            <Input disabled placeholder="HH:mm:ss" />
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please select subject' }]}
          >
            <Select>
              {subjects.map(subject => (
                <Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="teacher"
            label="Teacher"
            rules={[{ required: true, message: 'Please select teacher' }]}
          >
            <Select>
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="class_type"
            label="Class Type"
            rules={[{ required: true, message: 'Please select class type' }]}
          >
            <Select>
              {classTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingTimetable ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingTimetable(null);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Timetable; 
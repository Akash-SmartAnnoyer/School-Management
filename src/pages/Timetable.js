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
  Popconfirm,
  Checkbox
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  SearchOutlined,
  UploadOutlined,
  BookOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useClasses } from '../contexts/ClassesContext';
import moment from 'moment';
import './Timetable.css';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;

const Timetable = () => {
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { classes, loading: classesLoading } = useClasses();
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [activeTab, setActiveTab] = useState('1');
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const { currentUser } = useAuth();
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkEditModalVisible, setBulkEditModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loadingEdit, setLoadingEdit] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);

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

  // Add function to get unique time slots
  const getUniqueTimeSlots = () => {
    if (!timetables.length) return [];
    
    // Get all unique start times and sort them
    const timeSlots = [...new Set(timetables.map(t => t.start_time))].sort();
    return timeSlots;
  };

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

  const loadSubjects = async () => {
    try {
      const response = await api.subject.getSubjects();
      setSubjects(response.data.results);
    } catch (error) {
      message.error('Failed to load subjects');
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await api.teacher.getTeachers();
      setTeachers(response.data.results);
    } catch (error) {
      message.error('Failed to load teachers');
    }
  };

  const loadTimetables = async () => {
    try {
      setLoadingTimetable(true);
      const response = await api.timetable.getByClass(selectedClass);
      // Filter timetables to only show entries for the selected class
      const filteredTimetables = response.data.results.filter(timetable => 
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
    try {
      setTableLoading(true);
      await Promise.all([loadSubjects(), loadTeachers()]);
      setEditingTimetable(timetable);
      
      // Convert time strings to moment objects for TimePicker
      const formData = {
        ...timetable,
        start_time: moment(timetable.start_time, 'HH:mm:ss'),
        end_time: moment(timetable.end_time, 'HH:mm:ss'),
      };
      
      form.setFieldsValue(formData);
      setModalVisible(true);
    } catch (error) {
      message.error('Failed to load timetable data');
    } finally {
      setTableLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Get the raw time values from the TimePicker
      const startTime = values.start_time;
      const endTime = values.end_time;
      
      // Calculate duration in seconds
      const durationInSeconds = endTime.diff(startTime, 'seconds');
      
      const timetableData = {
        classroom: selectedClass,
        day: values.day,
        start_time: startTime.format('HH:mm:ss'),
        end_time: endTime.format('HH:mm:ss'),
        duration: durationInSeconds, // Send duration in seconds
        subject: values.subject,
        teacher: values.teacher,
        class_type: values.class_type
      };

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

  // Add function to handle bulk creation
  const handleBulkCreate = async (entries) => {
    try {
      setLoading(true);
      const response = await api.timetable.bulkCreate(selectedClass, entries);
      
      if (response.data.success_count > 0) {
        message.success(`Successfully created ${response.data.success_count} entries`);
      }
      
      if (response.data.fail_count > 0) {
        message.warning(`${response.data.fail_count} entries failed to create`);
        // Show detailed errors if any
        response.data.errors.forEach(error => {
          message.error(`Entry ${error.index + 1}: ${Object.values(error.errors).flat().join(', ')}`);
        });
      }
      
      loadTimetables();
    } catch (error) {
      message.error('Failed to create bulk entries');
    } finally {
      setLoading(false);
    }
  };

  // Add function to handle bulk edit
  const handleBulkEdit = async (entries) => {
    try {
      setLoading(true);
      const response = await api.timetable.bulkUpdate(selectedClass, entries.map(entry => ({
        id: entry.id,
        day: entry.day,
        start_time: entry.start_time.format('HH:mm:ss'),
        end_time: entry.end_time.format('HH:mm:ss'),
        duration: entry.end_time.diff(entry.start_time, 'seconds'),
        subject: entry.subject,
        teacher: entry.teacher,
        class_type: entry.class_type
      })));
      
      if (response.data.updated_count > 0) {
        message.success(`Successfully updated ${response.data.updated_count} entries`);
      }
      
      if (response.data.errors?.length > 0) {
        message.warning(`${response.data.errors.length} entries failed to update`);
        response.data.errors.forEach(error => {
          message.error(`Entry ${error.id}: ${Object.values(error.errors).flat().join(', ')}`);
        });
      }
      
      loadTimetables();
    } catch (error) {
      message.error('Failed to update entries');
    } finally {
      setLoading(false);
    }
  };

  // Add function to format duration for display
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleDelete = async (timetableId) => {
    try {
      setTableLoading(true);
      await api.timetable.delete(timetableId);
      message.success('Timetable deleted successfully');
      await loadTimetables();
    } catch (error) {
      message.error('Failed to delete timetable');
    } finally {
      setTableLoading(false);
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

  // Add function to handle cell selection
  const handleCellSelect = (classDetails) => {
    if (!classDetails) return;
    
    const isSelected = selectedRows.some(row => row.id === classDetails.id);
    if (isSelected) {
      setSelectedRows(selectedRows.filter(row => row.id !== classDetails.id));
    } else {
      setSelectedRows([...selectedRows, classDetails]);
    }
  };

  // Update renderTimetableCell to include selection
  const renderTimetableCell = (day, timeSlot) => {
    const classDetails = getClassDetails(day, timeSlot);
    if (!classDetails) return (
      <div style={{ 
        padding: '4px',
        backgroundColor: '#fafafa',
        borderRadius: '4px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#999',
        fontSize: '12px'
      }}>
        No Class
      </div>
    );

    const isSelected = selectedRows.some(row => row.id === classDetails.id);

    return (
      <div 
        className={`timetable-cell ${isSelected ? 'selected-cell' : ''}`}
        style={{ 
          padding: '4px',
          backgroundColor: isSelected 
            ? 'rgba(123, 131, 235, 0.1)'
            : '#ffffff',
          borderRadius: '4px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          border: isSelected ? `1px solid #7B83EB` : 'none',
          boxShadow: isSelected ? '0 2px 8px rgba(123, 131, 235, 0.15)' : 'none',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => handleCellSelect(classDetails)}
      >
        <div style={{ 
          fontWeight: 'bold', 
          color: isSelected ? '#7B83EB' : '#1890ff', 
          fontSize: '12px' 
        }}>
          {getSubjectName(classDetails.subject)}
        </div>
        <div style={{ fontSize: '11px', color: '#666' }}>{getTeacherName(classDetails.teacher)}</div>
        <div style={{ fontSize: '11px', color: '#666' }}>
          {formatTime(classDetails.start_time)} - {formatTime(classDetails.end_time)}
        </div>
        <div style={{ 
          position: 'absolute', 
          bottom: '4px', 
          right: '4px',
          color: isSelected ? '#7B83EB' : '#1890ff',
          fontSize: '14px'
        }}>
          {classDetails.class_type === 'theory' ? <BookOutlined /> : <ExperimentOutlined />}
        </div>
        <div className="timetable-cell-actions">
          <Space size="small">
            <Button 
              type="text" 
              size="small"
              icon={<EditOutlined style={{ fontSize: '12px' }} />} 
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(classDetails);
              }}
              style={{ padding: '0 4px' }}
            />
            <Popconfirm
              title="Delete Timetable Entry"
              description="Are you sure you want to delete this timetable entry?"
              onConfirm={(e) => {
                e.stopPropagation();
                handleDelete(classDetails.id);
              }}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button 
                type="text" 
                size="small"
                danger 
                icon={<DeleteOutlined style={{ fontSize: '12px' }} />} 
                style={{ padding: '0 4px' }}
              />
            </Popconfirm>
          </Space>
        </div>
      </div>
    );
  };

  // Replace the Table component with a custom timetable view
  const renderTimetableView = () => {
    const timeSlots = getUniqueTimeSlots();
    
    return (
      <div style={{ overflowX: 'auto' }}>
        <Spin spinning={tableLoading}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ 
                  padding: '8px', 
                  backgroundColor: '#fafafa', 
                  border: '1px solid #f0f0f0',
                  width: '80px'
                }}>Time</th>
                {days.map(day => (
                  <th key={day.value} style={{ 
                    padding: '8px', 
                    backgroundColor: '#fafafa', 
                    border: '1px solid #f0f0f0',
                    fontSize: '12px'
                  }}>
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(timeSlot => (
                <tr key={timeSlot}>
                  <td style={{ 
                    padding: '4px', 
                    border: '1px solid #f0f0f0', 
                    textAlign: 'center', 
                    backgroundColor: '#fafafa',
                    fontSize: '12px'
                  }}>
                    {formatTime(timeSlot)}
                  </td>
                  {days.map(day => (
                    <td key={`${day.value}-${timeSlot}`} style={{ 
                      padding: '4px', 
                      border: '1px solid #f0f0f0', 
                      height: '60px'
                    }}>
                      {renderTimetableCell(day.value, timeSlot)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Spin>
      </div>
    );
  };

  return (
    <div className="timetable-container">
      <div className="timetable-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/study-time.png" alt="Timetable" />
          <Title level={4} className="page-title">Timetable Management</Title>
        </div>
        <Space size="small">
          <Select
            placeholder="Select Class"
            value={selectedClass}
            onChange={setSelectedClass}
            style={{ width: 200 }}
            loading={classesLoading}
          >
            {classes.map(cls => (
              <Option key={cls.id} value={cls.id}>
                {`${cls.class_name} - Section ${cls.section}`}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddTimeSlot}
            disabled={!selectedClass}
          >
            Add Time Slot
          </Button>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setBulkModalVisible(true)}
            disabled={!selectedClass}
          >
            Bulk Upload
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setBulkEditModalVisible(true)}
            disabled={!selectedRows.length}
          >
            Bulk Edit {selectedRows.length > 0 && `(${selectedRows.length})`}
          </Button>
          {selectedRows.length > 0 && (
            <Button
              type="text"
              danger
              onClick={() => setSelectedRows([])}
            >
              Clear
            </Button>
          )}
        </Space>
      </div>

      <Card className="timetable-card">
        {loadingTimetable ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="medium" />
          </div>
        ) : !selectedClass ? (
          <Empty description="Please select a class to view timetable" />
        ) : (
          renderTimetableView()
        )}
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
          setEditingTimetable(null);
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
              onChange={(value) => handleSubjectChange(value)}
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
            name="class_type"
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
                setEditingTimetable(null);
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

      {/* Add Bulk Upload Modal */}
      <Modal
        title="Bulk Upload Timetable"
        open={bulkModalVisible}
        onCancel={() => {
          setBulkModalVisible(false);
          bulkForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={bulkForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const entries = values.entries.map(entry => ({
                day: entry.day,
                start_time: entry.start_time.format('HH:mm:ss'),
                end_time: entry.end_time.format('HH:mm:ss'),
                duration: entry.end_time.diff(entry.start_time, 'seconds'),
                subject: entry.subject,
                teacher: entry.teacher,
                class_type: entry.class_type
              }));
              
              await handleBulkCreate(entries);
              setBulkModalVisible(false);
              bulkForm.resetFields();
            } catch (error) {
              message.error('Failed to process bulk upload');
            }
          }}
        >
          <Form.List name="entries">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    style={{ marginBottom: 16 }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    }
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'day']}
                          label="Day"
                          rules={[{ required: true, message: 'Select day' }]}
                        >
                          <Select placeholder="Select Day">
                            {days.map(day => (
                              <Option key={day.value} value={day.value}>{day.label}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'start_time']}
                          label="Start Time"
                          rules={[{ required: true, message: 'Select start time' }]}
                        >
                          <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'end_time']}
                          label="End Time"
                          rules={[{ required: true, message: 'Select end time' }]}
                        >
                          <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'subject']}
                          label="Subject"
                          rules={[{ required: true, message: 'Select subject' }]}
                        >
                          <Select
                            placeholder="Select Subject"
                            onChange={(value) => handleSubjectChange(value)}
                          >
                            {subjects.map(subject => (
                              <Option key={subject.id} value={subject.id}>{subject.name}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'teacher']}
                          label="Teacher"
                          rules={[{ required: true, message: 'Select teacher' }]}
                        >
                          <Select placeholder="Select Teacher">
                            {teachers.map(teacher => (
                              <Option key={teacher.id} value={teacher.id}>{teacher.name}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'class_type']}
                          label="Class Type"
                          rules={[{ required: true, message: 'Select class type' }]}
                        >
                          <Select placeholder="Select Class Type">
                            {classTypes.map(type => (
                              <Option key={type.value} value={type.value}>{type.label}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Time Slot
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setBulkModalVisible(false);
                bulkForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Upload
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Bulk Edit Modal */}
      <Modal
        title="Bulk Edit Timetable"
        open={bulkEditModalVisible}
        onCancel={() => {
          setBulkEditModalVisible(false);
          bulkForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={bulkForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const entries = selectedRows.map((row, index) => ({
                id: row.id,
                day: values.entries[index]?.day || row.day,
                start_time: values.entries[index]?.start_time || moment(row.start_time, 'HH:mm:ss'),
                end_time: values.entries[index]?.end_time || moment(row.end_time, 'HH:mm:ss'),
                subject: values.entries[index]?.subject || row.subject,
                teacher: values.entries[index]?.teacher || row.teacher,
                class_type: values.entries[index]?.class_type || row.class_type
              }));
              
              await handleBulkEdit(entries);
              setBulkEditModalVisible(false);
              bulkForm.resetFields();
              setSelectedRows([]);
            } catch (error) {
              message.error('Failed to process bulk edit');
            }
          }}
        >
          <Form.List name="entries">
            {(fields, { add, remove }) => (
              <>
                {selectedRows.map((row, index) => (
                  <Card
                    key={row.id}
                    style={{ marginBottom: 16 }}
                    title={`Entry ${index + 1}`}
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name={[index, 'day']}
                          label="Day"
                          initialValue={row.day}
                        >
                          <Select placeholder="Select Day">
                            {days.map(day => (
                              <Option key={day.value} value={day.value}>{day.label}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name={[index, 'start_time']}
                          label="Start Time"
                          initialValue={moment(row.start_time, 'HH:mm:ss')}
                        >
                          <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name={[index, 'end_time']}
                          label="End Time"
                          initialValue={moment(row.end_time, 'HH:mm:ss')}
                        >
                          <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name={[index, 'subject']}
                          label="Subject"
                          initialValue={row.subject}
                        >
                          <Select
                            placeholder="Select Subject"
                            onChange={(value) => handleSubjectChange(value)}
                          >
                            {subjects.map(subject => (
                              <Option key={subject.id} value={subject.id}>{subject.name}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name={[index, 'teacher']}
                          label="Teacher"
                          initialValue={row.teacher}
                        >
                          <Select placeholder="Select Teacher">
                            {teachers.map(teacher => (
                              <Option key={teacher.id} value={teacher.id}>{teacher.name}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name={[index, 'class_type']}
                          label="Class Type"
                          initialValue={row.class_type}
                        >
                          <Select placeholder="Select Class Type">
                            {classTypes.map(type => (
                              <Option key={type.value} value={type.value}>{type.label}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button onClick={() => {
                      setBulkEditModalVisible(false);
                      bulkForm.resetFields();
                      setSelectedRows([]);
                    }}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Update
                    </Button>
                  </Space>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default Timetable; 
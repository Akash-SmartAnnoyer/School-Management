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
  ScheduleOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../services/api';
import moment from 'moment';
import './Timetable.css';

const { Title } = Typography;
const { Option } = Select;

const Timetable = () => {
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();
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
  const [bulkLoading, setBulkLoading] = useState(false);

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

  // Load initial data
  useEffect(() => {
    loadClasses();
    loadSubjects();
    loadTeachers();
  }, []);

  // Load timetables when class is selected
  useEffect(() => {
    if (selectedClass) {
      loadTimetables();
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const response = await api.class.getAll();
      setClasses(response.data || []);
    } catch (error) {
      message.error('Failed to load classes');
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await api.subject.getSubjects();
      setSubjects(response.data || []);
    } catch (error) {
      message.error('Failed to load subjects');
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await api.teacher.getAll();
      setTeachers(response.data || []);
    } catch (error) {
      message.error('Failed to load teachers');
    }
  };

  const loadTimetables = async () => {
    if (!selectedClass) return;
    try {
      setLoadingTimetable(true);
      const response = await api.timetable.getByClass(selectedClass);
      setTimetables(response.data || []);
    } catch (error) {
      message.error('Failed to load timetables');
    } finally {
      setLoadingTimetable(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Calculate duration in seconds
      const startTime = values.start_time;
      const endTime = values.end_time;
      const durationInSeconds = endTime.diff(startTime, 'seconds');
      
      // Format duration as HH:mm:ss
      const duration = moment.utc(durationInSeconds * 1000).format('HH:mm:ss');

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

  const handleBulkSubmit = async (values) => {
    try {
      setBulkLoading(true);
      const entries = values.entries.map(entry => {
        const durationInSeconds = entry.end_time.diff(entry.start_time, 'seconds');
        const duration = moment.utc(durationInSeconds * 1000).format('HH:mm:ss');
        
        return {
          day: entry.day,
          start_time: entry.start_time.format('HH:mm:ss'),
          end_time: entry.end_time.format('HH:mm:ss'),
          duration: duration,
          subject: entry.subject,
          teacher: entry.teacher,
          class_type: entry.class_type
        };
      });

      const response = await api.timetable.bulkCreate(selectedClass, entries);
      
      if (response.success_count > 0) {
        message.success(`Successfully created ${response.success_count} timetable entries`);
      }
      if (response.fail_count > 0) {
        message.warning(`${response.fail_count} entries failed to create`);
        // Show detailed error messages if available
        if (response.errors) {
          response.errors.forEach(error => {
            message.error(`Entry ${error.index + 1}: ${Object.values(error.errors).flat().join(', ')}`);
          });
        }
      }
      
      bulkForm.resetFields();
      loadTimetables();
    } catch (error) {
      console.error('Error in bulk create:', error);
      message.error('Failed to create timetable entries');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    try {
      const values = await bulkForm.validateFields();
      setBulkLoading(true);
      
      const entries = values.entries.map(entry => {
        const durationInSeconds = entry.end_time.diff(entry.start_time, 'seconds');
        const duration = moment.utc(durationInSeconds * 1000).format('HH:mm:ss');
        
        return {
          id: entry.id,
          day: entry.day,
          start_time: entry.start_time.format('HH:mm:ss'),
          end_time: entry.end_time.format('HH:mm:ss'),
          duration: duration,
          subject: entry.subject,
          teacher: entry.teacher,
          class_type: entry.class_type
        };
      });

      const response = await api.timetable.bulkUpdate(selectedClass, entries);
      
      if (response.updated_count > 0) {
        message.success(`Successfully updated ${response.updated_count} timetable entries`);
      }
      if (response.errors?.length > 0) {
        message.warning(`${response.errors.length} entries failed to update`);
        response.errors.forEach(error => {
          message.error(`Entry ${error.id}: ${Object.values(error.errors).flat().join(', ')}`);
        });
      }
      
      bulkForm.resetFields();
      loadTimetables();
    } catch (error) {
      console.error('Error in bulk update:', error);
      message.error('Failed to update timetable entries');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.timetable.delete(id);
      message.success('Timetable entry deleted successfully');
      loadTimetables();
    } catch (error) {
      message.error('Failed to delete timetable entry');
    }
  };

  const renderTimetableGrid = () => {
    if (!selectedClass) {
      return (
        <Empty
          description="Please select a class to view timetable"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    if (loadingTimetable) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!timetables.length) {
      return (
        <Empty
          description="No timetable entries found for this class"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    const timeSlots = [
      '08:00:00', '09:00:00', '10:00:00', '11:00:00', '12:00:00',
      '13:00:00', '14:00:00', '15:00:00', '16:00:00'
    ];

    const columns = [
      {
        title: 'Time',
        dataIndex: 'time',
        key: 'time',
        width: 100,
        fixed: 'left',
      },
      ...days.map(day => ({
        title: day.label,
        dataIndex: day.value,
        key: day.value,
        render: (_, record) => {
          const entry = timetables.find(t => 
            t.day === day.value && 
            t.start_time === record.time
          );
          
          if (!entry) return null;

          const subject = subjects.find(s => s.id === entry.subject);
          const teacher = teachers.find(t => t.id === entry.teacher);

          return (
            <Card 
              size="small" 
              style={{ 
                backgroundColor: entry.class_type === 'theory' ? '#e6f7ff' : '#f6ffed',
                margin: '2px'
              }}
            >
              <div style={{ fontSize: '12px' }}>
                <div><strong>{subject?.name || 'N/A'}</strong></div>
                <div>{teacher?.name || 'N/A'}</div>
                <div style={{ color: '#666' }}>{entry.class_type}</div>
                <div style={{ fontSize: '10px' }}>{entry.start_time} - {entry.end_time}</div>
              </div>
              <Space size="small" style={{ marginTop: '4px' }}>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(entry)}
                />
                <Popconfirm
                  title="Are you sure you want to delete this entry?"
                  onConfirm={() => handleDelete(entry.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Space>
            </Card>
          );
        }
      }))
    ];

    const data = timeSlots.map(time => ({
      key: time,
      time: time,
      ...days.reduce((acc, day) => ({ ...acc, [day.value]: null }), {})
    }));

    return (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ x: 'max-content' }}
        size="small"
        bordered
      />
    );
  };

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
        <Button 
          type="text" 
          icon={<PlusOutlined />} 
          onClick={() => handleAddTimeSlot(day, timeSlot)}
          style={{ color: '#1890ff' }}
        />
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
        <Space size="small" style={{ marginTop: '4px' }}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(classDetails)}
            style={{ color: '#1890ff' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this entry?"
            onConfirm={() => handleDelete(classDetails.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      </div>
    );
  };

  const handleAddTimeSlot = (day, timeSlot) => {
    setEditingTimetable(null);
    form.setFieldsValue({
      day: day,
      start_time: moment(timeSlot, 'HH:mm:ss'),
      end_time: moment(timeSlot, 'HH:mm:ss').add(1, 'hour')
    });
    setModalVisible(true);
  };

  return (
    <div className="timetable-container">
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <ScheduleOutlined /> Timetable Management
            </Title>
          </Col>
          <Col flex="auto">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Select
                  placeholder="Select Class"
                  value={selectedClass}
                  onChange={setSelectedClass}
                  style={{ width: 200 }}
                >
                  {classes.map(cls => (
                    <Option key={cls.id} value={cls.id}>{`${cls.class_name} - Section ${cls.section}`}</Option>
                  ))}
                </Select>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingTimetable(null);
                    form.resetFields();
                    setModalVisible(true);
                  }}
                  disabled={!selectedClass}
                >
                  Add Time Slot
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadTimetables}
                  disabled={!selectedClass}
                >
                  Refresh
                </Button>
              </Space>
              {!selectedClass && (
                <Typography.Text type="secondary">
                  Please select a class to create or view timetable entries
                </Typography.Text>
              )}
            </Space>
          </Col>
        </Row>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          style={{ marginTop: 16 }}
          items={[
            {
              key: '1',
              label: (
                <span>
                  <ScheduleOutlined />
                  Class Timetable
                </span>
              ),
              children: renderTimetableGrid()
            },
            {
              key: '2',
              label: (
                <span>
                  <PlusOutlined />
                  Bulk Operations
                </span>
              ),
              children: (
                <Card>
                  <Typography.Paragraph>
                    Use this section to create or update multiple timetable entries at once. 
                    Click "Add Time Slot" below to add entries, then fill in the details for each slot.
                  </Typography.Paragraph>
                  <Form
                    form={bulkForm}
                    layout="vertical"
                    onFinish={handleBulkSubmit}
                  >
                    <Form.List name="entries">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <Card key={key} style={{ marginBottom: 16 }}>
                              <Space align="baseline">
                                <Form.Item
                                  {...restField}
                                  name={[name, 'day']}
                                  label="Day"
                                  rules={[{ required: true, message: 'Select day' }]}
                                >
                                  <Select style={{ width: 120 }}>
                                    {days.map(day => (
                                      <Option key={day.value} value={day.value}>{day.label}</Option>
                                    ))}
                                  </Select>
                                </Form.Item>

                                <Form.Item
                                  {...restField}
                                  name={[name, 'start_time']}
                                  label="Start Time"
                                  rules={[{ required: true, message: 'Select start time' }]}
                                >
                                  <TimePicker format="HH:mm" />
                                </Form.Item>

                                <Form.Item
                                  {...restField}
                                  name={[name, 'end_time']}
                                  label="End Time"
                                  rules={[{ required: true, message: 'Select end time' }]}
                                >
                                  <TimePicker format="HH:mm" />
                                </Form.Item>

                                <Form.Item
                                  {...restField}
                                  name={[name, 'subject']}
                                  label="Subject"
                                  rules={[{ required: true, message: 'Select subject' }]}
                                >
                                  <Select style={{ width: 150 }}>
                                    {subjects.map(subject => (
                                      <Option key={subject.id} value={subject.id}>{subject.name}</Option>
                                    ))}
                                  </Select>
                                </Form.Item>

                                <Form.Item
                                  {...restField}
                                  name={[name, 'teacher']}
                                  label="Teacher"
                                  rules={[{ required: true, message: 'Select teacher' }]}
                                >
                                  <Select style={{ width: 150 }}>
                                    {teachers.map(teacher => (
                                      <Option key={teacher.id} value={teacher.id}>{teacher.name}</Option>
                                    ))}
                                  </Select>
                                </Form.Item>

                                <Form.Item
                                  {...restField}
                                  name={[name, 'class_type']}
                                  label="Type"
                                  rules={[{ required: true, message: 'Select type' }]}
                                >
                                  <Select style={{ width: 120 }}>
                                    {classTypes.map(type => (
                                      <Option key={type.value} value={type.value}>{type.label}</Option>
                                    ))}
                                  </Select>
                                </Form.Item>

                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => remove(name)}
                                />
                              </Space>
                            </Card>
                          ))}
                          <Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              block
                              icon={<PlusOutlined />}
                              disabled={!selectedClass}
                            >
                              Add Time Slot
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>

                    <Form.Item>
                      <Space>
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          loading={bulkLoading}
                          disabled={!selectedClass}
                          icon={<SaveOutlined />}
                        >
                          Create Entries
                        </Button>
                        <Button 
                          type="default" 
                          onClick={handleBulkUpdate} 
                          loading={bulkLoading}
                          disabled={!selectedClass}
                          icon={<SaveOutlined />}
                        >
                          Update Entries
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Card>
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={editingTimetable ? 'Edit Time Slot' : 'Add Time Slot'}
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
          onFinish={handleSubmit}
        >
          <Form.Item
            name="day"
            label="Day"
            rules={[{ required: true, message: 'Please select a day' }]}
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
            <Select>
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
            <Select>
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id}>{teacher.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="class_type"
            label="Type"
            rules={[{ required: true, message: 'Please select a type' }]}
          >
            <Select>
              {classTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingTimetable ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
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
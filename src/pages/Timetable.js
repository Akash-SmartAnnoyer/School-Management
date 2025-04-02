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
  TimePicker
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = Array.from({ length: 8 }, (_, i) => `${i + 1}`);

  // Load classes only when the component mounts
  useEffect(() => {
    loadClasses();
  }, []);

  // Load timetables only when a class is selected
  useEffect(() => {
    if (selectedClass) {
      loadTimetables();
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const response = await api.class.getAll();
      setClasses(response.data.data);
    } catch (error) {
      message.error('Failed to load classes');
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await api.subject.getAll();
      setSubjects(response.data.data);
    } catch (error) {
      message.error('Failed to load subjects');
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await api.teacher.getAll();
      setTeachers(response.data.data);
    } catch (error) {
      message.error('Failed to load teachers');
    }
  };

  const loadTimetables = async () => {
    try {
      const response = await api.timetable.getByClass(selectedClass);
      setTimetables(response.data.data);
    } catch (error) {
      message.error('Failed to load timetables');
    }
  };

  // Load subjects and teachers only when opening the modal
  const handleAddTimeSlot = () => {
    // Load required data only when needed
    loadSubjects();
    loadTeachers();
    setEditingTimetable(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = async (timetable) => {
    // Load required data only when needed
    await Promise.all([loadSubjects(), loadTeachers()]);
    setEditingTimetable(timetable);
    form.setFieldsValue(timetable);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const selectedTeacher = teachers.find(t => t.id === values.teacherId);
      const selectedSubject = subjects.find(s => s.id === values.subjectId);
      const selectedClassInfo = classes.find(c => c.id === selectedClass);

      const timetableData = {
        ...values,
        classId: selectedClass,
        teacherId: values.teacherId,
        teacherName: selectedTeacher?.name,
        subjectId: values.subjectId,
        subjectName: selectedSubject?.name,
        className: selectedClassInfo?.className,
        section: selectedClassInfo?.section,
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
      message.error('Failed to save timetable');
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

  const columns = [
    {
      title: 'Day',
      dataIndex: 'day',
      key: 'day',
    },
    {
      title: 'Time Slot',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
    },
    {
      title: 'Subject',
      dataIndex: 'subjectName',
      key: 'subjectName',
    },
    {
      title: 'Teacher',
      dataIndex: 'teacherName',
      key: 'teacherName',
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
                      {cls.className} - Section {cls.section}
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
                      {cls.className} - Section {cls.section}
                    </Option>
                  ))}
                </Select>
              </Col>
              {selectedClass && (
                <Col span={24}>
                  <Table
                    columns={columns.filter(col => col.key !== 'actions')}
                    dataSource={timetables}
                    rowKey="id"
                  />
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
        >
          <Form.Item
            name="day"
            label="Day"
            rules={[{ required: true, message: 'Please select day' }]}
          >
            <Select>
              {days.map(day => (
                <Option key={day} value={day}>{day}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="timeSlot"
            label="Time Slot"
            rules={[{ required: true, message: 'Please select time slot' }]}
          >
            <Select>
              {timeSlots.map(slot => (
                <Option key={slot} value={slot}>Period {slot}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subjectId"
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
            name="teacherId"
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
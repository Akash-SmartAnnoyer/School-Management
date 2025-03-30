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
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { getTeachers } from '../firebase/services';

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
  const { currentUser } = useAuth();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = Array.from({ length: 8 }, (_, i) => `${i + 1}`);

  useEffect(() => {
    loadClasses();
    loadSubjects();
    loadTeachers();
    loadTimetables();
  }, []);

  const loadClasses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'classes'));
      const classesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClasses(classesData);
    } catch (error) {
      message.error('Failed to load classes');
    }
  };

  const loadSubjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'subjects'));
      const subjectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubjects(subjectsData);
    } catch (error) {
      message.error('Failed to load subjects');
    }
  };

  const loadTeachers = async () => {
    try {
      const teachersData = await getTeachers();
      console.log('Teachers data:', teachersData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading teachers:', error);
      message.error('Failed to load teachers');
    }
  };

  const loadTimetables = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'timetables'));
      const timetablesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTimetables(timetablesData);
    } catch (error) {
      message.error('Failed to load timetables');
    }
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingTimetable) {
        await updateDoc(doc(db, 'timetables', editingTimetable.id), timetableData);
        message.success('Timetable updated successfully');
      } else {
        await addDoc(collection(db, 'timetables'), timetableData);
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

  const handleEdit = (timetable) => {
    setEditingTimetable(timetable);
    form.setFieldsValue(timetable);
    setModalVisible(true);
  };

  const handleDelete = async (timetableId) => {
    try {
      await deleteDoc(doc(db, 'timetables', timetableId));
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
      dataIndex: 'subjectId',
      key: 'subjectId',
      render: (subjectId) => {
        const subject = subjects.find(s => s.id === subjectId);
        return subject ? subject.name : 'N/A';
      }
    },
    {
      title: 'Teacher',
      dataIndex: 'teacherId',
      key: 'teacherId',
      render: (teacherId) => {
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher ? teacher.name : 'N/A';
      }
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

  const filteredTimetables = timetables.filter(t => t.classId === selectedClass);

  return (
    <div>
      <Title level={2}>Timetable Management</Title>
      <Card>
        <Tabs defaultActiveKey="1">
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
                      onClick={() => {
                        setEditingTimetable(null);
                        form.resetFields();
                        setModalVisible(true);
                      }}
                    >
                      Add Time Slot
                    </Button>
                  </Col>
                  <Col span={24}>
                    <Table
                      columns={columns}
                      dataSource={filteredTimetables}
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
                    dataSource={filteredTimetables}
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
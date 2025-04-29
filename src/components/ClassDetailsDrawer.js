import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Tabs, Card, Row, Col, Statistic, Empty, Tag, Button, Space, Avatar, Table, Modal, Select, message } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined, PlusOutlined } from '@ant-design/icons';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { getCloudinaryImage } from '../services/imageService';
import api from '../services/api';

const { TabPane } = Tabs;
const { Option } = Select;

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dyr02bpil'
  }
});

const ClassDetailsDrawer = ({ visible, onClose, classData }) => {
  const [loading, setLoading] = useState(true);
  const [classDetails, setClassDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [addStudentsModalVisible, setAddStudentsModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (classData?.id) {
      loadClassDetails();
      loadAllStudents();
    }
  }, [classData?.id]);

  const loadClassDetails = async () => {
    try {
      setLoading(true);
      const response = await api.class.getClass(classData.id);
      if (response.success) {
        setClassDetails(response.data);
      } else {
        console.error('Failed to load class details:', response.message);
      }
    } catch (error) {
      console.error('Error loading class details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllStudents = async () => {
    try {
      const response = await api.student.getStudents();
      if (response.success) {
        // Filter out students who are already in the class
        const currentClassStudents = classDetails?.students?.map(s => s.id) || [];
        const availableStudents = response.data.filter(student => 
          !currentClassStudents.includes(student.id)
        );
        setStudents(availableStudents);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleAddStudents = async () => {
    try {
      setLoading(true);
      const response = await api.class.addStudentsToClass(classData.id, selectedStudents);
      if (response.success) {
        messageApi.success(response.data.message);
        loadClassDetails(); // Refresh class details
        loadAllStudents(); // Refresh available students
        setAddStudentsModalVisible(false);
        setSelectedStudents([]);
      } else {
        messageApi.error('Failed to add students to class');
      }
    } catch (error) {
      console.error('Error adding students:', error);
      messageApi.error('Failed to add students to class');
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (student) => {
    if (!student) return 'Unknown Student';
    if (student.user) {
      return `${student.user.first_name || ''} ${student.user.last_name || ''}`.trim() || 'Unknown Student';
    }
    return student.name || 'Unknown Student';
  };

  const getStudentEmail = (student) => {
    if (!student) return '';
    if (student.user) {
      return student.user.email || '';
    }
    return student.email || '';
  };

  const getStudentPhone = (student) => {
    if (!student) return '';
    if (student.user) {
      return student.user.phone || '';
    }
    return student.phone || '';
  };

  return (
    <>
      {contextHolder}
      <Drawer
        title="Class Details"
        placement="right"
        onClose={onClose}
        open={visible}
        width={800}
      >
        {classDetails ? (
          <div>
            <Descriptions bordered>
              <Descriptions.Item label="Class Name">{classDetails.class_name}</Descriptions.Item>
              <Descriptions.Item label="Section">{classDetails.section}</Descriptions.Item>
              <Descriptions.Item label="Class Teacher">
                {classDetails.class_teacher ? (
                  <Space>
                    <Avatar icon={<UserOutlined />} />
                    <span>{`${classDetails.class_teacher.user.first_name} ${classDetails.class_teacher.user.last_name}`}</span>
                  </Space>
                ) : (
                  'Not Assigned'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Capacity">{classDetails.capacity}</Descriptions.Item>
              <Descriptions.Item label="Total Students">{classDetails.total_students}</Descriptions.Item>
              <Descriptions.Item label="Available Seats">{classDetails.available_seats}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={classDetails.status === 'active' ? 'green' : 'red'}>
                  {classDetails.status.charAt(0).toUpperCase() + classDetails.status.slice(1)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Tabs defaultActiveKey="1" style={{ marginTop: 24 }}>
              <TabPane 
                tab={
                  <span>
                    <TeamOutlined />
                    Students
                  </span>
                } 
                key="1"
              >
                <div style={{ marginBottom: 16 }}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setAddStudentsModalVisible(true)}
                    disabled={classDetails.available_seats === 0}
                  >
                    Add Students
                  </Button>
                </div>
                <Table
                  dataSource={classDetails.students || []}
                  columns={[
                    {
                      title: 'Name',
                      key: 'name',
                      render: (_, record) => (
                        <Space>
                          <Avatar icon={<UserOutlined />} />
                          <span>{getStudentName(record)}</span>
                        </Space>
                      ),
                    },
                    {
                      title: 'Email',
                      key: 'email',
                      render: (_, record) => getStudentEmail(record),
                    },
                    {
                      title: 'Phone',
                      key: 'phone',
                      render: (_, record) => getStudentPhone(record),
                    },
                  ]}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No students found"
                      />
                    )
                  }}
                />
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <BookOutlined />
                    Teacher Details
                  </span>
                } 
                key="2"
              >
                {classDetails.class_teacher ? (
                  <Card>
                    <Descriptions column={1}>
                      <Descriptions.Item label="Name">
                        {`${classDetails.class_teacher.user.first_name} ${classDetails.class_teacher.user.last_name}`}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {classDetails.class_teacher.user.email}
                      </Descriptions.Item>
                      <Descriptions.Item label="Phone">
                        {classDetails.class_teacher.user.phone}
                      </Descriptions.Item>
                      <Descriptions.Item label="Qualification">
                        {classDetails.class_teacher.qualification}
                      </Descriptions.Item>
                      <Descriptions.Item label="Specialization">
                        {classDetails.class_teacher.specialization}
                      </Descriptions.Item>
                      <Descriptions.Item label="Subject">
                        {classDetails.class_teacher.subject}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                ) : (
                  <Empty description="No teacher assigned" />
                )}
              </TabPane>
            </Tabs>
          </div>
        ) : (
          <Empty description="No class information available" />
        )}
      </Drawer>

      <Modal
        title="Add Students to Class"
        open={addStudentsModalVisible}
        onCancel={() => {
          setAddStudentsModalVisible(false);
          setSelectedStudents([]);
        }}
        onOk={handleAddStudents}
        confirmLoading={loading}
        okText="Add Students"
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select students"
          value={selectedStudents}
          onChange={setSelectedStudents}
          optionLabelProp="label"
        >
          {students.map(student => (
            <Option 
              key={student.id} 
              value={student.id}
              label={getStudentName(student)}
            >
              <Space>
                <Avatar icon={<UserOutlined />} />
                <span>{getStudentName(student)}</span>
                <span style={{ color: '#999' }}>({getStudentEmail(student)})</span>
              </Space>
            </Option>
          ))}
        </Select>
        <div style={{ marginTop: 16 }}>
          <Tag color="blue">Available Seats: {classDetails?.available_seats || 0}</Tag>
          <Tag color="green">Selected Students: {selectedStudents.length}</Tag>
        </div>
      </Modal>
    </>
  );
};

export default ClassDetailsDrawer; 
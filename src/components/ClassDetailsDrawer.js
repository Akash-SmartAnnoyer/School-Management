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
  const [loadingClassDetails, setLoadingClassDetails] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [classDetails, setClassDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [addStudentsModalVisible, setAddStudentsModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (visible && classData?.id) {
      loadClassDetails();
      loadAllStudents();
    }
  }, [visible, classData?.id]);

  const loadClassDetails = async () => {
    try {
      setLoadingClassDetails(true);
      const response = await api.class.getClass(classData.id);
      if (response.success) {
        setClassDetails(response.data);
      } else {
        messageApi.error('Failed to load class details');
        console.error('Failed to load class details:', response.message);
      }
    } catch (error) {
      messageApi.error('Failed to load class details');
      console.error('Error loading class details:', error);
    } finally {
      setLoadingClassDetails(false);
    }
  };

  const loadAllStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await api.student.getAllStudents();
      if (response.success) {
        setStudents(response.data);
      } else {
        messageApi.error('Failed to load students');
        console.error('Failed to load students:', response.message);
      }
    } catch (error) {
      messageApi.error('Failed to load students');
      console.error('Error loading students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAddStudents = async () => {
    try {
      setLoadingClassDetails(true);
      const response = await api.class.addStudentsToClass(classData.id, selectedStudents);
      
      if (response.status === 200 || response.status === 201) {
        messageApi.success('Students added successfully');
        loadClassDetails(); // Refresh class details
        loadAllStudents(); // Refresh available students
        setAddStudentsModalVisible(false);
        setSelectedStudents([]);
      } else if (response.status === 400) {
        messageApi.error(response.data.message || 'Invalid request. Please check the data and try again.');
      } else if (response.status === 401) {
        messageApi.error('Unauthorized. Please login again.');
      } else if (response.status === 403) {
        messageApi.error('You do not have permission to add students to this class.');
      } else if (response.status === 404) {
        messageApi.error('Class not found.');
      } else if (response.status === 409) {
        messageApi.error('Some students are already in the class or there is a conflict.');
      } else if (response.status === 422) {
        messageApi.error('Validation error: ' + (response.data.message || 'Please check the input data.'));
      } else if (response.status >= 500) {
        messageApi.error('Server error. Please try again later.');
      } else {
        messageApi.error('Failed to add students. Please try again.');
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          messageApi.error(data.message || 'Invalid request. Please check the data and try again.');
        } else if (status === 401) {
          messageApi.error('Unauthorized. Please login again.');
        } else if (status === 403) {
          messageApi.error('You do not have permission to add students to this class.');
        } else if (status === 404) {
          messageApi.error('Class not found.');
        } else if (status === 409) {
          messageApi.error('Some students are already in the class or there is a conflict.');
        } else if (status === 422) {
          messageApi.error('Validation error: ' + (data.message || 'Please check the input data.'));
        } else if (status >= 500) {
          messageApi.error('Server error. Please try again later.');
        } else {
          messageApi.error('Failed to add students. Please try again.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        messageApi.error('No response from server. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        messageApi.error('Error setting up the request. Please try again.');
      }
      console.error('Error adding students:', error);
    } finally {
      setLoadingClassDetails(false);
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
        width={720}
        loading={loadingClassDetails || loadingStudents}
      >
        {loadingClassDetails || loadingStudents ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading...
          </div>
        ) : (
          <>
            <Descriptions title="Class Information" bordered>
              <Descriptions.Item label="Class Name">{classDetails?.className}</Descriptions.Item>
              <Descriptions.Item label="Section">{classDetails?.section}</Descriptions.Item>
              <Descriptions.Item label="Teacher">{classDetails?.teacher?.name || 'Not Assigned'}</Descriptions.Item>
              <Descriptions.Item label="Capacity">{classDetails?.capacity}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={classDetails?.status === 'active' ? 'green' : 'red'}>
                  {classDetails?.status?.charAt(0).toUpperCase() + classDetails?.status?.slice(1)}
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
                    disabled={classDetails?.available_seats === 0}
                  >
                    Add Students
                  </Button>
                </div>
                <Table
                  dataSource={classDetails?.students || []}
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
                  loading={loadingClassDetails || loadingStudents}
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
                {classDetails?.class_teacher ? (
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
          </>
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
        confirmLoading={loadingClassDetails}
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
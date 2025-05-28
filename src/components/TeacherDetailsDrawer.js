import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Avatar, Tabs, Card, Row, Col, Statistic, Empty, Typography, Table, Upload, message } from 'antd';
import { UserOutlined, BookOutlined, TeamOutlined, UploadOutlined, BankOutlined } from '@ant-design/icons';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { getCloudinaryImage, uploadImage } from '../services/imageService';
import api from '../services/api';

const { TabPane } = Tabs;
const { Title } = Typography;

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dyr02bpil'
  }
});

const TeacherDetailsDrawer = ({ visible, onClose, teacher }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchClasses = async () => {
      if (!teacher?.classId) return;
      
      try {
        const response = await api.class.getAll();
        if (response.data.success) {
          const classData = response.data.data.filter(cls => cls.id === teacher.classId);
          setClasses(classData);
        } else {
          messageApi.error(response.data.message || 'Failed to load class data');
        }
      } catch (error) {
        messageApi.error('Failed to load class data');
        console.error('Error fetching class data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [teacher?.classId]);

  useEffect(() => {
    if (teacher?.id) {
      loadTeacherSchedule();
    }
  }, [teacher?.id]);

  const classInfo = classes[0];

  const loadTeacherSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.teacher.getSchedule(teacher.id);
      if (response.data.success) {
        setSchedule(response.data.data);
      } else {
        messageApi.error(response.data.message || 'Failed to load schedule');
      }
    } catch (error) {
      messageApi.error('Failed to load schedule');
      console.error('Error loading teacher schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setLoading(true);
      const imageUrl = await uploadImage(file);
      const response = await api.teacher.update(teacher.id, { photoURL: imageUrl });
      if (response.data.success) {
        messageApi.success('Photo updated successfully');
        // The parent component will handle refreshing the teacher data
        onClose(); // Close the drawer to force a refresh
      } else {
        messageApi.error(response.data.message || 'Failed to update photo');
      }
    } catch (error) {
      messageApi.error('Failed to upload photo');
      console.error('Error uploading photo:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Day',
      dataIndex: 'day',
      key: 'day',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Class',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
  ];

  return (
    <Drawer
      title="Teacher Details"
      placement="right"
      onClose={onClose}
      visible={visible}
      width={720}
    >
      {contextHolder}
      {teacher && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Upload
              name="photo"
              showUploadList={false}
              beforeUpload={(file) => {
                handleImageUpload(file);
                return false;
              }}
              accept="image/*"
            >
              <Avatar
                size={100}
                src={teacher.photoURL ? getCloudinaryImage(teacher.photoURL) : null}
                icon={!teacher.photoURL && (teacher.gender === 'M' ? 
                  <img src="/teacher-boy.png" alt="Male Teacher" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                  <img src="/teacher-girl.png" alt="Female Teacher" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              />
            </Upload>
            <Title level={4} style={{ marginTop: 16 }}>{teacher.name}</Title>
          </div>

          <Tabs defaultActiveKey="1">
            <TabPane tab="Personal Information" key="1">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Subject">{teacher.subject}</Descriptions.Item>
                <Descriptions.Item label="Qualification">{teacher.qualification}</Descriptions.Item>
                <Descriptions.Item label="Class">{classInfo ? `${classInfo.className} - ${classInfo.section}` : '-'}</Descriptions.Item>
                <Descriptions.Item label="Status">{teacher.status}</Descriptions.Item>
                <Descriptions.Item label="Email">{teacher.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{teacher.phone}</Descriptions.Item>
                <Descriptions.Item label="Date of Birth">{teacher.dateOfBirth}</Descriptions.Item>
                <Descriptions.Item label="Joining Date">{teacher.joiningDate}</Descriptions.Item>
                <Descriptions.Item label="Experience">{teacher.experience} years</Descriptions.Item>
                <Descriptions.Item label="Specialization">{teacher.specialization}</Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Teaching Statistics" key="2">
              <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Students Taught"
                      value={classInfo?.studentCount || 0}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Years of Experience"
                      value={teacher.experience || 0}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Classes Handled"
                      value={1}
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="Class Performance">
                <Empty description="Performance data will be available soon" />
              </Card>
            </TabPane>

            <TabPane tab="Schedule" key="3">
              <Card>
                {schedule.length > 0 ? (
                  <Table
                    columns={columns}
                    dataSource={schedule}
                    rowKey="id"
                    pagination={false}
                    loading={loading}
                  />
                ) : (
                  <Empty description="No schedule assigned yet" />
                )}
              </Card>
            </TabPane>
          </Tabs>
        </div>
      )}
    </Drawer>
  );
};

export default TeacherDetailsDrawer; 
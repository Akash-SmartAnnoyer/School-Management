import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Avatar, Tabs, Card, Row, Col, Statistic, Empty, Typography, Table, Upload, message } from 'antd';
import { UserOutlined, BookOutlined, TeamOutlined, UploadOutlined, BankOutlined } from '@ant-design/icons';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { getCloudinaryImage } from '../services/imageService';
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
        const classData = response.data.data.filter(cls => cls.id === teacher.classId);
        setClasses(classData);
      } catch (error) {
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
      setSchedule(response.data.data);
    } catch (error) {
      console.error('Error loading teacher schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        messageApi.error('You can only upload image files!');
        return false;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        messageApi.error('Image must be smaller than 2MB!');
        return false;
      }

      const base64Image = await getBase64(file);
      
      // Update teacher with new profile picture
      await api.teacher.update(teacher.id, {
        photoURL: base64Image,
        updatedAt: new Date().toISOString()
      });

      messageApi.success('Profile picture updated successfully');
      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Profile picture upload error:', error);
      messageApi.error('Failed to upload profile picture');
      return false;
    }
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
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
      render: (slot) => `Period ${slot}`
    },
    {
      title: 'Class',
      key: 'class',
      render: (_, record) => `${record.className} - Section ${record.section}`
    },
    {
      title: 'Subject',
      dataIndex: 'subjectName',
      key: 'subjectName',
    }
  ];

  return (
    <Drawer
      title="Teacher Details"
      placement="right"
      onClose={onClose}
      open={visible}
      width={720}
      bodyStyle={{ padding: '24px' }}
    >
      {contextHolder}
      {teacher && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Upload
              name="photoURL"
              showUploadList={false}
              beforeUpload={(file) => handleImageUpload(file)}
              accept="image/*"
            >
              <Avatar
                size={120}
                src={teacher.photoURL}
                icon={<UserOutlined />}
              />
            </Upload>
            <Title level={3}>{teacher.name}</Title>
            <Typography.Text type="secondary">ID: TCH{teacher.id.slice(-6)}</Typography.Text>
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
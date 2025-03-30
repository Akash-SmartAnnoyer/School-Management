import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Avatar, Tabs, Card, Row, Col, Statistic, Empty, Typography, Table } from 'antd';
import { UserOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { getCloudinaryImage } from '../services/imageService';

const { TabPane } = Tabs;
const { Title } = Typography;

const TeacherDetailsDrawer = ({ visible, onClose, teacher }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!teacher?.classId) return;
      
      try {
        const q = query(
          collection(db, 'classes'),
          where('id', '==', teacher.classId)
        );
        const querySnapshot = await getDocs(q);
        const classData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
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
      const q = query(
        collection(db, 'timetables'),
        where('teacherId', '==', teacher.id)
      );
      const querySnapshot = await getDocs(q);
      const scheduleData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSchedule(scheduleData);
    } catch (error) {
      console.error('Error loading teacher schedule:', error);
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
      {teacher && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {teacher.photoPublicId ? (
              <AdvancedImage 
                cldImg={getCloudinaryImage(teacher.photoPublicId)}
                style={{ width: 120, height: 120, borderRadius: '50%', marginBottom: '16px' }}
              />
            ) : (
              <Avatar 
                size={120} 
                icon={<UserOutlined />}
                style={{ marginBottom: '16px' }}
              />
            )}
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
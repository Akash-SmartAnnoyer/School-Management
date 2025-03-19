import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Tabs, Card, Row, Col, Statistic, Empty, Tag, Button, Space } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { getCloudinaryImage } from '../services/imageService';
import { subscribeToCollection } from '../firebase/services';

const { TabPane } = Tabs;

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dyr02bpil'
  }
});

const ClassDetailsDrawer = ({ visible, onClose, classInfo, teachers, students }) => {
  const [classStudents, setClassStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classInfo?.id) {
      const unsubscribe = subscribeToCollection('students', (data) => {
        const filteredStudents = data.filter(student => 
          student.classId === classInfo.id && student.status === 'Active'
        );
        setClassStudents(filteredStudents);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [classInfo?.id]);

  const classTeacher = teachers.find(t => t.id === classInfo?.teacherId);

  return (
    <Drawer
      title={`${classInfo?.className} - Section ${classInfo?.section}`}
      placement="right"
      onClose={onClose}
      open={visible}
      width={800}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Overview" key="1">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Students"
                  value={classStudents.length}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Capacity"
                  value={classInfo?.capacity}
                  prefix={<BookOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Available Seats"
                  value={classInfo?.capacity - classStudents.length}
                  prefix={<BookOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Class Information" style={{ marginTop: 16 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Class ID">{classInfo?.classId}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={classInfo?.status === 'Active' ? 'green' : 'red'}>
                  {classInfo?.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Class Teacher">
                {classTeacher ? (
                  <Button type="link" onClick={() => {
                    // TODO: Open teacher details drawer
                    console.log('Open teacher details:', classTeacher);
                  }}>
                    {classTeacher.name}
                  </Button>
                ) : (
                  'Not Assigned'
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>

        <TabPane tab="Students" key="2">
          <Card>
            {classStudents.length > 0 ? (
              <Row gutter={[16, 16]}>
                {classStudents.map(student => (
                  <Col span={8} key={student.id}>
                    <Card
                      hoverable
                      onClick={() => {
                        // TODO: Open student details drawer
                        console.log('Open student details:', student);
                      }}
                    >
                      <Space>
                        {student.photoPublicId ? (
                          <AdvancedImage
                            cldImg={getCloudinaryImage(student.photoPublicId)}
                            style={{ width: 40, height: 40, borderRadius: '50%' }}
                          />
                        ) : (
                          <UserOutlined style={{ fontSize: 24 }} />
                        )}
                        <div>
                          <div>{student.name}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            Roll No: {student.rollNumber}
                          </div>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="No students in this class" />
            )}
          </Card>
        </TabPane>
      </Tabs>
    </Drawer>
  );
};

export default ClassDetailsDrawer; 
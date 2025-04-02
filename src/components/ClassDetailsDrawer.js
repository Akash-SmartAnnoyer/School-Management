import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Tabs, Card, Row, Col, Statistic, Empty, Tag, Button, Space, Avatar, Table } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { getCloudinaryImage } from '../services/imageService';
import api from '../services/api';

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
      loadClassStudents();
    }
  }, [classInfo?.id]);

  const loadClassStudents = async () => {
    try {
      setLoading(true);
      const response = await api.student.getByClass(classInfo.id);
      const filteredStudents = response.data.data.filter(student => 
        student.status === 'Active'
      );
      setClassStudents(filteredStudents);
    } catch (error) {
      console.error('Error loading class students:', error);
    } finally {
      setLoading(false);
    }
  };

  const classTeacher = teachers.find(t => t.id === classInfo?.teacherId);

  return (
    <Drawer
      title="Class Details"
      placement="right"
      onClose={onClose}
      open={visible}
      width={800}
    >
      {classInfo ? (
        <div>
          <Descriptions bordered>
            <Descriptions.Item label="Class Name">{classInfo.className}</Descriptions.Item>
            <Descriptions.Item label="Section">{classInfo.section}</Descriptions.Item>
            <Descriptions.Item label="Grade Level">{classInfo.gradeLevel}</Descriptions.Item>
            <Descriptions.Item label="Academic Year">{classInfo.academicYear}</Descriptions.Item>
            <Descriptions.Item label="Class Teacher">
              {classTeacher ? (
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <span>{classTeacher.name}</span>
                </Space>
              ) : (
                'Not Assigned'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Total Students">{classStudents.length}</Descriptions.Item>
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
              <Table
                dataSource={classStudents}
                columns={[
                  {
                    title: 'Name',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text, record) => (
                      <Space>
                        <Avatar icon={<UserOutlined />} />
                        <span>{text}</span>
                      </Space>
                    ),
                  },
                  {
                    title: 'Roll Number',
                    dataIndex: 'rollNumber',
                    key: 'rollNumber',
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => (
                      <Tag color={status === 'Active' ? 'green' : 'red'}>
                        {status}
                      </Tag>
                    ),
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
                  Subjects
                </span>
              } 
              key="2"
            >
              <Row gutter={[16, 16]}>
                {classInfo.subjects?.map(subject => (
                  <Col span={8} key={subject.id}>
                    <Card size="small">
                      <Statistic
                        title={subject.name}
                        value={subject.code}
                        prefix={<BookOutlined />}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>
          </Tabs>
        </div>
      ) : (
        <Empty description="No class information available" />
      )}
    </Drawer>
  );
};

export default ClassDetailsDrawer; 
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

const ClassDetailsDrawer = ({ visible, onClose, classData }) => {
  const [loading, setLoading] = useState(true);
  const [classDetails, setClassDetails] = useState(null);

  useEffect(() => {
    if (classData?.id) {
      loadClassDetails();
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

  return (
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
              <Table
                dataSource={classDetails.students}
                columns={[
                  {
                    title: 'Name',
                    dataIndex: ['user', 'first_name'],
                    key: 'name',
                    render: (_, record) => (
                      <Space>
                        <Avatar icon={<UserOutlined />} />
                        <span>{`${record.user.first_name} ${record.user.last_name}`}</span>
                      </Space>
                    ),
                  },
                  {
                    title: 'Email',
                    dataIndex: ['user', 'email'],
                    key: 'email',
                  },
                  {
                    title: 'Phone',
                    dataIndex: ['user', 'phone'],
                    key: 'phone',
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
  );
};

export default ClassDetailsDrawer; 
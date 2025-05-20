import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Tabs, Card, Row, Col, Statistic, Empty, Tag, Button, Space, Avatar, Table, Modal, Select, message, Typography } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { getCloudinaryImage } from '../services/imageService';
import api from '../services/api';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title } = Typography;

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
        title={
          <Space>
            <BookOutlined style={{ color: '#7B83EB', fontSize: '20px' }} />
            <Title level={4} style={{ margin: 0, color: '#7B83EB' }}>Class Details</Title>
          </Space>
        }
        placement="right"
        onClose={onClose}
        open={visible}
        width={720}
        loading={loadingClassDetails || loadingStudents}
        styles={{
          header: {
            padding: '16px 24px',
            borderBottom: '1px solid #f0f0f0',
            background: '#ffffff'
          },
          body: {
            padding: '24px',
            background: '#ffffff'
          }
        }}
      >
        {loadingClassDetails || loadingStudents ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading...
          </div>
        ) : (
          <>
            <Card 
              className="class-info-card"
              style={{ 
                marginBottom: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <Row gutter={[24, 24]}>
                <Col span={12}>
                  <Statistic
                    title="Total Students"
                    value={classDetails?.total_students}
                    prefix={<TeamOutlined style={{ color: '#7B83EB' }} />}
                    valueStyle={{ color: '#7B83EB' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Available Seats"
                    value={classDetails?.available_seats}
                    prefix={<TeamOutlined style={{ color: '#7B83EB' }} />}
                    valueStyle={{ color: '#7B83EB' }}
                  />
                </Col>
              </Row>
            </Card>

            <Descriptions 
              title={
                <Space>
                  <BookOutlined style={{ color: '#7B83EB' }} />
                  <span style={{ color: '#595959', fontWeight: 500 }}>Class Information</span>
                </Space>
              } 
              bordered
              column={2}
              style={{ marginBottom: '24px' }}
            >
              <Descriptions.Item label="Class Name" labelStyle={{ fontWeight: 500 }}>{classDetails?.class_name}</Descriptions.Item>
              <Descriptions.Item label="Section" labelStyle={{ fontWeight: 500 }}>
                <Tag 
                  style={{ 
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    background: '#f5f5f5',
                    color: '#595959',
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  Section {classDetails?.section}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Teacher" labelStyle={{ fontWeight: 500 }}>
                {classDetails?.class_teacher ? (
                  <Space>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#7B83EB' }} />
                    <span>{`${classDetails.class_teacher.user.first_name} ${classDetails.class_teacher.user.last_name}`}</span>
                  </Space>
                ) : (
                  <Tag color="red">Not Assigned</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Capacity" labelStyle={{ fontWeight: 500 }}>{classDetails?.capacity}</Descriptions.Item>
              <Descriptions.Item label="Status" labelStyle={{ fontWeight: 500 }}>
                <Tag 
                  style={{ 
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    background: '#f5f5f5',
                    color: classDetails?.status === 'active' ? '#73d13d' : '#ffa940',
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: '24px',
                    lineHeight: '1'
                  }}
                >
                  {classDetails?.status === 'active' ? (
                    <CheckCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#73d13d' }} />
                  ) : (
                    <CloseCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#ffa940' }} />
                  )}
                  {classDetails?.status?.charAt(0).toUpperCase() + classDetails?.status?.slice(1)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Tabs 
              defaultActiveKey="1" 
              style={{ marginTop: 24 }}
              items={[
                {
                  key: '1',
                  label: (
                    <Space>
                      <TeamOutlined style={{ color: '#7B83EB' }} />
                      <span>Students</span>
                    </Space>
                  ),
                  children: (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />} 
                          onClick={() => setAddStudentsModalVisible(true)}
                          disabled={classDetails?.available_seats === 0}
                          style={{
                            background: '#7B83EB',
                            borderColor: '#7B83EB',
                            borderRadius: '6px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
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
                                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#7B83EB' }} />
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
                        style={{
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid #f0f0f0'
                        }}
                        locale={{
                          emptyText: (
                            <Empty
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                              description="No students found"
                              style={{ padding: '20px 0' }}
                            />
                          )
                        }}
                      />
                    </>
                  )
                },
                {
                  key: '2',
                  label: (
                    <Space>
                      <BookOutlined style={{ color: '#7B83EB' }} />
                      <span>Teacher Details</span>
                    </Space>
                  ),
                  children: classDetails?.class_teacher ? (
                    <Card
                      style={{
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                    >
                      <Descriptions column={1}>
                        <Descriptions.Item label="Name" labelStyle={{ fontWeight: 500 }}>
                          <Space>
                            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#7B83EB' }} />
                            <span>{`${classDetails.class_teacher.user.first_name} ${classDetails.class_teacher.user.last_name}`}</span>
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Email" labelStyle={{ fontWeight: 500 }}>
                          {classDetails.class_teacher.user.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phone" labelStyle={{ fontWeight: 500 }}>
                          {classDetails.class_teacher.user.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Qualification" labelStyle={{ fontWeight: 500 }}>
                          {classDetails.class_teacher.qualification}
                        </Descriptions.Item>
                        <Descriptions.Item label="Specialization" labelStyle={{ fontWeight: 500 }}>
                          {classDetails.class_teacher.specialization}
                        </Descriptions.Item>
                        <Descriptions.Item label="Subject" labelStyle={{ fontWeight: 500 }}>
                          {classDetails.class_teacher.subject}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  ) : (
                    <Empty description="No teacher assigned" />
                  )
                }
              ]}
            />
          </>
        )}
      </Drawer>

      <Modal
        title={
          <Space>
            <TeamOutlined style={{ color: '#7B83EB' }} />
            <span style={{ color: '#595959', fontWeight: 500 }}>Add Students to Class</span>
          </Space>
        }
        open={addStudentsModalVisible}
        onCancel={() => {
          setAddStudentsModalVisible(false);
          setSelectedStudents([]);
        }}
        onOk={handleAddStudents}
        confirmLoading={loadingClassDetails}
        okText="Add Students"
        okButtonProps={{
          style: {
            background: '#7B83EB',
            borderColor: '#7B83EB'
          }
        }}
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
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#7B83EB' }} />
                <span>{getStudentName(student)}</span>
                <span style={{ color: '#999' }}>({getStudentEmail(student)})</span>
              </Space>
            </Option>
          ))}
        </Select>
        <div style={{ marginTop: 16 }}>
          <Tag 
            style={{ 
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              background: '#f5f5f5',
              color: '#595959',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            Available Seats: {classDetails?.available_seats || 0}
          </Tag>
          <Tag 
            style={{ 
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              background: '#f5f5f5',
              color: '#595959',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              marginLeft: '8px'
            }}
          >
            Selected Students: {selectedStudents.length}
          </Tag>
        </div>
      </Modal>

      <style>
        {`
          .class-info-card .ant-statistic-title {
            color: #595959;
            font-weight: 500;
          }

          .ant-drawer-header {
            border-bottom: 1px solid #f0f0f0;
            padding: 16px 24px;
          }

          .ant-drawer-title {
            color: #7B83EB;
            font-weight: 500;
          }

          .ant-drawer-close {
            color: #7B83EB;
          }

          .ant-drawer-close:hover {
            color: #8ba1d1;
          }

          .ant-tabs-tab {
            padding: 12px 16px;
          }

          .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #7B83EB;
          }

          .ant-tabs-ink-bar {
            background: #7B83EB;
          }

          .ant-table-thead > tr > th {
            background: rgba(123, 131, 235, 0.1) !important;
            color: #7B83EB !important;
            font-weight: 600;
            border-bottom: 1px solid #f0f0f0;
            padding: 12px 16px !important;
          }

          .ant-table-tbody > tr > td {
            padding: 12px 16px !important;
            border-bottom: 1px solid #f0f0f0;
          }

          .ant-descriptions-item-label {
            color: #595959;
            font-weight: 500;
          }

          .ant-descriptions-item-content {
            color: #595959;
          }

          .ant-select-focused .ant-select-selector,
          .ant-select-selector:hover {
            border-color: #7B83EB !important;
          }

          .ant-select-item-option-selected {
            background-color: rgba(123, 131, 235, 0.1) !important;
          }

          .ant-select-item-option-active {
            background-color: rgba(123, 131, 235, 0.05) !important;
          }
        `}
      </style>
    </>
  );
};

export default ClassDetailsDrawer; 
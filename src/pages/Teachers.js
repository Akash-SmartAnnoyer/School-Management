import React, { useState, useEffect, useContext } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Upload,
  Avatar,
  message,
  Input as AntInput,
  Divider,
  DatePicker,
  Row,
  Col,
  Card,
  Typography,
  Tooltip,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UploadOutlined, 
  UserOutlined, 
  SearchOutlined,
  CameraOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  BookOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  HeartOutlined,
  InfoCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { uploadImage, getCloudinaryImage } from '../services/imageService';
import TeacherDetailsDrawer from '../components/TeacherDetailsDrawer';
import { MessageContext } from '../App';
import moment from 'moment';
import api from '../services/api';

const { Option } = Select;
const { Search } = AntInput;
const { Title } = Typography;

const Teachers = () => {
  const messageApi = useContext(MessageContext);
  const [teachers, setTeachers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [tempImage, setTempImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (isModalVisible) {
      loadClasses();
    }
  }, [isModalVisible]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.teacher.getAll();
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      messageApi.error('Failed to load teachers');
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await api.class.getClasses();
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      message.error('Failed to load classes');
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleAdd = () => {
    setEditingTeacher(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTeacher(record);
    const formValues = {
      ...record,
      dateOfBirth: record.dateOfBirth ? moment(record.dateOfBirth) : null,
      joiningDate: record.joiningDate ? moment(record.joiningDate) : null
    };
    form.setFieldsValue(formValues);
    setIsModalVisible(true);
  };

  const handleDelete = async (teacherId) => {
    try {
      setLoading(true);
      const response = await api.teacher.deleteTeacher(teacherId);
      if (response.data.success) {
        messageApi.success('Teacher deleted successfully');
        loadTeachers();
      }
    } catch (error) {
      messageApi.error('Failed to delete teacher');
      console.error('Error deleting teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        dob: values.dob?.format('YYYY-MM-DD'),
        role: 'teacher',
        password: values.password,
        confirm_password: values.confirm_password,
        profile: {
          address: values.address,
          blood_group: values.blood_group,
          class_name: values.class_name || 'NA',
          nationality: values.nationality
        },
        teacher_profile: {
          employee_id: values.employee_id,
          joining_date: values.joining_date?.format('YYYY-MM-DD'),
          qualification: values.qualification,
          specialization: values.specialization,
          status: values.status,
          subject: values.subject,
          years_of_experience: values.years_of_experience
        }
      };

      let response;
      if (editingTeacher) {
        response = await api.teacher.updateTeacher(editingTeacher.id, payload);
      } else {
        response = await api.teacher.createTeacher(payload);
      }

      // Check if response is valid JSON
      if (typeof response === 'object' && response !== null) {
        if (response.status === 200 || response.status === 201) {
          messageApi.success(editingTeacher ? 'Teacher updated successfully' : 'Teacher added successfully');
          setIsModalVisible(false);
          loadTeachers();
        } else {
          throw new Error(response.data?.message || 'Failed to save teacher');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error saving teacher:', error);
      // Safely check for error message
      const errorMessage = error?.message || '';
      if (errorMessage && typeof errorMessage === 'string' && errorMessage.includes('<!doctype')) {
        messageApi.error('Server error occurred. Please try again later.');
      } else {
        messageApi.error(errorMessage || (editingTeacher ? 'Failed to update teacher' : 'Failed to add teacher'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file, teacherId) => {
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

      const result = await uploadImage(file);
      
      const response = await api.teacher.updateTeacher(teacherId, {
        photoURL: result.url,
        updatedAt: new Date().toISOString()
      });

      if (response.data.success) {
        messageApi.success('Profile picture updated successfully');
        loadTeachers();
      }
      return false;
    } catch (error) {
      console.error('Profile picture upload error:', error);
      messageApi.error('Failed to upload profile picture');
      return false;
    }
  };

  const columns = [
    {
      title: 'Photo',
      dataIndex: 'photoURL',
      key: 'photo',
      width: 80,
      render: (photoURL, record) => (
        <Upload
          name="photo"
          showUploadList={false}
          beforeUpload={(file) => handleImageUpload(file, record.id)}
          accept="image/*"
        >
          <Avatar
            size={40}
            src={photoURL ? getCloudinaryImage(photoURL) : null}
            icon={!photoURL && <UserOutlined />}
          />
        </Upload>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Button type="link" onClick={() => {
          setSelectedTeacher(record);
          setDrawerVisible(true);
        }}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Qualification',
      dataIndex: 'qualification',
      key: 'qualification',
    },
    {
      title: 'Class',
      dataIndex: 'classId',
      key: 'classId',
      render: (classId) => {
        if (!classId) return 'Not Assigned';
        const classInfo = classes.find(c => c.id === classId);
        return classInfo ? `${classInfo.className} - Section ${classInfo.section}` : '-';
      },
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
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Upload Photo">
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                handleImageUpload(file, record.id);
                return false;
              }}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} size="small" />
            </Upload>
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredTeachers = teachers.filter(teacher =>
    (teacher.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (teacher.subject?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (teacher.email?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2}>Teachers</Title>
        </Col>
        <Col>
          <Space>
            <Input.Search
              placeholder="Search teachers..."
              allowClear
              onSearch={setSearchText}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add Teacher
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredTeachers}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                description="No teachers found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <IdcardOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
            <Typography.Title level={5} style={{ margin: 0 }}>
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </Typography.Title>
          </Space>
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setTempImage(null);
        }}
        width={900}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col span={8}>
              <Card 
                style={{ 
                  textAlign: 'center',
                  background: '#fafafa',
                  border: '1px dashed #d9d9d9',
                  borderRadius: '8px',
                  padding: '20px'
                }}
              >
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => {
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
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                      setTempImage(reader.result);
                    };
                    return false;
                  }}
                  accept="image/*"
                  maxCount={1}
                >
                  <div style={{ cursor: 'pointer' }}>
                    {(tempImage || editingTeacher?.photoURL) ? (
                      <img 
                        src={tempImage || editingTeacher.photoURL}
                        alt="Teacher"
                        style={{ 
                          width: 150, 
                          height: 150, 
                          borderRadius: '50%', 
                          objectFit: 'cover',
                          border: '4px solid #fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    ) : (
                      <Avatar
                        size={150}
                        icon={<CameraOutlined style={{ fontSize: '40px' }} />}
                        style={{ 
                          backgroundColor: '#f0f2f5',
                          border: '2px dashed #d9d9d9'
                        }}
                      />
                    )}
                    <div style={{ marginTop: '10px', color: '#666' }}>
                      <CameraOutlined /> Click to upload photo
                    </div>
                  </div>
                </Upload>
              </Card>
            </Col>
            <Col span={16}>
              <Card 
                title={
                  <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <span>Personal Information</span>
                  </Space>
                }
                style={{ marginBottom: '16px' }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="first_name"
                      label="First Name"
                      rules={[{ required: true, message: 'Please input first name!' }]}
                    >
                      <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="last_name"
                      label="Last Name"
                      rules={[{ required: true, message: 'Please input last name!' }]}
                    >
                      <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Please input email!' },
                        { type: 'email', message: 'Please enter a valid email!' }
                      ]}
                    >
                      <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label="Phone"
                      rules={[{ required: true, message: 'Please input phone number!' }]}
                    >
                      <Input prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[
                        { required: !editingTeacher, message: 'Please input password!' },
                        { min: 6, message: 'Password must be at least 6 characters!' }
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="confirm_password"
                      label="Confirm Password"
                      dependencies={['password']}
                      rules={[
                        { required: !editingTeacher, message: 'Please confirm password!' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('The two passwords do not match!'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="gender"
                      label="Gender"
                      rules={[{ required: true, message: 'Please select gender!' }]}
                    >
                      <Select>
                        <Option value="M">Male</Option>
                        <Option value="F">Female</Option>
                        <Option value="O">Other</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="dob"
                      label="Date of Birth"
                      rules={[{ required: true, message: 'Please select date of birth!' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="blood_group"
                      label="Blood Group"
                      rules={[{ required: true, message: 'Please select blood group!' }]}
                    >
                      <Select>
                        <Option value="A+">A+</Option>
                        <Option value="A-">A-</Option>
                        <Option value="B+">B+</Option>
                        <Option value="B-">B-</Option>
                        <Option value="AB+">AB+</Option>
                        <Option value="AB-">AB-</Option>
                        <Option value="O+">O+</Option>
                        <Option value="O-">O-</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="nationality"
                      label="Nationality"
                      rules={[{ required: true, message: 'Please input nationality!' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card 
                title={
                  <Space>
                    <PhoneOutlined style={{ color: '#1890ff' }} />
                    <span>Contact Information</span>
                  </Space>
                }
                style={{ marginBottom: '16px' }}
              >
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ required: true, message: 'Please input address!' }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Card>

              <Card 
                title={
                  <Space>
                    <BookOutlined style={{ color: '#1890ff' }} />
                    <span>Professional Information</span>
                  </Space>
                }
                style={{ marginBottom: '16px' }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="employee_id"
                      label="Employee ID"
                      rules={[{ required: true, message: 'Please input employee ID!' }]}
                    >
                      <Input prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="joining_date"
                      label="Joining Date"
                      rules={[{ required: true, message: 'Please select joining date!' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="qualification"
                      label="Qualification"
                      rules={[{ required: true, message: 'Please input qualification!' }]}
                    >
                      <Input prefix={<SafetyCertificateOutlined style={{ color: '#bfbfbf' }} />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="specialization"
                      label="Specialization"
                      rules={[{ required: true, message: 'Please input specialization!' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="subject"
                      label="Subject"
                      rules={[{ required: true, message: 'Please select subject!' }]}
                    >
                      <Select>
                        <Option value="Mathematics">Mathematics</Option>
                        <Option value="Science">Science</Option>
                        <Option value="English">English</Option>
                        <Option value="History">History</Option>
                        <Option value="Geography">Geography</Option>
                        <Option value="Computer Science">Computer Science</Option>
                        <Option value="Physical Education">Physical Education</Option>
                        <Option value="Art">Art</Option>
                        <Option value="Music">Music</Option>
                        <Option value="Languages">Languages</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="years_of_experience"
                      label="Years of Experience"
                      rules={[{ required: true, message: 'Please input years of experience!' }]}
                    >
                      <Input type="number" min={0} step={0.5} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status!' }]}
                >
                  <Select>
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Card>

              <Card 
                title={
                  <Space>
                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                    <span>Additional Information</span>
                  </Space>
                }
              >
                <Form.Item
                  name="medicalConditions"
                  label="Medical Conditions"
                >
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>

      <TeacherDetailsDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        teacher={selectedTeacher}
      />
    </div>
  );
};

export default Teachers; 
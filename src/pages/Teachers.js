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
  Empty,
  Popconfirm,
  Checkbox
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
  LoadingOutlined,
  SwapOutlined,
  DeleteFilled
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
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkStatusModalVisible, setBulkStatusModalVisible] = useState(false);
  const [bulkStatusForm] = Form.useForm();

  useEffect(() => {
    loadTeachers();
    loadClasses();
    loadSubjects();
  }, []);

  useEffect(() => {
    if (isModalVisible) {
      loadClasses();
      if (editingTeacher) {
        // Format the initial values for the form
        const formattedValues = {
          ...editingTeacher,
          dob: editingTeacher.dob ? moment(editingTeacher.dob) : null,
          joining_date: editingTeacher.joining_date ? moment(editingTeacher.joining_date) : null
        };
        form.setFieldsValue(formattedValues);
      } else {
        form.resetFields();
      }
    }
  }, [isModalVisible, editingTeacher]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.teacher.getTeachers();
      if (response.success) {
        setTeachers(response.data);
      } else {
        messageApi.error('Failed to load teachers');
      }
    } catch (error) {
      messageApi.error(error.message || 'Failed to load teachers');
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
        console.log('Loaded classes:', response.data.data);
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      message.error('Failed to load classes');
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await api.subject.getSubjects();
      if (response.data) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      message.error('Failed to load subjects');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleAdd = () => {
    setEditingTeacher(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = async (teacher) => {
    try {
      setLoading(true);
      // Fetch the latest teacher data
      const response = await api.teacher.getTeacher(teacher.user_id);
      if (response.data) {
        const teacherData = response.data;
        // Format the teacher data for the form
        const formValues = {
          first_name: teacherData.first_name,
          last_name: teacherData.last_name,
          email: teacherData.email,
          phone: teacherData.phone,
          gender: teacherData.gender,
          dob: teacherData.dob ? moment(teacherData.dob) : null,
          // Profile data
          address: teacherData.profile?.address,
          blood_group: teacherData.profile?.blood_group,
          nationality: teacherData.profile?.nationality,
          // Teacher profile data
          employee_id: teacherData.teacher_profile?.employee_id,
          joining_date: teacherData.teacher_profile?.joining_date ? moment(teacherData.teacher_profile.joining_date) : null,
          qualification: teacherData.teacher_profile?.qualification,
          specialization: teacherData.teacher_profile?.specialization,
          status: teacherData.teacher_profile?.status,
          subject: teacherData.teacher_profile?.subject,
          years_of_experience: teacherData.teacher_profile?.years_of_experience
        };
        
        // Set the editing teacher and show the modal
        setEditingTeacher({
          ...formValues,
          id: teacher.user_id // Make sure we have the user_id for the update
        });
        
        // Set form values directly
        form.setFieldsValue(formValues);
        setIsModalVisible(true);
      } else {
        messageApi.error('Failed to load teacher data');
      }
    } catch (error) {
      messageApi.error(error.message || 'Failed to load teacher data');
      console.error('Error loading teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teacherId) => {
    if (!teacherId) {
      messageApi.error('Invalid teacher ID');
      return;
    }

    try {
      setLoading(true);
      const response = await api.teacher.deleteTeacher(teacherId);
      
      if (response.status === 204) {
        messageApi.success('Teacher deleted successfully');
        loadTeachers();
      } else if (response.status === 403) {
        if (response.data?.detail === 'You do not have permission to perform this action.') {
          messageApi.error('You do not have permission to delete this teacher');
        } else if (response.data?.detail === 'Authentication credentials were not provided.') {
          messageApi.error('Please login again to perform this action');
        } else if (response.data?.code === 'token_not_valid') {
          messageApi.error('Your session has expired. Please login again');
        }
      } else if (response.status === 404) {
        messageApi.error('Teacher not found');
      } else {
        messageApi.error(response.data?.message || 'Failed to delete teacher');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      messageApi.error(error.message || 'Failed to delete teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (editingTeacher) {
        // Initialize update data with only changed fields
        const updateData = {};
        
        // Compare and add changed basic fields
        if (values.first_name !== editingTeacher.first_name) {
          updateData.first_name = values.first_name;
        }
        if (values.last_name !== editingTeacher.last_name) {
          updateData.last_name = values.last_name;
        }
        if (values.email !== editingTeacher.email) {
          updateData.email = values.email;
        }
        if (values.phone !== editingTeacher.phone) {
          updateData.phone = values.phone;
        }
        if (values.gender !== editingTeacher.gender) {
          updateData.gender = values.gender;
        }
        if (values.dob?.format('YYYY-MM-DD') !== editingTeacher.dob?.format('YYYY-MM-DD')) {
          updateData.dob = values.dob?.format('YYYY-MM-DD');
        }
        
        // Compare and add changed profile fields
        const profileChanges = {};
        if (values.address !== editingTeacher.address) {
          profileChanges.address = values.address;
        }
        if (values.blood_group !== editingTeacher.blood_group) {
          profileChanges.blood_group = values.blood_group;
        }
        if (values.nationality !== editingTeacher.nationality) {
          profileChanges.nationality = values.nationality;
        }
        if (Object.keys(profileChanges).length > 0) {
          updateData.profile = profileChanges;
        }
        
        // Compare and add changed teacher profile fields
        const teacherProfileChanges = {};
        if (values.employee_id !== editingTeacher.employee_id) {
          teacherProfileChanges.employee_id = values.employee_id;
        }
        if (values.joining_date?.format('YYYY-MM-DD') !== editingTeacher.joining_date?.format('YYYY-MM-DD')) {
          teacherProfileChanges.joining_date = values.joining_date?.format('YYYY-MM-DD');
        }
        if (values.qualification !== editingTeacher.qualification) {
          teacherProfileChanges.qualification = values.qualification;
        }
        if (values.specialization !== editingTeacher.specialization) {
          teacherProfileChanges.specialization = values.specialization;
        }
        if (values.status !== editingTeacher.status) {
          teacherProfileChanges.status = values.status;
        }
        if (values.subject !== editingTeacher.subject) {
          teacherProfileChanges.subject = values.subject;
        }
        if (values.years_of_experience !== editingTeacher.years_of_experience) {
          teacherProfileChanges.years_of_experience = values.years_of_experience;
        }
        if (Object.keys(teacherProfileChanges).length > 0) {
          updateData.teacher_profile = teacherProfileChanges;
        }

        // Only send update request if there are changes
        if (Object.keys(updateData).length > 0) {
          console.log('Update payload:', updateData); // Debug log to see what's being sent
          const response = await api.teacher.updateTeacher(editingTeacher.id, updateData);
          if (response.status === 200) {
            messageApi.success('Teacher updated successfully');
            setIsModalVisible(false);
            setLoading(true); // Keep loading state while refreshing the list
            await loadTeachers(); // Wait for the list to refresh
          }
        } else {
          messageApi.info('No changes detected');
          setIsModalVisible(false);
          return;
        }
      } else {
        // Format the data for create
        const createData = {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
          gender: values.gender,
          dob: values.dob.format('YYYY-MM-DD'),
          role: 'teacher',
          password: values.password,
          confirm_password: values.confirm_password,
          profile: {
            address: values.address,
            blood_group: values.blood_group,
            nationality: values.nationality
          },
          teacher_profile: {
            employee_id: values.employee_id,
            joining_date: values.joining_date.format('YYYY-MM-DD'),
            qualification: values.qualification,
            specialization: values.specialization,
            status: values.status,
            subject: values.subject,
            years_of_experience: values.years_of_experience
          }
        };

        const response = await api.teacher.createTeacher(createData);
        if (response.status === 201) {
          messageApi.success('Teacher added successfully');
          setIsModalVisible(false);
          loadTeachers();
        }
      }
    } catch (error) {
      console.error('Error saving teacher:', error);
      
      if (error.response?.status === 400) {
        const errors = error.response.data;
        
        // Function to recursively handle nested errors
        const handleNestedErrors = (errorObj, prefix = '') => {
          Object.entries(errorObj).forEach(([field, value]) => {
            if (Array.isArray(value)) {
              // Handle array of error messages
              value.forEach(message => {
                const errorField = prefix ? `${prefix}.${field}` : field;
                messageApi.error(`${errorField}: ${message}`);
              });
            } else if (typeof value === 'object' && value !== null) {
              // Handle nested objects (like teacher_profile)
              handleNestedErrors(value, field);
            }
          });
        };

        // Handle all errors including nested ones
        handleNestedErrors(errors);

      } else if (error.response?.status === 401) {
        messageApi.error('Unauthorized. Please login again.');
      } else if (error.response?.status === 403) {
        messageApi.error('You do not have permission to perform this action.');
      } else if (error.response?.status === 404) {
        messageApi.error('Resource not found.');
      } else if (error.response?.status === 409) {
        messageApi.error('Conflict detected. Please check the data and try again.');
      } else if (error.response?.status >= 500) {
        messageApi.error('Server error. Please try again later.');
      } else if (!error.response && error.request) {
        // The request was made but no response was received
        messageApi.error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        messageApi.error(error.message || 'An error occurred while saving the teacher.');
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

  const handleBulkStatusChange = async () => {
    try {
      const values = await bulkStatusForm.validateFields();
      console.log('Bulk status change for teachers:', {
        ids: selectedRowKeys,
        status: values.status
      });
      // TODO: Implement bulk status change API
      messageApi.success('Status update simulated for selected teachers');
      setBulkStatusModalVisible(false);
      setSelectedRowKeys([]);
    } catch (error) {
      messageApi.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      console.log('Bulk delete for teachers:', {
        ids: selectedRowKeys
      });
      // TODO: Implement bulk delete API
      messageApi.success('Delete simulated for selected teachers');
      setSelectedRowKeys([]);
    } catch (error) {
      messageApi.error('Failed to delete teachers');
      console.error('Error deleting teachers:', error);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
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
          beforeUpload={(file) => handleImageUpload(file, record.user_id)}
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
      dataIndex: 'class_id',
      key: 'class_id',
      render: (class_id, record) => {
        console.log('Rendering class for teacher:', record.name, 'class_id:', class_id);
        console.log('Available classes:', classes);
        if (!class_id) return 'Not Assigned';
        const classInfo = classes.find(c => c.id === class_id);
        console.log('Found class info:', classInfo);
        return classInfo ? `${classInfo.className} - Section ${classInfo.section}` : record.class || '-';
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
                handleImageUpload(file, record.user_id);
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
          <Popconfirm
            title="Are you sure you want to delete this teacher?"
            onConfirm={() => handleDelete(record.user_id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
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
    <div className="teachers-page" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '0', 
      overflow: 'hidden', 
      margin: '0',
      borderRadius: '16px',
      background: '#ffffff',
      boxShadow: '0 4px 20px rgba(159, 179, 223, 0.15)',
      border: '1px solid rgba(159, 179, 223, 0.2)'
    }}>
      <div className="teachers-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0',
        background: '#ffffff'
      }}>
        <Title level={3} className="page-title">
          <TeamOutlined className="title-icon" />
          Teachers
        </Title>
        <Space size="small">
          <Input.Search
            placeholder="Search teachers..."
            allowClear
            onSearch={setSearchText}
            style={{ 
              width: 250,
              borderRadius: '6px',
              boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
              border: '1px solid rgba(159, 179, 223, 0.3)'
            }}
            prefix={<SearchOutlined style={{ color: '#7B83EB' }} />}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="add-teacher-btn"
          >
            Add Teacher
          </Button>
        </Space>
      </div>

      <div style={{ 
        flex: 1, 
        overflow: 'hidden',
        padding: '0 16px 16px 16px'
      }}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredTeachers}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
          className="teachers-table"
          locale={{
            emptyText: (
              <Empty
                description="No teachers found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '20px 0' }}
              />
            ),
          }}
        />
      </div>

      {selectedRowKeys.length > 0 && (
        <div className="bulk-actions-bar">
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <span className="selected-count">{selectedRowKeys.length} teachers selected</span>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  onClick={() => setBulkStatusModalVisible(true)}
                  className="bulk-action-btn"
                  icon={<SwapOutlined />}
                >
                  Change Status
                </Button>
                <Popconfirm
                  title="Are you sure you want to delete selected teachers?"
                  onConfirm={handleBulkDelete}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button 
                    danger
                    className="bulk-delete-btn"
                    icon={<DeleteFilled />}
                  >
                    Delete Selected
                  </Button>
                </Popconfirm>
              </Space>
            </Col>
          </Row>
        </div>
      )}

      <Modal
        title={
          <Space>
            <UserOutlined className="modal-icon" />
            <Typography.Title level={5} className="modal-title">
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </Typography.Title>
          </Space>
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingTeacher(null);
        }}
        confirmLoading={loading}
        width={900}
        className="teacher-form-modal"
      >
        <Form
          form={form}
          layout="vertical"
          className="teacher-form"
        >
          <Row gutter={24}>
            <Col span={8}>
              <Card className="photo-upload-card">
                <Upload
                  name="photo"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={() => false}
                >
                  <div className="upload-placeholder">
                    <PlusOutlined />
                    <div>Upload Photo</div>
                  </div>
                </Upload>
              </Card>

              <Card 
                title={
                  <Space>
                    <UserOutlined className="card-icon" />
                    <span>Basic Information</span>
                  </Space>
                }
                className="info-card"
              >
                <Form.Item
                  name="first_name"
                  label="First Name"
                  rules={[{ required: true, message: 'Please input first name!' }]}
                >
                  <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
                </Form.Item>

                <Form.Item
                  name="last_name"
                  label="Last Name"
                  rules={[{ required: true, message: 'Please input last name!' }]}
                >
                  <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
                </Form.Item>

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

                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[{ required: true, message: 'Please input phone number!' }]}
                >
                  <Input prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} />
                </Form.Item>

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

                <Form.Item
                  name="dob"
                  label="DOB"
                  rules={[{ required: true, message: 'Please select date of birth!' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                {!editingTeacher && (
                  <>
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[
                        { required: true, message: 'Please input password!' },
                        { min: 6, message: 'Password must be at least 6 characters!' }
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item
                      name="confirm_password"
                      label="Confirm Password"
                      dependencies={['password']}
                      rules={[
                        { required: true, message: 'Please confirm password!' },
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
                  </>
                )}
              </Card>
            </Col>

            <Col span={16}>
              <Card 
                title={
                  <Space>
                    <BookOutlined className="card-icon" />
                    <span>Professional Information</span>
                  </Space>
                }
                className="info-card"
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
                      <Input />
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
                      rules={[{ required: true, message: 'Please input subject!' }]}
                    >
                      <Input />
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
                    <HomeOutlined className="card-icon" />
                    <span>Contact Information</span>
                  </Space>
                }
                className="info-card"
              >
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ required: true, message: 'Please input address!' }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="emergency_contact"
                      label="Emergency Contact"
                      rules={[{ required: true, message: 'Please input emergency contact!' }]}
                    >
                      <Input prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="emergency_contact_relation"
                      label="Relation"
                      rules={[{ required: true, message: 'Please input relation!' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card 
                title={
                  <Space>
                    <InfoCircleOutlined className="card-icon" />
                    <span>Additional Information</span>
                  </Space>
                }
                className="info-card"
              >
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
                      name="status"
                      label="Status"
                      rules={[{ required: true, message: 'Please select status!' }]}
                    >
                      <Select>
                        <Option value="Active">Active</Option>
                        <Option value="Inactive">Inactive</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="remarks"
                  label="Remarks"
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Change Status"
        open={bulkStatusModalVisible}
        onOk={handleBulkStatusChange}
        onCancel={() => setBulkStatusModalVisible(false)}
        confirmLoading={loading}
        className="status-modal"
      >
        <Form form={bulkStatusForm} layout="vertical">
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <TeacherDetailsDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        teacher={selectedTeacher}
      />

      <style>
        {`
          .teachers-page {
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 0;
            overflow: hidden;
            margin: 0;
            border-radius: 16px;
            background: #ffffff;
            box-shadow: 0 4px 20px rgba(159, 179, 223, 0.15);
            border: 1px solid rgba(159, 179, 223, 0.2);
          }

          .teachers-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            border-bottom: 1px solid #f0f0f0;
            background: #ffffff;
          }

          .page-title {
            margin: 0 !important;
            color: #7B83EB !important;
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 20px;
            font-weight: 600;
            padding-top: 2px;
          }

          .page-title .ant-typography {
            color: #7B83EB !important;
            margin: 0 !important;
          }

          .title-icon {
            font-size: 20px;
            color: #7B83EB;
          }

          .teachers-table {
            flex: 1;
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #f0f0f0;
            height: 100%;
          }

          .teachers-table .ant-table {
            border-radius: 8px;
            overflow: visible;
          }

          .teachers-table .ant-table-container {
            border-radius: 8px;
            overflow: visible;
          }

          .teachers-table .ant-table-body {
            overflow-y: auto !important;
            overflow-x: auto !important;
            margin-right: 1px;
          }

          .teachers-table .ant-spin-nested-loading {
            height: 100%;
          }

          .teachers-table .ant-spin-container {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .teachers-table .ant-table-placeholder {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .teachers-table .ant-spin {
            max-height: none;
          }

          .teachers-table .ant-spin-blur {
            opacity: 0.5;
            filter: blur(1px);
            pointer-events: none;
          }

          .teachers-table .ant-spin-blur::after {
            opacity: 0.4;
            background: #fff;
          }

          .teachers-table .ant-table-thead > tr > th {
            background: rgba(123, 131, 235, 0.1) !important;
            color: #7B83EB !important;
            font-weight: 600;
            border-bottom: 1px solid #f0f0f0;
            padding: 4px 12px !important;
            white-space: nowrap;
            height: 32px;
            line-height: 1.2;
            font-size: 13px;
          }

          .teachers-table .ant-table-tbody > tr > td {
            padding: 4px 12px !important;
            white-space: nowrap;
            border-bottom: 1px solid #f0f0f0;
            height: 32px;
            line-height: 1.2;
            font-size: 13px;
          }

          .teachers-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none;
          }

          .teachers-table .ant-table-cell {
            padding: 4px 12px !important;
          }

          .teachers-table .ant-table-cell .ant-tag {
            margin: 0;
            padding: 0 4px;
            font-size: 12px;
            height: 18px;
            line-height: 16px;
          }

          .teachers-table .ant-table-cell .ant-btn {
            padding: 0 4px;
            height: 22px;
            font-size: 12px;
          }

          .teachers-table .ant-table-pagination {
            margin: 16px 0 !important;
            padding: 8px 8px !important;
            height: 32px;
            border-top: 1px solid #f0f0f0;
            background: #ffffff;
          }

          .teachers-table .ant-pagination-item {
            min-width: 24px;
            height: 24px;
            line-height: 22px;
            font-size: 12px;
            margin: 0 4px;
          }

          .teachers-table .ant-pagination-prev .ant-pagination-item-link,
          .teachers-table .ant-pagination-next .ant-pagination-item-link {
            min-width: 24px;
            height: 24px;
            line-height: 22px;
            font-size: 12px;
          }

          .teachers-table .ant-pagination-options {
            margin-left: 8px;
          }

          .teachers-table .ant-pagination-options-size-changer {
            margin-right: 0;
          }

          .teachers-table .ant-select-selector {
            height: 24px !important;
            line-height: 22px !important;
            padding: 0 8px !important;
          }

          .teachers-table .ant-select-selection-item {
            line-height: 22px !important;
            font-size: 12px;
          }

          .add-teacher-btn {
            background: #7B83EB;
            border: none;
            display: flex;
            align-items: center;
            gap: 4px;
            height: 36px;
            padding: 0 16px;
            border-radius: 6px;
            color: white !important;
            font-weight: 500;
          }

          .add-teacher-btn:hover {
            background: #7B83EB;
            opacity: 0.9;
            color: white !important;
          }
          
          .add-teacher-btn .anticon {
            color: white;
            font-size: 16px;
          }

          .bulk-actions-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 12px 24px;
            background: white;
            border-top: 1px solid #7B83EB;
            box-shadow: 0 -2px 8px rgba(123, 131, 235, 0.2);
            z-index: 1000;
          }

          .selected-count {
            color: #7B83EB;
            font-weight: 500;
          }

          .bulk-action-btn {
            background: #7B83EB;
            border-color: #7B83EB;
          }

          .bulk-action-btn:hover {
            background: #7B83EB;
            border-color: #7B83EB;
            opacity: 0.9;
          }

          .bulk-delete-btn {
            background: #fff1f0;
            border-color: #ffa39e;
            color: #ff4d4f;
          }

          .bulk-delete-btn:hover {
            background: #ffccc7;
            border-color: #ff7875;
            color: #ff4d4f;
          }

          .teachers-table .ant-pagination-item-active {
            background: #7B83EB !important;
            border-color: #7B83EB !important;
          }

          .teachers-table .ant-pagination-item-active a {
            color: white !important;
          }

          .teachers-table .ant-pagination-item:hover {
            border-color: #7B83EB !important;
          }

          .teachers-table .ant-pagination-prev:hover .ant-pagination-item-link,
          .teachers-table .ant-pagination-next:hover .ant-pagination-item-link {
            border-color: #7B83EB !important;
            color: #7B83EB !important;
          }

          .teachers-table .ant-checkbox-wrapper:hover .ant-checkbox-inner,
          .teachers-table .ant-checkbox:hover .ant-checkbox-inner,
          .teachers-table .ant-checkbox-input:focus + .ant-checkbox-inner {
            border-color: #7B83EB !important;
          }

          .teachers-table .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #7B83EB !important;
            border-color: #7B83EB !important;
          }

          .teachers-table .ant-checkbox-indeterminate .ant-checkbox-inner::after {
            background-color: #7B83EB !important;
          }

          .teacher-form-modal .ant-modal-content {
            border-radius: 16px;
            overflow: hidden;
          }

          .teacher-form-modal .ant-modal-header {
            background: #fafafa;
            border-bottom: 1px solid #f0f0f0;
            padding: 16px 24px;
          }

          .teacher-form-modal .ant-modal-body {
            padding: 24px;
          }

          .teacher-form-modal .ant-modal-footer {
            border-top: 1px solid #f0f0f0;
            padding: 16px 24px;
          }

          .info-card {
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin-bottom: 16px;
          }

          .info-card .ant-card-head {
            border-bottom: 1px solid #f0f0f0;
            padding: 12px 16px;
          }

          .info-card .ant-card-head-title {
            padding: 0;
          }

          .card-icon {
            color: #7B83EB;
            font-size: 16px;
          }

          .modal-icon {
            color: #7B83EB;
            font-size: 20px;
          }

          .modal-title {
            margin: 0 !important;
            color: #262626 !important;
          }

          .photo-upload-card {
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin-bottom: 16px;
          }

          .upload-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #bfbfbf;
          }

          .upload-placeholder .anticon {
            font-size: 24px;
            margin-bottom: 8px;
          }
        `}
      </style>
    </div>
  );
};

export default Teachers; 
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
  Typography
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
  InfoCircleOutlined
} from '@ant-design/icons';
import { 
  addTeacher, 
  getTeachers, 
  updateTeacher, 
  deleteTeacher, 
  subscribeToCollection,
  getClasses,
  updateClass
} from '../firebase/services';
import { uploadImage, getCloudinaryImage } from '../services/imageService';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import TeacherDetailsDrawer from '../components/TeacherDetailsDrawer';
import { MessageContext } from '../App';
import moment from 'moment';

const { Option } = Select;
const { Search } = AntInput;

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dyr02bpil'
  }
});

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

  useEffect(() => {
    // Subscribe to real-time updates for teachers
    const unsubscribeTeachers = subscribeToCollection('teachers', (data) => {
      setTeachers(data);
    });

    // Subscribe to real-time updates for classes
    const unsubscribeClasses = subscribeToCollection('classes', (data) => {
      setClasses(data);
    });

    return () => {
      unsubscribeTeachers();
      unsubscribeClasses();
    };
  }, []);

  const handleAdd = () => {
    setEditingTeacher(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTeacher(record);
    // Convert ISO date strings to moment objects
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
      await deleteTeacher(teacherId);
      messageApi.success('Teacher deleted successfully');
    } catch (error) {
      messageApi.error('Error deleting teacher');
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

      const base64Image = await getBase64(file);
      
      if (teacherId === 'new') {
        // Store the image temporarily for new teacher
        setTempImage(base64Image);
        messageApi.success('Image ready to be saved with teacher details');
      } else {
        // Update existing teacher's image
        await updateTeacher(teacherId, {
          photoURL: base64Image,
          updatedAt: new Date().toISOString()
        });
        messageApi.success('Profile picture updated successfully');
      }
      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Profile picture upload error:', error);
      messageApi.error('Failed to upload profile picture');
      return false;
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Clean up the values object by removing undefined and empty string values
      const cleanValues = Object.entries(values).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      // Combine firstName and lastName into name
      const name = `${values.firstName || ''} ${values.lastName || ''}`.trim();

      // Convert moment objects to ISO strings
      const teacherData = {
        ...cleanValues,
        name, // Add the combined name field
        dateOfBirth: values.dateOfBirth?.toISOString(),
        joiningDate: values.joiningDate?.toISOString(),
        updatedAt: new Date().toISOString(),
        photoURL: tempImage || editingTeacher?.photoURL
      };

      if (editingTeacher) {
        // If class is being changed, update both the teacher and class records
        if (editingTeacher.classId !== values.classId) {
          // Clear teacherId from old class if it exists
          if (editingTeacher.classId) {
            const oldClass = classes.find(c => c.id === editingTeacher.classId);
            if (oldClass) {
              await updateClass(oldClass.id, { teacherId: null });
            }
          }
          
          // Set teacherId in new class if selected
          if (values.classId) {
            const newClass = classes.find(c => c.id === values.classId);
            if (newClass) {
              await updateClass(newClass.id, { teacherId: editingTeacher.id });
            }
          }
        }
        await updateTeacher(editingTeacher.id, teacherData);
        messageApi.success('Teacher updated successfully');
      } else {
        teacherData.createdAt = new Date().toISOString();
        const newTeacherRef = await addTeacher(teacherData);
        
        // If class is selected for new teacher, update the class's teacherId
        if (values.classId) {
          const selectedClass = classes.find(c => c.id === values.classId);
          if (selectedClass) {
            await updateClass(selectedClass.id, { teacherId: newTeacherRef.id });
          }
        }
        messageApi.success('Teacher added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      setTempImage(null);
    } catch (error) {
      console.error('Error saving teacher:', error);
      messageApi.error('Error saving teacher');
    }
  };

  const columns = [
    {
      title: 'Photo',
      dataIndex: 'photoURL',
      key: 'photo',
      width: 80,
      render: (photoURL, record) => {
        if (record.photoURL) {
          return (
            <img 
              src={record.photoURL}
              alt={record.name}
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
            />
          );
        }
        return (
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          />
        );
      },
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
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  // Add search filter function
  const filteredTeachers = teachers.filter(teacher =>
    (teacher.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (teacher.subject?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (teacher.email?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  return (
    <div>
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        gap: '16px'
      }}>
        <Search
          placeholder="Search teachers..."
          allowClear
          enterButton={<SearchOutlined />}
          size="small"
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
          size="small"
        >
          Add Teacher
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={filteredTeachers} 
        rowKey="id" 
      />

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
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setTempImage(null);
        }}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalOk}>
            {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'Active',
            ...editingTeacher,
            dateOfBirth: editingTeacher?.dateOfBirth ? moment(editingTeacher.dateOfBirth) : null,
            joiningDate: editingTeacher?.joiningDate ? moment(editingTeacher.joiningDate) : null
          }}
        >
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
                    handleImageUpload(file, editingTeacher?.id || 'new');
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
                      name="firstName"
                      label="First Name"
                      rules={[{ required: true, message: 'Please input first name!' }]}
                    >
                      <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="lastName"
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
                      name="dateOfBirth"
                      label="Date of Birth"
                      rules={[{ required: true, message: 'Please select date of birth!' }]}
                    >
                      <DatePicker 
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        placeholder="Select date"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="gender"
                      label="Gender"
                      rules={[{ required: true, message: 'Please select gender!' }]}
                    >
                      <Select>
                        <Option value="male">Male</Option>
                        <Option value="female">Female</Option>
                        <Option value="other">Other</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="nationality"
                      label="Nationality"
                      rules={[{ required: true, message: 'Please input nationality!' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="bloodGroup"
                      label="Blood Group"
                      rules={[{ required: true, message: 'Please select blood group!' }]}
                    >
                      <Select>
                        <Option value="A+">A+</Option>
                        <Option value="A-">A-</Option>
                        <Option value="B+">B+</Option>
                        <Option value="B-">B-</Option>
                        <Option value="O+">O+</Option>
                        <Option value="O-">O-</Option>
                        <Option value="AB+">AB+</Option>
                        <Option value="AB-">AB-</Option>
                      </Select>
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
                      label="Phone Number"
                      rules={[{ required: true, message: 'Please input phone number!' }]}
                    >
                      <Input prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ required: true, message: 'Please input address!' }]}
                >
                  <Input.TextArea 
                    rows={3} 
                    prefix={<HomeOutlined style={{ color: '#bfbfbf' }} />}
                  />
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
                      name="employeeId"
                      label="Employee ID"
                      rules={[{ required: true, message: 'Please input employee ID!' }]}
                    >
                      <Input prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="joiningDate"
                      label="Joining Date"
                      rules={[{ required: true, message: 'Please select joining date!' }]}
                    >
                      <DatePicker 
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        placeholder="Select date"
                      />
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
                        <Option value="Economics">Economics</Option>
                        <Option value="Business Studies">Business Studies</Option>
                        <Option value="Accountancy">Accountancy</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="qualification"
                      label="Qualification"
                      rules={[{ required: true, message: 'Please input qualification!' }]}
                    >
                      <Input prefix={<SafetyCertificateOutlined style={{ color: '#bfbfbf' }} />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="experience"
                      label="Years of Experience"
                      rules={[{ required: true, message: 'Please input years of experience!' }]}
                    >
                      <Input type="number" min={0} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="classId"
                      label="Assigned Class (Optional)"
                      rules={[{ required: false }]}
                    >
                      <Select allowClear>
                        <Option value="">Not Assigned</Option>
                        {classes
                          .filter(cls => cls.status === 'Active')
                          .map(cls => (
                            <Option key={cls.id} value={cls.id}>
                              {cls.className} - Section {cls.section}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="specialization"
                  label="Specialization"
                  rules={[{ required: true, message: 'Please input specialization!' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="previousSchools"
                  label="Previous Schools"
                >
                  <Input.TextArea rows={2} placeholder="List previous schools with years" />
                </Form.Item>
              </Card>

              <Card 
                title={
                  <Space>
                    <HeartOutlined style={{ color: '#1890ff' }} />
                    <span>Emergency Contact</span>
                  </Space>
                }
                style={{ marginBottom: '16px' }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="emergencyContactName"
                      label="Emergency Contact Name"
                      rules={[{ required: true, message: 'Please input emergency contact name!' }]}
                    >
                      <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="emergencyContactPhone"
                      label="Emergency Contact Phone"
                      rules={[{ required: true, message: 'Please input emergency contact phone!' }]}
                    >
                      <Input prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="emergencyContactRelation"
                  label="Relation with Teacher"
                  rules={[{ required: true, message: 'Please input relation with teacher!' }]}
                >
                  <Input />
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
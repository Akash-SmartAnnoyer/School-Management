import React, { useState, useEffect, useContext } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Upload,
  Avatar,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Input as AntInput,
  Divider,
  DatePicker,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UploadOutlined, 
  UserOutlined, 
  TeamOutlined, 
  BookOutlined, 
  SearchOutlined,
  CameraOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  HeartOutlined,
  InfoCircleOutlined,
  BankOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadImage, getCloudinaryImage } from '../services/imageService';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import StudentDetailsDrawer from '../components/StudentDetailsDrawer';
import { MessageContext } from '../App';
import { subscribeToCollection, getClasses, getTeachers } from '../firebase/services';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { message } from 'antd';
import { 
  addStudent, 
  getStudents, 
  updateStudent, 
  deleteStudent,
  getSectionsByClass
} from '../firebase/services';

const { Option } = Select;
const { Search } = AntInput;

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dyr02bpil'
  }
});

const StudentForm = ({ visible, onCancel, onSubmit, initialValues, onImageUpload }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    loadClasses();
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues]);

  const loadClasses = async () => {
    try {
      const classesData = await getClasses();
      setClasses(classesData);
    } catch (error) {
      message.error('Failed to load classes');
    }
  };

  const handleClassChange = async (classId) => {
    try {
      const sectionsData = await getSectionsByClass(classId);
      setSections(sectionsData);
      form.setFieldValue('section', undefined);
    } catch (error) {
      message.error('Failed to load sections');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await onSubmit(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error('Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <IdcardOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <Typography.Title level={5} style={{ margin: 0 }}>
            {initialValues ? "Edit Student" : "New Student Admission"}
          </Typography.Title>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: 'active',
          admissionDate: moment(),
          ...initialValues
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
                  onImageUpload(file, initialValues?.id || 'new');
                  return false;
                }}
                accept="image/*"
                maxCount={1}
              >
                <div style={{ cursor: 'pointer' }}>
                  {initialValues?.photoURL ? (
                    <img 
                      src={initialValues.photoURL}
                      alt="Student"
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
                  <IdcardOutlined style={{ color: '#1890ff' }} />
                  <span>Admission Details</span>
                </Space>
              }
              style={{ marginBottom: '16px' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="admissionNo"
                    label="Admission Number"
                    rules={[{ required: true, message: 'Please input admission number!' }]}
                  >
                    <Input prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="admissionDate"
                    label="Admission Date"
                    rules={[{ required: true, message: 'Please select admission date!' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

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
                    <DatePicker style={{ width: '100%' }} />
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
                <Col span={12}>
                  <Form.Item
                    name="nationality"
                    label="Nationality"
                    rules={[{ required: true, message: 'Please input nationality!' }]}
                  >
                    <Input prefix={<BankOutlined style={{ color: '#bfbfbf' }} />} />
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
                  <span>Academic Information</span>
                </Space>
              }
              style={{ marginBottom: '16px' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="class"
                    label="Class"
                    rules={[{ required: true, message: 'Please select class!' }]}
                  >
                    <Select onChange={handleClassChange}>
                      {classes.map(cls => (
                        <Option key={cls.id} value={cls.id}>{cls.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="section"
                    label="Section"
                    rules={[{ required: true, message: 'Please select section!' }]}
                  >
                    <Select>
                      {sections.map(section => (
                        <Option key={section.id} value={section.id}>{section.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="previousSchool"
                    label="Previous School"
                  >
                    <Input prefix={<BankOutlined style={{ color: '#bfbfbf' }} />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="lastGrade"
                    label="Last Grade Attended"
                  >
                    <Input prefix={<SafetyCertificateOutlined style={{ color: '#bfbfbf' }} />} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card 
              title={
                <Space>
                  <TeamOutlined style={{ color: '#1890ff' }} />
                  <span>Parent/Guardian Information</span>
                </Space>
              }
              style={{ marginBottom: '16px' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="fatherName"
                    label="Father's Name"
                    rules={[{ required: true, message: 'Please input father\'s name!' }]}
                  >
                    <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fatherOccupation"
                    label="Father's Occupation"
                  >
                    <Input prefix={<BankOutlined style={{ color: '#bfbfbf' }} />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="motherName"
                    label="Mother's Name"
                    rules={[{ required: true, message: 'Please input mother\'s name!' }]}
                  >
                    <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="motherOccupation"
                    label="Mother's Occupation"
                  >
                    <Input prefix={<BankOutlined style={{ color: '#bfbfbf' }} />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="parentEmail"
                    label="Parent's Email"
                    rules={[
                      { required: true, message: 'Please input parent\'s email!' },
                      { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                  >
                    <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="parentPhone"
                    label="Parent's Phone"
                    rules={[{ required: true, message: 'Please input parent\'s phone!' }]}
                  >
                    <Input prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="parentAddress"
                label="Parent's Address"
                rules={[{ required: true, message: 'Please input parent\'s address!' }]}
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
                label="Relation with Student"
                rules={[{ required: true, message: 'Please input relation with student!' }]}
              >
                <Input prefix={<TeamOutlined style={{ color: '#bfbfbf' }} />} />
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
                name="allergies"
                label="Allergies"
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item
                name="remarks"
                label="Remarks"
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button onClick={onCancel}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {initialValues ? 'Update' : 'Admit Student'}
                  </Button>
                </Space>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

const Students = () => {
  const messageApi = useContext(MessageContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingStudent, setEditingStudent] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(location.search);
    const viewId = params.get('view');
    const highlight = params.get('highlight') === 'true';

    if (viewId && highlight) {
      setHighlightedId(viewId);
      // Remove highlight parameter after 3 seconds
      const timer = setTimeout(() => {
        setHighlightedId(null);
        navigate(location.pathname + '?view=' + viewId, { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Subscribe to students collection
    const unsubscribeStudents = subscribeToCollection('students', (data) => {
      setStudents(data);
      setLoading(false);
    });

    // Subscribe to classes collection
    const unsubscribeClasses = subscribeToCollection('classes', (data) => {
      setClasses(data);
    });

    // Subscribe to teachers collection
    const unsubscribeTeachers = subscribeToCollection('teachers', (data) => {
      setTeachers(data);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeClasses();
      unsubscribeTeachers();
    };
  }, [location, navigate]);

  const handleAddStudent = () => {
    setEditingStudent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    form.setFieldsValue(student);
    setModalVisible(true);
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await deleteDoc(doc(db, 'students', studentId));
      messageApi.success('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      messageApi.error('Failed to delete student');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const studentData = {
        ...values,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingStudent) {
        await updateDoc(doc(db, 'students', editingStudent.id), studentData);
        messageApi.success('Student updated successfully');
      } else {
        await addDoc(collection(db, 'students'), studentData);
        messageApi.success('Student added successfully');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving student:', error);
      messageApi.error('Failed to save student');
    }
  };

  const handleImageUpload = async (file, studentId) => {
    let loadingMessage = null;
    try {
      loadingMessage = messageApi.loading('Uploading image...', 0);

      if (!file.type.startsWith('image/')) {
        messageApi.error('Please upload an image file');
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        messageApi.error('Image size should be less than 5MB');
        return false;
      }

      const { url, publicId } = await uploadImage(file);

      await updateDoc(doc(db, 'students', studentId), {
        photoURL: url,
        photoPublicId: publicId,
        updatedAt: new Date().toISOString()
      });

      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === studentId
            ? { ...student, photoURL: url, photoPublicId: publicId }
            : student
        )
      );

      messageApi.success('Image uploaded successfully');
      return true;
    } catch (error) {
      console.error('Error uploading image:', error);
      messageApi.error('Failed to upload image. Please try again.');
      return false;
    } finally {
      if (loadingMessage) {
        messageApi.destroy(loadingMessage);
      }
    }
  };

  const columns = [
    {
      title: 'Photo',
      dataIndex: 'photoPublicId',
      key: 'photo',
      width: 80,
      render: (photoPublicId, record) => {
        console.log('Student photo data:', {
          photoPublicId,
          photoURL: record.photoURL,
          record
        });
        
        if (photoPublicId) {
          const cldImg = getCloudinaryImage(photoPublicId);
          console.log('Cloudinary image:', cldImg);
          return (
            <AdvancedImage 
              cldImg={cldImg}
              style={{ width: 40, height: 40, borderRadius: '50%' }}
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
        <span style={{
          fontWeight: record.id === highlightedId ? 'bold' : 'normal',
          color: record.id === highlightedId ? '#1890ff' : 'inherit',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }} onClick={() => {
          setSelectedStudent(record);
          setDrawerVisible(true);
        }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Roll Number',
      dataIndex: 'rollNumber',
      key: 'rollNumber',
    },
    {
      title: 'Class',
      dataIndex: 'classId',
      key: 'classId',
      render: (classId) => {
        const classInfo = classes.find(c => c.id === classId);
        return classInfo ? `${classInfo.className} - Section ${classInfo.section}` : '-';
      },
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
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
            onClick={() => handleEditStudent(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteStudent(record.id)}
          />
        </Space>
      ),
    },
  ];

  // Add search filter function
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchText.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchText.toLowerCase()) ||
    student.email.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        gap: '16px'
      }}>
        <Search
          placeholder="Search students..."
          allowClear
          enterButton={<SearchOutlined />}
          size="small"
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddStudent}
          size="small"
        >
          Add Student
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredStudents}
        loading={loading}
        rowKey="id"
        rowClassName={(record) => record.id === highlightedId ? 'highlighted-row' : ''}
      />

      <StudentForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialValues={editingStudent}
        onImageUpload={handleImageUpload}
      />

      <StudentDetailsDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        student={selectedStudent}
      />
    </div>
  );
};

export default Students; 
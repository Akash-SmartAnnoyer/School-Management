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
  Typography,
  Drawer,
  List,
  Badge,
  Tooltip,
  Empty,
  message,
  Popconfirm
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
  SafetyCertificateOutlined,
  MenuOutlined,
  EllipsisOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { uploadImage, getCloudinaryImage } from '../services/imageService';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import StudentDetailsDrawer from '../components/StudentDetailsDrawer';
import { MessageContext } from '../App';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import api from '../services/api';

import './Students.css';

const { Option } = Select;
const { Search } = AntInput;
const { Title } = Typography;

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dyr02bpil'
  }
});

const StudentForm = ({ visible, onCancel, onSubmit, initialValues, loading }) => {
  const [form] = Form.useForm();
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    if (visible) {
      loadClasses();
      if (initialValues) {
        // Format the initial values for the form
        const formattedValues = {
          ...initialValues,
          dob: initialValues.dob ? moment(initialValues.dob) : null,
          admission_date: initialValues.admission_date ? moment(initialValues.admission_date) : null
        };
        form.setFieldsValue(formattedValues);
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues]);

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await api.class.getAll();
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Transform form values to match API payload structure
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        dob: values.dob.format('YYYY-MM-DD'),
        role: 'student',
        password: values.password,
        confirm_password: values.confirm_password,
        profile: {
          address: values.address,
          blood_group: values.blood_group,
          class_name: values.class_name,
          nationality: values.nationality
        },
        student_profile: {
          student_id: values.student_id,
          admission_number: values.admission_number,
          admission_date: values.admission_date.format('YYYY-MM-DD'),
          last_grade_attended: values.last_grade_attended,
          roll_no: values.roll_no,
          section: values.section,
          father_name: values.father_name,
          father_occupation: values.father_occupation,
          mother_name: values.mother_name,
          mother_occupation: values.mother_occupation,
          parent_address: values.parent_address,
          parent_email: values.parent_email,
          parent_phone: values.parent_phone,
          allergies: values.allergies,
          remarks: values.remarks
        }
      };
      onSubmit(payload);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Student' : 'Add New Student'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      className="student-form-modal"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Card title="Basic Information" className="mb-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: 'Please input first name!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="Last Name"
                rules={[{ required: true, message: 'Please input last name!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter last name" />
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
                <Input prefix={<MailOutlined />} placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please input phone number!' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: 'Please select gender' }]}
              >
                <Select placeholder="Select gender">
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

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input password!' }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="Confirm Password"
            rules={[{ required: true, message: 'Please confirm password!' }]}
          >
            <Input.Password placeholder="Confirm password" /> 
          </Form.Item>

        </Card>

        <Card title="Profile Information" className="mb-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="class_name"
                label="Class"
                rules={[{ required: false, message: 'Please select class!' }]}
              >
                <Select placeholder="Select class">
                  {classes.map(cls => (
                    <Option key={cls.id} value={cls.className}>
                      {cls.className}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="blood_group"
                label="Blood Group"
                rules={[{ required: true, message: 'Please select blood group!' }]}
              >
                <Select placeholder="Select blood group">
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
          </Row>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please input address!' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter address" />
          </Form.Item>

          <Form.Item
            name="nationality"
            label="Nationality"
            rules={[{ required: true, message: 'Please input nationality!' }]}
          >
            <Input placeholder="Enter nationality" />
          </Form.Item>
        </Card>

        <Card title="Student Profile Information">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="student_id"
                label="Student ID"
                rules={[{ required: true, message: 'Please input student ID!' }]}
              >
                <Input placeholder="Enter student ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="admission_number"
                label="Admission Number"
                rules={[{ required: true, message: 'Please input admission number!' }]}
              >
                <Input placeholder="Enter admission number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="admission_date"
                label="Admission Date"
                rules={[{ required: true, message: 'Please select admission date!' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_grade_attended"
                label="Last Grade Attended"
                rules={[{ required: true, message: 'Please input last grade attended!' }]}
              >
                <Input placeholder="Enter last grade attended" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roll_no"
                label="Roll Number"
                rules={[{ required: true, message: 'Please input roll number!' }]}
              >
                <Input type="number" placeholder="Enter roll number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="section"
                label="Section"
                rules={[{ required: true, message: 'Please input section!' }]}
              >
                <Input placeholder="Enter section" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Parent Information</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="father_name"
                label="Father's Name"
                rules={[{ required: true, message: 'Please input father\'s name!' }]}
              >
                <Input placeholder="Enter father's name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="father_occupation"
                label="Father's Occupation"
                rules={[{ required: true, message: 'Please input father\'s occupation!' }]}
              >
                <Input placeholder="Enter father's occupation" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="mother_name"
                label="Mother's Name"
                rules={[{ required: true, message: 'Please input mother\'s name!' }]}
              >
                <Input placeholder="Enter mother's name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mother_occupation"
                label="Mother's Occupation"
                rules={[{ required: true, message: 'Please input mother\'s occupation!' }]}
              >
                <Input placeholder="Enter mother's occupation" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="parent_address"
            label="Parent's Address"
            rules={[{ required: true, message: 'Please input parent\'s address!' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter parent's address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="parent_email"
                label="Parent's Email"
                rules={[
                  { required: true, message: 'Please input parent\'s email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input placeholder="Enter parent's email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="parent_phone"
                label="Parent's Phone"
                rules={[{ required: true, message: 'Please input parent\'s phone number!' }]}
              >
                <Input placeholder="Enter parent's phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="allergies"
            label="Allergies"
          >
            <Input.TextArea rows={2} placeholder="Enter any allergies" />
          </Form.Item>

          <Form.Item
            name="remarks"
            label="Remarks"
          >
            <Input.TextArea rows={3} placeholder="Enter remarks" />
          </Form.Item>
        </Card>
      </Form>
    </Modal>
  );
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const messageApi = useContext(MessageContext);

  useEffect(() => {
    loadStudents();
  }, [currentPage, pageSize]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await api.student.getStudents();
      if (response.success) {
        setStudents(response.data);
        setTotalStudents(response.data.length);
      } else {
        messageApi.error('Failed to load students');
      }
    } catch (error) {
      messageApi.error(error.message || 'Failed to load students');
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setModalVisible(true);
  };

  const handleEdit = (student) => {
    // Format the student data for the form
    const formValues = {
      ...student,
      dob: student.dob ? moment(student.dob) : null,
      admission_date: student.student_profile?.admission_date ? moment(student.student_profile.admission_date) : null,
      // Flatten nested profile data
      address: student.profile?.address,
      blood_group: student.profile?.blood_group,
      class_name: student.profile?.class_name,
      nationality: student.profile?.nationality,
      // Flatten nested student_profile data
      student_id: student.student_profile?.student_id,
      admission_number: student.student_profile?.admission_number,
      last_grade_attended: student.student_profile?.last_grade_attended,
      roll_no: student.student_profile?.roll_no,
      section: student.student_profile?.section,
      father_name: student.student_profile?.father_name,
      father_occupation: student.student_profile?.father_occupation,
      mother_name: student.student_profile?.mother_name,
      mother_occupation: student.student_profile?.mother_occupation,
      parent_address: student.student_profile?.parent_address,
      parent_email: student.student_profile?.parent_email,
      parent_phone: student.student_profile?.parent_phone,
      allergies: student.student_profile?.allergies,
      remarks: student.student_profile?.remarks
    };
    
    setEditingStudent(student);
    setModalVisible(true);
  };

  const handleDelete = async (studentId) => {
    console.log('Deleting student with ID:', studentId); // Debug log
    if (!studentId) {
      messageApi.error('Invalid student ID');
      return;
    }

    try {
      setLoading(true);
      const response = await api.student.deleteStudent(studentId);
      if (response.data?.success) {
        messageApi.success('Student deleted successfully');
        loadStudents();
      } else {
        messageApi.error(response.data?.message || 'Failed to delete student');
      }
    } catch (error) {
      messageApi.error(error.response?.data?.message || 'Failed to delete student');
      console.error('Error deleting student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingStudent) {
        const response = await api.student.updateStudent(editingStudent.id, values);
        if (response.data.success) {
          messageApi.success('Student updated successfully');
          setModalVisible(false);
          loadStudents();
        }
      } else {
        const response = await api.student.createStudent(values);
        if (response.data.success) {
          messageApi.success('Student added successfully');
          setModalVisible(false);
          loadStudents();
        }
      }
    } catch (error) {
      messageApi.error(editingStudent ? 'Failed to update student' : 'Failed to add student');
      console.error('Error saving student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setDetailsVisible(true);
  };

  const handleImageUpload = async (file, studentId) => {
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
      
      // Update student with new profile picture
      const response = await api.student.update(studentId, {
        photoURL: result.url,
        updatedAt: new Date().toISOString()
      });

      if (response.data.success) {
        messageApi.success('Profile picture updated successfully');
        loadStudents();
      }
      return false; // Prevent default upload behavior
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
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Roll Number',
      dataIndex: 'rollNumber',
      key: 'rollNumber',
      sorter: (a, b) => a.rollNumber.localeCompare(b.rollNumber),
    },
    {
      title: 'Class',
      key: 'class',
      render: (_, record) => {
        const classInfo = record.classId ? `Class ${record.classId}` : 'Not Assigned';
        return <Tag color="blue">{classInfo}</Tag>;
      },
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => (
        <Tag color={gender === 'male' ? 'blue' : 'pink'}>
          {gender === 'male' ? <ManOutlined /> : <WomanOutlined />} {gender}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? <CheckCircleOutlined /> : <CloseCircleOutlined />} {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        console.log('Student record:', record); // Debug log
        return (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<UserOutlined />}
                onClick={() => handleViewDetails(record)}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            <Popconfirm
              title="Are you sure you want to delete this student?"
              onConfirm={() => handleDelete(record.user_id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchText.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchText.toLowerCase()) ||
    student.email.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2}>Students</Title>
        </Col>
        <Col>
          <Space>
            <Input.Search
              placeholder="Search students..."
              allowClear
              onSearch={setSearchText}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add Student
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalStudents,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} students`,
          }}
          locale={{
            emptyText: (
              <Empty
                description="No students found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      <StudentForm
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingStudent(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editingStudent}
        loading={loading}
      />

      <StudentDetailsDrawer
        visible={detailsVisible}
        onClose={() => {
          setDetailsVisible(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />
    </div>
  );
};

export default Students; 
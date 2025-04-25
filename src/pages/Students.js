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
  message
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
        form.setFieldsValue(initialValues);
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
      onSubmit(values);
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
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please input student name!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter full name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="rollNumber"
              label="Roll Number"
              rules={[{ required: true, message: 'Please input roll number!' }]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="Enter roll number" />
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
              name="classId"
              label="Class"
              rules={[{ required: false, message: 'Please select class' }]}
            >
              <Select
                placeholder="Select class"
                loading={loadingClasses}
                prefix={<BankOutlined />}
              >
                {classes.map(cls => (
                  <Option key={cls.id} value={cls.id}>
                    {cls.className} - Section {cls.section}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select gender' }]}
            >
              <Select placeholder="Select gender" prefix={<ManOutlined />}>
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: 'Please input address!' }]}
            >
              <Input.TextArea
                prefix={<HomeOutlined />}
                placeholder="Enter address"
                rows={3}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="photoURL"
              label="Photo"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e;
                }
                return e?.fileList;
              }}
            >
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
                onChange={async ({ fileList }) => {
                  if (fileList.length > 0) {
                    try {
                      const file = fileList[0].originFileObj;
                      const result = await uploadImage(file);
                      form.setFieldsValue({ photoURL: result.url });
                    } catch (error) {
                      console.error('Error uploading image:', error);
                      message.error('Failed to upload image');
                    }
                  }
                }}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
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
      const response = await api.student.getAll();
      if (response.data.success) {
        setStudents(response.data.data);
        setTotalStudents(response.data.data.length);
      }
    } catch (error) {
      messageApi.error('Failed to load students');
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
    setEditingStudent(student);
    setModalVisible(true);
  };

  const handleDelete = async (studentId) => {
    try {
      setLoading(true);
      const response = await api.student.delete(studentId);
      if (response.data.success) {
        messageApi.success('Student deleted successfully');
        loadStudents();
      }
    } catch (error) {
      messageApi.error('Failed to delete student');
      console.error('Error deleting student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingStudent) {
        const response = await api.student.update(editingStudent.id, values);
        if (response.data.success) {
          messageApi.success('Student updated successfully');
          setModalVisible(false);
          loadStudents();
        }
      } else {
        const response = await api.student.create(values);
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
      render: (_, record) => (
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
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
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
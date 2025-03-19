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
  Input as AntInput
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, UserOutlined, TeamOutlined, BookOutlined, SearchOutlined } from '@ant-design/icons';
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
  
const { Option } = Select;
const { Search } = AntInput;

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dyr02bpil'
  }
});

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
      dataIndex: 'profilePublicId',
      key: 'photo',
      width: 80,
      render: (profilePublicId, record) => {
        if (profilePublicId) {
          return (
            <AdvancedImage 
              cldImg={getCloudinaryImage(profilePublicId)}
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

      <Modal
        title={editingStudent ? 'Edit Student' : 'Add Student'}
        open={modalVisible}
        onOk={form.submit}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="rollNumber"
            label="Roll Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="classId"
            label="Class"
            rules={[{ required: true, message: 'Please select class!' }]}
          >
            <Select>
              {classes
                .filter(cls => cls.status === 'Active')
                .map(cls => (
                  <Option key={cls.id} value={cls.id}>
                    {cls.className} - Section {cls.section}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true },
              { type: 'email' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <StudentDetailsDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        student={selectedStudent}
      />
    </div>
  );
};

export default Students; 
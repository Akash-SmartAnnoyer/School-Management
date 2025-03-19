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
  Space
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadImage, getCloudinaryImage } from '../services/imageService';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import StudentDetailsDrawer from '../components/StudentDetailsDrawer';
import { MessageContext } from '../App';
  
const { Option } = Select;

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dyr02bpil'
  }
});

const Students = () => {
  const messageApi = useContext(MessageContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingStudent, setEditingStudent] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const q = query(collection(db, 'students'));
      const querySnapshot = await getDocs(q);
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      messageApi.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

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
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      messageApi.error('Failed to delete student');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const studentData = {
        ...values,
        className: values.className,
        section: values.section,
        createdAt: new Date().toISOString()
      };

      if (editingStudent) {
        await updateDoc(doc(db, 'students', editingStudent.id), studentData);
        messageApi.success('Student updated successfully');
      } else {
        await addDoc(collection(db, 'students'), studentData);
        messageApi.success('Student added successfully');
      }

      setModalVisible(false);
      fetchStudents();
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
      dataIndex: 'photoURL',
      key: 'photo',
      width: 80,
      render: (photoURL, record) => {
        if (record.photoPublicId) {
          const cldImg = getCloudinaryImage(record.photoPublicId);
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
        <Button type="link" onClick={() => {
          setSelectedStudent(record);
          setDrawerVisible(true);
        }}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Roll Number',
      dataIndex: 'rollNumber',
      key: 'rollNumber',
    },
    {
      title: 'Class',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
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

  return (
    <div style={{ padding: 24 }}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddStudent}
        style={{ marginBottom: 16 }}
      >
        Add Student
      </Button>

      <Table
        columns={columns}
        dataSource={students}
        loading={loading}
        rowKey="id"
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
            name="className"
            label="Class"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="section"
            label="Section"
            rules={[{ required: true }]}
          >
            <Input />
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
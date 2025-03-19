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
  Input as AntInput
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
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
    form.setFieldsValue(record);
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

  const handleImageUpload = async (file, teacherId) => {
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

      await updateTeacher(teacherId, {
        photoURL: url,
        photoPublicId: publicId,
        updatedAt: new Date().toISOString()
      });

      setTeachers(prevTeachers =>
        prevTeachers.map(teacher =>
          teacher.id === teacherId
            ? { ...teacher, photoURL: url, photoPublicId: publicId }
            : teacher
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

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const teacherData = {
        ...values,
        updatedAt: new Date().toISOString()
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
    } catch (error) {
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
    teacher.name.toLowerCase().includes(searchText.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchText.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchText.toLowerCase())
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
        title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input teacher name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please input subject!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="qualification"
            label="Qualification"
            rules={[{ required: true, message: 'Please input qualification!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="classId"
            label="Class (Optional)"
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
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please input phone number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="experience"
            label="Years of Experience"
            rules={[{ required: true, message: 'Please input years of experience!' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
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
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Tag,
  Tooltip,
  Popconfirm,
  Input as AntInput,
  Empty,
  Row,
  Col,
  Upload,
  Avatar,
  Drawer,
  Card,
  Statistic,
  Divider,
  Badge,
  Tabs,
  List,
  Timeline,
  Calendar,
  Progress,
  Rate,
  Comment,
  Alert,
  Steps,
  Descriptions,
  Image,
  Carousel,
  Collapse,
  Tree,
  Transfer,
  Cascader,
  DatePicker,
  TimePicker,
  Switch,
  Slider,
  Radio,
  Checkbox,
  InputNumber,
  AutoComplete,
  Mentions,
  TreeSelect,
  Upload as AntUpload,
  Form as AntForm,
  Modal as AntModal,
  Drawer as AntDrawer,
  Card as AntCard,
  Statistic as AntStatistic,
  Divider as AntDivider,
  Badge as AntBadge,
  Tabs as AntTabs,
  List as AntList,
  Timeline as AntTimeline,
  Calendar as AntCalendar,
  Progress as AntProgress,
  Rate as AntRate,
  Comment as AntComment,
  Alert as AntAlert,
  Steps as AntSteps,
  Descriptions as AntDescriptions,
  Image as AntImage,
  Carousel as AntCarousel,
  Collapse as AntCollapse,
  Tree as AntTree,
  Transfer as AntTransfer,
  Cascader as AntCascader,
  DatePicker as AntDatePicker,
  TimePicker as AntTimePicker,
  Switch as AntSwitch,
  Slider as AntSlider,
  Radio as AntRadio,
  Checkbox as AntCheckbox,
  InputNumber as AntInputNumber,
  AutoComplete as AntAutoComplete,
  Mentions as AntMentions,
  TreeSelect as AntTreeSelect,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  UploadOutlined,
  TeamOutlined,
  BookOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TagOutlined,
  StarOutlined,
  TrophyOutlined,
  FileTextOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FileOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  FolderAddOutlined,
  FolderViewOutlined,
  FileAddOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  FileMarkdownOutlined,
  FileTextOutlined as FileTextOutlined2,
  FileExcelOutlined as FileExcelOutlined2,
  FilePdfOutlined as FilePdfOutlined2,
  FileWordOutlined as FileWordOutlined2,
  FileImageOutlined as FileImageOutlined2,
  FileZipOutlined as FileZipOutlined2,
  FileUnknownOutlined as FileUnknownOutlined2,
  FileMarkdownOutlined as FileMarkdownOutlined2,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SwapOutlined,
  DeleteFilled,
  IdcardOutlined,
  SafetyCertificateOutlined,
  HomeOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useTeachers } from '../contexts/TeachersContext';
import { useMessage } from '../contexts/MessageContext';
import api from '../services/api';
import { uploadImage, getCloudinaryImage } from '../services/imageService';
import TeacherDetailsDrawer from '../components/TeacherDetailsDrawer';
import moment from 'moment';
import ImagePreviewModal from '../components/ImagePreviewModal';

const { Title } = Typography;
const { Option } = Select;
const { Search } = AntInput;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;
const { TextArea } = Input;
const { Dragger } = Upload;

const Teachers = () => {
  const messageApi = useMessage();
  const { 
    teachers, 
    loading: teachersLoading, 
    currentPage, 
    totalTeachers, 
    pageSize,
    loadTeachers,
    refreshTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher
  } = useTeachers();
  const [form] = Form.useForm();
  const [bulkStatusForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkStatusModalVisible, setBulkStatusModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('ascend');
  const [classes, setClasses] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (modalVisible) {
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
  }, [modalVisible, editingTeacher]);

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await api.subject.getSubjects();
      if (response.success) {
        setSubjects(response.data.results || []);
      }
    } catch (error) {
      messageApi.error('Failed to load subjects');
      console.error('Error loading subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleAdd = () => {
    setEditingTeacher(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = async (teacher) => {
    try {
      setActionLoading(true);
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
        
        setEditingTeacher({
          ...formValues,
          id: teacher.user_id
        });
        
        // Set the image preview if photo exists
        if (teacherData.profile?.photo) {
          setImageUrl(teacherData.profile.photo);
        } else {
          setImageUrl(null);
        }
        
        form.setFieldsValue(formValues);
        setModalVisible(true);
      } else {
        messageApi.error('Failed to load teacher data');
      }
    } catch (error) {
      messageApi.error(error.message || 'Failed to load teacher data');
      console.error('Error loading teacher:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (teacherId) => {
    if (!teacherId) {
      messageApi.error('Invalid teacher ID');
      return;
    }

    try {
      setActionLoading(true);
      const response = await api.teacher.deleteTeacher(teacherId);
      
      if (response.status === 204) {
        messageApi.success('Teacher deleted successfully');
        await refreshTeachers();
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
      setActionLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setActionLoading(true);
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

        // Create FormData object for update
        const formData = new FormData();
        
        // Add all changed fields to FormData
        Object.entries(updateData).forEach(([key, value]) => {
          if (key === 'profile' || key === 'teacher_profile') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        });

        // Add photo if it was changed
        if (selectedFile) {
          formData.append('photo', selectedFile);
        }

        // Only send update request if there are changes
        if (Object.keys(updateData).length > 0 || selectedFile) {
          const response = await api.teacher.updateTeacher(editingTeacher.id, formData);
          if (response.status === 200) {
            messageApi.success('Teacher updated successfully');
            setModalVisible(false);
            await refreshTeachers();
          }
        } else {
          messageApi.info('No changes detected');
          setModalVisible(false);
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

        // Create FormData object
        const formData = new FormData();
        
        // Add basic user fields
        formData.append('first_name', createData.first_name);
        formData.append('last_name', createData.last_name);
        formData.append('email', createData.email);
        formData.append('phone', createData.phone);
        formData.append('gender', createData.gender);
        formData.append('dob', createData.dob);
        formData.append('role', createData.role);
        formData.append('password', createData.password);
        formData.append('confirm_password', createData.confirm_password);

        // Add profile data
        formData.append('profile', JSON.stringify(createData.profile));

        // Add teacher profile data
        formData.append('teacher_profile', JSON.stringify(createData.teacher_profile));

        // Add photo if exists
        if (selectedFile) {
          formData.append('photo', selectedFile);
        }

        const response = await api.teacher.createTeacher(formData);
        if (response.status === 201) {
          messageApi.success('Teacher added successfully');
          setModalVisible(false);
          await refreshTeachers();
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
      setActionLoading(false);
    }
  };

  const handleImageUpload = async (file, record) => {
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

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setSelectedFile(file);
      setSelectedStudentId(record.user_id);
      setPreviewVisible(true);
      
      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Error handling image:', error);
      messageApi.error('Failed to process image');
      return false;
    }
  };

  const handlePreviewCancel = () => {
    setPreviewVisible(false);
    setPreviewImage('');
    setSelectedFile(null);
    setSelectedStudentId(null);
  };

  const handlePreviewUpload = async () => {
    if (!selectedFile || !selectedStudentId) return;

    try {
      setUploadingImage(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('photo', selectedFile);

      // Make API call with user_id
      const response = await api.teacher.updateTeacher(selectedStudentId, formData);

      if (response.status === 200) {
        messageApi.success('Profile picture updated successfully');
        refreshTeachers();
        handlePreviewCancel();
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      messageApi.error(error.message || 'Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
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
      dataIndex: 'photo',
      key: 'photo',
      width: 80,
      render: (photoURL, record) => (
        <Upload
          name="photo"
          showUploadList={false}
          beforeUpload={(file) => handleImageUpload(file, record)}
          accept="image/*"
        >
          <Avatar
            size={40}
            src={record.photo || null}
            icon={!record.photo && (record.gender === 'M' ? 
              <img src="/teacher-boy.png" alt="Male Teacher" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
              <img src="/teacher-girl.png" alt="Female Teacher" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            style={{ 
              border: '2px solid #f0f0f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: '#fafafa'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
              e.currentTarget.style.border = '2px solid #d9d9d9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
              e.currentTarget.style.border = '2px solid #f0f0f0';
            }}
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
          setDetailsDrawerVisible(true);
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
        <Tag 
          style={{ 
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: '#f5f5f5',
            color: status === 'Active' ? '#73d13d' : '#ffa940',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'inline-flex',
            alignItems: 'center',
            height: '24px',
            lineHeight: '1'
          }}
        >
          {status === 'Active' ? (
            <CheckCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#73d13d' }} />
          ) : (
            <CloseCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#ffa940' }} />
          )} 
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle" style={{ justifyContent: 'flex-end', width: '100%' }}>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined style={{ fontSize: '16px', color: '#8c8c8c' }} />}
              onClick={() => handleEdit(record)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                background: '#f5f5f5'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
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
                type="text"
                icon={<DeleteOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  background: '#fff1f0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ffccc7';
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff1f0';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleSearch = (value) => {
    setSearchText(value);
    loadTeachers(1, 10, value);
  };

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
          <img src="/training.png" alt="Teachers" style={{ width: '40px', height: '40px' }} />
          {/* <TeamOutlined className="title-icon" /> */}
          Teachers
        </Title>
        <Space size="small">
          <Input.Search
            placeholder="Search teachers..."
            allowClear
            onSearch={handleSearch}
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
        padding: '0 16px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 180px)'
      }}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={teachers}
          rowKey="id"
          loading={teachersLoading || actionLoading}
          scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
          className="teachers-table"
          pagination={{
            current: currentPage,
            total: totalTeachers,
            pageSize: 10,
            onChange: (page) => loadTeachers(page),
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} teachers`
          }}
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
            <IdcardOutlined className="modal-icon" />
            <Typography.Title level={5} className="modal-title">
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </Typography.Title>
          </Space>
        }
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setImageUrl(null);
        }}
        width={900}
        confirmLoading={actionLoading}
        className="teacher-form-modal"
      >
        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col span={8}>
              <Card className="photo-upload-card">
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
                      setImageUrl(reader.result);
                      setSelectedFile(file);
                    };
                    return false;
                  }}
                  accept="image/*"
                  maxCount={1}
                >
                  <div className="upload-placeholder">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt="Preview" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }} 
                      />
                    ) : (
                      <>
                        <PlusOutlined />
                        <div>Upload Photo</div>
                      </>
                    )}
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
                      <Select loading={loadingSubjects}>
                        {subjects.map(subject => (
                          <Option key={subject.id} value={subject.name}>
                            {subject.name}
                          </Option>
                        ))}
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
                      name="nationality"
                      label="Nationality"
                      rules={[{ required: true, message: 'Please input nationality!' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

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

      <Modal
        title="Change Status"
        open={bulkStatusModalVisible}
        onOk={handleBulkStatusChange}
        onCancel={() => setBulkStatusModalVisible(false)}
        confirmLoading={actionLoading}
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
        visible={detailsDrawerVisible}
        onClose={() => setDetailsDrawerVisible(false)}
        teacher={selectedTeacher}
      />

      <ImagePreviewModal
        visible={previewVisible}
        imageUrl={previewImage}
        onCancel={handlePreviewCancel}
        onUpload={handlePreviewUpload}
        loading={uploadingImage}
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
            display: flex;
            flex-direction: column;
          }

          .teachers-table .ant-table {
            flex: 1;
            display: flex;
            flex-direction: column;
            border-radius: 8px;
            overflow: hidden;
          }

          .teachers-table .ant-table-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            border-radius: 8px;
            overflow: hidden;
          }

          .teachers-table .ant-table-body {
            flex: 1;
            overflow-y: auto !important;
            overflow-x: auto !important;
            margin-right: 1px;
          }

          .teachers-table .ant-spin-nested-loading {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .teachers-table .ant-spin-container {
            flex: 1;
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

          .teachers-table .ant-table-cell .ant-avatar {
            width: 22px;
            height: 22px;
            line-height: 22px;
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

          .teacher-form-modal .modal-icon {
            font-size: 20px;
            color: #7B83EB;
          }

          .teacher-form-modal .modal-title {
            margin: 0;
            color: #7B83EB;
          }

          .teacher-form-modal .photo-upload-card {
            text-align: center;
            background: #fafafa;
            border: 1px dashed #d9d9d9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 16px;
          }

          .teacher-form-modal .upload-placeholder {
            cursor: pointer;
            color: #7B83EB;
          }

          .teacher-form-modal .info-card {
            margin-bottom: 16px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }

          .teacher-form-modal .card-icon {
            color: #7B83EB;
          }

          .teacher-form-modal .ant-card-head {
            border-bottom: 1px solid #f0f0f0;
            padding: 12px 16px;
          }

          .teacher-form-modal .ant-card-head-title {
            padding: 0;
          }

          .teacher-form-modal .ant-form-item-label > label {
            color: #595959;
            font-weight: 500;
          }

          .teacher-form-modal .ant-input-affix-wrapper:hover,
          .teacher-form-modal .ant-input-affix-wrapper:focus,
          .teacher-form-modal .ant-input-affix-wrapper-focused {
            border-color: #7B83EB;
          }

          .teacher-form-modal .ant-select:hover .ant-select-selector,
          .teacher-form-modal .ant-select-focused .ant-select-selector {
            border-color: #7B83EB !important;
          }

          .teacher-form-modal .ant-picker:hover,
          .teacher-form-modal .ant-picker-focused {
            border-color: #7B83EB;
          }

          .teacher-form-modal .ant-btn-primary {
            background: #7B83EB;
            border-color: #7B83EB;
          }

          .teacher-form-modal .ant-btn-primary:hover {
            background: #8ba1d1;
            border-color: #8ba1d1;
          }
        `}
      </style>
    </div>
  );
};

export default Teachers; 
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
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
  Spin,
  Dropdown,
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
  ArrowLeftOutlined,
  SettingOutlined,
  ExportOutlined,
  DownloadOutlined,
  SendOutlined,
  ImportOutlined,
  UserAddOutlined,
  HeartOutlined,
  MoreOutlined,
  LoadingOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useTeachers } from '../contexts/TeachersContext';
import { useMessage } from '../contexts/MessageContext';
import api from '../services/api';
import { uploadImage, getCloudinaryImage } from '../services/imageService';
import TeacherDetailsDrawer from '../components/TeacherDetailsDrawer';
import moment from 'moment';
import ImagePreviewModal from '../components/ImagePreviewModal';
import ColumnSettingsDrawer from '../components/ColumnSettingsDrawer';
import useColumnSettings from '../hooks/useColumnSettings';
import StyledModal from '../components/StyledModal';
import ImportModal from '../components/ImportModal';
import { downloadSampleFile } from '../utils/sampleFileGenerator';

const { Title } = Typography;
const { Option } = Select;
const { Search } = AntInput;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;
const { TextArea } = Input;
const { Dragger } = Upload;

const TeacherView = ({ visible, onCancel, teacher, onTeacherUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { refreshTeachers } = useTeachers();
  const [editingSection, setEditingSection] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (visible && teacher) {
      loadTeacherDetails();
    }
  }, [visible, teacher]);

  const loadTeacherDetails = async () => {
    if (!teacher?.user_id) return;
    
    try {
      setLoading(true);
      const response = await api.teacher.getTeacher(teacher.user_id);
      if (response.data) {
        setTeacherData(response.data);
      } else {
        messageApi.error('Failed to load teacher details');
      }
    } catch (error) {
      messageApi.error('Failed to load teacher details');
      console.error('Error loading teacher details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !teacher) return null;

  const handleEditSection = (section) => {
    setEditingSection(section);
    // Populate editedValues with current teacherData, flattening nested objects for easier editing
    const currentData = teacherData || teacher;
    setEditedValues({ 
      ...currentData,
      // Flatten nested objects for easier editing
      employee_id: currentData?.teacher_profile?.employee_id,
      joining_date: currentData?.teacher_profile?.joining_date,
      qualification: currentData?.teacher_profile?.qualification,
      specialization: currentData?.teacher_profile?.specialization,
      years_of_experience: currentData?.teacher_profile?.years_of_experience,
      status: currentData?.teacher_profile?.status,
      subject: currentData?.teacher_profile?.subject,
      address: currentData?.profile?.address,
      blood_group: currentData?.profile?.blood_group,
      nationality: currentData?.profile?.nationality,
      // Keep nested objects for API calls
      profile: { ...currentData?.profile },
      teacher_profile: { ...currentData?.teacher_profile }
    });
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditedValues({});
  };

  const handleSaveEdit = async (section) => {
    try {
      setIsSaving(true);
      
      // Prepare the update data based on the section being edited
      const updateData = {};
      
      if (section === 'contact') {
        updateData.email = editedValues.email;
        updateData.phone = editedValues.phone;
        updateData.profile = {
          address: editedValues.profile?.address
        };
      } else if (section === 'professional') {
        updateData.teacher_profile = {
          employee_id: editedValues.teacher_profile?.employee_id,
          subject: editedValues.teacher_profile?.subject,
          qualification: editedValues.teacher_profile?.qualification,
          specialization: editedValues.teacher_profile?.specialization,
          years_of_experience: editedValues.teacher_profile?.years_of_experience,
          status: editedValues.teacher_profile?.status
        };
      } else if (section === 'personal') {
        updateData.gender = editedValues.gender;
        updateData.dob = editedValues.dob?.format('YYYY-MM-DD');
        updateData.profile = {
          blood_group: editedValues.profile?.blood_group,
          nationality: editedValues.profile?.nationality
        };
      }
      
      // Create FormData for the update
      const formData = new FormData();
      Object.entries(updateData).forEach(([key, value]) => {
        if (key === 'profile' || key === 'teacher_profile') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      
      await api.teacher.updateTeacher(teacherData.user_id, formData);
      messageApi.success('Teacher information updated successfully');
      
      // Refresh the teacher data to show updated information
      await loadTeacherDetails();
      await refreshTeachers();
      setEditingSection(null);
      setEditedValues({});
    } catch (error) {
      console.error('Error updating teacher:', error);
      messageApi.error('Failed to update teacher information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedValues(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.teacher.deleteTeacher(teacher.user_id);
      messageApi.success('Teacher deleted successfully');
      refreshTeachers();
      onCancel();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      messageApi.error('Failed to delete teacher');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderDetailItem = (label, value, icon = null, field = null, section = null) => (
    <div className="detail-item" style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      gap: '12px',
      marginBottom: '8px'
    }}>
      {icon && (
        <div className="detail-icon" style={{ 
          color: '#666',
          fontSize: '16px',
          width: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '2px'
        }}>
          {icon}
        </div>
      )}
      <div className="detail-content" style={{ flex: 1 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <div className="detail-label" style={{ 
            color: '#1f1f1f', 
            fontSize: '14px',
            minWidth: '120px',
            fontWeight: 600
          }}>
            {label}
          </div>
          {editingSection === section && field ? (
            <Input
              value={field.includes('.') ? 
                (field.split('.')[0] === 'profile' ? editedValues.profile?.[field.split('.')[1]] : 
                 field.split('.')[0] === 'teacher_profile' ? editedValues.teacher_profile?.[field.split('.')[1]] : 
                 editedValues[field]) : editedValues[field] || ''}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              style={{ width: '200px' }}
            />
          ) : (
            <div className="detail-value" style={{ 
              fontSize: '14px',
              fontWeight: 400,
              color: '#666'
            }}>
              {value || 'N/A'}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const items = [
    {
      key: 'edit',
      label: 'Edit Teacher',
      icon: <EditOutlined />,
      onClick: () => {
        setIsEditing(true);
        // Navigate to edit or open edit modal
      }
    },
    {
      key: 'email',
      label: 'Send Email',
      icon: <MailOutlined />,
      onClick: () => {/* Add email handler */}
    },
    {
      key: 'download',
      label: 'Download',
      icon: <DownloadOutlined />,
      onClick: () => {/* Add download handler */}
    },
    {
      key: 'print',
      label: 'Print',
      icon: <PrinterOutlined />,
      onClick: () => {/* Add print handler */}
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: isDeleting ? <LoadingOutlined /> : <DeleteOutlined />,
      danger: true,
      disabled: isDeleting,
      onClick: () => {
        Modal.confirm({
          title: 'Are you sure you want to delete this teacher?',
          content: 'This action cannot be undone.',
          okText: 'Yes, Delete',
          okType: 'danger',
          cancelText: 'No, Cancel',
          onOk: handleDelete,
          okButtonProps: { loading: isDeleting }
        });
      }
    }
  ];

  return (
    <>
      {contextHolder}
      <Spin spinning={isEditing || isDeleting || isSaving} tip="Loading..." size="small">
        <div style={{ 
          width: '100%', 
          textAlign: 'left',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ 
            height: '1.25in',
            backgroundColor: '#f5f5f5',
            padding: '12px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
            textAlign: 'left',
            position: 'relative',
            flexShrink: 0
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              width: '100%',
              textAlign: 'left'
            }}>
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={onCancel}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              
              <Avatar 
                size={40}
                src={teacherData?.profile?.photo}
                icon={!teacherData?.profile?.photo && (teacherData?.gender === 'M' ? 
                  <img src="/teacher-boy.png" alt="Male Teacher" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                  <img src="/teacher-girl.png" alt="Female Teacher" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                style={{ cursor: 'pointer' }}
                onClick={() => {/* Add image preview handler */}}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {editingSection === 'basic' ? (
                  <Space>
                    <Input
                      value={editedValues.first_name || ''}
                      onChange={(e) => handleFieldChange('first_name', e.target.value)}
                      style={{ width: '150px' }}
                    />
                    <Input
                      value={editedValues.last_name || ''}
                      onChange={(e) => handleFieldChange('last_name', e.target.value)}
                      style={{ width: '150px' }}
                    />
                  </Space>
                ) : (
                  <Typography.Title level={3} style={{ margin: 0 }}>
                    <span style={{ color: '#1f1f1f' }}>{teacherData?.first_name || teacher?.first_name} </span>
                    <span style={{ color: '#f54278' }}>{teacherData?.last_name || teacher?.last_name}</span>
                  </Typography.Title>
                )}
                <Typography.Text copyable style={{ color: '#666', fontSize: '14px' }}>
                  #{teacherData?.teacher_profile?.employee_id || teacher?.employee_id}
                </Typography.Text>
              </div>

              <div style={{ 
                position: 'absolute', 
                right: '24px', 
                top: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px' 
              }}>
                <Dropdown
                  menu={{ items }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                </Dropdown>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginLeft: '0',
              textAlign: 'left',
              width: '100%',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar 
                  size={32}
                  icon={<IdcardOutlined />}
                  style={{ backgroundColor: '#f0f0f0' }}
                />
                <Typography.Text strong style={{ fontSize: '14px' }}>
                  Professional Details
                </Typography.Text>
                {editingSection === 'basic' ? (
                  <Space>
                    <Input
                      value={editedValues.employee_id || ''}
                      onChange={(e) => handleFieldChange('employee_id', e.target.value)}
                      style={{ width: '150px' }}
                    />
                    <DatePicker
                      value={editedValues.joining_date ? moment(editedValues.joining_date) : null}
                      onChange={(date) => handleFieldChange('joining_date', date)}
                      style={{ width: '150px' }}
                    />
                  </Space>
                ) : (
                  <>
                    <Typography.Text strong style={{ fontSize: '14px', marginLeft: '8px' }}>
                      {teacherData?.teacher_profile?.employee_id || teacher?.employee_id}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: '12px', marginLeft: '4px' }}>
                      {teacherData?.teacher_profile?.joining_date ? moment(teacherData.teacher_profile.joining_date).format('DD MMM, YYYY') : 'N/A'}
                    </Typography.Text>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginRight: '24px' }}>
                {editingSection === 'basic' ? (
                  <Space>
                    <Input
                      value={editedValues.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      prefix={<MailOutlined style={{ color: '#666' }} />}
                      style={{ width: '200px' }}
                    />
                    <Input
                      value={editedValues.phone || ''}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      prefix={<PhoneOutlined style={{ color: '#666' }} />}
                      style={{ width: '200px' }}
                    />
                    <Input
                      value={editedValues.address || ''}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      prefix={<EnvironmentOutlined style={{ color: '#666' }} />}
                      style={{ width: '200px' }}
                    />
                  </Space>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MailOutlined style={{ color: '#666' }} />
                      <Typography.Text style={{ fontSize: '14px' }}>
                        {teacherData?.email || teacher?.email || 'No email'}
                      </Typography.Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PhoneOutlined style={{ color: '#666' }} />
                      <Typography.Text style={{ fontSize: '14px' }}>
                        {teacherData?.phone || teacher?.phone || 'No phone'}
                      </Typography.Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <EnvironmentOutlined style={{ color: '#666' }} />
                      <Typography.Text style={{ fontSize: '14px' }}>
                        {teacherData?.profile?.address || teacher?.address || 'No address'}
                      </Typography.Text>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ 
            padding: '16px 24px 40px 24px',
            borderBottom: '1px solid #f0f0f0',
            flex: 1,
            overflow: 'auto'
          }}>
            <Tabs
              defaultActiveKey="details"
              items={[
                {
                  key: 'details',
                  label: <span style={{ fontWeight: 'bold' }}>Details</span>,
                  children: (
                    <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <Card 
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>Contact Information</span>
                              {editingSection === 'contact' ? (
                                <Space>
                                  <Tooltip title="Save Changes">
                                    <Button 
                                      type="text" 
                                      size="small" 
                                      icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />}
                                      onClick={() => handleSaveEdit('contact')}
                                      loading={isSaving}
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#f6ffed',
                                        border: '1px solid #b7eb8f'
                                      }}
                                    />
                                  </Tooltip>
                                  <Tooltip title="Cancel">
                                    <Button 
                                      type="text" 
                                      size="small" 
                                      icon={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />}
                                      onClick={handleCancelEdit}
                                      disabled={isSaving}
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#fff2f0',
                                        border: '1px solid #ffccc7'
                                      }}
                                    />
                                  </Tooltip>
                                </Space>
                              ) : (
                                <Button 
                                  type="text" 
                                  icon={<EditOutlined />} 
                                  onClick={() => handleEditSection('contact')}
                                />
                              )}
                            </div>
                          }
                          bordered={false} 
                          style={{ 
                            backgroundColor: '#E6EBF0',
                            borderRadius: '8px',
                            transition: 'background-color 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#E6EBF0';
                          }}
                        >
                          <Row gutter={[16, 8]}>
                            <Col span={24}>
                              {renderDetailItem('Email', teacherData?.email || teacher?.email, <MailOutlined />, 'email', 'contact')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Phone', teacherData?.phone || teacher?.phone, <PhoneOutlined />, 'phone', 'contact')}
                            </Col>
                            <Col span={24}>
                              {renderDetailItem('Address', teacherData?.profile?.address || teacher?.address, <EnvironmentOutlined />, 'profile.address', 'contact')}
                            </Col>
                          </Row>
                        </Card>

                        <Card 
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>Professional Information</span>
                              {editingSection === 'professional' ? (
                                <Space>
                                  <Tooltip title="Save Changes">
                                    <Button 
                                      type="text" 
                                      size="small" 
                                      icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />}
                                      onClick={() => handleSaveEdit('professional')}
                                      loading={isSaving}
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#f6ffed',
                                        border: '1px solid #b7eb8f'
                                      }}
                                    />
                                  </Tooltip>
                                  <Tooltip title="Cancel">
                                    <Button 
                                      type="text" 
                                      size="small" 
                                      icon={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />}
                                      onClick={handleCancelEdit}
                                      disabled={isSaving}
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#fff2f0',
                                        border: '1px solid #ffccc7'
                                      }}
                                    />
                                  </Tooltip>
                                </Space>
                              ) : (
                                <Button 
                                  type="text" 
                                  icon={<EditOutlined />} 
                                  onClick={() => handleEditSection('professional')}
                                />
                              )}
                            </div>
                          }
                          bordered={false} 
                          style={{ 
                            backgroundColor: '#E6EBF0',
                            borderRadius: '8px',
                            transition: 'background-color 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#E6EBF0';
                          }}
                        >
                          <Row gutter={[16, 8]}>
                            <Col span={12}>
                              {renderDetailItem('Employee ID', teacherData?.teacher_profile?.employee_id || teacher?.employee_id, <IdcardOutlined />, 'teacher_profile.employee_id', 'professional')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Subject', teacherData?.teacher_profile?.subject || teacher?.subject, <BookOutlined />, 'teacher_profile.subject', 'professional')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Qualification', teacherData?.teacher_profile?.qualification || teacher?.qualification, <SafetyCertificateOutlined />, 'teacher_profile.qualification', 'professional')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Specialization', teacherData?.teacher_profile?.specialization || teacher?.specialization, <BookOutlined />, 'teacher_profile.specialization', 'professional')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Experience', `${teacherData?.teacher_profile?.years_of_experience || teacher?.years_of_experience || '0'} years`, <TrophyOutlined />, 'teacher_profile.years_of_experience', 'professional')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Status', teacherData?.teacher_profile?.status || teacher?.status, <CheckCircleOutlined />, 'teacher_profile.status', 'professional')}
                            </Col>
                          </Row>
                        </Card>
                      </div>

                      <div style={{ width: '300px' }}>
                        <Card bordered={false}>
                          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <Avatar 
                              size={120}
                              src={teacherData?.profile?.photo}
                              icon={!teacherData?.profile?.photo && (teacherData?.gender === 'M' ? 
                                <img src="/teacher-boy.png" alt="Male Teacher" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                                <img src="/teacher-girl.png" alt="Female Teacher" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              )}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {/* Add image preview handler */}}
                            />
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <Typography.Title level={4} style={{ margin: '8px 0' }}>
                              {teacherData?.first_name || teacher?.first_name} {teacherData?.last_name || teacher?.last_name}
                            </Typography.Title>
                            <Typography.Text type="secondary">
                              #{teacherData?.teacher_profile?.employee_id || teacher?.employee_id}
                            </Typography.Text>
                          </div>
                          <Divider />
                          <div style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <Typography.Title level={5} style={{ margin: 0 }}>Personal Information</Typography.Title>
                              {editingSection === 'personal' ? (
                                <Space>
                                  <Tooltip title="Save Changes">
                                    <Button 
                                      type="text" 
                                      size="small" 
                                      icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />}
                                      onClick={() => handleSaveEdit('personal')}
                                      loading={isSaving}
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#f6ffed',
                                        border: '1px solid #b7eb8f'
                                      }}
                                    />
                                  </Tooltip>
                                  <Tooltip title="Cancel">
                                    <Button 
                                      type="text" 
                                      size="small" 
                                      icon={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />}
                                      onClick={handleCancelEdit}
                                      disabled={isSaving}
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#fff2f0',
                                        border: '1px solid #ffccc7'
                                      }}
                                    />
                                  </Tooltip>
                                </Space>
                              ) : (
                                <Button 
                                  type="text" 
                                  icon={<EditOutlined />} 
                                  onClick={() => handleEditSection('personal')}
                                />
                              )}
                            </div>
                            {editingSection === 'personal' ? (
                              <>
                                <Form.Item label="Gender" style={{ marginBottom: '8px' }}>
                                  <Select
                                    value={editedValues.gender}
                                    onChange={(value) => handleFieldChange('gender', value)}
                                    style={{ width: '100%' }}
                                  >
                                    <Select.Option value="M">Male</Select.Option>
                                    <Select.Option value="F">Female</Select.Option>
                                    <Select.Option value="O">Other</Select.Option>
                                  </Select>
                                </Form.Item>
                                <Form.Item label="Date of Birth" style={{ marginBottom: '8px' }}>
                                  <DatePicker
                                    value={editedValues.dob ? moment(editedValues.dob) : null}
                                    onChange={(date) => handleFieldChange('dob', date)}
                                    style={{ width: '100%' }}
                                  />
                                </Form.Item>
                                <Form.Item label="Blood Group" style={{ marginBottom: '8px' }}>
                                  <Select
                                    value={editedValues.profile?.blood_group}
                                    onChange={(value) => handleFieldChange('profile.blood_group', value)}
                                    style={{ width: '100%' }}
                                  >
                                    <Select.Option value="A+">A+</Select.Option>
                                    <Select.Option value="A-">A-</Select.Option>
                                    <Select.Option value="B+">B+</Select.Option>
                                    <Select.Option value="B-">B-</Select.Option>
                                    <Select.Option value="AB+">AB+</Select.Option>
                                    <Select.Option value="AB-">AB-</Select.Option>
                                    <Select.Option value="O+">O+</Select.Option>
                                    <Select.Option value="O-">O-</Select.Option>
                                  </Select>
                                </Form.Item>
                                <Form.Item label="Nationality" style={{ marginBottom: '8px' }}>
                                  <Input
                                    value={editedValues.profile?.nationality || ''}
                                    onChange={(e) => handleFieldChange('profile.nationality', e.target.value)}
                                    style={{ width: '100%' }}
                                  />
                                </Form.Item>
                              </>
                            ) : (
                              <>
                                {renderDetailItem('Gender', teacherData?.gender === 'M' ? 'Male' : teacherData?.gender === 'F' ? 'Female' : 'Other', <UserOutlined />)}
                                {renderDetailItem('Date of Birth', teacherData?.dob ? moment(teacherData.dob).format('DD MMM, YYYY') : 'N/A', <CalendarOutlined />)}
                                {renderDetailItem('Blood Group', teacherData?.profile?.blood_group, <HeartOutlined />)}
                                {renderDetailItem('Nationality', teacherData?.profile?.nationality, <IdcardOutlined />)}
                              </>
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'attendance',
                  label: <span style={{ fontWeight: 'bold' }}>Attendance</span>,
                  children: <div style={{ textAlign: 'center', padding: '40px' }}>Coming Soon</div>
                },
                {
                  key: 'academics',
                  label: <span style={{ fontWeight: 'bold' }}>Academics</span>,
                  children: <div style={{ textAlign: 'center', padding: '40px' }}>Coming Soon</div>
                },
                {
                  key: 'activities',
                  label: <span style={{ fontWeight: 'bold' }}>Activities</span>,
                  children: <div style={{ textAlign: 'center', padding: '40px' }}>Coming Soon</div>
                }
              ]}
              style={{ margin: 0 }}
            />
          </div>
        </div>
      </Spin>
    </>
  );
};

const TeacherForm = ({ visible, onCancel, onSubmit, initialValues, loading }) => {
  const [form] = Form.useForm();
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (visible) {
      loadSubjects();
      if (initialValues) {
        const formattedValues = {
          ...initialValues,
          dob: initialValues.dob ? moment(initialValues.dob) : null,
          joining_date: initialValues.joining_date ? moment(initialValues.joining_date) : null
        };
        form.setFieldsValue(formattedValues);
        if (initialValues.photo) {
          setPreviewImage(initialValues.photo);
        } else {
          setPreviewImage(null);
        }
      } else {
        form.resetFields();
        setPreviewImage(null);
        setSelectedFile(null);
      }
    }
  }, [visible, initialValues]);

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await api.subject.getSubjects();
      if (response.success) {
        setSubjects(response.data.results || []);
      }
    } catch (error) {
      message.error('Failed to load subjects');
      console.error('Error loading subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handlePhotoUpload = async (file) => {
    try {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        return false;
      }

      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setSelectedFile(file);
      
      return false;
    } catch (error) {
      console.error('Error handling image:', error);
      message.error('Failed to process image');
      return false;
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Form instance before validation:', form);
      console.log('Form fields before validation:', form.getFieldsValue());
      
      const values = await form.validateFields();
      console.log('Form values from TeacherForm:', values); // Debug log
      
      // Check if values are properly extracted
      if (!values || Object.keys(values).length === 0) {
        console.error('No values extracted from form');
        message.error('Please fill in all required fields');
        return;
      }
      
      onSubmit(values, initialValues, selectedFile);
    } catch (error) {
      console.error('Validation failed:', error);
      console.error('Validation errors:', error.errorFields); // Debug log
      
      // Try to get form values even if validation fails
      const formValues = form.getFieldsValue();
      console.log('Form values after validation failure:', formValues);
      
      // Check if we have some values to work with
      if (formValues && Object.keys(formValues).length > 0) {
        console.log('Using form values despite validation failure');
        onSubmit(formValues, initialValues, selectedFile);
        return;
      }
      
      // Show specific validation errors
      if (error.errorFields && error.errorFields.length > 0) {
        const errorMessages = error.errorFields.map(field => field.errors.join(', ')).join('; ');
        message.error(`Validation failed: ${errorMessages}`);
      } else {
        message.error('Please fill in all required fields');
      }
    }
  };

  if (!visible) return null;

  return (
    <div className="teacher-form-container">
      <div className="teacher-form-header">
        <Space>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => {
              setSelectedFile(null);
              setPreviewImage(null);
              onCancel();
            }}
          />
          <IdcardOutlined className="header-icon" style={{ color: '#7B83EB' }} />
          <Typography.Title level={4} className="header-title" style={{ color: '#7B83EB', margin: 0 }}>
            {initialValues ? 'Edit Teacher' : 'Add New Teacher'}
          </Typography.Title>
        </Space>
        <Button 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
          className="submit-button"
        >
          {initialValues ? 'Update Teacher' : 'Add Teacher'}
        </Button>
      </div>

      <div className="teacher-form-content">
        <div className="teacher-form-main">
          <Form
            key={initialValues ? `edit-${initialValues.id}` : 'create'}
            form={form}
            layout="vertical"
            className="teacher-form"
            preserve={false}
          >
            <Row gutter={24}>
              <Col span={16}>
                <Card 
                  title={
                    <Space>
                      <BookOutlined className="card-icon" style={{ color: '#7B83EB' }} />
                      <span style={{ color: '#7B83EB' }}>Professional Information</span>
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
                        <Input prefix={<IdcardOutlined style={{ color: '#7B83EB' }} />} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="joining_date"
                        label="Joining Date"
                        rules={[{ required: !initialValues, message: 'Please select joining date!' }]}
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
                        <Input prefix={<SafetyCertificateOutlined style={{ color: '#7B83EB' }} />} />
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
                      <HomeOutlined className="card-icon" style={{ color: '#7B83EB' }} />
                      <span style={{ color: '#7B83EB' }}>Contact Information</span>
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
              </Col>

              <Col span={8}>
                <Card className="photo-upload-card">
                  <Upload
                    name="photo"
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={handlePhotoUpload}
                    accept="image/*"
                  >
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div className="upload-placeholder">
                        <PlusOutlined />
                        <div>Upload Photo</div>
                      </div>
                    )}
                  </Upload>
                </Card>

                <Card 
                  title={
                    <Space>
                      <UserOutlined className="card-icon" style={{ color: '#7B83EB' }} />
                      <span style={{ color: '#7B83EB' }}>Basic Information</span>
                    </Space>
                  }
                  className="info-card"
                >
                  <Form.Item
                    name="first_name"
                    label="First Name"
                    rules={[{ required: true, message: 'Please input first name!' }]}
                  >
                    <Input prefix={<UserOutlined style={{ color: '#7B83EB' }} />} />
                  </Form.Item>

                  <Form.Item
                    name="last_name"
                    label="Last Name"
                    rules={[{ required: true, message: 'Please input last name!' }]}
                  >
                    <Input prefix={<UserOutlined style={{ color: '#7B83EB' }} />} />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please input email!' },
                      { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                  >
                    <Input prefix={<MailOutlined style={{ color: '#7B83EB' }} />} />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Phone"
                    rules={[{ required: true, message: 'Please input phone number!' }]}
                  >
                    <Input prefix={<PhoneOutlined style={{ color: '#7B83EB' }} />} />
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
                    rules={[{ required: !initialValues, message: 'Please select date of birth!' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>

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

                  <Form.Item
                    name="nationality"
                    label="Nationality"
                    rules={[{ required: true, message: 'Please input nationality!' }]}
                  >
                    <Input />
                  </Form.Item>

                  {!initialValues && (
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
            </Row>
          </Form>
        </div>
      </div>

      <style jsx>{`
        .teacher-form-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(159, 179, 223, 0.15);
          border: 1px solid rgba(159, 179, 223, 0.2);
        }

        .teacher-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #f0f0f0;
          background: #fff;
          border-radius: 16px 16px 0 0;
        }

        .header-icon {
          font-size: 24px;
        }

        .header-title {
          margin: 0 !important;
        }

        .submit-button {
          background: #7B83EB;
          border: none;
          height: 40px;
          padding: 0 24px;
          border-radius: 6px;
        }

        .teacher-form-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .teacher-form-main {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }

        .info-card {
          margin-bottom: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .photo-upload-card {
          text-align: center;
          background: #fafafa;
          border: 1px dashed #d9d9d9;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #8c8c8c;
        }

        .card-icon {
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

const Teachers = forwardRef((props, ref) => {
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
  const [viewMode, setViewMode] = useState(false);
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
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportType, setExportType] = useState('excel');
  const [exportEmails, setExportEmails] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportMode, setExportMode] = useState('download');
  
  // Import modal states
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('idle');
  
  const [teacherCount, setTeacherCount] = useState(teachers.length);

  const {
    columnSettingsVisible,
    setColumnSettingsVisible,
    columnSettings,
    handleColumnVisibilityChange,
    handleColumnReorder,
    handleCheckAll,
    getVisibleColumns
  } = useColumnSettings([
    { key: 'photo', title: 'Photo', visible: true, order: 0 },
    { key: 'name', title: 'Name', visible: true, order: 1 },
    { key: 'subject', title: 'Subject', visible: true, order: 2 },
    { key: 'qualification', title: 'Qualification', visible: true, order: 3 },
    { key: 'class_id', title: 'Class', visible: true, order: 4 },
    { key: 'status', title: 'Status', visible: true, order: 5 },
    { key: 'actions', title: 'Actions', visible: true, order: 6 }
  ]);

  const handleImport = async (file) => {
    setImportLoading(true);
    setImportStatus('uploading');
    setImportProgress(0);
    
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setImportStatus('processing');
      setImportProgress(0);
      
      // Simulate processing
      for (let i = 0; i <= 100; i += 20) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Here you would typically process the Excel file
      // For now, we'll just simulate success
      setImportStatus('success');
      message.success('Teachers imported successfully!');
      
      // Refresh the teachers list
      // refreshTeachers(); // You would need to implement this
      
    } catch (error) {
      setImportStatus('error');
      message.error('Import failed. Please check your file format.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadSample = () => {
    downloadSampleFile('teachers');
  };

  useEffect(() => {
    loadSubjects();
    setTeacherCount(teachers.length);
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

  const handleSubmit = async (values) => {
    try {
      setActionLoading(true);
      console.log('Received values in handleSubmit:', values); // Debug log
      
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
        if (values.dob && editingTeacher.dob) {
          if (values.dob.format('YYYY-MM-DD') !== editingTeacher.dob.format('YYYY-MM-DD')) {
            updateData.dob = values.dob.format('YYYY-MM-DD');
          }
        } else if (values.dob && !editingTeacher.dob) {
          updateData.dob = values.dob.format('YYYY-MM-DD');
        } else if (!values.dob && editingTeacher.dob) {
          updateData.dob = null;
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
        if (values.joining_date && editingTeacher.joining_date) {
          if (values.joining_date.format('YYYY-MM-DD') !== editingTeacher.joining_date.format('YYYY-MM-DD')) {
            teacherProfileChanges.joining_date = values.joining_date.format('YYYY-MM-DD');
          }
        } else if (values.joining_date && !editingTeacher.joining_date) {
          teacherProfileChanges.joining_date = values.joining_date.format('YYYY-MM-DD');
        } else if (!values.joining_date && editingTeacher.joining_date) {
          teacherProfileChanges.joining_date = null;
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
        console.log('Creating new teacher with values:', values);
        console.log('Values type:', typeof values);
        console.log('Values keys:', Object.keys(values || {}));
        
        const createData = {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
          gender: values.gender,
          dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
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
            joining_date: values.joining_date ? values.joining_date.format('YYYY-MM-DD') : null,
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
          setViewMode(true);
          setModalVisible(true);
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

  const handleTableChange = (pagination, filters, sorter) => {
    loadTeachers(pagination.current, pagination.pageSize);
  };

  // Expose handleAdd function through ref
  useImperativeHandle(ref, () => ({
    handleAdd: () => {
      setEditingTeacher(null);
      setModalVisible(true);
    }
  }));

  useEffect(() => { setTeacherCount(teachers.length); }, [teachers]);

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
      {!modalVisible ? (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            padding: '24px 24px 0 24px',
            background: '#fff',
          }}>
            {/* Left: Search */}
            <Input.Search
              placeholder="Search teachers..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 250, borderRadius: '6px', boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)', border: '1px solid rgba(159, 179, 223, 0.3)' }}
              prefix={<SearchOutlined style={{ color: '#44cf65' }} />}
            />
            {/* Right: Controls */}
            <Space size="small">
              <Tooltip title="Total Teachers">
                <div className="teacher-count-badge" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f5f5f5', border: '1px solid #f0f0f0', borderRadius: '20px', cursor: 'default', transition: 'all 0.3s ease' }}>
                  <UserAddOutlined style={{ fontSize: '16px', color: '#44cf65' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#44cf65' }}>{teacherCount}+</span>
                </div>
              </Tooltip>
              <Tooltip title="Export Teachers">
                <Button
                  type="text"
                  icon={<ExportOutlined />}
                  onClick={() => setExportModalVisible(true)}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', border: '1px solid #f0f0f0', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </Tooltip>
              <Tooltip title="Import Teachers">
                <Button
                  type="text"
                  icon={<ImportOutlined />}
                  onClick={() => setImportModalVisible(true)}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', border: '1px solid #f0f0f0', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </Tooltip>
              <Tooltip title="Column Settings">
                <img src="/checklist.png" alt="Settings" style={{ width: '24px', height: '24px', cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => setColumnSettingsVisible(true)} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.filter = 'brightness(0.9)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)'; }} />
              </Tooltip>
            </Space>
          </div>

          <div style={{ 
            flex: 1, 
            overflow: 'hidden',
            padding: '0 16px 16px 16px'
          }}>
            <Table
              columns={getVisibleColumns().map(col => {
                const column = columns.find(c => c.key === col.key);
                return column || { title: col.title, dataIndex: col.key, key: col.key };
              })}
              dataSource={teachers}
              rowKey="id"
              loading={teachersLoading || actionLoading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalTeachers,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} teachers`,
                onChange: handleTableChange
              }}
              onChange={handleTableChange}
              rowSelection={rowSelection}
              className="teachers-table"
              scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
            />
          </div>
        </>
      ) : viewMode ? (
        <TeacherView
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setViewMode(false);
            setSelectedTeacher(null);
          }}
          teacher={selectedTeacher}
          onTeacherUpdate={() => {}}
        />
      ) : (
        <TeacherForm
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingTeacher(null);
          }}
          onSubmit={handleSubmit}
          initialValues={editingTeacher}
          loading={actionLoading}
        />
      )}

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


      <ImagePreviewModal
        visible={previewVisible}
        imageUrl={previewImage}
        onCancel={handlePreviewCancel}
        onUpload={handlePreviewUpload}
        loading={uploadingImage}
      />

      <ColumnSettingsDrawer
        visible={columnSettingsVisible}
        onClose={() => setColumnSettingsVisible(false)}
        columnSettings={columnSettings}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        onColumnReorder={handleColumnReorder}
        onCheckAll={handleCheckAll}
      />

      <StyledModal
        visible={exportModalVisible}
        onClose={() => { setExportModalVisible(false); setExportType('excel'); setExportEmails([]); setExportMode('download'); }}
        title={<Space><ExportOutlined style={{ color: '#44cf65' }} /><span>Export Teachers</span></Space>}
        width={400}
        className="export-modal"
        style={{
          maxHeight: 'none',
          overflowY: 'visible'
        }}
      >
        <div className="export-modal-content">
          <Form layout="vertical">
            <Form.Item label="Export Format" className="export-format-item">
              <div className="format-options">
                <div className={`format-option ${exportType === 'excel' ? 'active' : ''}`} onClick={() => setExportType('excel')}>
                  <FileExcelOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                  <span>Excel</span>
                </div>
                <div className={`format-option ${exportType === 'pdf' ? 'active' : ''}`} onClick={() => setExportType('pdf')}>
                  <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                  <span>PDF</span>
                </div>
              </div>
            </Form.Item>
            <Form.Item label="Export Mode" className="export-mode-item">
              <div className="mode-options">
                <div className={`mode-option ${exportMode === 'download' ? 'active' : ''}`} onClick={() => setExportMode('download')}>
                  <DownloadOutlined style={{ fontSize: '18px' }} />
                  <span>Download</span>
                </div>
                <div className={`mode-option ${exportMode === 'send' ? 'active' : ''}`} onClick={() => setExportMode('send')}>
                  <SendOutlined style={{ fontSize: '18px' }} />
                  <span>Send via Email</span>
                </div>
              </div>
            </Form.Item>
            {exportMode === 'send' && (
              <Form.Item label="Email Addresses" className="email-item">
                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder="Enter email addresses"
                  value={exportEmails}
                  onChange={setExportEmails}
                  tokenSeparators={[',']}
                  className="email-select"
                  maxTagCount={3}
                  maxTagTextLength={20}
                  dropdownStyle={{ 
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}
                  getPopupContainer={(trigger) => trigger.parentElement}
                />
              </Form.Item>
            )}
            <Form.Item className="export-submit-item">
              <Button type="primary" onClick={() => { setExportLoading(true); setTimeout(() => { setExportLoading(false); setExportModalVisible(false); }, 1000); }} loading={exportLoading} block className="export-submit-button">
                {exportMode === 'download' ? 'Download' : 'Send'}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </StyledModal>

      <ImportModal
        visible={importModalVisible}
        onClose={() => {
          setImportModalVisible(false);
          setImportStatus('idle');
          setImportProgress(0);
        }}
        onImport={handleImport}
        title="Import Teachers"
        sampleFileUrl={handleDownloadSample}
        requiredFields={[
          'First Name',
          'Last Name',
          'Teacher ID',
          'Email',
          'Phone',
          'Date of Birth',
          'Gender',
          'Subject',
          'Qualification',
          'Status'
        ]}
        optionalFields={[
          'Experience',
          'Address',
          'Emergency Contact',
          'Emergency Phone',
          'Joining Date',
          'Salary'
        ]}
        brandColor="#44cf65"
        loading={importLoading}
        importProgress={importProgress}
        importStatus={importStatus}
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

          /* Export Modal Styles */
          .export-modal .ant-modal-content {
            border-radius: 12px;
            overflow: hidden;
          }

          .export-modal .ant-modal-header {
            border-bottom: 1px solid #f0f0f0;
            padding: 16px 24px;
            margin: 0;
          }

          .export-modal .ant-modal-body {
            padding: 24px;
            max-height: none;
            overflow-y: visible;
          }

          .export-modal-content {
            padding: 0;
          }

          .export-format-item,
          .export-mode-item {
            margin-bottom: 24px;
          }

          .format-options,
          .mode-options {
            display: flex;
            gap: 12px;
            width: 100%;
          }

          .format-option,
          .mode-option {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            border: 1px solid #f0f0f0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #fafafa;
          }

          .format-option:hover,
          .mode-option:hover {
            background: #f5f5f5;
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }

          .format-option.active,
          .mode-option.active {
            background: #44cf65;
            border-color: #44cf65;
            color: white;
          }

          .format-option.active .anticon,
          .mode-option.active .anticon {
            color: white !important;
          }

          .format-option span,
          .mode-option span {
            font-size: 13px;
            font-weight: 500;
          }

          .email-item {
            margin-bottom: 24px;
          }

          .email-select {
            border-radius: 6px;
          }

          .email-select .ant-select-selector {
            border-radius: 6px !important;
            border: 1px solid #f0f0f0 !important;
            padding: 4px 8px !important;
            min-height: 40px !important;
          }

          .email-select .ant-select-selection-item {
            background: #f5f5f5 !important;
            border: 1px solid #f0f0f0 !important;
            border-radius: 4px !important;
            padding: 2px 8px !important;
            margin: 2px !important;
            font-size: 12px !important;
          }

          .email-select .ant-select-selection-placeholder {
            line-height: 38px !important;
          }

          .email-select .ant-select-selection-overflow {
            flex-wrap: nowrap;
            overflow: hidden;
          }

          .email-select .ant-select-selection-overflow-item {
            flex: none;
          }

          .export-submit-item {
            margin-bottom: 0;
          }

          .export-submit-button {
            height: 40px;
            background: #44cf65;
            border-color: #44cf65;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .export-submit-button:hover {
            background: #44cf65;
            border-color: #44cf65;
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(68, 207, 101, 0.3);
          }

          .ant-form-item-label > label {
            font-size: 13px;
            font-weight: 500;
            color: #595959;
          }

          /* Select dropdown styling */
          .email-select .ant-select-dropdown {
            border-radius: 8px;
            box-shadow: 0 3px 12px rgba(0,0,0,0.1);
          }

          .email-select .ant-select-item {
            padding: 8px 12px;
            font-size: 13px;
          }

          .email-select .ant-select-item-option-selected {
            background: #f5f5f5;
            color: #44cf65;
          }

          .email-select .ant-select-item-option-active {
            background: #fafafa;
          }
        `}
      </style>
    </div>
  );
});

export default Teachers; 
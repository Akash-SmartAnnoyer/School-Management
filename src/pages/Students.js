import React, { useState, useEffect, useContext, forwardRef, useImperativeHandle, useRef } from 'react';
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
  Popconfirm,
  Checkbox,
  Radio,
  Tabs,
  Dropdown,
  Spin,
  Alert,
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
  LoadingOutlined,
  SwapOutlined,
  DeleteFilled,
  MoneyCollectOutlined,
  ArrowLeftOutlined,
  SettingOutlined,
  ExportOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  ImportOutlined,
  SendOutlined,
  UserAddOutlined,
  PrinterOutlined,
  MoreOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  TrophyOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import { uploadImage, getCloudinaryImage } from '../services/imageService';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import StudentDetailsDrawer from '../components/StudentDetailsDrawer';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { MessageContext } from '../contexts/MessageContext';
import moment from 'moment';
import api, { studentAPI } from '../services/api';
import { useStudents } from '../contexts/StudentsContext';
import StatusBadge from '../components/StatusBadge';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import './Students.css';
import { DragHandleOutlined } from '@mui/icons-material';
import StyledModal from '../components/StyledModal';
import ImportModal from '../components/ImportModal';
import TabPane from 'antd/es/tabs/TabPane';
import useMessage from 'antd/es/message/useMessage';
import { useClasses } from '../contexts/ClassesContext';
import { downloadSampleFile } from '../utils/sampleFileGenerator';

const { Option } = Select;
const { Search } = AntInput;
const { Title } = Typography;

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dyr02bpil'
  }
});

const StudentView = ({ visible, onCancel, student, onStudentUpdate }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { refreshStudents } = useStudents();
  const [editingSection, setEditingSection] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  
  if (!visible || !student) return null;

  const handleEditSection = (section) => {
    setEditingSection(section);
    setEditedValues({ ...student });
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
      
      if (section === 'basic') {
        updateData.first_name = editedValues.first_name;
        updateData.last_name = editedValues.last_name;
        updateData.email = editedValues.email;
        updateData.phone = editedValues.phone;
        updateData.gender = editedValues.gender;
        updateData.dob = editedValues.dob?.format('YYYY-MM-DD');
      } else if (section === 'contact') {
        updateData.email = editedValues.email;
        updateData.phone = editedValues.phone;
        updateData.parent_address = editedValues.parent_address;
      } else if (section === 'academic') {
        updateData.student_profile = {
          student_id: editedValues.student_id,
          admission_number: editedValues.admission_number,
          admission_date: editedValues.admission_date?.format('YYYY-MM-DD'),
          last_grade_attended: editedValues.last_grade_attended,
          roll_no: editedValues.roll_no,
          section: editedValues.section
        };
      } else if (section === 'parent') {
        updateData.student_profile = {
          father_name: editedValues.father_name,
          father_occupation: editedValues.father_occupation,
          mother_name: editedValues.mother_name,
          mother_occupation: editedValues.mother_occupation,
          parent_address: editedValues.parent_address,
          parent_email: editedValues.parent_email,
          parent_phone: editedValues.parent_phone
        };
      } else if (section === 'profile') {
        updateData.profile = {
          nationality: editedValues.profile?.nationality,
          blood_group: editedValues.blood_group
        };
      }
      
      // Create FormData for the update
      const formData = new FormData();
      Object.entries(updateData).forEach(([key, value]) => {
        if (key === 'profile' || key === 'student_profile') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      
      await api.student.updateStudent(student.user_id || student.id, formData);
      messageApi.success('Student information updated successfully');
      
      // Refresh the student data to show updated information
      if (onStudentUpdate) {
        await onStudentUpdate(student.user_id || student.id);
      }
      
      refreshStudents();
      setEditingSection(null);
      setEditedValues({});
    } catch (error) {
      console.error('Error updating student:', error);
      messageApi.error('Failed to update student information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await studentAPI.deleteStudent(student.id);
      messageApi.success('Student deleted successfully');
      refreshStudents(); // Refresh the student list
      onCancel(); // Close the view modal
    } catch (error) {
      console.error('Error deleting student:', error);
      messageApi.error('Failed to delete student');
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
              value={editedValues[field] || ''}
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

  const getRomanNumeral = (num) => {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return romanNumerals[num - 1] || num;
  };

  const items = [
    {
      key: 'edit',
      label: 'Edit Student',
      icon: <EditOutlined />,
      onClick: () => {
        setIsEditing(true);
        navigate(`/students/edit/${student.id}`);
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
          title: 'Are you sure you want to delete this student?',
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
                src={student.photo}
                icon={!student.photo && (student.gender === 'M' ? 
                  <img src="/student-boy.png" alt="Male Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                  <img src="/student-girl.png" alt="Female Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    <span style={{ color: '#1f1f1f' }}>{student.first_name} </span>
                    <span style={{ color: '#f54278' }}>{student.last_name}</span>
                  </Typography.Title>
                )}
                <Typography.Text copyable style={{ color: '#666', fontSize: '14px' }}>
                  #{student.student_id || student.user_id}
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
                {/* {editingSection === 'basic' ? (
                  <Space>
                    <Button type="primary" size="small" onClick={() => handleSaveEdit('basic')}>
                      Save
                    </Button>
                    <Button size="small" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </Space>
                ) : (
                  <>
                    <Typography.Text strong style={{ fontSize: '16px' }}>
                      {getRomanNumeral(student.profile?.class_name)}-{student.student_profile?.section}
                    </Typography.Text>
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      onClick={() => handleEditSection('basic')}
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
                  </>
                )} */}
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
                  Admission Details
                </Typography.Text>
                {editingSection === 'basic' ? (
                  <Space>
                    <Input
                      value={editedValues.admission_number || ''}
                      onChange={(e) => handleFieldChange('admission_number', e.target.value)}
                      style={{ width: '150px' }}
                    />
                    <DatePicker
                      value={editedValues.admission_date ? moment(editedValues.admission_date) : null}
                      onChange={(date) => handleFieldChange('admission_date', date)}
                      style={{ width: '150px' }}
                    />
                  </Space>
                ) : (
                  <>
                    <Typography.Text strong style={{ fontSize: '14px', marginLeft: '8px' }}>
                      {student.admission_number}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: '12px', marginLeft: '4px' }}>
                      {student.admission_date ? moment(student.admission_date).format('DD MMM, YYYY') : 'N/A'}
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
                      value={editedValues.parent_address || ''}
                      onChange={(e) => handleFieldChange('parent_address', e.target.value)}
                      prefix={<EnvironmentOutlined style={{ color: '#666' }} />}
                      style={{ width: '200px' }}
                    />
                  </Space>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MailOutlined style={{ color: '#666' }} />
                      <Typography.Text style={{ fontSize: '14px' }}>
                        {student.email || 'No email'}
                      </Typography.Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PhoneOutlined style={{ color: '#666' }} />
                      <Typography.Text style={{ fontSize: '14px' }}>
                        {student.phone || 'No phone'}
                      </Typography.Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <EnvironmentOutlined style={{ color: '#666' }} />
                      <Typography.Text style={{ fontSize: '14px' }}>
                        {student.parent_address || 'No address'}
                      </Typography.Text>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ 
            padding: '16px 24px',
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
                              {renderDetailItem('Email', student.email, <MailOutlined />, 'email', 'contact')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Phone', student.phone, <PhoneOutlined />, 'phone', 'contact')}
                            </Col>
                            <Col span={24}>
                              {renderDetailItem('Address', student.parent_address, <EnvironmentOutlined />, 'parent_address', 'contact')}
                            </Col>
                          </Row>
                        </Card>

                        <Card 
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>Academic Profile</span>
                              {editingSection === 'academic' ? (
                                <Space>
                                  <Tooltip title="Save Changes">
                                    <Button 
                                      type="text" 
                                      size="small" 
                                      icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />}
                                      onClick={() => handleSaveEdit('academic')}
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
                                  onClick={() => handleEditSection('academic')}
                                />
                              )}
                            </div>
                          }
                          bordered={false} 
                          style={{ 
                            marginTop: '16px',
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
                              {renderDetailItem('Class', `${getRomanNumeral(student.profile?.class_name)}-${student.student_profile?.section}`, <BookOutlined />, 'class_name', 'academic')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Roll Number', student.roll_no, <IdcardOutlined />, 'roll_no', 'academic')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Last Grade Attended', student.last_grade_attended, <TrophyOutlined />, 'last_grade_attended', 'academic')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Admission Number', student.admission_number, <NumberOutlined />, 'admission_number', 'academic')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Admission Date', student.admission_date ? moment(student.admission_date).format('DD MMM, YYYY') : 'N/A', <CalendarOutlined />, 'admission_date', 'academic')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Status', student.status === 'active' ? 'Active' : 'Inactive', <CheckCircleOutlined />, 'status', 'academic')}
                            </Col>
                          </Row>
                        </Card>

                        <Card 
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>Parent Information</span>
                              {editingSection === 'parent' ? (
                                <Space>
                                  <Tooltip title="Save Changes">
                                    <Button 
                                      type="text" 
                                      size="small" 
                                      icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />}
                                      onClick={() => handleSaveEdit('parent')}
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
                                  onClick={() => handleEditSection('parent')}
                                />
                              )}
                            </div>
                          }
                          bordered={false} 
                          style={{ 
                            marginTop: '16px',
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
                              {renderDetailItem("Father's Name", student.father_name, <UserOutlined />, 'father_name', 'parent')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem("Father's Occupation", student.father_occupation, <UserOutlined />, 'father_occupation', 'parent')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem("Mother's Name", student.mother_name, <UserOutlined />, 'mother_name', 'parent')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem("Mother's Occupation", student.mother_occupation, <UserOutlined />, 'mother_occupation', 'parent')}
                            </Col>
                            <Col span={24}>
                              {renderDetailItem("Parent's Address", student.parent_address, <EnvironmentOutlined />, 'parent_address', 'parent')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem("Parent's Email", student.parent_email, <MailOutlined />, 'parent_email', 'parent')}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem("Parent's Phone", student.parent_phone, <PhoneOutlined />, 'parent_phone', 'parent')}
                            </Col>
                          </Row>
                        </Card>

                        <Card 
                          title={
                            <Space>
                              <MoneyCollectOutlined className="card-icon" style={{ color: '#7B83EB' }} />
                              <span style={{ color: '#7B83EB' }}>Fee Details</span>
                            </Space>
                          }
                          bordered={false} 
                          style={{ 
                            marginTop: '16px',
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
                              {renderDetailItem('Fee Type', student.fee_type, <MoneyCollectOutlined />)}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Fee Amount', student.fee_amount ? `₹${student.fee_amount}` : 'N/A', <MoneyCollectOutlined />)}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Payment Status', student.payment_status, <SafetyCertificateOutlined />)}
                            </Col>
                            <Col span={12}>
                              {renderDetailItem('Last Payment Date', student.last_payment_date ? moment(student.last_payment_date).format('DD MMM, YYYY') : 'N/A', <CalendarOutlined />)}
                            </Col>
                          </Row>
                        </Card>
                      </div>

                      <div style={{ width: '300px' }}>
                        <Card bordered={false}>
                          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <Avatar 
                              size={120}
                              src={student.photo}
                              icon={!student.photo && (student.gender === 'M' ? 
                                <img src="/student-boy.png" alt="Male Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                                <img src="/student-girl.png" alt="Female Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              )}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {/* Add image preview handler */}}
                            />
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <Typography.Title level={4} style={{ margin: '8px 0' }}>
                              {student.first_name} {student.last_name}
                            </Typography.Title>
                            <Typography.Text type="secondary">
                              #{student.student_id || student.user_id}
                            </Typography.Text>
                          </div>
                          <Divider />
                          <div style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <Typography.Title level={5} style={{ margin: 0 }}>Basic Information</Typography.Title>
                              {editingSection === 'profile' ? (
                                <Space>
                                  <Tooltip title="Save Changes">
                                    <Button 
                                      type="text" 
                                      size="small" 
                                      icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />}
                                      onClick={() => handleSaveEdit('profile')}
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
                                  onClick={() => handleEditSection('profile')}
                                />
                              )}
                            </div>
                            {editingSection === 'profile' ? (
                              <>
                                <Form.Item label="Gender" style={{ marginBottom: '8px' }}>
                                  <Select
                                    value={editedValues.gender}
                                    onChange={(value) => handleFieldChange('gender', value)}
                                    style={{ width: '100%' }}
                                  >
                                    <Select.Option value="M">Male</Select.Option>
                                    <Select.Option value="F">Female</Select.Option>
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
                                    value={editedValues.blood_group}
                                    onChange={(value) => handleFieldChange('blood_group', value)}
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
                                  />
                                </Form.Item>
                              </>
                            ) : (
                              <>
                                {renderDetailItem('Gender', student.gender === 'M' ? 'Male' : 'Female', <ManOutlined />)}
                                {renderDetailItem('Date of Birth', student.dob ? moment(student.dob).format('DD MMM, YYYY') : 'N/A', <CalendarOutlined />)}
                                {renderDetailItem('Blood Group', student.blood_group, <HeartOutlined />)}
                                {renderDetailItem('Nationality', student.profile?.nationality, <GlobalOutlined />)}
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
                  key: 'sports',
                  label: <span style={{ fontWeight: 'bold' }}>Sports & Cultural</span>,
                  children: <div style={{ textAlign: 'center', padding: '40px' }}>Coming Soon</div>
                },
                {
                  key: 'others',
                  label: <span style={{ fontWeight: 'bold' }}>Others</span>,
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

const StudentForm = ({ visible, onCancel, onSubmit, initialValues, loading }) => {
  const [form] = Form.useForm();
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [originalValues, setOriginalValues] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (visible) {
      loadClasses();
      if (initialValues) {
        const formattedValues = {
          ...initialValues,
          dob: initialValues.dob ? moment(initialValues.dob) : null,
          admission_date: initialValues.admission_date ? moment(initialValues.admission_date) : null
        };
        setOriginalValues(formattedValues);
        form.setFieldsValue(formattedValues);
        if (initialValues.photo) {
          setPreviewImage(initialValues.photo);
        } else {
          setPreviewImage(null);
        }
      } else {
        setOriginalValues(null);
        form.resetFields();
        setPreviewImage(null);
        setSelectedFile(null);
      }
    }
  }, [visible, initialValues]);

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await api.class.getClasses();
      if (response.success) {
        const classesData = response.data.results || response.data;
        setClasses(classesData);
      } else {
        message.error('Failed to load classes');
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      message.error('Failed to load classes');
    } finally {
      setLoadingClasses(false);
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
      const values = await form.validateFields();
      onSubmit(values, originalValues, selectedFile);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  if (!visible) return null;

  return (
    <div className="student-form-container">
      <div className="student-form-header">
        <Space>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => {
              setSelectedFile(null);
              setPreviewImage(null);
              onCancel();
            }}
            className="back-button"
          />
          <img 
            src="/students.png" 
            alt="Students" 
            style={{ 
              width: '24px', 
              height: '24px',
              objectFit: 'contain'
            }} 
          />
          <Typography.Title level={4} className="header-title" style={{ margin: 0 }}>
            <span style={{ color: '#1f1f1f' }}>
              {initialValues?.isViewMode ? 'View ' : initialValues ? 'Edit ' : 'Add New '}
            </span>
            <span style={{ color: '#f54278' }}>Student</span>
          </Typography.Title>
        </Space>
        {!initialValues?.isViewMode && (
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={loading}
            className="submit-button"
          >
            {initialValues ? 'Update Student' : 'Add Student'}
          </Button>
        )}
      </div>

      <div className="student-form-content">
        <div className="student-form-main">
          <Form
            key={initialValues ? `edit-${initialValues.id}` : 'create'}
            form={form}
            layout="vertical"
            className="student-form"
            disabled={initialValues?.isViewMode}
          >
            <Row gutter={24}>
              <Col span={16}>
                <Card 
                  title={
                    <Space>
                      <BookOutlined className="card-icon" style={{ color: '#7B83EB' }} />
                      <span style={{ color: '#7B83EB' }}>Academic Information</span>
                    </Space>
                  }
                  className="info-card"
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="student_id"
                        label="Student ID"
                        rules={[{ required: true, message: 'Please input student ID!' }]}
                      >
                        <Input prefix={<IdcardOutlined style={{ color: '#7B83EB' }} />} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="admission_number"
                        label="Admission Number"
                        rules={[{ required: true, message: 'Please input admission number!' }]}
                      >
                        <Input prefix={<IdcardOutlined style={{ color: '#7B83EB' }} />} />
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
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>

                </Card>

                <Card 
                  title={
                    <Space>
                      <HomeOutlined className="card-icon" style={{ color: '#7B83EB' }} />
                      <span style={{ color: '#7B83EB' }}>Parent Information</span>
                    </Space>
                  }
                  className="info-card"
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="father_name"
                        label="Father's Name"
                        rules={[{ required: true, message: 'Please input father\'s name!' }]}
                      >
                        <Input prefix={<UserOutlined style={{ color: '#7B83EB' }} />} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="father_occupation"
                        label="Father's Occupation"
                        rules={[{ required: true, message: 'Please input father\'s occupation!' }]}
                      >
                        <Input />
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
                        <Input prefix={<UserOutlined style={{ color: '#7B83EB' }} />} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="mother_occupation"
                        label="Mother's Occupation"
                        rules={[{ required: true, message: "Please input mother's occupation!" }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="parent_address"
                    label="Parent's Address"
                    rules={[{ required: true, message: 'Please input parent\'s address!' }]}
                  >
                    <Input.TextArea rows={3} />
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
                        <Input prefix={<MailOutlined style={{ color: '#7B83EB' }} />} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="parent_phone"
                        label="Parent's Phone"
                        rules={[{ required: true, message: 'Please input parent\'s phone number!' }]}
                      >
                        <Input prefix={<PhoneOutlined style={{ color: '#7B83EB' }} />} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                <Card 
                  title={
                    <Space>
                      <InfoCircleOutlined className="card-icon" style={{ color: '#7B83EB' }} />
                      <span style={{ color: '#7B83EB' }}>Additional Information</span>
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
                        name="allergies"
                        label="Allergies"
                      >
                        <Input.TextArea rows={2} />
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
                    rules={[{ required: true, message: 'Please select date of birth!' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item
                    name={['profile', 'classroom_id']}
                    label="Class"
                    rules={[{ required: true, message: 'Please select class!' }]}
                  >
                    <Select loading={loadingClasses}>
                      {classes.map(cls => (
                        <Option key={cls.id} value={cls.id}>
                          {cls.class_name} - Section {cls.section}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="roll_no"
                    label="Roll Number"
                    rules={[{ required: true, message: 'Please input roll number!' }]}
                  >
                    <Input type="number" />
                  </Form.Item>

                  <Form.Item
                    name={['profile', 'nationality']}
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

            <Card 
              title={
                <Space>
                  <MoneyCollectOutlined className="card-icon" style={{ color: '#7B83EB' }} />
                  <span style={{ color: '#7B83EB' }}>Fee Details</span>
                </Space>
              }
              className="fee-details-card"
            >
              <Form.List 
                name="fee_details"
                initialValue={initialValues?.fee_details || [{}]}
              >
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card 
                        key={key} 
                        style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}
                        extra={
                          fields.length > 1 && (
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => remove(name)}
                            />
                          )
                        }
                      >
                        <Row gutter={16}>
                          <Col span={24}>
                            <Form.Item
                              {...restField}
                              name={[name, 'fee_type']}
                              label="Fee Type"
                              rules={[{ required: true, message: 'Please select or enter fee type!' }]}
                            >
                              <Select
                                showSearch
                                allowClear
                                placeholder="Select or enter fee type"
                              >
                                <Option value="Tuition Fee">Tuition Fee</Option>
                                <Option value="Transport Fee">Transport Fee</Option>
                                <Option value="Library Fee">Library Fee</Option>
                                <Option value="Sports Fee">Sports Fee</Option>
                                <Option value="Books Fee">Books Fee</Option>
                                <Option value="Joining Fee">Joining Fee</Option>
                                <Option value="Anniversary Fee">Anniversary Fee</Option>
                                <Option value="Special Fee">Special Fee</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'amount']}
                              label="Total Amount"
                              rules={[{ required: true, message: 'Please enter amount!' }]}
                            >
                              <Input prefix="₹" type="number" step="0.01" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'period']}
                              label="Fee Period"
                              rules={[{ required: true, message: 'Please select period!' }]}
                            >
                              <Select onChange={(value) => {
                                const amount = form.getFieldValue(['fee_details', name, 'amount']);
                                if (amount) {
                                  let terms = 1;
                                  switch(value) {
                                    case 'Monthly':
                                      terms = 12;
                                      break;
                                    case 'Quarterly':
                                      terms = 4;
                                      break;
                                    case 'Half Yearly':
                                      terms = 2;
                                      break;
                                    case 'Yearly':
                                      terms = 1;
                                      break;
                                  }
                                  const amountPerTerm = (amount / terms).toFixed(2);
                                  form.setFieldsValue({
                                    fee_details: {
                                      [name]: {
                                        terms,
                                        amount_per_term: amountPerTerm
                                      }
                                    }
                                  });
                                }
                              }}>
                                <Option value="Monthly">Monthly</Option>
                                <Option value="Quarterly">Quarterly</Option>
                                <Option value="Half Yearly">Half Yearly</Option>
                                <Option value="Yearly">Yearly</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'terms']}
                              label="Number of Terms"
                            >
                              <Input type="number" disabled />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'amount_per_term']}
                              label="Amount per Term"
                            >
                              <Input prefix="₹" type="number" step="0.01" disabled />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'status']}
                              label="Fee Status"
                              rules={[{ required: true, message: 'Please select status!' }]}
                            >
                              <Select onChange={(value) => {
                                if (value === 'Partial') {
                                  form.setFieldsValue({
                                    fee_details: {
                                      [name]: {
                                        show_due_amount: true
                                      }
                                    }
                                  });
                                } else {
                                  form.setFieldsValue({
                                    fee_details: {
                                      [name]: {
                                        show_due_amount: false,
                                        due_amount: null
                                      }
                                    }
                                  });
                                }
                              }}>
                                <Option value="Paid">Paid</Option>
                                <Option value="Unpaid">Unpaid</Option>
                                <Option value="Partial">Partial</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              noStyle
                              shouldUpdate={(prevValues, currentValues) => {
                                return prevValues?.fee_details?.[name]?.status !== currentValues?.fee_details?.[name]?.status;
                              }}
                            >
                              {({ getFieldValue }) => {
                                const showDueAmount = getFieldValue(['fee_details', name, 'show_due_amount']);
                                return showDueAmount ? (
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'due_amount']}
                                    label="Due Amount"
                                    rules={[{ required: true, message: 'Please enter due amount!' }]}
                                  >
                                    <Input prefix="₹" type="number" step="0.01" />
                                  </Form.Item>
                                ) : null;
                              }}
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item
                          {...restField}
                          name={[name, 'remarks']}
                          label="Remarks"
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button 
                        type="dashed" 
                        onClick={() => add()} 
                        block 
                        icon={<PlusOutlined />}
                      >
                        Add Fee
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>
          </Form>
        </div>
      </div>

      <style jsx>{`
        .student-form-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(159, 179, 223, 0.15);
          border: 1px solid rgba(159, 179, 223, 0.2);
        }

        .student-form-header {
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

        .back-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          border: none;
          transition: all 0.3s;
        }

        .back-button:hover {
          background: #e8e8e8;
        }

        .submit-button {
          background: #f54278;
          border: none;
          height: 40px;
          padding: 0 24px;
          border-radius: 6px;
          transition: all 0.3s;
        }

        .submit-button:hover {
          background: #e03a6a;
        }

        .student-form-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .student-form-main {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }

        .fee-details-card {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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

const ImagePreviewModal = ({ visible, imageUrl, onCancel, onUpload, loading }) => {
  return (
    <Modal
      title="Preview Profile Picture"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="upload" 
          type="primary" 
          onClick={onUpload}
          loading={loading}
        >
          Upload
        </Button>
      ]}
    >
      <div style={{ textAlign: 'center' }}>
        <img 
          src={imageUrl} 
          alt="Preview" 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '300px',
            objectFit: 'contain',
            borderRadius: '8px'
          }} 
        />
      </div>
    </Modal>
  );
};

const ColumnSettingsDrawer = ({ 
  visible, 
  onClose, 
  onApply, 
  onCancel, 
  columnSettings, 
  onColumnVisibilityChange, 
  onColumnReorder, 
  onCheckAll 
}) => {
  const allChecked = columnSettings?.columns.every(col => col.visible) || false;
  const indeterminate = columnSettings?.columns.some(col => col.visible) && !allChecked;

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onColumnReorder(result);
  };

  return (
    <Drawer
      title={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: 'white',
          paddingRight: '40px'
        }}>
          <SettingOutlined style={{ fontSize: '18px' }} />
          <span style={{ fontSize: '12px', fontWeight: 500 }}>Toggle Cols</span>
        </div>
      }
      placement="right"
      onClose={onCancel}
      open={visible}
      width={280}
      className="column-settings-drawer"
      closable={false}
      extra={
        <Checkbox
          indeterminate={indeterminate}
          checked={allChecked}
          onChange={(e) => onCheckAll(e.target.checked)}
          className="check-all-checkbox"
        >
          <span className="check-all-text">{allChecked ? 'Uncheck All' : 'Check All'}</span>
        </Checkbox>
      }
    >
      <div className="column-settings-content">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="columns">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="columns-list"
              >
                {columnSettings?.columns.map((col, index) => (
                  <Draggable 
                    key={col.key} 
                    draggableId={col.key} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                          marginBottom: '8px'
                        }}
                        className={`column-item ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        <div className="column-item-content">
                          <div {...provided.dragHandleProps} className="drag-handle">
                            <DragHandleOutlined />
                          </div>
                          <Checkbox
                            checked={col.visible}
                            onChange={(e) => onColumnVisibilityChange(col.key, e.target.checked)}
                            className="column-checkbox"
                          >
                            <span className="column-title">{col.title}</span>
                          </Checkbox>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <style>
        {`
          .column-settings-drawer .ant-drawer-header {
            background: #7B83EB;
            border-bottom: none;
            padding: 12px 16px;
          }

          .column-settings-drawer .ant-drawer-title {
            color: white;
            font-size: 15px;
            font-weight: 500;
          }

          .column-settings-drawer .ant-drawer-body {
            padding: 0;
          }

          .column-settings-content {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .check-all-checkbox {
            margin-right: 0;
          }

          .check-all-text {
            font-size: 13px;
            font-weight: 500;
            color: white;
          }

          .columns-list {
            flex: 1;
            overflow-y: auto;
            padding: 12px 16px;
            min-height: 100px;
          }

          .column-item {
            background: white;
            border: 1px solid #f0f0f0;
            border-radius: 6px;
            transition: all 0.2s ease;
          }

          .column-item.dragging {
            background: #fafafa;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            border: 1px solid #7B83EB;
          }

          .column-item-content {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
          }

          .drag-handle {
            color: #999;
            cursor: grab;
            font-size: 14px;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .drag-handle:hover {
            background: #f5f5f5;
            color: #666;
          }

          .drag-handle:active {
            cursor: grabbing;
          }

          .column-checkbox {
            flex: 1;
          }

          .column-title {
            font-size: 13px;
            color: #262626;
          }

          .column-settings-drawer .ant-checkbox-wrapper:hover .ant-checkbox-inner,
          .column-settings-drawer .ant-checkbox:hover .ant-checkbox-inner,
          .column-settings-drawer .ant-checkbox-input:focus + .ant-checkbox-inner {
            border-color: #7B83EB;
          }

          .column-settings-drawer .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #7B83EB;
            border-color: #7B83EB;
          }

          .column-settings-drawer .ant-checkbox-indeterminate .ant-checkbox-inner::after {
            background-color: #7B83EB;
          }

          .column-settings-drawer .ant-checkbox-wrapper .ant-checkbox-inner {
            border-color: white;
          }

          .column-settings-drawer .ant-checkbox-wrapper:hover .ant-checkbox-inner {
            border-color: white;
          }

          .column-settings-drawer .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner {
            background-color: white;
            border-color: white;
          }

          .column-settings-drawer .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner::after {
            border-color: #7B83EB;
          }
        `}
      </style>
    </Drawer>
  );
};

const Students = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { 
    students, 
    loading, 
    currentPage, 
    totalStudents, 
    pageSize,
    setCurrentPage,
    setPageSize,
    loadStudents,
    refreshStudents 
  } = useStudents();
  const { classes } = useClasses();
  const [form] = Form.useForm();
  const [bulkStatusForm] = Form.useForm();
  const [bulkClassForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [bulkStatusModalVisible, setBulkStatusModalVisible] = useState(false);
  const [bulkClassModalVisible, setBulkClassModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchColumn, setSearchColumn] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [columnSettingsVisible, setColumnSettingsVisible] = useState(false);
  const [columnSettings, setColumnSettings] = useState({
    columns: [
      { key: 'photo', title: 'Photo', visible: true, order: 0 },
      { key: 'name', title: 'Name', visible: true, order: 1 },
      { key: 'roll_no', title: 'Roll No', visible: true, order: 2 },
      { key: 'class', title: 'Class', visible: true, order: 3 },
      { key: 'gender', title: 'Gender', visible: true, order: 4 },
      { key: 'status', title: 'Status', visible: true, order: 5 },
      { key: 'actions', title: 'Actions', visible: true, order: 6 }
    ]
  });
  const [tempColumnSettings, setTempColumnSettings] = useState(null);
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
  
  // Import history states
  const [importHistory, setImportHistory] = useState([]);
  const [importHistoryLoading, setImportHistoryLoading] = useState(false);
  
  // Use totalStudents from context instead of hardcoded value
  const studentCount = totalStudents;

  // Handle route changes
  useEffect(() => {
    const path = location.pathname;
    const id = path.split('/').pop();
    
    if (path === '/students/add') {
      setModalVisible(true);
      setEditingStudent(null);
    } else if (path.includes('/students/edit/') && id) {
      loadStudentForEdit(id);
    } else if (path.includes('/students/view/') && id) {
      loadStudentForView(id);
    } else {
      setModalVisible(false);
      setEditingStudent(null);
    }
  }, [location.pathname]);

  const loadStudentForEdit = async (studentId) => {
    try {
      setTableLoading(true);
      const response = await api.student.getStudent(studentId);
      if (response.data) {
        const studentData = response.data;
        const formValues = {
          first_name: studentData.first_name,
          last_name: studentData.last_name,
          email: studentData.email,
          phone: studentData.phone,
          gender: studentData.gender,
          dob: studentData.dob ? moment(studentData.dob) : null,
          blood_group: studentData.profile?.blood_group,
          profile: {
            nationality: studentData.profile?.nationality,
            classroom_id: studentData.student_profile?.classroom,
            class_name: studentData.profile?.class_name
          },
          student_profile: {
            student_id: studentData.student_profile?.student_id,
            admission_number: studentData.student_profile?.admission_number,
            admission_date: studentData.student_profile?.admission_date,
            last_grade_attended: studentData.student_profile?.last_grade_attended,
            roll_no: studentData.student_profile?.roll_no,
            section: studentData.student_profile?.section,
            father_name: studentData.student_profile?.father_name,
            father_occupation: studentData.student_profile?.father_occupation,
            mother_name: studentData.student_profile?.mother_name,
            mother_occupation: studentData.student_profile?.mother_occupation,
            parent_address: studentData.student_profile?.parent_address,
            parent_email: studentData.student_profile?.parent_email,
            parent_phone: studentData.student_profile?.parent_phone,
            allergies: studentData.student_profile?.allergies,
            remarks: studentData.student_profile?.remarks,
            classroom: studentData.student_profile?.classroom
          },
          student_id: studentData.student_profile?.student_id,
          admission_number: studentData.student_profile?.admission_number,
          admission_date: studentData.student_profile?.admission_date ? moment(studentData.student_profile.admission_date) : null,
          last_grade_attended: studentData.student_profile?.last_grade_attended,
          roll_no: studentData.student_profile?.roll_no,
          section: studentData.student_profile?.section,
          father_name: studentData.student_profile?.father_name,
          father_occupation: studentData.student_profile?.father_occupation,
          mother_name: studentData.student_profile?.mother_name,
          mother_occupation: studentData.student_profile?.mother_occupation,
          parent_address: studentData.student_profile?.parent_address,
          parent_email: studentData.student_profile?.parent_email,
          parent_phone: studentData.student_profile?.parent_phone,
          allergies: studentData.student_profile?.allergies,
          remarks: studentData.student_profile?.remarks,
          fee_details: studentData.student_profile?.fee_details || [],
          photo: studentData.profile?.photo
        };
        
        setEditingStudent({
          ...formValues,
          id: studentId
        });
        setModalVisible(true);
      } else {
        message.error('Failed to load student data');
        navigate('/students');
      }
    } catch (error) {
      console.error('Error loading student:', error);
      message.error(error.message || 'Failed to load student data');
      navigate('/students');
    } finally {
      setTableLoading(false);
    }
  };

  const loadStudentForView = async (studentId) => {
    try {
      setTableLoading(true);
      const response = await api.student.getStudent(studentId);
      if (response.data) {
        const studentData = response.data;
        const formValues = {
          first_name: studentData.first_name,
          last_name: studentData.last_name,
          email: studentData.email,
          phone: studentData.phone,
          gender: studentData.gender,
          dob: studentData.dob ? moment(studentData.dob) : null,
          blood_group: studentData.profile?.blood_group,
          profile: {
            nationality: studentData.profile?.nationality,
            classroom_id: studentData.student_profile?.classroom,
            class_name: studentData.profile?.class_name
          },
          student_profile: {
            student_id: studentData.student_profile?.student_id,
            admission_number: studentData.student_profile?.admission_number,
            admission_date: studentData.student_profile?.admission_date,
            last_grade_attended: studentData.student_profile?.last_grade_attended,
            roll_no: studentData.student_profile?.roll_no,
            section: studentData.student_profile?.section,
            father_name: studentData.student_profile?.father_name,
            father_occupation: studentData.student_profile?.father_occupation,
            mother_name: studentData.student_profile?.mother_name,
            mother_occupation: studentData.student_profile?.mother_occupation,
            parent_address: studentData.student_profile?.parent_address,
            parent_email: studentData.student_profile?.parent_email,
            parent_phone: studentData.student_profile?.parent_phone,
            allergies: studentData.student_profile?.allergies,
            remarks: studentData.student_profile?.remarks,
            classroom: studentData.student_profile?.classroom
          },
          student_id: studentData.student_profile?.student_id,
          admission_number: studentData.student_profile?.admission_number,
          admission_date: studentData.student_profile?.admission_date ? moment(studentData.student_profile.admission_date) : null,
          last_grade_attended: studentData.student_profile?.last_grade_attended,
          roll_no: studentData.student_profile?.roll_no,
          section: studentData.student_profile?.section,
          father_name: studentData.student_profile?.father_name,
          father_occupation: studentData.student_profile?.father_occupation,
          mother_name: studentData.student_profile?.mother_name,
          mother_occupation: studentData.student_profile?.mother_occupation,
          parent_address: studentData.student_profile?.parent_address,
          parent_email: studentData.student_profile?.parent_email,
          parent_phone: studentData.student_profile?.parent_phone,
          allergies: studentData.student_profile?.allergies,
          remarks: studentData.student_profile?.remarks,
          fee_details: studentData.student_profile?.fee_details || [],
          photo: studentData.profile?.photo,
          status: studentData.status
        };
        
        setEditingStudent({
          ...formValues,
          id: studentId,
          user_id: studentData.user_id,
          isViewMode: true
        });
        setModalVisible(true);
      } else {
        message.error('Failed to load student data');
        navigate('/students');
      }
    } catch (error) {
      console.error('Error loading student:', error);
      message.error(error.message || 'Failed to load student data');
      navigate('/students');
    } finally {
      setTableLoading(false);
    }
  };

  // Expose handleAdd function through ref
  useImperativeHandle(ref, () => ({
    handleAdd: () => {
      navigate('/students/add');
    }
  }));

  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchText.toLowerCase()) ||
      student.roll_no.toLowerCase().includes(searchText.toLowerCase()) ||
      student.email.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchText]);

  const handleAdd = () => {
    setEditingStudent(null);
    setModalVisible(true);
  };

  const handleEdit = async (student) => {
    navigate(`/students/edit/${student.user_id}`);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingStudent(null);
    navigate('/students');
  };

  const handleDelete = async (studentId) => {
    try {
      const response = await api.student.deleteStudent(studentId);
      if (response.success) {
        message.success('Student deleted successfully');
        refreshStudents();
      } else {
        message.error('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      message.error('Failed to delete student');
    }
  };

  const handleSubmit = async (values, originalValues, selectedFile) => {
    try {
      setFormSubmitting(true);
      let response;
      
      if (editingStudent) {
        // Initialize update data with only changed fields
        const updateData = {};
        
        // Compare and add changed basic fields
        if (values.first_name !== editingStudent.first_name) {
          updateData.first_name = values.first_name;
        }
        if (values.last_name !== editingStudent.last_name) {
          updateData.last_name = values.last_name;
        }
        if (values.email !== editingStudent.email) {
          updateData.email = values.email;
        }
        if (values.phone !== editingStudent.phone) {
          updateData.phone = values.phone;
        }
        if (values.gender !== editingStudent.gender) {
          updateData.gender = values.gender;
        }
        if (values.dob?.format('YYYY-MM-DD') !== editingStudent.dob?.format('YYYY-MM-DD')) {
          updateData.dob = values.dob?.format('YYYY-MM-DD');
        }
        
        // Compare and add changed profile fields
        const profileChanges = {};
        if (values.profile?.nationality !== editingStudent.profile?.nationality) {
          profileChanges.nationality = values.profile?.nationality;
        }
        if (values.profile?.classroom_id !== editingStudent.profile?.classroom_id) {
          profileChanges.classroom_id = values.profile?.classroom_id;
          // Extract class_name and section from selected class
          const selectedClass = classes.find(cls => cls.id === values.profile?.classroom_id);
          if (selectedClass) {
            profileChanges.class_name = selectedClass.class_name;
          }
        }
        if (values.blood_group !== editingStudent.blood_group) {
          profileChanges.blood_group = values.blood_group;
        }
        if (Object.keys(profileChanges).length > 0) {
          updateData.profile = profileChanges;
        }
        
        // Compare and add changed student profile fields
        const studentProfileChanges = {};
        if (values.student_id !== editingStudent.student_id) {
          studentProfileChanges.student_id = values.student_id;
        }
        if (values.admission_number !== editingStudent.admission_number) {
          studentProfileChanges.admission_number = values.admission_number;
        }
        if (values.admission_date?.format('YYYY-MM-DD') !== editingStudent.admission_date?.format('YYYY-MM-DD')) {
          studentProfileChanges.admission_date = values.admission_date?.format('YYYY-MM-DD');
        }
        if (values.last_grade_attended !== editingStudent.last_grade_attended) {
          studentProfileChanges.last_grade_attended = values.last_grade_attended;
        }
        if (values.roll_no !== editingStudent.roll_no) {
          studentProfileChanges.roll_no = values.roll_no;
        }
        // Extract section and classroom from selected class if classroom_id changed
        if (values.profile?.classroom_id !== editingStudent.profile?.classroom_id) {
          const selectedClass = classes.find(cls => cls.id === values.profile?.classroom_id);
          if (selectedClass) {
            studentProfileChanges.section = selectedClass.section;
            studentProfileChanges.classroom = values.profile?.classroom_id;
          }
        }
        if (values.father_name !== editingStudent.father_name) {
          studentProfileChanges.father_name = values.father_name;
        }
        if (values.father_occupation !== editingStudent.father_occupation) {
          studentProfileChanges.father_occupation = values.father_occupation;
        }
        if (values.mother_name !== editingStudent.mother_name) {
          studentProfileChanges.mother_name = values.mother_name;
        }
        if (values.mother_occupation !== editingStudent.mother_occupation) {
          studentProfileChanges.mother_occupation = values.mother_occupation;
        }
        if (values.parent_address !== editingStudent.parent_address) {
          studentProfileChanges.parent_address = values.parent_address;
        }
        if (values.parent_email !== editingStudent.parent_email) {
          studentProfileChanges.parent_email = values.parent_email;
        }
        if (values.parent_phone !== editingStudent.parent_phone) {
          studentProfileChanges.parent_phone = values.parent_phone;
        }
        if (values.allergies !== editingStudent.allergies) {
          studentProfileChanges.allergies = values.allergies;
        }
        if (values.remarks !== editingStudent.remarks) {
          studentProfileChanges.remarks = values.remarks;
        }

        // Compare and add changed fee details
        if (values.fee_details) {
          const feeDetailsChanges = values.fee_details.map((fee, index) => {
            const originalFee = editingStudent.fee_details?.[index];
            const changes = {};
            
            if (fee.fee_type !== originalFee?.fee_type) {
              changes.fee_type = fee.fee_type;
            }
            if (fee.amount !== originalFee?.amount) {
              changes.amount = fee.amount;
            }
            if (fee.period !== originalFee?.period) {
              changes.period = fee.period;
            }
            if (fee.terms !== originalFee?.terms) {
              changes.terms = fee.terms;
            }
            if (fee.amount_per_term !== originalFee?.amount_per_term) {
              changes.amount_per_term = fee.amount_per_term;
            }
            if (fee.status !== originalFee?.status) {
              changes.status = fee.status;
            }
            if (fee.due_amount !== originalFee?.due_amount) {
              changes.due_amount = fee.due_amount;
            }
            if (fee.remarks !== originalFee?.remarks) {
              changes.remarks = fee.remarks;
            }
            
            return Object.keys(changes).length > 0 ? changes : null;
          }).filter(Boolean);

          if (feeDetailsChanges.length > 0) {
            studentProfileChanges.fee_details = feeDetailsChanges;
          }
        }

        if (Object.keys(studentProfileChanges).length > 0) {
          updateData.student_profile = studentProfileChanges;
        }

        // Create FormData object for update
        const formData = new FormData();
        
        // Add all changed fields to FormData
        Object.entries(updateData).forEach(([key, value]) => {
          if (key === 'profile' || key === 'student_profile') {
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
          response = await api.student.updateStudent(editingStudent.id, formData);
        } else {
          message.info('No changes detected');
          setModalVisible(false);
          return;
        }
      } else {
        // Extract class_name and section from selected class
        const selectedClass = classes.find(cls => cls.id === values.profile?.classroom_id);
        const class_name = selectedClass?.class_name || '';
        const section = selectedClass?.section || '';

        // Format the data for create
        const createData = {
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
            nationality: values.profile?.nationality,
            classroom_id: values.profile?.classroom_id,
            class_name: class_name,
            blood_group: values.blood_group
          },
          student_profile: {
            student_id: values.student_id,
            admission_number: values.admission_number,
            admission_date: values.admission_date.format('YYYY-MM-DD'),
            last_grade_attended: values.last_grade_attended,
            roll_no: values.roll_no,
            section: section,
            classroom: values.profile?.classroom_id,
            father_name: values.father_name,
            father_occupation: values.father_occupation,
            mother_name: values.mother_name,
            mother_occupation: values.mother_occupation,
            parent_address: values.parent_address,
            parent_email: values.parent_email,
            parent_phone: values.parent_phone,
            allergies: values.allergies,
            remarks: values.remarks,
            fee_details: values.fee_details?.map(fee => ({
              fee_type: fee.fee_type,
              amount: parseFloat(fee.amount),
              period: fee.period,
              terms: parseInt(fee.terms),
              amount_per_term: parseFloat(fee.amount_per_term),
              status: fee.status,
              due_amount: fee.status === 'Partial' ? parseFloat(fee.due_amount) : null,
              remarks: fee.remarks
            })) || []
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

        // Add student profile data
        formData.append('student_profile', JSON.stringify(createData.student_profile));

        // Add photo if exists
        if (selectedFile) {
          formData.append('photo', selectedFile);
        }

        response = await api.student.createStudent(formData);
      }

      if (response.status === 200 || response.status === 201) {
        message.success(editingStudent ? 'Student updated successfully' : 'Student added successfully');
        setModalVisible(false);
        refreshStudents();
      }
    } catch (error) {
      console.error('Error saving student:', error);
      
      if (error.response?.status === 400) {
        const errors = error.response.data;
        
        // Function to recursively handle nested errors
        const handleNestedErrors = (errorObj, prefix = '') => {
          Object.entries(errorObj).forEach(([field, value]) => {
            if (Array.isArray(value)) {
              // Handle array of error messages
              value.forEach(message => {
                const errorField = prefix ? `${prefix}.${field}` : field;
                message.error(`${errorField}: ${message}`);
              });
            } else if (typeof value === 'object' && value !== null) {
              // Handle nested objects (like student_profile)
              handleNestedErrors(value, field);
            }
          });
        };

        // Handle all errors including nested ones
        handleNestedErrors(errors);

      } else if (error.response?.status === 401) {
        message.error('Unauthorized. Please login again.');
      } else if (error.response?.status === 403) {
        message.error('You do not have permission to perform this action.');
      } else if (error.response?.status === 404) {
        message.error('Resource not found.');
      } else if (error.response?.status === 409) {
        message.error('Conflict detected. Please check the data and try again.');
      } else if (error.response?.status >= 500) {
        message.error('Server error. Please try again later.');
      } else if (!error.response && error.request) {
        // The request was made but no response was received
        message.error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        message.error(error.message || 'An error occurred while saving the student.');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    loadStudents(pagination.current, pagination.pageSize);
  };

  const handleImageUpload = async (file, record) => {
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

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setSelectedFile(file);
      setSelectedStudentId(record.user_id);
      setPreviewVisible(true);
      
      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Error handling image:', error);
      message.error('Failed to process image');
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
      const response = await api.student.updateStudentPhoto(selectedStudentId, formData);

      if (response.status === 200) {
        message.success('Profile picture updated successfully');
        refreshStudents();
        handlePreviewCancel();
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error(error.message || 'Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleViewDetails = (student) => {
    navigate(`/students/view/${student.user_id}`);
  };

  const handleStudentUpdate = async (studentId) => {
    try {
      const response = await api.student.getStudent(studentId);
      if (response.data) {
        const studentData = response.data;
        const formValues = {
          first_name: studentData.first_name,
          last_name: studentData.last_name,
          email: studentData.email,
          phone: studentData.phone,
          gender: studentData.gender,
          dob: studentData.dob ? moment(studentData.dob) : null,
          blood_group: studentData.profile?.blood_group,
          profile: {
            nationality: studentData.profile?.nationality,
            classroom_id: studentData.student_profile?.classroom,
            class_name: studentData.profile?.class_name
          },
          student_id: studentData.student_profile?.student_id,
          admission_number: studentData.student_profile?.admission_number,
          admission_date: studentData.student_profile?.admission_date ? moment(studentData.student_profile.admission_date) : null,
          last_grade_attended: studentData.student_profile?.last_grade_attended,
          roll_no: studentData.student_profile?.roll_no,
          father_name: studentData.student_profile?.father_name,
          father_occupation: studentData.student_profile?.father_occupation,
          mother_name: studentData.student_profile?.mother_name,
          mother_occupation: studentData.student_profile?.mother_occupation,
          parent_address: studentData.student_profile?.parent_address,
          parent_email: studentData.student_profile?.parent_email,
          parent_phone: studentData.student_profile?.parent_phone,
          allergies: studentData.student_profile?.allergies,
          remarks: studentData.student_profile?.remarks,
          fee_details: studentData.student_profile?.fee_details || [],
          photo: studentData.profile?.photo,
          status: studentData.status
        };
        
        setEditingStudent({
          ...formValues,
          id: studentId,
          user_id: studentData.user_id,
          isViewMode: true
        });
      }
    } catch (error) {
      console.error('Error refreshing student data:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = selectedRowKeys.map(id => api.student.deleteStudent(id));
      await Promise.all(deletePromises);
      message.success('Selected students deleted successfully');
      setSelectedRowKeys([]);
      refreshStudents();
    } catch (error) {
      console.error('Error deleting students:', error);
      message.error('Failed to delete selected students');
    }
  };

  const handleBulkStatusChange = async () => {
    try {
      const values = await bulkStatusForm.validateFields();
      const updatePromises = selectedRowKeys.map(id => 
        api.student.updateStudent(id, { status: values.status })
      );
      await Promise.all(updatePromises);
      message.success('Status updated successfully for selected students');
      setBulkStatusModalVisible(false);
      setSelectedRowKeys([]);
      refreshStudents();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status');
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleColumnVisibilityChange = (key, checked) => {
    setColumnSettings(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.key === key ? { ...col, visible: checked } : col
      )
    }));
  };

  const handleColumnReorder = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(columnSettings.columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setColumnSettings(prev => ({
      ...prev,
      columns: items
    }));
  };

  const handleCheckAll = (checked) => {
    setColumnSettings(prev => ({
      ...prev,
      columns: prev.columns.map(col => ({ ...col, visible: checked }))
    }));
  };

  const handleOpenColumnSettings = () => {
    setColumnSettingsVisible(true);
  };

  const getVisibleColumns = () => {
    const sortedColumns = [...columnSettings.columns].sort((a, b) => a.order - b.order);
    return columns.filter(col => 
      sortedColumns.find(c => c.key === col.key)?.visible
    );
  };

  const columns = [
    {
      title: 'Photo',
      dataIndex: 'photo',
      key: 'photo',
      width: 80,
      render: (photo, record) => (
        <Upload
          name="photo"
          showUploadList={false}
          beforeUpload={(file) => handleImageUpload(file, record)}
          accept="image/*"
        >
          <Avatar
            size={45}
            src={photo || null}
            icon={!photo && (record.gender === 'M' ? 
              <img src="/student-boy.png" alt="Male Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
              <img src="/student-girl.png" alt="Female Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
      sorter: true,
      render: (text, record) => (
        <a onClick={() => handleViewDetails(record)}>{text}</a>
      ),
      width: 200,
      fixed: 'left',
      showSorterTooltip: false,
    },
    {
      title: 'Roll No',
      dataIndex: 'roll_no',
      key: 'roll_no',
      width: 100,
      sorter: (a, b) => a.roll_no.localeCompare(b.roll_no),
      render: (text) => (
        <Tag 
          style={{ 
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: '#f5f5f5',
            color: '#595959',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '24px',
            lineHeight: '1',
            margin: 0
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'Class',
      key: 'class',
      render: (_, record) => {
        const classInfo = record.class || 'Not Assigned';
        return (
          <Tag 
            style={{ 
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              background: 'linear-gradient(45deg, #f5f5f5, #fafafa)',
              color: '#595959',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '24px',
              lineHeight: '1',
              margin: 0
            }}
          >
            {classInfo}
          </Tag>
        );
      },
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => <StatusBadge type="gender" value={gender} />
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge type="status" value={status} />
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
            title="Are you sure you want to delete this student?"
            onConfirm={() => handleDelete(record.id)}
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

  const handleExport = async () => {
    try {
      setExportLoading(true);
      if (exportMode === 'download') {
        // Handle file download based on exportType
        if (exportType === 'excel') {
          // Implement Excel export
          message.success('Excel file downloaded successfully');
        } else {
          // Implement PDF export
          message.success('PDF file downloaded successfully');
        }
      } else {
        // Handle email sending
        if (exportEmails.length === 0) {
          message.error('Please add at least one email address');
          return;
        }
        // Implement email sending logic
        message.success('File sent successfully to the provided email addresses');
      }
      setExportModalVisible(false);
    } catch (error) {
      console.error('Error exporting:', error);
      message.error('Failed to export file');
    } finally {
      setExportLoading(false);
    }
  };

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
      message.success('Students imported successfully!');
      
      // Refresh the students list
      refreshStudents();
      
    } catch (error) {
      setImportStatus('error');
      message.error('Import failed. Please check your file format.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadSample = () => {
    downloadSampleFile('students');
  };


  const loadImportHistory = async () => {
    setImportHistoryLoading(true);
    try {
      // Simulate API call to get import history
      // In real implementation, this would call the backend API
      const mockHistory = [
        {
          id: '1',
          filename: 'students_batch_1.xlsx',
          status: 'completed',
          progress: 100,
          records: { total: 50, successful: 48, failed: 2 },
          uploaded_at: '2024-01-15T10:30:00Z',
          completed_at: '2024-01-15T10:32:00Z',
          message: 'Students imported successfully',
          errors: [
            { row: 15, field: 'email', error: 'Invalid email format' },
            { row: 23, field: 'student_id', error: 'Student ID already exists' }
          ]
        },
        {
          id: '2',
          filename: 'students_batch_2.xlsx',
          status: 'failed',
          progress: 25,
          records: { total: 30, successful: 0, failed: 30 },
          uploaded_at: '2024-01-14T14:20:00Z',
          completed_at: '2024-01-14T14:22:00Z',
          message: 'Import failed due to invalid file format',
          errors: [
            { row: 1, field: 'first_name', error: 'Required field missing' }
          ]
        },
        {
          id: '3',
          filename: 'students_batch_3.xlsx',
          status: 'processing',
          progress: 60,
          records: { total: 100, successful: 60, failed: 0 },
          uploaded_at: '2024-01-15T15:45:00Z',
          completed_at: null,
          message: 'Processing in progress...',
          errors: []
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setImportHistory(mockHistory);
    } catch (error) {
      message.error('Failed to load import history');
    } finally {
      setImportHistoryLoading(false);
    }
  };

  const handleDownloadImportFile = (record) => {
    // In real implementation, this would download the original file or results
    message.info(`Downloading ${record.filename}...`);
  };

  const handleViewImportDetails = (record) => {
    // This is handled by the ImportHistoryModal component
    console.log('Viewing details for:', record);
  };

  // Update form visibility state
  useEffect(() => {
    if (ref && ref.current) {
      const element = document.querySelector('[data-form-visible]');
      if (element) {
        element.setAttribute('data-form-visible', modalVisible);
      }
    }
  }, [modalVisible, ref]);

  const areAllStudentsFromSameClass = () => {
    if (selectedRowKeys.length === 0) return false;
    
    const selectedStudents = students.filter(student => selectedRowKeys.includes(student.id));
    if (selectedStudents.length === 0) return false;
    
    const firstStudentClass = selectedStudents[0].classroom;
    return selectedStudents.every(student => student.classroom === firstStudentClass);
  };

  const handleBulkClassChange = async () => {
    try {
      const values = await bulkClassForm.validateFields();
      const updatePromises = selectedRowKeys.map(id => 
        api.student.updateStudent(id, { classroom: values.classroom })
      );
      await Promise.all(updatePromises);
      message.success('Class updated successfully for selected students');
      setBulkClassModalVisible(false);
      setSelectedRowKeys([]);
      refreshStudents();
    } catch (error) {
      console.error('Error updating class:', error);
      message.error('Failed to update class');
    }
  };

  return (
    <div className="students-page" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '0', 
      overflow: 'hidden', 
      margin: '0',
      background: '#ffffff',
      boxShadow: '0 4px 20px rgba(159, 179, 223, 0.15)',
      border: '1px solid rgba(159, 179, 223, 0.2)'
    }} data-form-visible={modalVisible}>
      {modalVisible ? (
        editingStudent?.isViewMode ? (
          <StudentView
            visible={modalVisible}
            onCancel={handleCancel}
            student={editingStudent}
            onStudentUpdate={handleStudentUpdate}
          />
        ) : (
          <StudentForm
            visible={modalVisible}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            initialValues={editingStudent}
            loading={formSubmitting}
          />
        )
      ) : (
        <>
          <div style={{ 
            padding: '24px 24px 0 24px',
            background: '#fff',
            height: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              {/* Left side - Search */}
              <Input.Search
                placeholder="Search students..."
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

              {/* Right side - Controls */}
              <Space size="small">
                <Tooltip title="Total Students">
                  <div className="student-count-badge">
                    <UserAddOutlined style={{ fontSize: '16px', color: '#7B83EB' }} />
                    <span>{studentCount}+</span>
                  </div>
                </Tooltip>
                <Tooltip title="Export Students">
                  <Button
                    type="text"
                    icon={<ExportOutlined />}
                    onClick={() => setExportModalVisible(true)}
                    className="export-button"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f5f5f5',
                      border: '1px solid #f0f0f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease'
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
                <Tooltip title="Import Students">
                  <Button
                    type="text"
                    icon={<ImportOutlined />}
                    onClick={() => setImportModalVisible(true)}
                    className="import-button"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f5f5f5',
                      border: '1px solid #f0f0f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease'
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
                <Tooltip title="Column Settings">
                  <img 
                    src="/checklist.png" 
                    alt="Settings" 
                    style={{ 
                      width: '24px', 
                      height: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={handleOpenColumnSettings}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.filter = 'brightness(0.9)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.filter = 'brightness(1)';
                    }}
                  />
                </Tooltip>
              </Space>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              <Table
                columns={getVisibleColumns()}
                dataSource={filteredStudents}
                rowKey="id"
                loading={loading || tableLoading}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalStudents,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} students`,
                  onChange: (page, pageSize) => {
                    setCurrentPage(page);
                    setPageSize(pageSize);
                    loadStudents(page, pageSize);
                  },
                  style: { marginBottom: 0 }
                }}
                onChange={handleTableChange}
                rowSelection={{
                  type: 'checkbox',
                  selectedRowKeys,
                  onChange: (newSelectedRowKeys) => {
                    setSelectedRowKeys(newSelectedRowKeys);
                  },
                }}
                className="students-table"
                scroll={{ x: 'max-content', y: 'calc(100vh - 260px)' }}
                size="small"
                style={{
                  '--ant-table-row-height': '20px'
                }}
              />
            </div>
          </div>
        </>
      )}

      {selectedRowKeys.length > 0 && (
        <div className="bulk-actions-bar">
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <span className="selected-count">{selectedRowKeys.length} students selected</span>
              </Space>
            </Col>
            <Col>
              <Space>
                <Tooltip 
                  title={!areAllStudentsFromSameClass() ? "All selected students must be from the same class to change their class" : ""}
                >
                  <Button
                    type="primary"
                    onClick={() => setBulkClassModalVisible(true)}
                    className="bulk-action-btn"
                    icon={<TeamOutlined />}
                    disabled={!areAllStudentsFromSameClass()}
                  >
                    Change Class
                  </Button>
                </Tooltip>
                <Button
                  type="primary"
                  onClick={() => setBulkStatusModalVisible(true)}
                  className="bulk-action-btn"
                  icon={<SwapOutlined />}
                >
                  Change Status
                </Button>
                <Popconfirm
                  title="Are you sure you want to delete selected students?"
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

      <StudentDetailsDrawer
        visible={detailsDrawerVisible}
        onClose={() => {
          setDetailsDrawerVisible(false);
          setSelectedStudentDetails(null);
        }}
        student={selectedStudentDetails}
      />

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

      <Modal
        title="Change Class"
        open={bulkClassModalVisible}
        onOk={handleBulkClassChange}
        onCancel={() => setBulkClassModalVisible(false)}
        confirmLoading={loading}
      >
        {!areAllStudentsFromSameClass() ? (
          <Alert
            message="Cannot Change Class"
            description="All selected students must be from the same class to perform this action. Please select students from the same class and try again."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        ) : (
          <Form form={bulkClassForm} layout="vertical">
            <Form.Item
              name="classroom"
              label="Class"
              rules={[{ required: true, message: 'Please select class' }]}
            >
              <Select>
                {classes.map(cls => (
                  <Option key={cls.id} value={cls.id}>
                    {`${cls.class_name} - Section ${cls.section}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        )}
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
        onApply={() => {}} // Empty function since we don't need it anymore
        onCancel={() => setColumnSettingsVisible(false)}
        columnSettings={columnSettings}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        onColumnReorder={handleColumnReorder}
        onCheckAll={handleCheckAll}
      />

      <StyledModal
        visible={exportModalVisible}
        onClose={() => {
          setExportModalVisible(false);
          setExportType('excel');
          setExportEmails([]);
          setExportMode('download');
        }}
        title={
          <Space>
            <ExportOutlined style={{ color: '#7B83EB' }} />
            <span>Export Students</span>
          </Space>
        }
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
                <div 
                  className={`format-option ${exportType === 'excel' ? 'active' : ''}`}
                  onClick={() => setExportType('excel')}
                >
                  <FileExcelOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                  <span>Excel</span>
                </div>
                <div 
                  className={`format-option ${exportType === 'pdf' ? 'active' : ''}`}
                  onClick={() => setExportType('pdf')}
                >
                  <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                  <span>PDF</span>
                </div>
              </div>
            </Form.Item>

            <Form.Item label="Export Mode" className="export-mode-item">
              <div className="mode-options">
                <div 
                  className={`mode-option ${exportMode === 'download' ? 'active' : ''}`}
                  onClick={() => setExportMode('download')}
                >
                  <DownloadOutlined style={{ fontSize: '18px' }} />
                  <span>Download</span>
                </div>
                <div 
                  className={`mode-option ${exportMode === 'send' ? 'active' : ''}`}
                  onClick={() => setExportMode('send')}
                >
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
              <Button
                type="primary"
                onClick={handleExport}
                loading={exportLoading}
                block
                className="export-submit-button"
              >
                {exportMode === 'download' ? 'Download' : 'Send'}
              </Button>
            </Form.Item>
          </Form>
        </div>

        <style jsx>{`
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
            background: #7B83EB;
            border-color: #7B83EB;
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
            background: #7B83EB;
            border-color: #7B83EB;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .export-submit-button:hover {
            background: #7B83EB;
            border-color: #7B83EB;
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(123, 131, 235, 0.3);
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
            color: #7B83EB;
          }

          .email-select .ant-select-item-option-active {
            background: #fafafa;
          }
        `}</style>
      </StyledModal>

      <ImportModal
        visible={importModalVisible}
        onClose={() => {
          setImportModalVisible(false);
          setImportStatus('idle');
          setImportProgress(0);
        }}
        onImport={handleImport}
        title="Import Students"
        sampleFileUrl={handleDownloadSample}
        requiredFields={[
          'First Name',
          'Last Name',
          'Student ID',
          'Email',
          'Phone',
          'Date of Birth',
          'Gender',
          'Class',
          'Section',
          'Status'
        ]}
        optionalFields={[
          'Address',
          'Parent Name',
          'Parent Phone',
          'Parent Email',
          'Admission Date'
        ]}
        brandColor="#7B83EB"
        loading={importLoading}
        importProgress={importProgress}
        importStatus={importStatus}
        importHistory={importHistory}
        historyLoading={importHistoryLoading}
        onLoadHistory={loadImportHistory}
        onDownloadFile={handleDownloadImportFile}
        showHistoryTab={true}
      />

      <style>
        {`
          .students-page {
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

          .students-header {
            display: flex;
            justify-content: space-between;
            alignItems: center;
            padding: 16px 24px;
            border-bottom: 1px solid #f0f0f0;
            background: #ffffff;
          }

          .page-title {
            margin: 0 !important;
            color: #7B83EB !important;
            display: flex;
            alignItems: center;
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

          .students-table {
            flex: 1;
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #f0f0f0;
            height: 100%;
          }

          .students-table .ant-table {
            border-radius: 8px;
            overflow: visible;
          }

          .students-table .ant-table-container {
            border-radius: 8px;
            overflow: visible;
          }

          .students-table .ant-table-body {
            overflow-y: auto !important;
            overflow-x: auto !important;
            margin-right: 1px;
          }

          .students-table .ant-spin-nested-loading {
            height: 100%;
          }

          .students-table .ant-spin-container {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .students-table .ant-table-placeholder {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .students-table .ant-spin {
            max-height: none;
          }

          .students-table .ant-spin-blur {
            opacity: 0.5;
            filter: blur(1px);
            pointer-events: none;
          }

          .students-table .ant-spin-blur::after {
            opacity: 0.4;
            background: #fff;
          }

          .students-table .ant-table-thead > tr > th {
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

          .students-table .ant-table-tbody > tr > td {
            padding: 4px 12px !important;
            white-space: nowrap;
            border-bottom: 1px solid #f0f0f0;
            height: 32px;
            line-height: 1.2;
            font-size: 13px;
          }

          .students-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none;
          }

          .students-table .ant-table-cell {
            padding: 4px 12px !important;
          }

          .students-table .ant-table-cell .ant-tag {
            margin: 0;
            padding: 4px 8px;
            font-size: 13px;
            height: 24px;
            line-height: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
          }

          .students-table .ant-table-cell .ant-btn {
            padding: 0 4px;
            height: 22px;
            font-size: 12px;
          }

          .students-table .ant-table-cell .ant-avatar {
            width: 22px;
            height: 22px;
            line-height: 22px;
            font-size: 12px;
          }

          .students-table .ant-table-pagination {
            margin: 16px 0 !important;
            padding: 8px 8px !important;
            height: 32px;
            border-top: 1px solid #f0f0f0;
            background: #ffffff;
          }

          .students-table .ant-pagination-item {
            min-width: 24px;
            height: 24px;
            line-height: 22px;
            font-size: 12px;
            margin: 0 4px;
          }

          .students-table .ant-pagination-prev .ant-pagination-item-link,
          .students-table .ant-pagination-next .ant-pagination-item-link {
            min-width: 24px;
            height: 24px;
            line-height: 22px;
            font-size: 12px;
          }

          .students-table .ant-pagination-options {
            margin-left: 8px;
          }

          .students-table .ant-pagination-options-size-changer {
            margin-right: 0;
          }

          .students-table .ant-select-selector {
            height: 24px !important;
            line-height: 22px !important;
            padding: 0 8px !important;
          }

          .students-table .ant-select-selection-item {
            line-height: 22px !important;
            font-size: 12px;
          }

          .add-student-btn {
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

          .add-student-btn:hover {
            background: #7B83EB;
            opacity: 0.9;
            color: white !important;
          }
          
          .add-student-btn .anticon {
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

          .students-table .ant-pagination-item-active {
            background: #7B83EB !important;
            border-color: #7B83EB !important;
          }

          .students-table .ant-pagination-item-active a {
            color: white !important;
          }

          .students-table .ant-pagination-item:hover {
            border-color: #7B83EB !important;
          }

          .students-table .ant-pagination-prev:hover .ant-pagination-item-link,
          .students-table .ant-pagination-next:hover .ant-pagination-item-link {
            border-color: #7B83EB !important;
            color: #7B83EB !important;
          }

          .students-table .ant-checkbox-wrapper:hover .ant-checkbox-inner,
          .students-table .ant-checkbox:hover .ant-checkbox-inner,
          .students-table .ant-checkbox-input:focus + .ant-checkbox-inner {
            border-color: #7B83EB !important;
          }

          .students-table .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #7B83EB !important;
            border-color: #7B83EB !important;
          }

          .students-table .ant-checkbox-indeterminate .ant-checkbox-inner::after {
            background-color: #7B83EB !important;
          }

          .column-settings-drawer .ant-drawer-header {
            background: #7B83EB;
            border-bottom: none;
            padding: 12px 16px;
          }

          .column-settings-drawer .ant-drawer-title {
            color: white;
            font-size: 15px;
            font-weight: 500;
          }

          .column-settings-drawer .ant-drawer-body {
            padding: 0;
          }

          .column-settings-content {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .check-all-checkbox {
            margin-right: 0;
          }

          .check-all-text {
            font-size: 13px;
            font-weight: 500;
            color: white;
          }

          .columns-list {
            flex: 1;
            overflow-y: auto;
            padding: 12px 16px;
            min-height: 100px;
          }

          .column-item {
            background: white;
            border: 1px solid #f0f0f0;
            border-radius: 6px;
            transition: all 0.2s ease;
          }

          .column-item.dragging {
            background: #fafafa;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            border: 1px solid #7B83EB;
          }

          .column-item-content {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
          }

          .drag-handle {
            color: #999;
            cursor: grab;
            font-size: 14px;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .drag-handle:hover {
            background: #f5f5f5;
            color: #666;
          }

          .drag-handle:active {
            cursor: grabbing;
          }

          .column-checkbox {
            flex: 1;
          }

          .column-title {
            font-size: 13px;
            color: #262626;
          }

          .column-settings-drawer .ant-checkbox-wrapper:hover .ant-checkbox-inner,
          .column-settings-drawer .ant-checkbox:hover .ant-checkbox-inner,
          .column-settings-drawer .ant-checkbox-input:focus + .ant-checkbox-inner {
            border-color: #7B83EB;
          }

          .column-settings-drawer .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #7B83EB;
            border-color: #7B83EB;
          }

          .column-settings-drawer .ant-checkbox-indeterminate .ant-checkbox-inner::after {
            background-color: #7B83EB;
          }

          .column-settings-drawer .ant-checkbox-wrapper .ant-checkbox-inner {
            border-color: white;
          }

          .column-settings-drawer .ant-checkbox-wrapper:hover .ant-checkbox-inner {
            border-color: white;
          }

          .column-settings-drawer .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner {
            background-color: white;
            border-color: white;
          }

          .column-settings-drawer .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner::after {
            border-color: #7B83EB;
          }

          .student-count-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: #f5f5f5;
            border: 1px solid #f0f0f0;
            border-radius: 20px;
            cursor: default;
            transition: all 0.3s ease;
          }

          .student-count-badge:hover {
            background: #f0f0f0;
            transform: translateY(-1px);
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
          }

          .student-count-badge span {
            font-size: 13px;
            font-weight: 600;
            color: #7B83EB;
          }

          .ant-tooltip {
            font-size: 12px;
          }

          .ant-tooltip-inner {
            padding: 6px 10px;
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.75);
          }

          .ant-tooltip-arrow-content {
            background: rgba(0, 0, 0, 0.75);
          }
        `}
      </style>
    </div>
  );
});

export default Students; 
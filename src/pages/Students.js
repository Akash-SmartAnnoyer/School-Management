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
  Popconfirm,
  Checkbox
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
  MoneyCollectOutlined
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
import { useStudents } from '../contexts/StudentsContext';

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
  const [originalValues, setOriginalValues] = useState(null);

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
      } else {
        setOriginalValues(null);
        form.resetFields();
      }
    }
  }, [visible, initialValues]);

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await api.class.getClasses();
      if (response.success) {
        // Handle the response format with results array
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values, originalValues);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <IdcardOutlined className="modal-icon" style={{ color: '#7B83EB' }} />
          <Typography.Title level={5} className="modal-title" style={{ color: '#7B83EB' }}>
            {initialValues ? 'Edit Student' : 'Add New Student'}
          </Typography.Title>
        </Space>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={900}
      className="student-form-modal"
    >
      <Form
        key={initialValues ? `edit-${initialValues.id}` : 'create'}
        form={form}
        layout="vertical"
        className="student-form"
      >
        <Row gutter={24}>
          <Col span={8}>
            <Card className="photo-upload-card">
              <Upload
                name="photo"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => false}
              >
                <div className="upload-placeholder">
                  <PlusOutlined />
                  <div>Upload Photo</div>
                </div>
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
                name={['profile', 'nationality']}
                label="Nationality"
                rules={[{ required: true, message: 'Please input nationality!' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name={['profile', 'class_name']}
                label="Class Name"
                rules={[{ required: true, message: 'Please input class name!' }]}
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

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="roll_no"
                    label="Roll Number"
                    rules={[{ required: true, message: 'Please input roll number!' }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="section"
                    label="Section"
                    rules={[{ required: true, message: 'Please input section!' }]}
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

            <Card 
              title={
                <Space>
                  <MoneyCollectOutlined className="card-icon" style={{ color: '#7B83EB' }} />
                  <span style={{ color: '#7B83EB' }}>Fee Details</span>
                </Space>
              }
              className="info-card"
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
                          <Col span={8}>
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
                                dropdownRender={menu => (
                                  <>
                                    {menu}
                                    <Divider style={{ margin: '8px 0' }} />
                                    <Form.Item
                                      style={{ margin: '0 8px 4px' }}
                                    >
                                      <Input
                                        placeholder="Add new fee type"
                                        onPressEnter={e => {
                                          e.preventDefault();
                                          const value = e.target.value;
                                          if (value) {
                                            const newOption = { value, label: value };
                                            // Add to options if not exists
                                            const options = form.getFieldValue(['fee_details', name, 'fee_type_options']) || [];
                                            if (!options.find(opt => opt.value === value)) {
                                              form.setFieldsValue({
                                                fee_details: {
                                                  [name]: {
                                                    fee_type_options: [...options, newOption]
                                                  }
                                                }
                                              });
                                            }
                                            form.setFieldsValue({
                                              fee_details: {
                                                [name]: {
                                                  fee_type: value
                                                }
                                              }
                                            });
                                          }
                                        }}
                                      />
                                    </Form.Item>
                                  </>
                                )}
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
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'amount']}
                              label="Total Amount"
                              rules={[{ required: true, message: 'Please enter amount!' }]}
                            >
                              <Input prefix="₹" type="number" step="0.01" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
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
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'terms']}
                              label="Number of Terms"
                            >
                              <Input type="number" disabled />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'amount_per_term']}
                              label="Amount per Term"
                            >
                              <Input prefix="₹" type="number" step="0.01" disabled />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
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
                        </Row>

                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, currentValues) => {
                            return prevValues?.fee_details?.[name]?.status !== currentValues?.fee_details?.[name]?.status;
                          }}
                        >
                          {({ getFieldValue }) => {
                            const showDueAmount = getFieldValue(['fee_details', name, 'show_due_amount']);
                            return showDueAmount ? (
                              <Row gutter={16}>
                                <Col span={8}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'due_amount']}
                                    label="Due Amount"
                                    rules={[{ required: true, message: 'Please enter due amount!' }]}
                                  >
                                    <Input prefix="₹" type="number" step="0.01" />
                                  </Form.Item>
                                </Col>
                              </Row>
                            ) : null;
                          }}
                        </Form.Item>

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
                        onClick={() => {
                          try {
                            add({
                              fee_type: '',
                              amount: '',
                              period: '',
                              terms: '',
                              amount_per_term: '',
                              status: '',
                              due_amount: '',
                              remarks: ''
                            });
                          } catch (error) {
                            console.error('Error adding fee:', error);
                            message.error('Failed to add fee');
                          }
                        }} 
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
          </Col>
        </Row>
      </Form>
    </Modal>
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

const Students = () => {
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
  const [form] = Form.useForm();
  const [bulkStatusForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [bulkStatusModalVisible, setBulkStatusModalVisible] = useState(false);
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
    try {
      setTableLoading(true);
      // Fetch the latest student data
      const response = await api.student.getStudent(student.user_id);
      if (response.data) {
        const studentData = response.data;
        // Format the student data for the form
        const formValues = {
          first_name: studentData.first_name,
          last_name: studentData.last_name,
          email: studentData.email,
          phone: studentData.phone,
          gender: studentData.gender,
          dob: studentData.dob ? moment(studentData.dob) : null,
          // Profile data
          profile: {
            nationality: studentData.profile?.nationality,
            classroom_id: studentData.student_profile?.classroom,
            class_name: studentData.profile?.class_name
          },
          // Student profile data
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
          blood_group: studentData.profile?.blood_group,
          fee_details: studentData.student_profile?.fee_details || []
        };
        
        // Set the editing student and show the modal
        setEditingStudent({
          ...formValues,
          id: student.user_id // Make sure we have the user_id for the update
        });
        setModalVisible(true);
      } else {
        message.error('Failed to load student data');
      }
    } catch (error) {
      console.error('Error loading student:', error);
      message.error(error.message || 'Failed to load student data');
    } finally {
      setTableLoading(false);
    }
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

  const handleSubmit = async (values, originalValues) => {
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
        }
        if (values.profile?.class_name !== editingStudent.profile?.class_name) {
          profileChanges.class_name = values.profile?.class_name;
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
        if (values.section !== editingStudent.section) {
          studentProfileChanges.section = values.section;
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

        // Only send update request if there are changes
        if (Object.keys(updateData).length > 0) {
          response = await api.student.updateStudent(editingStudent.id, updateData);
        } else {
          message.info('No changes detected');
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
          role: 'student',
          password: values.password,
          confirm_password: values.confirm_password,
          profile: {
            nationality: values.profile?.nationality,
            classroom_id: values.profile?.classroom_id,
            class_name: values.profile?.class_name,
            blood_group: values.blood_group
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

        response = await api.student.createStudent(createData);
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

  const handleImageUpload = async (file, studentId) => {
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
      setSelectedStudentId(studentId);
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

      // Make API call
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
    setSelectedStudentDetails(student);
    setDetailsDrawerVisible(true);
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
            size={45}
            src={photoURL ? getCloudinaryImage(photoURL) : null}
            icon={!photoURL && (record.gender === 'M' ? 
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
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => handleViewDetails(record)}
          style={{ 
            padding: 0, 
            height: 'auto',
            fontSize: '15px',
            fontWeight: 500,
            color: '#595959',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#8c8c8c';
            e.currentTarget.style.transform = 'translateX(5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#595959';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          {text}
        </Button>
      ),
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
      render: (gender) => (
        <Tag 
          style={{ 
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: '#f5f5f5',
            color: gender === 'M' ? '#40a9ff' : '#ff85c0',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'inline-flex',
            alignItems: 'center',
            height: '24px',
            lineHeight: '1'
          }}
        >
          {gender === 'M' ? (
            <ManOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#40a9ff' }} />
          ) : (
            <WomanOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#ff85c0' }} />
          )} 
          {gender}
        </Tag>
      ),
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
            color: status === 'Active' 
              ? '#73d13d' 
              : '#ffa940',
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

  return (
    <div className="students-page" style={{ 
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
      <div className="students-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0',
        background: '#ffffff'
      }}>
        <Title level={3} className="page-title">
          {/* <TeamOutlined className="title-icon" /> */}
          <img src="/students.png" alt="Students" style={{ width: '40px', height: '40px' }} />
          Students
        </Title>
        <Space size="small">
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="add-student-btn"
          >
            Add Student
          </Button>
        </Space>
      </div>

      <div style={{ 
        flex: 1, 
        overflow: 'hidden',
        padding: '0 16px 16px 16px'
      }}>
        <Table
          columns={columns}
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
            }
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
          scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
        />
      </div>

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

      <StudentForm
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingStudent(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editingStudent}
        loading={formSubmitting}
      />

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

      <ImagePreviewModal
        visible={previewVisible}
        imageUrl={previewImage}
        onCancel={handlePreviewCancel}
        onUpload={handlePreviewUpload}
        loading={uploadingImage}
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
        `}
      </style>
    </div>
  );
};

export default Students; 
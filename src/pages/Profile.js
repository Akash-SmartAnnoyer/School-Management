import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  message,
  Avatar,
  Typography,
  Divider,
  Row,
  Col,
  Tabs,
  Space,
  Switch,
  Select,
  Alert
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  UploadOutlined,
  SaveOutlined,
  BankOutlined,
  LockOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { getOrganizations, updateSchool, updatePrincipal, updateTeacher } from '../utils/organizationStorage';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Profile = () => {
  const { currentUser, updateProfile: updateAuthProfile } = useAuth();
  const [form] = Form.useForm();
  const [schoolForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [imageUrl, setImageUrl] = useState(currentUser?.profilePic || 'https://via.placeholder.com/150');
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [schoolLogoUrl, setSchoolLogoUrl] = useState(null);
  const [organizations, setOrganizations] = useState(getOrganizations());

  useEffect(() => {
    if (currentUser) {
      // Get the latest organizations data
      const currentOrgs = getOrganizations();
      const currentSchool = currentOrgs.schools[currentUser.schoolId];
      
      if (currentUser.role === 'PRINCIPAL') {
        // Set principal form fields
        form.setFieldsValue({
          name: currentSchool.principal.name,
          email: currentSchool.principal.email,
          phone: currentSchool.principal.phone,
          address: currentSchool.principal.address
        });
        
        // Set profile picture from principal data
        if (currentSchool.principal.profilePic) {
          setImageUrl(currentSchool.principal.profilePic);
          setProfilePic(currentSchool.principal.profilePic);
        }

        // Set school form fields
        schoolForm.setFieldsValue({
          schoolName: currentSchool.name,
          schoolAddress: currentSchool.address,
          schoolPhone: currentSchool.phone,
          schoolEmail: currentSchool.email
        });
        
        // Set school logo from school data
        if (currentSchool.logo) {
          setSchoolLogoUrl(currentSchool.logo);
          setSchoolLogo(currentSchool.logo);
        }
      } else {
        // Set teacher form fields
        form.setFieldsValue({
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          address: currentUser.address,
          subject: currentUser.subject,
          qualification: currentUser.qualification
        });
        
        // Set profile picture from teacher data
        if (currentUser.profilePic) {
          setImageUrl(currentUser.profilePic);
          setProfilePic(currentUser.profilePic);
        }
      }
    }
  }, [currentUser, form, schoolForm]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Get current organizations data
      const currentOrgs = getOrganizations();
      const currentSchool = currentOrgs.schools[currentUser.schoolId];
      
      if (currentUser.role === 'PRINCIPAL') {
        // Update principal data
        const updatedPrincipal = {
          ...currentSchool.principal,
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          profilePic: imageUrl || currentSchool.principal.profilePic
        };

        // Update school data with new principal info
        const updatedSchool = {
          ...currentSchool,
          principal: updatedPrincipal
        };

        // Update organizations data
        const updatedOrgs = {
          ...currentOrgs,
          schools: {
            ...currentOrgs.schools,
            [currentUser.schoolId]: updatedSchool
          }
        };

        // Save to localStorage
        localStorage.setItem('school_organizations', JSON.stringify(updatedOrgs));
        setOrganizations(updatedOrgs);

        // Update auth context with all current data
        await updateAuthProfile({
          ...values,
          profilePic: imageUrl || currentSchool.principal.profilePic,
          schoolName: currentSchool.name,
          schoolLogo: currentSchool.logo
        });
      } else {
        // Handle teacher profile update
        const updatedOrgs = updateTeacher(currentUser.schoolId, currentUser.username, {
          ...values,
          profilePic: imageUrl
        });
        setOrganizations(updatedOrgs);

        // Update auth context with all current data
        await updateAuthProfile({
          ...values,
          profilePic: imageUrl,
          schoolName: currentSchool.name,
          schoolLogo: currentSchool.logo
        });
      }

      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Get current organizations data
      const currentOrgs = getOrganizations();
      const currentSchool = currentOrgs.schools[currentUser.schoolId];
      
      // Update school data
      const updatedSchool = {
        ...currentSchool,
        name: values.schoolName,
        address: values.schoolAddress,
        phone: values.schoolPhone,
        email: values.schoolEmail,
        logo: schoolLogoUrl || currentSchool.logo // Preserve existing logo if not changed
      };

      // Update organizations data
      const updatedOrgs = {
        ...currentOrgs,
        schools: {
          ...currentOrgs.schools,
          [currentUser.schoolId]: updatedSchool
        }
      };

      // Save to localStorage
      localStorage.setItem('school_organizations', JSON.stringify(updatedOrgs));
      setOrganizations(updatedOrgs);

      // Update auth context with new school data
      await updateAuthProfile({
        ...currentUser,
        schoolName: values.schoolName,
        schoolLogo: schoolLogoUrl || currentSchool.logo // Preserve existing logo if not changed
      });

      message.success('School profile updated successfully');
    } catch (error) {
      console.error('School update error:', error);
      message.error('Failed to update school profile');
    } finally {
      setLoading(false);
    }
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (file) => {
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

      const base64Image = await getBase64(file);
      
      // Update local state
      setImageUrl(base64Image);
      setProfilePic(base64Image);

      // Get current organizations data
      const currentOrgs = getOrganizations();
      const currentSchool = currentOrgs.schools[currentUser.schoolId];

      if (currentUser.role === 'PRINCIPAL') {
        // Update principal data with new profile picture
        const updatedPrincipal = {
          ...currentSchool.principal,
          profilePic: base64Image
        };

        // Update school data
        const updatedSchool = {
          ...currentSchool,
          principal: updatedPrincipal
        };

        // Update organizations data
        const updatedOrgs = {
          ...currentOrgs,
          schools: {
            ...currentOrgs.schools,
            [currentUser.schoolId]: updatedSchool
          }
        };

        // Save to localStorage
        localStorage.setItem('school_organizations', JSON.stringify(updatedOrgs));
        setOrganizations(updatedOrgs);

        // Update auth context with new profile picture
        await updateAuthProfile({
          ...currentUser,
          profilePic: base64Image
        });
      }

      message.success('Profile picture updated successfully');
      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Profile picture upload error:', error);
      message.error('Failed to upload profile picture');
      return false;
    }
  };

  const handleSchoolLogoUpload = async (file) => {
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

      const base64Image = await getBase64(file);
      
      // Update local state
      setSchoolLogoUrl(base64Image);
      setSchoolLogo(base64Image);

      // Get current organizations data
      const currentOrgs = getOrganizations();
      const currentSchool = currentOrgs.schools[currentUser.schoolId];

      // Update school data with new logo
      const updatedSchool = {
        ...currentSchool,
        logo: base64Image
      };

      // Update organizations data
      const updatedOrgs = {
        ...currentOrgs,
        schools: {
          ...currentOrgs.schools,
          [currentUser.schoolId]: updatedSchool
        }
      };

      // Save to localStorage
      localStorage.setItem('school_organizations', JSON.stringify(updatedOrgs));
      setOrganizations(updatedOrgs);

      // Update auth context with new school logo
      await updateAuthProfile({
        ...currentUser,
        schoolLogo: base64Image
      });

      message.success('School logo updated successfully');
      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Logo upload error:', error);
      message.error('Failed to upload school logo');
      return false;
    }
  };

  return (
    <div className="profile-page">
      <Card>
        <Title level={2}>Profile Settings</Title>
        
        <Row gutter={24}>
          <Col span={8}>
            <Card title="Profile Picture">
              <Upload
                name="profilePic"
                showUploadList={false}
                beforeUpload={handleImageUpload}
                accept="image/*"
              >
                <div className="profile-pic-container">
                  <Avatar
                    size={150}
                    src={imageUrl}
                    icon={<UserOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                  <Button icon={<UploadOutlined />}>Change Picture</Button>
                </div>
              </Upload>
            </Card>
          </Col>

          <Col span={16}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Phone"
                    rules={[{ required: true, message: 'Please enter your phone number' }]}
                  >
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="address"
                    label="Address"
                    rules={[{ required: true, message: 'Please enter your address' }]}
                  >
                    <Input prefix={<GlobalOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              {currentUser?.role === 'TEACHER' && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="subject"
                      label="Subject"
                      rules={[{ required: true, message: 'Please enter your subject' }]}
                    >
                      <Input prefix={<SafetyCertificateOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="qualification"
                      label="Qualification"
                      rules={[{ required: true, message: 'Please enter your qualification' }]}
                    >
                      <Input prefix={<SafetyCertificateOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>

        {currentUser?.role === 'PRINCIPAL' && (
          <>
            <Divider />
            <Title level={3}>School Profile</Title>
            
            <Row gutter={24}>
              <Col span={8}>
                <Card title="School Logo">
                  <Upload
                    name="schoolLogo"
                    showUploadList={false}
                    beforeUpload={handleSchoolLogoUpload}
                    accept="image/*"
                  >
                    <div className="school-logo-container">
                      <Avatar
                        size={150}
                        src={schoolLogoUrl}
                        icon={<BankOutlined />}
                        style={{ marginBottom: 16 }}
                      />
                      <Button icon={<UploadOutlined />}>Change Logo</Button>
                    </div>
                  </Upload>
                </Card>
              </Col>

              <Col span={16}>
                <Form
                  form={schoolForm}
                  layout="vertical"
                  onFinish={handleSchoolSubmit}
                >
                  <Form.Item
                    name="schoolName"
                    label="School Name"
                    rules={[{ required: true, message: 'Please enter school name' }]}
                  >
                    <Input prefix={<BankOutlined />} />
                  </Form.Item>

                  <Form.Item
                    name="schoolAddress"
                    label="School Address"
                    rules={[{ required: true, message: 'Please enter school address' }]}
                  >
                    <Input prefix={<GlobalOutlined />} />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="schoolPhone"
                        label="School Phone"
                        rules={[{ required: true, message: 'Please enter school phone' }]}
                      >
                        <Input prefix={<PhoneOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="schoolEmail"
                        label="School Email"
                        rules={[
                          { required: true, message: 'Please enter school email' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input prefix={<MailOutlined />} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                    >
                      Save School Profile
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </>
        )}
      </Card>
    </div>
  );
};

export default Profile; 
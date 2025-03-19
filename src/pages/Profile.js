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
  Tabs
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  UploadOutlined,
  SaveOutlined,
  BankOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, updateSchoolSettings } from '../firebase/services';
import { uploadImage, getCloudinaryImage } from '../services/imageService';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import './Profile.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dyr02bpil'
  }
});

const Profile = () => {
  const { currentUser, updateProfile: updateAuthProfile } = useAuth();
  const [form] = Form.useForm();
  const [schoolForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [imageUrl, setImageUrl] = useState(currentUser?.profilePic || 'https://via.placeholder.com/150');
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [schoolLogoUrl, setSchoolLogoUrl] = useState(null);
  const [profilePublicId, setProfilePublicId] = useState(null);
  const [schoolLogoPublicId, setSchoolLogoPublicId] = useState(null);

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        address: currentUser.address,
        subject: currentUser.subject,
        qualification: currentUser.qualification,
        rollNumber: currentUser.rollNumber,
        classId: currentUser.classId
      });
      setImageUrl(currentUser.profilePic || 'https://via.placeholder.com/150');
      setProfilePublicId(currentUser.profilePublicId);

      if (currentUser.role === 'PRINCIPAL') {
        schoolForm.setFieldsValue({
          schoolName: currentUser.schoolName,
          schoolAddress: currentUser.schoolAddress,
          schoolPhone: currentUser.schoolPhone,
          schoolEmail: currentUser.schoolEmail
        });
        setSchoolLogoUrl(currentUser.schoolLogo || 'https://via.placeholder.com/150');
        setSchoolLogoPublicId(currentUser.schoolLogoPublicId);
      }
    }
  }, [currentUser, form, schoolForm]);

  const handleImageUpload = async (file, isSchoolLogo = false) => {
    let loadingMessage = null;
    try {
      loadingMessage = message.loading('Uploading image...', 0);

      if (!file.type.startsWith('image/')) {
        message.error('Please upload an image file');
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        message.error('Image size should be less than 5MB');
        return false;
      }

      const { url, publicId } = await uploadImage(file);

      if (isSchoolLogo) {
        setSchoolLogoUrl(url);
        setSchoolLogo(url);
        setSchoolLogoPublicId(publicId);
        
        // Only include fields that have values
        const updatedData = {
          schoolLogo: url,
          schoolLogoPublicId: publicId
        };

        // Add other fields only if they exist
        const schoolName = schoolForm.getFieldValue('schoolName');
        const schoolEmail = schoolForm.getFieldValue('schoolEmail');
        const schoolPhone = schoolForm.getFieldValue('schoolPhone');
        const schoolAddress = schoolForm.getFieldValue('schoolAddress');

        if (schoolName) updatedData.schoolName = schoolName;
        if (schoolEmail) updatedData.schoolEmail = schoolEmail;
        if (schoolPhone) updatedData.schoolPhone = schoolPhone;
        if (schoolAddress) updatedData.schoolAddress = schoolAddress;

        await updateSchoolSettings(currentUser.id, updatedData);
        await updateAuthProfile(updatedData);
      } else {
        setImageUrl(url);
        setProfilePic(url);
        setProfilePublicId(publicId);
        
        // Only include fields that have values
        const updatedData = {
          profilePic: url,
          profilePublicId: publicId
        };

        // Add other fields only if they exist
        const name = form.getFieldValue('name');
        const email = form.getFieldValue('email');
        const phone = form.getFieldValue('phone');
        const address = form.getFieldValue('address');

        if (name) updatedData.name = name;
        if (email) updatedData.email = email;
        if (phone) updatedData.phone = phone;
        if (address) updatedData.address = address;

        await updateProfile(currentUser.id, updatedData);
        await updateAuthProfile(updatedData);
      }

      message.success(`${isSchoolLogo ? 'School logo' : 'Profile picture'} uploaded successfully`);
      return true;
    } catch (error) {
      console.error('Upload error:', error);
      message.error(`Error uploading ${isSchoolLogo ? 'school logo' : 'profile picture'}: ${error.message}`);
      return false;
    } finally {
      if (loadingMessage) {
        message.destroy(loadingMessage);
      }
    }
  };

  const renderProfileImage = () => {
    if (profilePublicId) {
      const cldImg = getCloudinaryImage(profilePublicId);
      return (
        <AdvancedImage 
          cldImg={cldImg}
          style={{ width: 150, height: 150, borderRadius: '50%' }}
        />
      );
    }
    return (
      <Avatar
        size={150}
        src={imageUrl}
        icon={<UserOutlined />}
        className="profile-avatar"
      />
    );
  };

  const renderSchoolLogo = () => {
    if (schoolLogoPublicId) {
      const cldImg = getCloudinaryImage(schoolLogoPublicId);
      return (
        <AdvancedImage 
          cldImg={cldImg}
          style={{ width: 150, height: 150, borderRadius: '50%' }}
        />
      );
    }
    return (
      <Avatar
        size={150}
        src={schoolLogoUrl}
        icon={<BankOutlined />}
        className="profile-avatar"
      />
    );
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const updatedData = {
        ...values,
        profilePic: profilePic || currentUser.profilePic
      };
      await updateProfile(currentUser.id, updatedData);
      await updateAuthProfile(updatedData);
      message.success('Profile updated successfully');
    } catch (error) {
      message.error('Error updating profile');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSchoolSettingsFinish = async (values) => {
    try {
      setLoading(true);
      const updatedData = {
        ...values,
        schoolLogo: schoolLogo || currentUser.schoolLogo || schoolLogoUrl
      };
      await updateSchoolSettings(currentUser.id, updatedData);
      await updateAuthProfile(updatedData);
      message.success('School settings updated successfully');
    } catch (error) {
      message.error('Error updating school settings');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <Card className="profile-card">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Personal Information" key="1">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <div className="avatar-upload">
                  {renderProfileImage()}
                  <Upload
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleImageUpload(file);
                      return false;
                    }}
                    accept="image/*"
                    maxCount={1}
                  >
                    <div className="upload-overlay">
                      <UploadOutlined />
                      <div className="upload-text">Change Photo</div>
                    </div>
                  </Upload>
                </div>
              </Col>

              <Col xs={24} md={16}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  className="profile-form"
                >
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please input your name!' }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please input your email!' },
                      { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please input your phone number!' }]}
                  >
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>

                  <Form.Item
                    name="address"
                    label="Address"
                    rules={[{ required: true, message: 'Please input your address!' }]}
                  >
                    <Input.TextArea prefix={<HomeOutlined />} />
                  </Form.Item>

                  {currentUser?.role === 'TEACHER' && (
                    <>
                      <Form.Item
                        name="subject"
                        label="Subject"
                        rules={[{ required: true, message: 'Please input your subject!' }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name="qualification"
                        label="Qualification"
                        rules={[{ required: true, message: 'Please input your qualification!' }]}
                      >
                        <Input />
                      </Form.Item>
                    </>
                  )}

                  {currentUser?.role === 'STUDENT' && (
                    <>
                      <Form.Item
                        name="rollNumber"
                        label="Roll Number"
                        rules={[{ required: true, message: 'Please input your roll number!' }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name="classId"
                        label="Class"
                        rules={[{ required: true, message: 'Please select your class!' }]}
                      >
                        <Input disabled />
                      </Form.Item>
                    </>
                  )}

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Save Changes
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </TabPane>

          {currentUser?.role === 'PRINCIPAL' && (
            <TabPane tab="School Settings" key="2">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <div className="avatar-upload">
                    {renderSchoolLogo()}
                    <Upload
                      showUploadList={false}
                      beforeUpload={(file) => {
                        handleImageUpload(file, true);
                        return false;
                      }}
                      accept="image/*"
                      maxCount={1}
                    >
                      <div className="upload-overlay">
                        <UploadOutlined />
                        <div className="upload-text">Change School Logo</div>
                      </div>
                    </Upload>
                  </div>
                </Col>

                <Col xs={24} md={16}>
                  <Form
                    form={schoolForm}
                    layout="vertical"
                    onFinish={onSchoolSettingsFinish}
                    className="profile-form"
                  >
                    <Form.Item
                      name="schoolName"
                      label="School Name"
                      rules={[{ required: true, message: 'Please input school name!' }]}
                    >
                      <Input prefix={<BankOutlined />} />
                    </Form.Item>

                    <Form.Item
                      name="schoolEmail"
                      label="School Email"
                      rules={[
                        { required: true, message: 'Please input school email!' },
                        { type: 'email', message: 'Please enter a valid email!' }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>

                    <Form.Item
                      name="schoolPhone"
                      label="School Phone"
                      rules={[{ required: true, message: 'Please input school phone number!' }]}
                    >
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>

                    <Form.Item
                      name="schoolAddress"
                      label="School Address"
                      rules={[{ required: true, message: 'Please input school address!' }]}
                    >
                      <Input.TextArea prefix={<HomeOutlined />} />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        Save School Settings
                      </Button>
                    </Form.Item>
                  </Form>
                </Col>
              </Row>
            </TabPane>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile; 
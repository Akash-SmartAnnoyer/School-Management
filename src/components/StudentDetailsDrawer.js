import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  Tabs, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Table, 
  Empty, 
  Avatar, 
  Space, 
  Divider,
  Descriptions,
  Button
} from 'antd';
import { 
  UserOutlined, 
  BookOutlined, 
  TrophyOutlined, 
  CalendarOutlined, 
  TeamOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  HeartOutlined,
  MoneyCollectOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import api from '../services/api';
import moment from 'moment';
import StatusBadge from './StatusBadge';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const StudentDetailsDrawer = ({ visible, onClose, student }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);

  if (!student) {
    return (
      <Drawer
        title="Student Details"
        placement="right"
        onClose={onClose}
        open={visible}
        width={800}
        className="student-details-drawer"
      >
        <Empty description="No student information available" />
      </Drawer>
    );
  }

  const renderDetailItem = (label, value, icon = null) => (
    <div className="detail-item">
      {icon && <div className="detail-icon">{icon}</div>}
      <div className="detail-content">
        <div className="detail-label">{label}</div>
        <div className="detail-value">{value || 'N/A'}</div>
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <Card 
      className="info-card"
      title={
        <Space>
          <UserOutlined className="card-icon" style={{ color: '#7B83EB' }} />
          <span style={{ color: '#7B83EB' }}>Basic Information</span>
        </Space>
      }
      bordered={false}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          {renderDetailItem('First Name', student.first_name, <UserOutlined />)}
        </Col>
        <Col span={12}>
          {renderDetailItem('Last Name', student.last_name, <UserOutlined />)}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          {renderDetailItem('Email', student.email, <MailOutlined />)}
        </Col>
        <Col span={12}>
          {renderDetailItem('Phone', student.phone, <PhoneOutlined />)}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          {renderDetailItem('Gender', student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'Other')}
        </Col>
        <Col span={12}>
          {renderDetailItem('Date of Birth', student.dob ? moment(student.dob).format('DD MMM, YYYY') : 'N/A')}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          {renderDetailItem('Class', student.profile?.class_name)}
        </Col>
        <Col span={12}>
          {renderDetailItem('Nationality', student.profile?.nationality)}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          {renderDetailItem('Blood Group', student.blood_group)}
        </Col>
        <Col span={12}>
          {renderDetailItem('Status', <StatusBadge type="status" value={student.status} />)}
        </Col>
      </Row>
    </Card>
  );

  const renderAcademicInfo = () => (
    <Card 
      className="info-card"
      title={
        <Space>
          <BookOutlined className="card-icon" style={{ color: '#7B83EB' }} />
          <span style={{ color: '#7B83EB' }}>Academic Information</span>
        </Space>
      }
      bordered={false}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          {renderDetailItem('Student ID', student.student_id, <IdcardOutlined />)}
        </Col>
        <Col span={12}>
          {renderDetailItem('Admission Number', student.admission_number, <IdcardOutlined />)}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          {renderDetailItem('Admission Date', student.admission_date ? moment(student.admission_date).format('DD MMM, YYYY') : 'N/A')}
        </Col>
        <Col span={12}>
          {renderDetailItem('Last Grade Attended', student.last_grade_attended)}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          {renderDetailItem('Roll Number', student.roll_no)}
        </Col>
        <Col span={12}>
          {renderDetailItem('Section', student.student_profile?.section)}
        </Col>
      </Row>
    </Card>
  );

  const renderParentInfo = () => (
    <Card 
      className="info-card"
      title={
        <Space>
          <HomeOutlined className="card-icon" style={{ color: '#7B83EB' }} />
          <span style={{ color: '#7B83EB' }}>Parent Information</span>
        </Space>
      }
      bordered={false}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          {renderDetailItem('Father\'s Name', student.father_name, <UserOutlined />)}
        </Col>
        <Col span={12}>
          {renderDetailItem('Father\'s Occupation', student.father_occupation)}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          {renderDetailItem('Mother\'s Name', student.mother_name, <UserOutlined />)}
        </Col>
        <Col span={12}>
          {renderDetailItem('Mother\'s Occupation', student.mother_occupation)}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          {renderDetailItem('Parent\'s Address', student.parent_address, <HomeOutlined />)}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          {renderDetailItem('Parent\'s Email', student.parent_email, <MailOutlined />)}
        </Col>
        <Col span={12}>
          {renderDetailItem('Parent\'s Phone', student.parent_phone, <PhoneOutlined />)}
        </Col>
      </Row>
    </Card>
  );

  const renderAdditionalInfo = () => (
    <Card 
      className="info-card"
      title={
        <Space>
          <InfoCircleOutlined className="card-icon" style={{ color: '#7B83EB' }} />
          <span style={{ color: '#7B83EB' }}>Additional Information</span>
        </Space>
      }
      bordered={false}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          {renderDetailItem('Allergies', student.allergies || 'None', <HeartOutlined />)}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          {renderDetailItem('Remarks', student.remarks || 'No remarks', <InfoCircleOutlined />)}
        </Col>
      </Row>
    </Card>
  );

  const renderFeeDetails = () => (
    <Card 
      className="info-card"
      title={
        <Space>
          <MoneyCollectOutlined className="card-icon" style={{ color: '#7B83EB' }} />
          <span style={{ color: '#7B83EB' }}>Fee Details</span>
        </Space>
      }
      bordered={false}
    >
      {student.fee_details && student.fee_details.length > 0 ? (
        student.fee_details.map((fee, index) => (
          <Card 
            key={index} 
            className="fee-card"
            size="small"
            title={fee.fee_type}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                {renderDetailItem('Total Amount', `₹${fee.amount}`)}
              </Col>
              <Col span={12}>
                {renderDetailItem('Fee Period', fee.period)}
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                {renderDetailItem('Number of Terms', fee.terms)}
              </Col>
              <Col span={12}>
                {renderDetailItem('Amount per Term', `₹${fee.amount_per_term}`)}
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                {renderDetailItem('Fee Status', <StatusBadge type="fee" value={fee.status} />)}
              </Col>
              {fee.status === 'Partial' && (
                <Col span={12}>
                  {renderDetailItem('Due Amount', `₹${fee.due_amount}`)}
                </Col>
              )}
            </Row>
            {fee.remarks && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  {renderDetailItem('Remarks', fee.remarks)}
                </Col>
              </Row>
            )}
          </Card>
        ))
      ) : (
        <Empty description="No fee details available" />
      )}
    </Card>
  );

  const renderAttendance = () => (
    <div className="coming-soon-container">
      <Empty 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Attendance information coming soon" 
      />
    </div>
  );

  const renderAcademics = () => (
    <div className="coming-soon-container">
      <Empty 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Academic performance information coming soon" 
      />
    </div>
  );

  const renderActivities = () => (
    <div className="coming-soon-container">
      <Empty 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Sports & Cultural activities information coming soon" 
      />
    </div>
  );

  return (
    <Drawer
      title={
        <div className="drawer-header">
          <Space>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={onClose}
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
              <span style={{ color: '#1f1f1f' }}>View </span>
              <span style={{ color: '#f54278' }}>Student</span>
            </Typography.Title>
          </Space>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={800}
      className="student-details-drawer"
      closable={false}
    >
      <div className="student-details-container">
        <div className="student-header">
          <div className="student-avatar-container">
            <Avatar 
              size={100} 
              src={student.photo} 
              icon={!student.photo && <UserOutlined />}
              className="student-avatar"
            />
          </div>
          <div className="student-info">
            <Title level={3} className="student-name">
              {student.first_name} {student.last_name}
            </Title>
            <Space size="middle">
              <Tag color="blue" className="info-tag">
                <IdcardOutlined /> {student.student_id}
              </Tag>
              <Tag color="purple" className="info-tag">
                <BookOutlined /> {student.profile?.class_name}
              </Tag>
              <StatusBadge type="status" value={student.status} />
            </Space>
          </div>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="student-tabs"
          tabBarStyle={{ marginBottom: 16 }}
        >
          <TabPane 
            tab={<span><InfoCircleOutlined /> Details</span>} 
            key="details"
          >
            <div className="tab-content">
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                  {renderBasicInfo()}
                  {renderAcademicInfo()}
                  {renderParentInfo()}
                  {renderAdditionalInfo()}
                </Col>
                <Col xs={24} lg={8}>
                  {renderFeeDetails()}
                </Col>
              </Row>
            </div>
          </TabPane>
          <TabPane 
            tab={<span><CalendarOutlined /> Attendance</span>} 
            key="attendance"
          >
            {renderAttendance()}
          </TabPane>
            <TabPane 
            tab={<span><BookOutlined /> Academics</span>} 
            key="academics"
            >
            {renderAcademics()}
            </TabPane>
            <TabPane 
            tab={<span><TeamOutlined /> Sports & Cultural</span>} 
            key="activities"
          >
            {renderActivities()}
            </TabPane>
          </Tabs>
        </div>

      <style jsx>{`
        .student-details-drawer .ant-drawer-header {
          padding: 16px 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .back-button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          border: none;
        }

        .student-details-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .student-header {
          display: flex;
          align-items: center;
          padding: 0 0 20px 0;
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 20px;
        }

        .student-avatar-container {
          margin-right: 24px;
        }

        .student-avatar {
          border: 4px solid #f0f0f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .student-info {
          flex: 1;
        }

        .student-name {
          margin: 0 0 8px 0 !important;
          color: #262626;
        }

        .info-tag {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .student-tabs {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .student-tabs .ant-tabs-content {
          flex: 1;
          overflow: auto;
        }

        .tab-content {
          padding: 0 0 24px 0;
          overflow: auto;
        }

        .info-card {
          margin-bottom: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .info-card .ant-card-head {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          background: rgba(123, 131, 235, 0.05);
        }

        .info-card .ant-card-body {
          padding: 16px;
        }

        .card-icon {
          font-size: 16px;
        }

        .detail-item {
          display: flex;
          margin-bottom: 12px;
        }

        .detail-icon {
          margin-right: 8px;
          color: #7B83EB;
          font-size: 16px;
          display: flex;
          align-items: flex-start;
          padding-top: 2px;
        }

        .detail-content {
          flex: 1;
        }

        .detail-label {
          color: #8c8c8c;
          font-size: 12px;
          margin-bottom: 2px;
        }

        .detail-value {
          color: #262626;
          font-size: 14px;
          font-weight: 500;
        }

        .fee-card {
          margin-bottom: 12px;
          border-radius: 6px;
          border: 1px solid #f0f0f0;
        }

        .fee-card .ant-card-head {
          padding: 8px 12px;
          min-height: auto;
          background: #fafafa;
        }

        .fee-card .ant-card-head-title {
          font-size: 14px;
          padding: 0;
        }

        .fee-card .ant-card-body {
          padding: 12px;
        }

        .coming-soon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 300px;
          background: #fafafa;
          border-radius: 8px;
        }
      `}</style>
    </Drawer>
  );
};

export default StudentDetailsDrawer; 
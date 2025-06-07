    import React from 'react';
import { Modal, Row, Col, Card, Tooltip } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  FormatPainterOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const QuickActionsModal = ({ visible, onClose, onActionClick }) => {
  const actions = [
    {
      key: 'addStudent',
      icon: <UserOutlined style={{ fontSize: '24px', color: '#7B83EB' }} />,
      title: 'Add Student',
      description: 'Register a new student in the system',
      bgColor: 'white',
      hoverColor: '#e6e9fd',
    },
    {
      key: 'addTeacher',
      icon: <TeamOutlined style={{ fontSize: '24px', color: '#4ECDC4' }} />,
      title: 'Add Teacher',
      description: 'Register a new teacher in the system',
      bgColor: 'white',
      hoverColor: '#def7f5',
    },
    {
      key: 'markAttendance',
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#FF6B6B' }} />,
      title: 'Mark Attendance',
      description: 'Record attendance for students or teachers',
      bgColor: 'white',
      hoverColor: '#ffe6e6',
    },
    {
      key: 'addEvent',
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#FFE66D' }} />,
      title: 'Add Calendar Event',
      description: 'Schedule a new event in the academic calendar',
      bgColor: 'white',
      hoverColor: '#fff8d6',
    },
    {
      key: 'theme',
      icon: <FormatPainterOutlined style={{ fontSize: '24px', color: '#95E1D3' }} />,
      title: 'Theme Settings',
      description: 'Customize the application appearance',
      bgColor: 'white',
      hoverColor: '#e5faf7',
    },
  ];

  const handleActionClick = (action) => {
    if (onActionClick) {
      onActionClick(action);
    }
    onClose();
  };

  return (
    <Modal
      title="Select Action Type"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      bodyStyle={{ padding: '24px' }}
    >
      <Row gutter={[16, 16]}>
        {actions.map((action) => (
          <Col span={8} key={action.key}>
            <Card
              hoverable
              onClick={() => handleActionClick(action)}
              style={{
                height: '120px',
                backgroundColor: action.bgColor,
                border: '1px solid #d9d9d9',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                padding: '12px 16px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = action.hoverColor;
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = action.bgColor;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* 25% Icon */}
              <div style={{
                width: '25%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {action.icon}
              </div>

              {/* 75% Text */}
              <div style={{ width: '75%', paddingLeft: '12px', position: 'relative' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000',
                  }}>
                    {action.title}
                  </h3>
                  <Tooltip
                    title={
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '6px',
                        color: '#fff',
                        minWidth: '160px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                      }}>
                        <div>{action.icon}</div>
                        <div style={{ fontSize: '13px' }}>{action.description}</div>
                      </div>
                    }
                    color="#000"
                    overlayStyle={{ maxWidth: '220px' }}
                    placement="topRight"
                  >
                    <InfoCircleOutlined style={{ fontSize: '14px', color: '#999', marginLeft: 8 }} />
                  </Tooltip>
                </div>
                <p style={{
                  margin: '6px 0 0',
                  color: '#666',
                  fontSize: '13px',
                  lineHeight: 1.4,
                }}>
                  {action.description}
                </p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Modal>
  );
};

export default QuickActionsModal;

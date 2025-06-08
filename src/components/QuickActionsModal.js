import React, { useState } from 'react';
import { Row, Col, Card, Tooltip, Typography, Space } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    CalendarOutlined,
    FormatPainterOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import StyledModal from './StyledModal';

const { Title, Text } = Typography;

const QuickActionsModal = ({ visible, onClose, onActionClick }) => {
    const [hoveredCard, setHoveredCard] = useState(null);

    const actions = [
        {
            key: 'addStudent',
            icon: <UserOutlined style={{ fontSize: '24px', color: '#7B83EB' }} />,
            title: 'Add Student',
            description: 'Register a new student in the system',
            bgColor: 'white',
            hoverColor: '#e6e9fd',
            tooltipContent: {
                title: 'Student Registration',
                description: 'Register a new student in the system',
                features: [
                    'Add personal information',
                    'Upload student documents',
                    'Assign to classes',
                    'Set up parent/guardian contacts',
                    'Configure fee structure'
                ]
            }
        },
        {
            key: 'addTeacher',
            icon: <TeamOutlined style={{ fontSize: '24px', color: '#4ECDC4' }} />,
            title: 'Add Teacher',
            description: 'Register a new teacher in the system',
            bgColor: 'white',
            hoverColor: '#def7f5',
            tooltipContent: {
                title: 'Teacher Registration',
                description: 'Register a new teacher in the system',
                features: [
                    'Add professional details',
                    'Upload qualifications',
                    'Assign subjects and classes',
                    'Set up attendance tracking',
                    'Configure salary structure'
                ]
            }
        },
        {
            key: 'markAttendance',
            icon: <CalendarOutlined style={{ fontSize: '24px', color: '#FF6B6B' }} />,
            title: 'Mark Attendance',
            description: 'Record attendance for students or teachers',
            bgColor: 'white',
            hoverColor: '#ffe6e6',
            tooltipContent: {
                title: 'Attendance Management',
                description: 'Record and manage attendance records',
                features: [
                    'Mark daily attendance',
                    'View attendance history',
                    'Generate attendance reports',
                    'Set up attendance rules',
                    'Configure notifications'
                ]
            }
        },
        {
            key: 'addEvent',
            icon: <CalendarOutlined style={{ fontSize: '24px', color: '#FFE66D' }} />,
            title: 'Add Calendar Event',
            description: 'Schedule a new event in the academic calendar',
            bgColor: 'white',
            hoverColor: '#fff8d6',
            tooltipContent: {
                title: 'Calendar Event Management',
                description: 'Schedule and manage academic events',
                features: [
                    'Create academic events',
                    'Set up recurring events',
                    'Send event notifications',
                    'Manage event categories',
                    'Generate event reports'
                ]
            }
        },
        {
            key: 'theme',
            icon: <FormatPainterOutlined style={{ fontSize: '24px', color: '#95E1D3' }} />,
            title: 'Theme Settings',
            description: 'Customize the application appearance',
            bgColor: 'white',
            hoverColor: '#e5faf7',
            tooltipContent: {
                title: 'Theme Customization',
                description: 'Customize the application appearance',
                features: [
                    'Change color scheme',
                    'Modify layout settings',
                    'Customize typography',
                    'Adjust spacing and margins',
                    'Save theme preferences'
                ]
            }
        },
    ];

    const handleActionClick = (action) => {
        if (onActionClick) {
            onActionClick(action);
        }
        onClose();
    };

    const renderTooltipContent = (action) => (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            color: '#fff',
            minWidth: '200px',
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '4px',
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
            }}>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{action.tooltipContent.title}</span>
                <div style={{ marginLeft: '8px' }}>{action.icon}</div>
            </div>
            <p style={{ fontSize: '13px', margin: 0, opacity: 0.9 }}>{action.tooltipContent.description}</p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Features:</div>
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                }}>
                    {action.tooltipContent.features.map((feature, index) => (
                        <li key={index} style={{ fontSize: '12px', opacity: 0.9 }}>
                            • {feature}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );

    return (
        <StyledModal
            visible={visible}
            onClose={onClose}
            width={800}
        >
            <div className="quick-actions-container">
                <div className="form-header">
                    <Space>
                        {/* <UserOutlined style={{ fontSize: '20px', color: '#7B83EB' }} /> */}
                        <Title level={5} style={{ margin: 0 }}>
                            Select Action Type
                        </Title>
                    </Space>
                </div>

                <Row gutter={[16, 16]}>
                    {actions.map((action) => (
                        <Col span={8} key={action.key}>
                            <Card
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
                                    setHoveredCard(action.key);
                                    e.currentTarget.style.backgroundColor = action.hoverColor;
                                    e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    setHoveredCard(null);
                                    e.currentTarget.style.backgroundColor = action.bgColor;
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    width: '25%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    {action.icon}
                                </div>

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
                                        <div style={{
                                            opacity: hoveredCard === action.key ? 1 : 0,
                                            transition: 'opacity 0.3s ease',
                                        }}>
                                            <Tooltip
                                                title={renderTooltipContent(action)}
                                                color="#000"
                                                overlayStyle={{ maxWidth: '300px' }}
                                                placement="topRight"
                                            >
                                                <InfoCircleOutlined style={{
                                                    fontSize: '14px',
                                                    color: '#999',
                                                    marginLeft: 8,
                                                    cursor: 'help'
                                                }} />
                                            </Tooltip>
                                        </div>
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
            </div>
        </StyledModal>
    );
};

export default QuickActionsModal;

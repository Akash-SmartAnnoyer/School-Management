import React from 'react';
import { Typography, Row, Col, Card, Button, Space, Divider, List, Collapse, Layout, Tabs, Image } from 'antd';
import { 
  BookOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  DollarOutlined,
  QuestionCircleOutlined,
  MailOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  UserOutlined,
  BankOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  LockOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Header, Footer } = Layout;
const { TabPane } = Tabs;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #f7f9fc;
`;

const StyledHeader = styled(Header)`
  background: white;
  padding: 0 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: fixed;
  width: 100%;
  z-index: 1000;
`;

const StyledFooter = styled(Footer)`
  text-align: center;
  background: white;
  padding: 24px 50px;
  border-top: 1px solid #e8e8e8;
`;

const StyledSection = styled.section`
  padding: 80px 0;
  background: ${props => props.background || '#f7f9fc'};
`;

const FeatureCard = styled(Card)`
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(123, 131, 235, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(123, 131, 235, 0.15);
    border-color: #7B83EB;
  }
`;

const VideoFrame = styled.div`
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(123, 131, 235, 0.1);
  
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

const FeatureShowcase = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(123, 131, 235, 0.1);
  border: 1px solid #e8e8e8;
`;

const ScreenshotContainer = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(123, 131, 235, 0.1);
  margin: 24px 0;
  border: 1px solid #e8e8e8;
  
  img {
    width: 100%;
    height: auto;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.02);
  }
`;

const AcademyLanding = () => {
  const features = [
    {
      icon: <TeamOutlined style={{ fontSize: 32, color: 'var(--primary-color)' }} />,
      title: 'Student Management',
      description: 'Comprehensive student profiles, attendance tracking, and academic performance monitoring.'
    },
    {
      icon: <BookOutlined style={{ fontSize: 32, color: 'var(--primary-color)' }} />,
      title: 'Course Management',
      description: 'Organize courses, assignments, and learning materials in one centralized platform.'
    },
    {
      icon: <CalendarOutlined style={{ fontSize: 32, color: 'var(--primary-color)' }} />,
      title: 'Scheduling',
      description: 'Efficient class scheduling, event management, and calendar integration.'
    },
    {
      icon: <FileTextOutlined style={{ fontSize: 32, color: 'var(--primary-color)' }} />,
      title: 'Document Management',
      description: 'Secure storage and easy access to all academic and administrative documents.'
    },
    {
      icon: <DollarOutlined style={{ fontSize: 32, color: 'var(--primary-color)' }} />,
      title: 'Financial Management',
      description: 'Track fees, generate invoices, and manage financial records seamlessly.'
    }
  ];

  const modules = [
    {
      key: 'dashboard',
      title: 'Dashboard',
      icon: <DashboardOutlined />,
      description: 'Get a comprehensive overview of your school\'s performance and activities.',
      features: [
        'Real-time analytics and statistics',
        'Quick access to important functions',
        'Customizable widgets and reports',
        'Performance metrics and KPIs'
      ],
      screenshot: '/screenshots/dashboard.png'
    },
    {
      key: 'students',
      title: 'Student Management',
      icon: <UserOutlined />,
      description: 'Complete student information management system.',
      features: [
        'Detailed student profiles',
        'Attendance tracking',
        'Academic performance monitoring',
        'Parent communication portal',
        'Document management',
        'Health records'
      ],
      screenshot: '/screenshots/students.png'
    },
    {
      key: 'academics',
      title: 'Academic Management',
      icon: <BookOutlined />,
      description: 'Streamline academic operations and enhance learning outcomes.',
      features: [
        'Course and subject management',
        'Assignment tracking',
        'Grade management',
        'Exam scheduling',
        'Result processing',
        'Academic calendar'
      ],
      screenshot: '/screenshots/academics.png'
    },
    {
      key: 'finance',
      title: 'Financial Management',
      icon: <BankOutlined />,
      description: 'Comprehensive financial management for educational institutions.',
      features: [
        'Fee structure management',
        'Online payment processing',
        'Invoice generation',
        'Financial reporting',
        'Expense tracking',
        'Budget management'
      ],
      screenshot: '/screenshots/finance.png'
    },
    {
      key: 'reports',
      title: 'Reports & Analytics',
      icon: <BarChartOutlined />,
      description: 'Powerful reporting and analytics tools for data-driven decisions.',
      features: [
        'Custom report generation',
        'Performance analytics',
        'Attendance reports',
        'Financial reports',
        'Academic reports',
        'Export capabilities'
      ],
      screenshot: '/screenshots/reports.png'
    }
  ];

  const faqs = [
    {
      question: 'What is 360Schooling?',
      answer: '360Schooling is a comprehensive school management system designed to streamline educational administration, enhance learning experiences, and improve communication between students, teachers, and administrators.'
    },
    {
      question: 'How can I get started with 360Schooling?',
      answer: 'Getting started is easy! Simply contact our team through the contact form, and we\'ll guide you through the setup process, including system configuration, data migration, and staff training.'
    },
    {
      question: 'Is 360Schooling suitable for all types of educational institutions?',
      answer: 'Yes! 360Schooling is designed to be flexible and scalable, making it suitable for schools of all sizes, from small private institutions to large educational networks.'
    },
    {
      question: 'What kind of support do you offer?',
      answer: 'We provide 24/7 technical support, regular system updates, and comprehensive training resources to ensure you get the most out of 360Schooling.'
    },
    {
      question: 'How secure is the data in 360Schooling?',
      answer: 'We take data security very seriously. Our system uses industry-standard encryption, regular backups, and strict access controls to ensure your data is always safe and secure.'
    },
    {
      question: 'Can 360Schooling be customized for our specific needs?',
      answer: 'Absolutely! We understand that every school has unique requirements. Our system is highly customizable, and we work closely with you to tailor the solution to your specific needs.'
    }
  ];

  return (
    <StyledLayout>
      <StyledHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img 
            src="/logo-transparent-png.png" 
            alt="360Schooling Logo" 
            style={{ height: '40px' }} 
          />
          <Title level={4} style={{ margin: 0, color: '#7B83EB' }}>
            360 Academy
          </Title>
        </div>
        <Space>
          <Button type="primary" onClick={() => window.location.href = '/login'}>
            Login
          </Button>
          <Button onClick={() => window.location.href = '/register'}>
            Register
          </Button>
        </Space>
      </StyledHeader>

      <Layout.Content style={{ paddingTop: '64px' }}>
        {/* Hero Section */}
        <StyledSection background="white">
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Row align="middle" gutter={[48, 48]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" size="large">
                  <Title level={1} style={{ color: '#1f1f1f', margin: 0 }}>
                    Transform Your School Management
                  </Title>
                  <Paragraph style={{ color: '#666666', fontSize: 18 }}>
                    Experience the future of education management with our comprehensive, user-friendly platform. Streamline operations, enhance learning, and improve communication.
                  </Paragraph>
                  <Space>
                    <Button type="primary" size="large" style={{ background: '#7B83EB', borderColor: '#7B83EB' }}>
                      Schedule Demo
                    </Button>
                    <Button size="large" style={{ color: '#7B83EB', borderColor: '#7B83EB' }}>
                      Learn More
                    </Button>
                  </Space>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <img 
                  src="/screenshots/dashboard-preview.png" 
                  alt="360Schooling Dashboard" 
                  style={{ 
                    width: '100%', 
                    maxWidth: 600, 
                    margin: '0 auto', 
                    display: 'block',
                    boxShadow: '0 4px 20px rgba(123, 131, 235, 0.15)',
                    borderRadius: '16px'
                  }} 
                />
              </Col>
            </Row>
          </div>
        </StyledSection>

        {/* Key Features Section */}
        <StyledSection>
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 48, color: '#1f1f1f' }}>
              Key Features
            </Title>
            <Row gutter={[24, 24]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                  <FeatureCard>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      {React.cloneElement(feature.icon, { style: { fontSize: 32, color: '#7B83EB' } })}
                      <Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>{feature.title}</Title>
                      <Paragraph style={{ color: '#666666' }}>
                        {feature.description}
                      </Paragraph>
                    </Space>
                  </FeatureCard>
                </Col>
              ))}
            </Row>
          </div>
        </StyledSection>

        {/* Module Showcase Section */}
        <StyledSection background="white">
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 48, color: '#1f1f1f' }}>
              Explore Our Modules
            </Title>
            <Tabs 
              defaultActiveKey="dashboard" 
              centered 
              size="large"
              style={{
                '.ant-tabs-tab': {
                  color: '#666666',
                },
                '.ant-tabs-tab-active': {
                  color: '#7B83EB',
                },
                '.ant-tabs-ink-bar': {
                  background: '#7B83EB',
                }
              }}
            >
              {modules.map(module => (
                <TabPane
                  tab={
                    <Space>
                      {React.cloneElement(module.icon, { style: { color: '#7B83EB' } })}
                      {module.title}
                    </Space>
                  }
                  key={module.key}
                >
                  <FeatureShowcase>
                    <Row gutter={[48, 48]} align="middle">
                      <Col xs={24} md={12}>
                        <Space direction="vertical" size="large">
                          <Title level={3} style={{ color: '#1f1f1f' }}>{module.title}</Title>
                          <Paragraph style={{ fontSize: 16, color: '#666666' }}>
                            {module.description}
                          </Paragraph>
                          <List
                            dataSource={module.features}
                            renderItem={item => (
                              <List.Item>
                                <Space>
                                  <CheckCircleOutlined style={{ color: '#7B83EB' }} />
                                  <Text style={{ color: '#666666' }}>{item}</Text>
                                </Space>
                              </List.Item>
                            )}
                          />
                        </Space>
                      </Col>
                      <Col xs={24} md={12}>
                        <ScreenshotContainer>
                          <img src={module.screenshot} alt={`${module.title} Screenshot`} />
                        </ScreenshotContainer>
                      </Col>
                    </Row>
                  </FeatureShowcase>
                </TabPane>
              ))}
            </Tabs>
          </div>
        </StyledSection>

        {/* Video Section */}
        <StyledSection>
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} md={12}>
                <Title level={2} style={{ color: '#1f1f1f' }}>See 360Schooling in Action</Title>
                <Paragraph style={{ fontSize: 16, color: '#666666' }}>
                  Watch our comprehensive demo video to see how 360Schooling can transform your educational institution. Learn about our key features and how they can benefit your school.
                </Paragraph>
                <List
                  dataSource={[
                    'Complete system walkthrough',
                    'Feature demonstrations',
                    'User interface showcase',
                    'Mobile app preview',
                    'Integration capabilities'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Space>
                        <CheckCircleOutlined style={{ color: '#7B83EB' }} />
                        <Text style={{ color: '#666666' }}>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Col>
              <Col xs={24} md={12}>
                <VideoFrame>
                  <iframe
                    src="https://www.youtube.com/embed/your-video-id"
                    title="360Schooling Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </VideoFrame>
              </Col>
            </Row>
          </div>
        </StyledSection>

        {/* FAQs Section */}
        <StyledSection background="white">
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 48, color: '#1f1f1f' }}>
              Frequently Asked Questions
            </Title>
            <Collapse 
              bordered={false}
              style={{ 
                background: 'white',
                borderRadius: 16,
                boxShadow: '0 4px 20px rgba(123, 131, 235, 0.1)',
                border: '1px solid #e8e8e8'
              }}
            >
              {faqs.map((faq, index) => (
                <Panel 
                  header={<span style={{ color: '#1f1f1f' }}>{faq.question}</span>}
                  key={index}
                  style={{ 
                    borderBottom: index !== faqs.length - 1 ? '1px solid #e8e8e8' : 'none'
                  }}
                >
                  <Paragraph style={{ color: '#666666' }}>{faq.answer}</Paragraph>
                </Panel>
              ))}
            </Collapse>
          </div>
        </StyledSection>

        {/* Contact Section */}
        <StyledSection>
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} md={12}>
                <Title level={2} style={{ color: '#1f1f1f' }}>Get in Touch</Title>
                <Paragraph style={{ fontSize: 16, color: '#666666' }}>
                  Ready to transform your educational institution? Contact us today to schedule a demo or learn more about how 360Schooling can benefit your school.
                </Paragraph>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    icon={<MailOutlined />} 
                    size="large"
                    style={{ width: '100%', background: '#7B83EB', borderColor: '#7B83EB' }}
                  >
                    Contact Us
                  </Button>
                  <Button 
                    icon={<PlayCircleOutlined />} 
                    size="large"
                    style={{ width: '100%', color: '#7B83EB', borderColor: '#7B83EB' }}
                  >
                    Schedule Demo
                  </Button>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Card 
                  style={{ 
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(123, 131, 235, 0.1)',
                    border: '1px solid #e8e8e8'
                  }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Title level={4} style={{ color: '#1f1f1f' }}>Why Choose 360Schooling?</Title>
                    <List
                      dataSource={[
                        'User-friendly interface',
                        'Comprehensive features',
                        'Regular updates and support',
                        'Secure and reliable',
                        'Customizable to your needs',
                        'Mobile app available',
                        '24/7 technical support',
                        'Easy data migration',
                        'Cloud-based solution',
                        'Multi-language support'
                      ]}
                      renderItem={item => (
                        <List.Item>
                          <Space>
                            <CheckCircleOutlined style={{ color: '#7B83EB' }} />
                            <Text style={{ color: '#666666' }}>{item}</Text>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        </StyledSection>
      </Layout.Content>

      <StyledFooter>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <img 
              src="/logo-transparent-png.png" 
              alt="360Schooling Logo" 
              style={{ height: '40px', marginBottom: '16px' }} 
            />
            <Title level={4} style={{ margin: 0, color: '#7B83EB' }}>
              360Schooling
            </Title>
          </div>
          <Text type="secondary" style={{ color: '#666666' }}>
            © {new Date().getFullYear()} 360Schooling. All rights reserved.
          </Text>
        </Space>
      </StyledFooter>
    </StyledLayout>
  );
};

export default AcademyLanding; 
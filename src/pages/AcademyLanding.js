import React from 'react';
import { Typography, Row, Col, Card, Button, Space, Divider, List, Collapse, Layout, Tabs, Image, Statistic } from 'antd';
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
  LockOutlined,
  StarOutlined,
  TrophyOutlined,
  GlobalOutlined,
  RocketOutlined
} from '@ant-design/icons';
import styled, { keyframes, css } from 'styled-components';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Header, Footer } = Layout;
const { TabPane } = Tabs;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #f7f9fc;
`;

const StyledHeader = styled(Header)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 0 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: fixed;
  width: 100%;
  z-index: 1000;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
  }
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

const HeroSection = styled(StyledSection)`
  position: relative;
  overflow: hidden;
  padding: 120px 0;
  background: linear-gradient(135deg, #7B83EB 0%, #5B63D9 100%);
  color: white;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/pattern.svg');
    opacity: 0.1;
  }
`;

const HeroImage = styled.img`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: block;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  animation: ${float} 3s ease-in-out infinite;
`;

const FeatureCard = styled(Card)`
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(123, 131, 235, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
  animation: ${fadeIn} 0.5s ease-out;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(123, 131, 235, 0.15);
    border-color: #7B83EB;
    
    .feature-icon {
      animation: ${float} 2s ease-in-out infinite;
    }
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

const StatsSection = styled(StyledSection)`
  background: white;
  text-align: center;
`;

const StatisticCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(123, 131, 235, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(123, 131, 235, 0.15);
  }
`;

const TestimonialCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(123, 131, 235, 0.1);
  margin: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(123, 131, 235, 0.15);
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

  const stats = [
    {
      title: 'Active Schools',
      value: '500+',
      icon: <GlobalOutlined style={{ fontSize: 32, color: '#7B83EB' }} />
    },
    {
      title: 'Happy Users',
      value: '50K+',
      icon: <UserOutlined style={{ fontSize: 32, color: '#7B83EB' }} />
    },
    {
      title: 'Success Rate',
      value: '98%',
      icon: <TrophyOutlined style={{ fontSize: 32, color: '#7B83EB' }} />
    },
    {
      title: 'Features',
      value: '100+',
      icon: <RocketOutlined style={{ fontSize: 32, color: '#7B83EB' }} />
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Principal, St. Mary\'s Academy',
      content: '360Schooling has transformed how we manage our school. The platform is intuitive, feature-rich, and has significantly improved our administrative efficiency.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'IT Director, Global Education Network',
      content: 'The comprehensive features and excellent support make 360Schooling the perfect solution for our multi-campus institution.',
      rating: 5
    },
    {
      name: 'Emma Rodriguez',
      role: 'Administrator, Bright Future School',
      content: 'Implementing 360Schooling was the best decision we made. It has streamlined our operations and improved communication across all levels.',
      rating: 5
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
        <HeroSection>
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Row align="middle" gutter={[48, 48]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" size="large">
                  <Title level={1} style={{ color: 'white', margin: 0, fontSize: '3.5rem' }}>
                    Transform Your School Management
                  </Title>
                  <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 20 }}>
                    Experience the future of education management with our comprehensive, user-friendly platform. Streamline operations, enhance learning, and improve communication.
                  </Paragraph>
                  <Space>
                    <Button type="primary" size="large" style={{ 
                      background: 'white', 
                      borderColor: 'white',
                      color: '#7B83EB',
                      height: '48px',
                      padding: '0 32px',
                      fontSize: '16px'
                    }}>
                      Schedule Demo
                    </Button>
                    <Button size="large" style={{ 
                      color: 'white', 
                      borderColor: 'white',
                      height: '48px',
                      padding: '0 32px',
                      fontSize: '16px'
                    }}>
                      Learn More
                    </Button>
                  </Space>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <HeroImage 
                  src="/screenshots/dashboard-preview.png" 
                  alt="360Schooling Dashboard" 
                />
              </Col>
            </Row>
          </div>
        </HeroSection>

        {/* Stats Section */}
        <StatsSection>
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Row gutter={[24, 24]}>
              {stats.map((stat, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <StatisticCard>
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                      {stat.icon}
                      <Statistic 
                        title={stat.title} 
                        value={stat.value} 
                        valueStyle={{ color: '#7B83EB', fontSize: '2rem' }}
                      />
                    </Space>
                  </StatisticCard>
                </Col>
              ))}
            </Row>
          </div>
        </StatsSection>

        {/* Enhanced Features Section */}
        <StyledSection>
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 48, color: '#1f1f1f' }}>
              Powerful Features for Modern Education
            </Title>
            <Row gutter={[24, 24]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                  <FeatureCard>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      <div className="feature-icon">
                        {React.cloneElement(feature.icon, { style: { fontSize: 32, color: '#7B83EB' } })}
                      </div>
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

        {/* Testimonials Section */}
        <StyledSection background="white">
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 48, color: '#1f1f1f' }}>
              What Our Clients Say
            </Title>
            <Row gutter={[24, 24]}>
              {testimonials.map((testimonial, index) => (
                <Col xs={24} md={8} key={index}>
                  <TestimonialCard>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      <div style={{ color: '#7B83EB' }}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <StarOutlined key={i} />
                        ))}
                      </div>
                      <Paragraph style={{ fontSize: 16, color: '#666666', fontStyle: 'italic' }}>
                        "{testimonial.content}"
                      </Paragraph>
                      <Space direction="vertical" size="small">
                        <Text strong style={{ color: '#1f1f1f' }}>{testimonial.name}</Text>
                        <Text type="secondary">{testimonial.role}</Text>
                      </Space>
                    </Space>
                  </TestimonialCard>
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
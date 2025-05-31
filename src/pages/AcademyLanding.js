import React from 'react';
import { Typography, Row, Col, Card, Button, Space, Divider, List, Collapse, Layout } from 'antd';
import { 
  BookOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  DollarOutlined,
  QuestionCircleOutlined,
  MailOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Header, Footer } = Layout;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: var(--background-color);
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
`;

const StyledSection = styled.section`
  padding: 80px 0;
  background: ${props => props.background || 'var(--background-color)'};
`;

const FeatureCard = styled(Card)`
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(123, 131, 235, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(123, 131, 235, 0.15);
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
          <Title level={4} style={{ margin: 0, color: 'var(--primary-color)' }}>
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
        <StyledSection background="linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)">
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Row align="middle" gutter={[48, 48]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" size="large">
                  <Title level={1} style={{ color: 'white', margin: 0 }}>
                    Welcome to 360Schooling
                  </Title>
                  <Paragraph style={{ color: 'white', fontSize: 18 }}>
                    Transform your educational institution with our comprehensive school management solution. Streamline operations, enhance learning, and improve communication.
                  </Paragraph>
                  <Button type="primary" size="large" style={{ background: 'white', color: 'var(--primary-color)' }}>
                    Get Started
                  </Button>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <img 
                  src="/logo-transparent-png.png" 
                  alt="360Schooling Logo" 
                  style={{ 
                    width: '100%', 
                    maxWidth: 400, 
                    margin: '0 auto', 
                    display: 'block',
                    filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.2))'
                  }} 
                />
              </Col>
            </Row>
          </div>
        </StyledSection>

        {/* Features Section */}
        <StyledSection>
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
              Comprehensive Features
            </Title>
            <Row gutter={[24, 24]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                  <FeatureCard>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      {feature.icon}
                      <Title level={4} style={{ margin: 0 }}>{feature.title}</Title>
                      <Paragraph style={{ color: 'var(--text-secondary)' }}>
                        {feature.description}
                      </Paragraph>
                    </Space>
                  </FeatureCard>
                </Col>
              ))}
            </Row>
          </div>
        </StyledSection>

        {/* Video Section */}
        <StyledSection background="var(--surface-color)">
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} md={12}>
                <Title level={2}>See 360Schooling in Action</Title>
                <Paragraph style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                  Watch our demo video to see how 360Schooling can transform your educational institution. Learn about our key features and how they can benefit your school.
                </Paragraph>
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
        <StyledSection>
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
              Frequently Asked Questions
            </Title>
            <Collapse 
              bordered={false}
              style={{ 
                background: 'var(--surface-color)',
                borderRadius: 16,
                boxShadow: '0 4px 20px rgba(123, 131, 235, 0.1)'
              }}
            >
              {faqs.map((faq, index) => (
                <Panel 
                  header={faq.question} 
                  key={index}
                  style={{ 
                    borderBottom: index !== faqs.length - 1 ? '1px solid var(--border-color)' : 'none'
                  }}
                >
                  <Paragraph>{faq.answer}</Paragraph>
                </Panel>
              ))}
            </Collapse>
          </div>
        </StyledSection>

        {/* Contact Section */}
        <StyledSection background="var(--surface-color)">
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} md={12}>
                <Title level={2}>Get in Touch</Title>
                <Paragraph style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                  Ready to transform your educational institution? Contact us today to schedule a demo or learn more about how 360Schooling can benefit your school.
                </Paragraph>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    icon={<MailOutlined />} 
                    size="large"
                    style={{ width: '100%' }}
                  >
                    Contact Us
                  </Button>
                  <Button 
                    icon={<PlayCircleOutlined />} 
                    size="large"
                    style={{ width: '100%' }}
                  >
                    Schedule Demo
                  </Button>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Card 
                  style={{ 
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(123, 131, 235, 0.1)'
                  }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Title level={4}>Why Choose 360Schooling?</Title>
                    <List
                      dataSource={[
                        'User-friendly interface',
                        'Comprehensive features',
                        'Regular updates and support',
                        'Secure and reliable',
                        'Customizable to your needs'
                      ]}
                      renderItem={item => (
                        <List.Item>
                          <Space>
                            <CheckCircleOutlined style={{ color: 'var(--success-color)' }} />
                            <Text>{item}</Text>
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
            <Title level={4} style={{ margin: 0, color: 'var(--primary-color)' }}>
              360Schooling
            </Title>
          </div>
          <Text type="secondary">
            © {new Date().getFullYear()} 360Schooling. All rights reserved.
          </Text>
        </Space>
      </StyledFooter>
    </StyledLayout>
  );
};

export default AcademyLanding; 
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Carousel, message, Progress, List, Typography, Space, Avatar, Timeline } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined, CalendarOutlined, ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined, DollarOutlined, BarChartOutlined, DownloadOutlined, PrinterOutlined, CarOutlined } from '@ant-design/icons';
import { subscribeToCollection, getStudents, getTeachers, getClasses, getAttendance } from '../firebase/services';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadSampleData } from '../utils/sampleData';
import moment from 'moment';
import './Dashboard.css';
import { Pie, Column, Line } from '@ant-design/plots';
import { getCalendarEvents, initializeSampleData } from '../services/localStorage';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [finance, setFinance] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [feeCollection, setFeeCollection] = useState([]);
  const [libraryStats, setLibraryStats] = useState({});
  const [transportStats, setTransportStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to real-time updates for all collections
    const unsubscribeStudents = subscribeToCollection('students', (data) => {
      setStudents(data);
    });

    const unsubscribeTeachers = subscribeToCollection('teachers', (data) => {
      setTeachers(data);
    });

    const unsubscribeClasses = subscribeToCollection('classes', (data) => {
      setClasses(data);
    });

    const unsubscribeAttendance = subscribeToCollection('attendance', (data) => {
      setAttendance(data);
    });

    const unsubscribeFinance = subscribeToCollection('finance', (data) => {
      setFinance(data);
    });

    // Initialize and load calendar events from local storage
    initializeSampleData();
    setCalendarEvents(getCalendarEvents());

    // Sample notifications
    setNotifications([
      { id: 1, type: 'exam', message: 'Final exams schedule released', date: '2024-03-20', priority: 'high' },
      { id: 2, type: 'fee', message: 'Last date for fee submission: March 25', date: '2024-03-18', priority: 'medium' },
      { id: 3, type: 'event', message: 'Annual sports day on March 30', date: '2024-03-15', priority: 'low' },
    ]);

    // Sample upcoming exams
    setUpcomingExams([
      { id: 1, subject: 'Mathematics', date: '2024-03-25', time: '10:00 AM', duration: '3 hours' },
      { id: 2, subject: 'Science', date: '2024-03-27', time: '10:00 AM', duration: '3 hours' },
      { id: 3, subject: 'English', date: '2024-03-29', time: '10:00 AM', duration: '3 hours' },
    ]);

    // Sample recent activities
    setRecentActivities([
      { id: 1, type: 'attendance', message: 'Attendance marked for Class 10A', time: '2 hours ago' },
      { id: 2, type: 'fee', message: 'Fee received from 15 students', time: '3 hours ago' },
      { id: 3, type: 'exam', message: 'Exam results published for Class 9', time: '5 hours ago' },
    ]);

    // Sample fee collection data
    setFeeCollection([
      { month: 'Jan', type: 'Collected', value: 85000 },
      { month: 'Jan', type: 'Pending', value: 15000 },
      { month: 'Feb', type: 'Collected', value: 90000 },
      { month: 'Feb', type: 'Pending', value: 10000 },
      { month: 'Mar', type: 'Collected', value: 75000 },
      { month: 'Mar', type: 'Pending', value: 25000 },
    ]);

    // Sample library statistics
    setLibraryStats({
      totalBooks: 5000,
      issuedBooks: 350,
      popularCategories: ['Science', 'Mathematics', 'Literature'],
      recentAdditions: 50
    });

    // Sample transport statistics
    setTransportStats({
      totalBuses: 12,
      activeRoutes: 8,
      studentsUsingTransport: 450,
      routes: [
        { route: 'Route 1', students: 45, distance: '15 km' },
        { route: 'Route 2', students: 38, distance: '12 km' },
        { route: 'Route 3', students: 42, distance: '18 km' },
      ]
    });

    return () => {
      unsubscribeStudents();
      unsubscribeTeachers();
      unsubscribeClasses();
      unsubscribeAttendance();
      unsubscribeFinance();
    };
  }, []);

  // Calculate today's attendance
  const today = moment().format('YYYY-MM-DD');
  const todayAttendance = attendance.filter(record => record.date === today);
  const presentCount = todayAttendance.filter(record => record.status === 'Present').length;
  const absentCount = todayAttendance.filter(record => record.status === 'Absent').length;

  // Get recent transactions
  const recentTransactions = finance
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <span style={{ color: record.type === 'Income' ? '#52c41a' : '#ff4d4f' }}>
          {record.type === 'Income' ? '+' : '-'}₹{amount.toLocaleString()}
        </span>
      ),
    },
  ];

  const handleUploadSampleData = async () => {
    try {
      await uploadSampleData();
      message.success('Sample data uploaded successfully!');
    } catch (error) {
      message.error('Error uploading sample data: ' + error.message);
    }
  };

  // Calculate attendance percentage
  const attendancePercentage = presentCount + absentCount > 0 
    ? Math.round((presentCount / (presentCount + absentCount)) * 100) 
    : 0;

  // Prepare data for charts
  const attendanceData = [
    { type: 'Present', value: presentCount },
    { type: 'Absent', value: absentCount }
  ];

  const monthlyFinanceData = finance
    .filter(record => moment(record.date).isSame(moment(), 'month'))
    .reduce((acc, record) => {
      const date = moment(record.date).format('MMM DD');
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (record.type === 'Income') {
        acc[date].income += record.amount;
      } else {
        acc[date].expense += record.amount;
      }
      return acc;
    }, {});

  const financeChartData = Object.values(monthlyFinanceData);

  const getNextHoliday = () => {
    const today = moment();
    const upcomingHolidays = calendarEvents
      .filter(event => event.type === 'HOLIDAY' && moment(event.date).isAfter(today))
      .sort((a, b) => moment(a.date).diff(moment(b.date)));

    return upcomingHolidays[0];
  };

  const nextHoliday = getNextHoliday();

  return (
    <div style={{ 
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
      <Row justify="space-between" align="middle" style={{ padding: '16px 24px' }}>
        <Col>
          <Title level={3} style={{ 
            color: '#7B83EB',
            margin: 0,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <BarChartOutlined style={{ fontSize: '24px', color: '#7B83EB', fontWeight: 'bold'}} />
            School Dashboard
          </Title>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              style={{
                height: '32px',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                background: '#7B83EB',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.3s ease',
                padding: '0 12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(159, 179, 223, 0.25)';
                e.currentTarget.style.background = '#8ba1d1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(159, 179, 223, 0.15)';
                e.currentTarget.style.background = '#7B83EB';
              }}
              onClick={handleUploadSampleData}
            >
              Upload Sample Data
            </Button>
          </Space>
        </Col>
      </Row>

      <Card
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
          overflow: 'hidden',
          background: '#ffffff',
          border: '1px solid rgba(159, 179, 223, 0.3)',
          margin: '0 16px 16px 16px',
          padding: 0
        }}
        bodyStyle={{ padding: 0, height: '100%' }}
      >
        <Carousel autoplay className="dashboard-carousel">
          <div className="carousel-slide">
            <div className="carousel-content">
              <h2>Welcome to School Management System</h2>
              <p>Empowering education through technology</p>
            </div>
          </div>
          <div className="carousel-slide">
            <div className="carousel-content">
              <h2>Excellence in Education</h2>
              <p>Nurturing minds, Building futures</p>
            </div>
          </div>
        </Carousel>

        <Row gutter={[16, 16]} style={{ padding: '16px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)',
                background: 'linear-gradient(135deg, #7B83EB 0%, #8ba1d1 100%)',
                color: 'white'
              }}
            >
              <Statistic
                title={<span style={{ color: 'white' }}>Total Students</span>}
                value={students.length}
                prefix={<UserOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)',
                background: 'linear-gradient(135deg, #7B83EB 0%, #8ba1d1 100%)',
                color: 'white'
              }}
            >
              <Statistic
                title={<span style={{ color: 'white' }}>Total Teachers</span>}
                value={teachers.length}
                prefix={<TeamOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)',
                background: 'linear-gradient(135deg, #7B83EB 0%, #8ba1d1 100%)',
                color: 'white'
              }}
            >
              <Statistic
                title={<span style={{ color: 'white' }}>Total Classes</span>}
                value={classes.length}
                prefix={<BookOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)',
                background: 'linear-gradient(135deg, #7B83EB 0%, #8ba1d1 100%)',
                color: 'white'
              }}
            >
              <Statistic
                title={<span style={{ color: 'white' }}>Today's Attendance</span>}
                value={`${presentCount}/${presentCount + absentCount}`}
                prefix={<CalendarOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
                suffix={
                  <Progress 
                    type="circle" 
                    percent={attendancePercentage} 
                    width={40}
                    strokeColor="white"
                    trailColor="rgba(255, 255, 255, 0.2)"
                  />
                }
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ padding: '0 16px 16px 16px' }}>
          <Col xs={24} lg={16}>
            <Card
              title="Today's Attendance Summary"
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="attendance-chart">
                    <Pie
                      data={attendanceData}
                      angleField="value"
                      colorField="type"
                      radius={0.8}
                      label={{
                        content: '{name} {percentage}%',
                        style: {
                          fontSize: 14,
                          textAlign: 'center',
                          fill: '#fff'
                        }
                      }}
                      color={['#52c41a', '#ff4d4f']}
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="attendance-stats">
                    <div className="attendance-stat">
                      <span className="stat-label">Present</span>
                      <span className="stat-value present">{presentCount}</span>
                    </div>
                    <div className="attendance-stat">
                      <span className="stat-label">Absent</span>
                      <span className="stat-value absent">{absentCount}</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <div className="dashboard-side-cards">
              <Card
                title="Recent Transactions"
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                  border: '1px solid rgba(159, 179, 223, 0.3)',
                  marginBottom: '16px'
                }}
              >
                <Table
                  columns={transactionColumns}
                  dataSource={recentTransactions}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                />
              </Card>
              {nextHoliday && (
                <Card
                  title="Next Holiday"
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                    border: '1px solid rgba(159, 179, 223, 0.3)',
                    background: 'linear-gradient(135deg, #7B83EB 0%, #8ba1d1 100%)',
                    color: 'white'
                  }}
                >
                  <div className="next-holiday-info">
                    <h3>{nextHoliday.title}</h3>
                    <p>{moment(nextHoliday.date).format('MMMM D, YYYY')}</p>
                    <p>{moment(nextHoliday.date).diff(moment(), 'days')} days remaining</p>
                  </div>
                </Card>
              )}
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ padding: '0 16px 16px 16px' }}>
          <Col xs={24} lg={12}>
            <Card
              title="Monthly Finance Overview"
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
            >
              <Column
                data={financeChartData}
                xField="date"
                yField="income"
                seriesField="type"
                columnStyle={{
                  radius: [4, 4, 0, 0],
                }}
                color={['#52c41a', '#ff4d4f']}
                label={{
                  position: 'middle',
                  style: {
                    fill: '#FFFFFF',
                  },
                }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title="Student Growth Trend"
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
            >
              <Line
                data={[
                  { month: 'Jan', students: 150 },
                  { month: 'Feb', students: 165 },
                  { month: 'Mar', students: 180 },
                  { month: 'Apr', students: 190 },
                  { month: 'May', students: 200 },
                  { month: 'Jun', students: students.length },
                ]}
                xField="month"
                yField="students"
                smooth
                point={{
                  size: 5,
                  shape: 'diamond',
                }}
                label={{
                  style: {
                    fill: '#aaa',
                  },
                }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ padding: '16px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
              border: '1px solid rgba(159, 179, 223, 0.3)',
              background: 'linear-gradient(135deg, #7B83EB 0%, #8ba1d1 100%)',
              color: 'white'
            }}
          >
            <Statistic
              title={<span style={{ color: 'white' }}>Library Books</span>}
              value={libraryStats.totalBooks}
              prefix={<BookOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ padding: '0 16px 16px 16px' }}>
        <Col xs={24} md={12}>
          <Card
            title="Recent Notifications"
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
              border: '1px solid rgba(159, 179, 223, 0.3)'
            }}
          >
            <List
              dataSource={notifications}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ 
                        backgroundColor: item.priority === 'high' ? '#ff4d4f' : 
                                       item.priority === 'medium' ? '#faad14' : '#52c41a' 
                      }}>
                        {item.type.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    title={item.message}
                    description={moment(item.date).format('MMM DD, YYYY')}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="Upcoming Exams"
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
              border: '1px solid rgba(159, 179, 223, 0.3)'
            }}
          >
            <List
              dataSource={upcomingExams}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<CalendarOutlined style={{ fontSize: '24px', color: '#7B83EB' }} />}
                    title={item.subject}
                    description={`${moment(item.date).format('MMM DD, YYYY')} at ${item.time} (${item.duration})`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ padding: '0 16px 16px 16px' }}>
        <Col xs={24} md={12}>
          <Card
            title="Library Statistics"
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
              border: '1px solid rgba(159, 179, 223, 0.3)'
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Total Books"
                  value={libraryStats.totalBooks}
                  prefix={<BookOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Issued Books"
                  value={libraryStats.issuedBooks}
                  prefix={<BookOutlined />}
                />
              </Col>
              <Col span={24}>
                <Title level={5}>Popular Categories</Title>
                <Space wrap>
                  {libraryStats.popularCategories?.map(category => (
                    <Tag color="#7B83EB" key={category}>{category}</Tag>
                  ))}
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="Transport Statistics"
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
              border: '1px solid rgba(159, 179, 223, 0.3)'
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Total Buses"
                  value={transportStats.totalBuses}
                  prefix={<CarOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Active Routes"
                  value={transportStats.activeRoutes}
                  prefix={<CarOutlined />}
                />
              </Col>
              <Col span={24}>
                <Title level={5}>Route Details</Title>
                <List
                  size="small"
                  dataSource={transportStats.routes}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.route}
                        description={`${item.students} students • ${item.distance}`}
                      />
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ padding: '0 16px 16px 16px' }}>
        <Col span={24}>
          <Card
            title="Fee Collection Overview"
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
              border: '1px solid rgba(159, 179, 223, 0.3)'
            }}
          >
            <Column
              data={feeCollection}
              xField="month"
              yField="value"
              seriesField="type"
              isGroup={true}
              columnStyle={{
                radius: [4, 4, 0, 0],
              }}
              color={['#7B83EB', '#ff4d4f']}
              label={{
                position: 'middle',
                style: {
                  fill: '#FFFFFF',
                  opacity: 0.6,
                },
              }}
              legend={{
                position: 'top',
              }}
              xAxis={{
                label: {
                  autoHide: true,
                  autoRotate: false,
                },
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ padding: '0 16px 16px 16px' }}>
        <Col span={24}>
          <Card
            title="Recent Activities"
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
              border: '1px solid rgba(159, 179, 223, 0.3)'
            }}
          >
            <Timeline>
              {recentActivities.map(activity => (
                <Timeline.Item 
                  key={activity.id}
                  color={
                    activity.type === 'attendance' ? '#7B83EB' :
                    activity.type === 'fee' ? '#52c41a' :
                    activity.type === 'exam' ? '#faad14' : '#1890ff'
                  }
                >
                  <p>{activity.message}</p>
                  <small>{activity.time}</small>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      <style>
        {`
          .ant-card-head {
            border-bottom: 1px solid rgba(159, 179, 223, 0.2);
            padding: 16px 24px;
          }

          .ant-card-head-title {
            color: #7B83EB;
            font-weight: 600;
          }

          .ant-table {
            border-radius: 8px;
            overflow: hidden;
          }

          .ant-table-thead > tr > th {
            background: rgba(159, 179, 223, 0.1) !important;
            color: #7B83EB !important;
            font-weight: 600;
          }

          .ant-table-tbody > tr:hover > td {
            background: rgba(159, 179, 223, 0.05) !important;
          }

          .ant-tag {
            border-radius: 4px;
            padding: 0 8px;
            height: 24px;
            line-height: 22px;
            font-weight: 500;
          }

          .ant-statistic-title {
            color: rgba(255, 255, 255, 0.85);
          }

          .ant-statistic-content {
            color: white;
          }

          .ant-progress-text {
            color: white !important;
          }

          .dashboard-carousel {
            margin-bottom: 24px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(159, 179, 223, 0.15);
          }

          .carousel-slide {
            height: 300px;
            background-size: cover;
            background-position: center;
            position: relative;
          }

          .carousel-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: white;
            width: 100%;
            padding: 20px;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(4px);
          }

          .carousel-content h2 {
            font-size: 3rem;
            margin-bottom: 16px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            font-weight: 700;
          }

          .carousel-content p {
            font-size: 1.4rem;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
            opacity: 0.9;
          }

          .attendance-chart {
            height: 100%;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 12px;
          }

          .attendance-stats {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 16px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 12px;
            height: 100%;
          }

          .attendance-stat {
            text-align: center;
            padding: 20px;
            border-radius: 12px;
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .stat-label {
            display: block;
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 8px;
            font-weight: 500;
          }

          .stat-value {
            display: block;
            font-size: 2.5rem;
            font-weight: bold;
            line-height: 1;
          }

          .stat-value.present {
            color: #52c41a;
          }

          .stat-value.absent {
            color: #ff4d4f;
          }

          .next-holiday-info {
            text-align: center;
            padding: 16px;
          }

          .next-holiday-info h3 {
            margin: 0 0 8px 0;
            font-size: 20px;
            font-weight: 500;
            color: white;
          }

          .next-holiday-info p {
            margin: 4px 0;
            font-size: 16px;
            opacity: 0.9;
            color: white;
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard; 
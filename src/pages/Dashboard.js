import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Carousel, message, Progress, List, Typography, Space, Avatar, Timeline } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined, CalendarOutlined, ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined, DollarOutlined, BarChartOutlined, DownloadOutlined, PrinterOutlined, CarOutlined, PlusOutlined, CheckSquareOutlined } from '@ant-design/icons';
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

  // Sample finance data
  const monthlyFinanceData = [
    { date: 'Jan', type: 'Income', value: 850000 },
    { date: 'Jan', type: 'Expense', value: 650000 },
    { date: 'Feb', type: 'Income', value: 920000 },
    { date: 'Feb', type: 'Expense', value: 680000 },
    { date: 'Mar', type: 'Income', value: 780000 },
    { date: 'Mar', type: 'Expense', value: 720000 },
    { date: 'Apr', type: 'Income', value: 890000 },
    { date: 'Apr', type: 'Expense', value: 690000 },
    { date: 'May', type: 'Income', value: 950000 },
    { date: 'May', type: 'Expense', value: 710000 },
    { date: 'Jun', type: 'Income', value: 880000 },
    { date: 'Jun', type: 'Expense', value: 680000 },
  ];

  // Sample recent transactions
  const recentTransactions = [
    {
      id: 1,
      date: '2024-03-20',
      description: 'Tuition Fee Collection - Class 10A',
      amount: 250000,
      type: 'Income',
      status: 'Completed',
      method: 'Online Transfer'
    },
    {
      id: 2,
      date: '2024-03-19',
      description: 'Teacher Salary Payment',
      amount: 180000,
      type: 'Expense',
      status: 'Completed',
      method: 'Bank Transfer'
    },
    {
      id: 3,
      date: '2024-03-18',
      description: 'Library Books Purchase',
      amount: 45000,
      type: 'Expense',
      status: 'Completed',
      method: 'Credit Card'
    },
    {
      id: 4,
      date: '2024-03-17',
      description: 'Sports Equipment Purchase',
      amount: 35000,
      type: 'Expense',
      status: 'Completed',
      method: 'Debit Card'
    },
    {
      id: 5,
      date: '2024-03-16',
      description: 'Transport Fee Collection',
      amount: 120000,
      type: 'Income',
      status: 'Completed',
      method: 'Cash'
    },
    {
      id: 6,
      date: '2024-03-15',
      description: 'School Supplies Purchase',
      amount: 50000,
      type: 'Expense',
      status: 'Completed',
      method: 'Credit Card'
    },
    {
      id: 7,
      date: '2024-03-14',
      description: 'Teacher Salary Payment',
      amount: 180000,
      type: 'Expense',
      status: 'Completed',
      method: 'Bank Transfer'
    }
  ];

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('MMM DD, YYYY'),
      width: 120,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <span style={{ 
          color: record.type === 'Income' ? '#52c41a' : '#ff4d4f',
          fontWeight: 500
        }}>
          {record.type === 'Income' ? '+' : '-'}₹{amount.toLocaleString()}
        </span>
      ),
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Completed' ? '#52c41a' : '#faad14'}>
          {status}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 120,
    }
  ];

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
      { month: 'Jan', type: 'Collected', value: 8500 },
      { month: 'Jan', type: 'Pending', value: 1500 },
      { month: 'Feb', type: 'Collected', value: 9000 },
      { month: 'Feb', type: 'Pending', value: 1000 },
      { month: 'Mar', type: 'Collected', value: 7500 },
      { month: 'Mar', type: 'Pending', value: 2500 },
      { month: 'Apr', type: 'Collected', value: 8000 },
      { month: 'Apr', type: 'Pending', value: 2000 },
      { month: 'May', type: 'Collected', value: 9500 },
      { month: 'May', type: 'Pending', value: 1500 },
      { month: 'Jun', type: 'Collected', value: 7000 },
      { month: 'Jun', type: 'Pending', value: 3000 },
      
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
  const financeChartData = monthlyFinanceData;

  // Calculate attendance percentage
  const attendancePercentage = presentCount + absentCount > 0 
    ? Math.round((presentCount / (presentCount + absentCount)) * 100) 
    : 0;

  // Prepare data for charts
  const attendanceData = [
    { type: 'Present', value: presentCount || 0 },
    { type: 'Absent', value: absentCount || 0 }
  ];

  const getNextHoliday = () => {
    const today = moment();
    const upcomingHolidays = calendarEvents
      .filter(event => event.type === 'HOLIDAY' && moment(event.date).isAfter(today))
      .sort((a, b) => moment(a.date).diff(moment(b.date)));

    return upcomingHolidays[0];
  };

  const nextHoliday = getNextHoliday();

  return (
    <div className="dashboard-container">
      <div className="dashboard-carousel">
        <Carousel autoplay>
          <div className="carousel-slide" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")' }}>
            <div className="carousel-content">
              <h2>Welcome to Smart School</h2>
              <p>Empowering education through technology</p>
            </div>
          </div>
          <div className="carousel-slide" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2032&q=80")' }}>
            <div className="carousel-content">
              <h2>Excellence in Education</h2>
              <p>Nurturing minds, Building futures</p>
            </div>
          </div>
          <div className="carousel-slide" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")' }}>
            <div className="carousel-content">
              <h2>Modern Learning Environment</h2>
              <p>State-of-the-art facilities for better education</p>
            </div>
          </div>
          <div className="carousel-slide" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")' }}>
            <div className="carousel-content">
              <h2>Holistic Development</h2>
              <p>Academic excellence meets personal growth</p>
            </div>
          </div>
        </Carousel>
      </div>

      <div className="dashboard-stats">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card gradient-primary" onClick={() => navigate('/students')}>
              <Statistic
                title="Total Students"
                value={students.length}
                prefix={<TeamOutlined />}
                valueStyle={{ color: 'white' }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card gradient-primary" onClick={() => navigate('/teachers')}>
              <Statistic
                title="Total Teachers"
                value={teachers.length}
                prefix={<TeamOutlined />}
                valueStyle={{ color: 'white' }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card gradient-primary" onClick={() => navigate('/classes')}>
              <Statistic
                title="Total Classes"
                value={classes.length}
                prefix={<BookOutlined />}
                valueStyle={{ color: 'white' }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card gradient-primary attendance-card">
              <Statistic
                title="Today's Attendance"
                value={`${presentCount}/${presentCount + absentCount}`}
                prefix={<CalendarOutlined />}
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
            </div>
          </Col>
        </Row>
      </div>

      <div className="dashboard-main">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <div className="dashboard-section">
              <div className="section-header">
                <Title level={4}>Today's Attendance Summary</Title>
              </div>
              <div className="section-content">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="attendance-chart">
                      <Pie
                        data={attendanceData}
                        angleField="value"
                        colorField="type"
                        radius={0.9}
                        label={{
                          content: '{name} {percentage}%',
                          style: {
                            fontSize: 16,
                            textAlign: 'center',
                            fill: '#fff',
                            fontWeight: 'bold'
                          }
                        }}
                        color={['#7B83EB', '#FF6B6B']}
                        height={300}
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
              </div>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="dashboard-section">
              <div className="section-header">
                <Title level={4}>Recent Transactions</Title>
              </div>
              <div className="section-content">
                <Table
                  columns={transactionColumns}
                  dataSource={recentTransactions}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ y: 'calc(100% - 39px)' }}
                />
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <div className="dashboard-charts">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <div className="dashboard-section">
              <div className="section-header">
                <Title level={4}>Monthly Finance Overview</Title>
              </div>
              <div className="section-content">
                <Column
                  data={financeChartData}
                  xField="date"
                  yField="value"
                  seriesField="type"
                  isGroup={true}
                  height={276}
                  columnStyle={{
                    radius: [4, 4, 0, 0],
                  }}
                  color={['#7B83EB', '#FF6B6B']}
                  label={{
                    position: 'top',
                    style: {
                      fill: '#666',
                      opacity: 0.8,
                      fontSize: 12,
                      fontWeight: 'bold',
                    },
                    formatter: (text) => `₹${(text.value / 1000).toFixed(1)}K`
                  }}
                  legend={{
                    position: 'top',
                    itemName: {
                      style: {
                        fill: '#666',
                        fontSize: 12,
                      },
                    },
                  }}
                  xAxis={{
                    label: {
                      autoHide: true,
                      autoRotate: false,
                      style: {
                        fill: '#666',
                        fontSize: 12,
                      },
                    },
                    line: {
                      style: {
                        stroke: '#ddd',
                      },
                    },
                  }}
                  yAxis={{
                    label: {
                      formatter: (value) => `₹${(value / 1000).toFixed(0)}K`,
                      style: {
                        fill: '#666',
                        fontSize: 12,
                      },
                    },
                    grid: {
                      line: {
                        style: {
                          stroke: '#f0f0f0',
                          lineDash: [4, 4],
                        },
                      },
                    },
                  }}
                  tooltip={{
                    formatter: (datum) => {
                      return {
                        name: datum.type,
                        value: `₹${datum.value.toLocaleString()}`,
                      };
                    },
                  }}
                />
              </div>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="dashboard-section">
              <div className="section-header">
                <Title level={4}>Student Growth Trend</Title>
              </div>
              <div className="section-content">
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
                  height={276}
                  smooth
                  point={{
                    size: 5,
                    shape: 'diamond',
                  }}
                  label={{
                    style: {
                      fill: '#666',
                      fontSize: 12,
                    },
                  }}
                  xAxis={{
                    label: {
                      style: {
                        fill: '#666',
                        fontSize: 12,
                      },
                    },
                  }}
                  yAxis={{
                    label: {
                      style: {
                        fill: '#666',
                        fontSize: 12,
                      },
                    },
                    grid: {
                      line: {
                        style: {
                          stroke: '#f0f0f0',
                          lineDash: [4, 4],
                        },
                      },
                    },
                  }}
                  tooltip={{
                    formatter: (datum) => {
                      return {
                        name: 'Students',
                        value: datum.students,
                      };
                    },
                  }}
                />
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <div className="dashboard-info">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="dashboard-section">
              <div className="section-header">
                <Title level={4}>Recent Activities</Title>
              </div>
              <div className="section-content">
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
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="dashboard-section">
              <div className="section-header">
l                <Title level={4}>Upcoming Events</Title>
              </div>
              <div className="section-content">
                <List
                  dataSource={[...upcomingExams, ...calendarEvents.filter(event => 
                    moment(event.date).isAfter(moment()) && 
                    ['EXAM', 'EVENT', 'HOLIDAY'].includes(event.type)
                  )].sort((a, b) => moment(a.date).diff(moment(b.date)))}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar style={{ 
                            backgroundColor: 
                              item.type === 'EXAM' ? '#7B83EB' :
                              item.type === 'EVENT' ? '#52c41a' :
                              item.type === 'HOLIDAY' ? '#faad14' : '#1890ff'
                          }}>
                            {item.type === 'EXAM' ? 'E' :
                             item.type === 'EVENT' ? 'E' :
                             item.type === 'HOLIDAY' ? 'H' : 'O'}
                          </Avatar>
                        }
                        title={item.type === 'EXAM' ? item.subject : item.title}
                        description={
                          item.type === 'EXAM' 
                            ? `${moment(item.date).format('MMM DD, YYYY')} at ${item.time} (${item.duration})`
                            : `${moment(item.date).format('MMM DD, YYYY')} - ${item.description}`
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <div className="dashboard-stats-extended">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="dashboard-section">
              <div className="section-header">
                <Title level={4}>Library Statistics</Title>
              </div>
              <div className="section-content">
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <div className="stat-card gradient-primary">
                      <Statistic
                        title="Total Books"
                        value={libraryStats.totalBooks}
                        prefix={<BookOutlined />}
                        valueStyle={{ color: 'white' }}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="stat-card">
                      <Statistic
                        title="Issued Books"
                        value={libraryStats.issuedBooks}
                        prefix={<BookOutlined />}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="stat-card">
                      <Statistic
                        title="Recent Additions"
                        value={libraryStats.recentAdditions}
                        prefix={<BookOutlined />}
                      />
                    </div>
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
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="dashboard-section">
              <div className="section-header">
                <Title level={4}>Transport Statistics</Title>
              </div>
              <div className="section-content">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="stat-card">
                      <Statistic
                        title="Total Buses"
                        value={transportStats.totalBuses}
                        prefix={<CarOutlined />}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="stat-card">
                      <Statistic
                        title="Active Routes"
                        value={transportStats.activeRoutes}
                        prefix={<CarOutlined />}
                      />
                    </div>
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
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <div className="dashboard-fee">
        <div className="dashboard-section">
          <div className="section-header">
            <Title level={4}>Fee Collection Overview</Title>
          </div>
          <div className="section-content">
            <Column
              data={feeCollection}
              xField="month"
              yField="value"
              seriesField="type"
              isGroup={true}
              height={276}
              columnStyle={{
                radius: [4, 4, 0, 0],
              }}
              color={['#7B83EB', '#FF6B6B']}
              label={{
                position: 'top',
                style: {
                  fill: '#666',
                  opacity: 0.8,
                  fontSize: 12,
                  fontWeight: 'bold',
                },
                formatter: (text) => `₹${(text.value / 1000).toFixed(1)}K`
              }}
              legend={{
                position: 'top',
                itemName: {
                  style: {
                    fill: '#666',
                    fontSize: 12,
                  },
                },
              }}
              xAxis={{
                label: {
                  autoHide: true,
                  autoRotate: false,
                  style: {
                    fill: '#666',
                    fontSize: 12,
                  },
                },
                line: {
                  style: {
                    stroke: '#ddd',
                  },
                },
              }}
              yAxis={{
                label: {
                  formatter: (value) => `₹${(value / 1000).toFixed(0)}K`,
                  style: {
                    fill: '#666',
                    fontSize: 12,
                  },
                },
                grid: {
                  line: {
                    style: {
                      stroke: '#f0f0f0',
                      lineDash: [4, 4],
                    },
                  },
                },
              }}
              tooltip={{
                formatter: (datum) => {
                  return {
                    name: datum.type,
                    value: `₹${datum.value.toLocaleString()}`,
                  };
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <div className="section-header">
          <Title level={4}><BarChartOutlined /> Quick Actions</Title>
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div className="action-card" onClick={() => navigate('/students')}>
              <div className="action-icon">
                <TeamOutlined />
              </div>
              <div className="action-content">
                <h3>Add New Student</h3>
                <p>Register a new student</p>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="action-card" onClick={() => navigate('/teachers')}>
              <div className="action-icon">
                <UserOutlined />
              </div>
              <div className="action-content">
                <h3>Add New Teacher</h3>
                <p>Register a new teacher</p>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="action-card" onClick={() => navigate('/classes')}>
              <div className="action-icon">
                <BookOutlined />
              </div>
              <div className="action-content">
                <h3>Add New Class</h3>
                <p>Create a new class</p>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="action-card" onClick={() => navigate('/attendance')}>
              <div className="action-icon">
                <CalendarOutlined />
              </div>
              <div className="action-content">
                <h3>Mark Attendance</h3>
                <p>Record daily attendance</p>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <style>
        {`
          .dashboard-container {
            padding: 16px;
            background: var(--surface-color);
            border-radius: 16px;
            box-shadow: 0 2px 8px var(--shadow-color);
          }

          .dashboard-header {
            margin-bottom: 24px;
          }

          .dashboard-header h3 {
            color: #7B83EB;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .dashboard-carousel {
            margin-bottom: 24px;
            border-radius: 12px;
            overflow: hidden;
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
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
          }

          .carousel-content h2 {
            font-size: 2.5rem;
            margin-bottom: 16px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            font-weight: 700;
          }

          .carousel-content p {
            font-size: 1.2rem;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          }

          .dashboard-stats {
            margin-bottom: 24px;
          }

          .stat-card {
            padding: 24px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: white;
            border: 1px solid rgba(123, 131, 235, 0.1);
          }

          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(123, 131, 235, 0.15);
            border-color: rgba(123, 131, 235, 0.3);
          }

          .gradient-primary {
            background: linear-gradient(135deg, rgba(123, 131, 235, 0.9) 0%, rgba(159, 163, 223, 0.9) 100%);
            color: white;
            border: none;
          }

          .gradient-primary:hover {
            background: linear-gradient(135deg, rgba(123, 131, 235, 1) 0%, rgba(159, 163, 223, 1) 100%);
          }

          .dashboard-section {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            height: 100%;
            transition: all 0.3s ease;
          }

          .dashboard-section:hover {
            box-shadow: 0 4px 12px rgba(123, 131, 235, 0.1);
          }

          .section-header {
            padding: 16px 24px;
            border-bottom: 1px solid var(--border-color);
          }

          .section-header h4 {
            margin: 0;
            color: #7B83EB;
          }

          .section-content {
            padding: 24px;
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
            padding: 24px;
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
            font-size: 1.4rem;
            color: #666;
            margin-bottom: 12px;
            font-weight: 500;
          }

          .stat-value {
            display: block;
            font-size: 3.5rem;
            font-weight: bold;
            line-height: 1;
          }

          .stat-value.present {
            color: #7B83EB;
          }

          .stat-value.absent {
            color: #FF6B6B;
          }

          .action-card {
            background: linear-gradient(135deg, rgba(123, 131, 235, 0.9) 0%, rgba(159, 163, 223, 0.9) 100%);
            padding: 24px;
            border-radius: 12px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            border: none;
          }

          .action-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(123, 131, 235, 0.15);
            background: linear-gradient(135deg, rgba(123, 131, 235, 1) 0%, rgba(159, 163, 223, 1) 100%);
          }

          .action-icon {
            background: rgba(255, 255, 255, 0.15);
            padding: 16px;
            border-radius: 12px;
            backdrop-filter: blur(4px);
            transition: all 0.3s ease;
          }

          .action-card:hover .action-icon {
            background: rgba(255, 255, 255, 0.25);
            transform: scale(1.05);
          }

          .action-content {
            text-align: center;
          }

          .action-content h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
          }

          .action-content p {
            margin: 8px 0 0 0;
            color: rgba(255, 255, 255, 0.8);
          }

          .ant-table {
            border-radius: 8px;
            overflow: hidden;
          }

          .ant-table-thead > tr > th {
            background: rgba(123, 131, 235, 0.08) !important;
            color: #7B83EB !important;
            font-weight: 600;
          }

          .ant-table-tbody > tr:hover > td {
            background: rgba(123, 131, 235, 0.04) !important;
          }

          .ant-table-tbody > tr > td {
            transition: all 0.3s ease;
          }

          .ant-table-tbody > tr:hover > td {
            transform: translateY(-1px);
          }

          .ant-list-item {
            padding: 12px 0;
          }

          .ant-list-item-meta-title {
            color: var(--text-primary);
            font-weight: 500;
          }

          .ant-list-item-meta-description {
            color: var(--text-secondary);
          }

          .ant-avatar {
            background: #7B83EB;
          }

          .dashboard-stats-extended {
            margin-bottom: 24px;
          }

          .dashboard-fee {
            margin-bottom: 24px;
          }

          .ant-timeline-item-content {
            margin-left: 28px;
          }

          .ant-timeline-item-content p {
            margin: 0;
            color: var(--text-primary);
            font-weight: 500;
          }

          .ant-timeline-item-content small {
            color: var(--text-secondary);
            font-size: 12px;
          }

          .ant-tag {
            border-radius: 4px;
            padding: 0 8px;
            height: 24px;
            line-height: 22px;
            font-weight: 500;
            background: rgba(123, 131, 235, 0.1);
            border-color: #7B83EB;
            color: #7B83EB;
          }

          .ant-timeline-item-head {
            background-color: #7B83EB;
          }

          .ant-progress-text {
            color: #7B83EB !important;
          }

          .ant-progress-circle-path {
            stroke: #7B83EB !important;
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard; 
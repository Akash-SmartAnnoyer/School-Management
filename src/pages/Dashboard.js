import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Carousel, message, Progress, List } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined, CalendarOutlined, ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined, DollarOutlined, BarChartOutlined } from '@ant-design/icons';
import { subscribeToCollection, getStudents, getTeachers, getClasses, getAttendance } from '../firebase/services';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadSampleData } from '../utils/sampleData';
import moment from 'moment';
import './Dashboard.css';
import { Pie, Column, Line } from '@ant-design/plots';
import { getCalendarEvents, initializeSampleData } from '../services/localStorage';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [finance, setFinance] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>School Dashboard</h1>
        <Button type="primary" onClick={handleUploadSampleData}>
          Upload Sample Data
        </Button>
      </div>

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

      <Row gutter={[16, 16]} className="dashboard-stats">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Students"
              value={students.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Teachers"
              value={teachers.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Classes"
              value={classes.length}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Today's Attendance"
              value={`${presentCount}/${presentCount + absentCount}`}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix={
                <Progress 
                  type="circle" 
                  percent={attendancePercentage} 
                  width={40}
                  strokeColor={attendancePercentage > 80 ? '#52c41a' : '#faad14'}
                />
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="dashboard-content">
        <Col xs={24} lg={16}>
          <Card 
            title="Today's Attendance Summary" 
            className="attendance-card"
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
            <Row gutter={[16, 16]} className="quick-actions-row">
              <Col span={12}>
                <Card 
                  className="quick-action-card"
                  onClick={() => navigate('/students')}
                  hoverable
                >
                  <div className="quick-action-content">
                    <UserOutlined className="quick-action-icon" />
                    <div className="quick-action-text">
                      <h3>Add New Student</h3>
                      <p>Register a new student in the school</p>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card 
                  className="quick-action-card"
                  onClick={() => navigate('/teachers')}
                  hoverable
                >
                  <div className="quick-action-content">
                    <TeamOutlined className="quick-action-icon" />
                    <div className="quick-action-text">
                      <h3>Add New Teacher</h3>
                      <p>Add a new teacher to the staff</p>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <div className="dashboard-side-cards">
            <Card 
              title="Recent Transactions" 
              className="finance-card"
            >
              <Table 
                columns={transactionColumns} 
                dataSource={recentTransactions} 
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
            {nextHoliday && (
              <Card 
                title="Next Holiday" 
                className="next-holiday-card"
              >
                <div className="next-holiday-info">
                  <h3>{nextHoliday.title}</h3>
                  <p>{moment(nextHoliday.date).format('MMMM D, YYYY')}</p>
                  <p>{moment(nextHoliday.date).diff(moment(), 'days')} days remaining</p>
                </div>
              </Card>
            )}
            <Card 
              title="Upcoming Events" 
              className="upcoming-events-card"
            >
              <List
                dataSource={calendarEvents
                  .filter(event => moment(event.date).isAfter(moment()))
                  .sort((a, b) => moment(a.date).diff(moment(b.date)))
                  .slice(0, 5)}
                renderItem={event => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <span>
                          <Tag color={
                            event.type === 'HOLIDAY' ? 'red' :
                            event.type === 'EXAM' ? 'blue' :
                            'green'
                          }>
                            {event.type}
                          </Tag>
                          {event.title}
                        </span>
                      }
                      description={moment(event.date).format('MMMM D, YYYY')}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="dashboard-charts">
        <Col xs={24} lg={12}>
          <Card 
            title="Monthly Finance Overview" 
            className="chart-card"
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
            className="chart-card"
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
    </div>
  );
};

export default Dashboard; 
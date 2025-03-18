import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, message } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { subscribeToCollection } from '../firebase/services';
import { uploadSampleData } from '../utils/sampleData';
import moment from 'moment';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [finance, setFinance] = useState([]);

  useEffect(() => {
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

    return () => {
      unsubscribeStudents();
      unsubscribeTeachers();
      unsubscribeClasses();
      unsubscribeAttendance();
      unsubscribeFinance();
    };
  }, []);

  const today = moment().format('YYYY-MM-DD');
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentCount = todayAttendance.filter(a => a.status === 'Present').length;
  const absentCount = todayAttendance.filter(a => a.status === 'Absent').length;

  const recentTransactions = finance
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'Income' ? 'green' : 'red'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₹${amount.toLocaleString()}`
    }
  ];

  const handleUploadSampleData = async () => {
    try {
      await uploadSampleData();
      message.success('Sample data uploaded successfully');
    } catch (error) {
      message.error('Error uploading sample data');
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Students"
              value={students.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Teachers"
              value={teachers.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Classes"
              value={classes.length}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Today's Attendance"
              value={`${presentCount}/${students.length}`}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card title="Today's Attendance Summary">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Present"
                  value={presentCount}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Absent"
                  value={absentCount}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card title="Recent Transactions">
            <Table
              columns={transactionColumns}
              dataSource={recentTransactions}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Button type="primary" onClick={handleUploadSampleData}>
              Upload Sample Data
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 
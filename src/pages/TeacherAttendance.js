import React, { useState, useEffect } from 'react';
import { Table, Button, Space, DatePicker, Card, message, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../services/api';
import moment from 'moment';

const TeacherAttendance = () => {
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [loading, setLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadAttendance();
    }
  }, [selectedDate]);

  const loadTeachers = async () => {
    try {
      const response = await api.teacher.getAll();
      setTeachers(response.data.data);
    } catch (error) {
      message.error('Failed to load teachers');
    }
  };

  const loadAttendance = async () => {
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const response = await api.attendance.getByDate(dateStr);
      const teacherAttendance = response.data.data.filter(
        record => record.type === 'teacher'
      );
      
      const statusMap = {};
      teacherAttendance.forEach(record => {
        statusMap[record.teacherId] = record.status;
      });
      setAttendanceStatus(statusMap);
    } catch (error) {
      message.error('Failed to load attendance');
    }
  };

  const handleAttendanceChange = (teacherId, status) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [teacherId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      
      // Create attendance records for all teachers
      const attendanceRecords = teachers.map(teacher => ({
        teacherId: teacher.id,
        date: dateStr,
        status: attendanceStatus[teacher.id] || 'Absent',
        type: 'teacher',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // Save all attendance records
      await Promise.all(attendanceRecords.map(record => api.attendance.create(record)));
      
      message.success('Teacher attendance saved successfully');
      loadAttendance();
    } catch (error) {
      message.error('Error saving teacher attendance');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 100,
      fixed: 'left',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Attendance',
      key: 'attendance',
      render: (_, record) => (
        <Space wrap>
          <Button
            type={attendanceStatus[record.id] === 'Present' ? 'primary' : 'default'}
            icon={<CheckCircleOutlined />}
            onClick={() => handleAttendanceChange(record.id, 'Present')}
            size="small"
          >
            Present
          </Button>
          <Button
            type={attendanceStatus[record.id] === 'Absent' ? 'primary' : 'default'}
            icon={<CloseCircleOutlined />}
            onClick={() => handleAttendanceChange(record.id, 'Absent')}
            size="small"
          >
            Absent
          </Button>
        </Space>
      ),
    },
  ];

  const presentCount = Object.values(attendanceStatus).filter(status => status === 'Present').length;
  const totalCount = teachers.length;
  const absentCount = totalCount - presentCount;

  return (
    <div style={{ padding: '16px' }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={24} md={16}>
            <Button
              type="primary"
              onClick={handleSaveAttendance}
              loading={loading}
              style={{ width: '100%' }}
            >
              Save Teacher Attendance
            </Button>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8}>
            <Statistic
              title="Present"
              value={presentCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Col>
          <Col xs={12} sm={8}>
            <Statistic
              title="Absent"
              value={absentCount}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Total"
              value={totalCount}
              prefix={<TeamOutlined />}
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={teachers}
          rowKey="id"
          pagination={false}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default TeacherAttendance; 
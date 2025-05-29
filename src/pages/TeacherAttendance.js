import React, { useState, useEffect } from 'react';
import { Table, Button, Space, DatePicker, Card, message, Row, Col, Statistic, Typography, Input } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import api from '../services/api';
import moment from 'moment';

const { Title } = Typography;
const { TextArea } = Input;

const TeacherAttendance = () => {
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [loading, setLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [attendanceDetails, setAttendanceDetails] = useState({});

  useEffect(() => {
    loadTeachers();
    loadAttendance();
  }, [selectedDate]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.teacher.getTeachers();
      if (response && response.data && response.data.results) {
        const mappedTeachers = response.data.results.map(teacher => ({
          id: teacher.id,
          name: teacher.name,
          subject: teacher.subject,
          employeeId: teacher.employee_id,
          qualification: teacher.qualification,
          class: teacher.class,
          status: teacher.status
        }));
        setTeachers(mappedTeachers);
      } else {
        console.error('Unexpected API response structure:', response);
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
      message.error('Failed to load teachers');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const date = selectedDate.format('YYYY-MM-DD');
      const response = await api.teacherAttendance.getByDateRange(date, date);
      const attendanceData = response.data.results || [];
      
      // Initialize attendance status and details from existing records
      const status = {};
      const details = {};
      attendanceData.forEach(record => {
        status[record.teacher] = record.status;
        details[record.teacher] = record.details;
      });
      
      setAttendanceStatus(status);
      setAttendanceDetails(details);
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Error loading attendance:', error);
      message.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (teacherId, status) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [teacherId]: status
    }));
  };

  const handleDetailsChange = (teacherId, details) => {
    setAttendanceDetails(prev => ({
      ...prev,
      [teacherId]: details
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      setLoading(true);
      const date = selectedDate.format('YYYY-MM-DD');
      const attendanceRecords = Object.entries(attendanceStatus).map(([teacherId, status]) => ({
        teacher: parseInt(teacherId),
        date,
        status: status.toLowerCase(),
        details: attendanceDetails[teacherId] || ''
      }));

      await api.teacherAttendance.create(attendanceRecords);
      message.success('Attendance saved successfully');
      loadAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      if (error.message?.includes('already exists')) {
        message.error('Attendance already marked for some teachers');
      } else if (error.message?.includes('Date must be today or yesterday')) {
        message.error('Attendance can only be marked for today or yesterday');
      } else {
        message.error('Error saving attendance');
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 120,
      fixed: 'left',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Attendance',
      key: 'attendance',
      render: (_, record) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space wrap>
            <Button
              type={attendanceStatus[record.id] === 'present' ? 'primary' : 'default'}
              icon={<CheckCircleOutlined />}
              onClick={() => handleAttendanceChange(record.id, 'present')}
              size="small"
            >
              Present
            </Button>
            <Button
              type={attendanceStatus[record.id] === 'absent' ? 'primary' : 'default'}
              icon={<CloseCircleOutlined />}
              onClick={() => handleAttendanceChange(record.id, 'absent')}
              size="small"
            >
              Absent
            </Button>
            <Button
              type={attendanceStatus[record.id] === 'leave' ? 'primary' : 'default'}
              icon={<CalendarOutlined />}
              onClick={() => handleAttendanceChange(record.id, 'leave')}
              size="small"
            >
              Leave
            </Button>
          </Space>
          {attendanceStatus[record.id] && (
            <TextArea
              placeholder="Enter details"
              value={attendanceDetails[record.id] || ''}
              onChange={(e) => handleDetailsChange(record.id, e.target.value)}
              rows={2}
            />
          )}
        </Space>
      ),
    },
  ];

  const presentCount = Object.values(attendanceStatus).filter(status => status === 'present').length;
  const absentCount = Object.values(attendanceStatus).filter(status => status === 'absent').length;
  const leaveCount = Object.values(attendanceStatus).filter(status => status === 'leave').length;
  const totalCount = teachers.length;

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Title level={4}>Teacher Attendance</Title>
          </Col>
          <Col xs={24} md={12}>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              style={{ width: '100%' }}
              disabledDate={date => date.isAfter(moment())}
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Present"
              value={presentCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Absent"
              value={absentCount}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Leave"
              value={leaveCount}
              prefix={<CalendarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Total"
              value={totalCount}
              prefix={<TeamOutlined style={{ color: '#7B83EB' }} />}
              valueStyle={{ color: '#7B83EB' }}
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
          loading={loading}
        />
        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <Button
            type="primary"
            onClick={handleSaveAttendance}
            loading={loading}
            disabled={Object.keys(attendanceStatus).length === 0}
          >
            Save Attendance
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TeacherAttendance; 
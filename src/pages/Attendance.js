import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Select, DatePicker, Card, message, Row, Col, Statistic, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import api from '../services/api';
import moment from 'moment';

const { Option } = Select;
const { Title } = Typography;

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [timetableId, setTimetableId] = useState(null);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadStudents();
      loadTimetable();
    }
  }, [selectedClass, selectedDate]);

  const loadClasses = async () => {
    setClassesLoading(true);
    try {
      const response = await api.class.getClasses();
      console.log('Classes API Response:', response);
      if (response && response.data) {
        setClasses(response.data || []);
      } else {
        console.error('Unexpected API response structure:', response);
        setClasses([]);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      message.error('Failed to load classes');
      setClasses([]);
    } finally {
      setClassesLoading(false);
    }
  };

  const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const response = await api.class.getClass(selectedClass);
      console.log('Class Details Response:', response);
      
      if (response && response.data) {
        const classData = response.data;
        const mappedStudents = classData.students.map(student => ({
          id: student.id,
          name: `${student.user.first_name} ${student.user.last_name}`,
          rollNumber: student.user.id,
          classId: student.classroom,
          email: student.user.email,
          phone: student.user.phone
        }));
        console.log('Mapped Students:', mappedStudents);
        setStudents(mappedStudents);
      } else {
        console.error('Unexpected API response structure:', response);
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      message.error('Failed to load students');
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  const loadTimetable = async () => {
    try {
      const response = await api.timetable.getByClass(selectedClass);
      if (response && response.data) {
        // Get timetable for the selected date
        const dayOfWeek = selectedDate.format('dddd').toLowerCase();
        const timetable = response.data.find(t => t.day.toLowerCase() === dayOfWeek);
        if (timetable) {
          setTimetableId(timetable.id);
        } else {
          message.error('No timetable found for selected date');
          setTimetableId(null);
        }
      }
    } catch (error) {
      console.error('Error loading timetable:', error);
      message.error('Failed to load timetable');
      setTimetableId(null);
    }
  };

  const loadAttendance = async () => {
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const response = await api.attendance.getByDate(dateStr);
      const classAttendance = response.data.data.filter(
        record => record.classId === selectedClass
      );
      
      const statusMap = {};
      classAttendance.forEach(record => {
        statusMap[record.studentId] = record.status;
      });
      setAttendanceStatus(statusMap);
    } catch (error) {
      message.error('Failed to load attendance');
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) {
      message.error('Please select a class');
      return;
    }

    if (!timetableId) {
      message.error('No timetable found for selected date');
      return;
    }

    setLoading(true);
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const classStudents = students.filter(s => s.classId === selectedClass);
      
      // Get teacher ID from the selected class
      const selectedClassData = classes.find(c => c.id === selectedClass);
      const teacherId = selectedClassData?.teacher?.id;

      if (!teacherId) {
        message.error('Teacher information not found');
        return;
      }
      
      // Create attendance records for all students in the class
      const attendanceRecords = classStudents.map(student => ({
        student: student.id,
        timetable: timetableId,
        classroom: selectedClass,
        status: attendanceStatus[student.id]?.toLowerCase() || 'absent',
        date: dateStr,
        taken_by_teacher: teacherId
      }));

      // Save all attendance records
      await Promise.all(attendanceRecords.map(record => api.attendance.createAttendance(record)));
      
      message.success('Attendance saved successfully');
      loadAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      if (error.message?.includes('already exists')) {
        message.error('Attendance already marked for some students');
      } else if (error.message?.includes('Date must be today or yesterday')) {
        message.error('Attendance can only be marked for today or yesterday');
      } else if (error.message?.includes('Day does not match timetable day')) {
        message.error('Selected date does not match the timetable day');
      } else {
        message.error('Error saving attendance');
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Roll Number',
      dataIndex: 'rollNumber',
      key: 'rollNumber',
      width: 130,
      fixed: 'left',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
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
  const totalCount = students.filter(s => s.classId === selectedClass).length;
  const absentCount = totalCount - presentCount;

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
            <CalendarOutlined style={{ fontSize: '24px', color: '#7B83EB' }} />
            Attendance Management
          </Title>
        </Col>
        <Col>
          <Space size="small">
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              format="YYYY-MM-DD"
              style={{ 
                width: 200,
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
            />
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
        <Row gutter={[16, 16]} style={{ padding: '16px' }}>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ 
                width: '100%',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
              placeholder="Select Class"
              onChange={handleClassChange}
              value={selectedClass}
              loading={classesLoading}
            >
              {classes && classes.map(cls => (
                <Option key={cls.id} value={cls.id}>
                  {cls.class_name} - {cls.section} ({cls.status === 'active' ? 'Active' : 'Inactive'})
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="primary"
              onClick={handleSaveAttendance}
              loading={loading}
              disabled={!selectedClass}
              style={{ 
                width: '100%',
                height: '40px',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                background: '#7B83EB',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.3s ease'
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
            >
              Save Attendance
            </Button>
          </Col>
        </Row>

        <Card 
          style={{ 
            margin: '0 16px 16px 16px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
            border: '1px solid rgba(159, 179, 223, 0.3)'
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8}>
              <Statistic
                title="Present"
                value={presentCount}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={12} sm={8}>
              <Statistic
                title="Absent"
                value={absentCount}
                prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Total"
                value={totalCount}
                prefix={<TeamOutlined style={{ color: '#7B83EB' }} />}
                valueStyle={{ color: '#7B83EB' }}
              />
            </Col>
          </Row>
        </Card>

        <Card 
          style={{ 
            margin: '0 16px 16px 16px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
            border: '1px solid rgba(159, 179, 223, 0.3)'
          }}
        >
          <Table
            columns={columns}
            dataSource={students.filter(student => student.classId === selectedClass)}
            rowKey="id"
            pagination={false}
            scroll={{ x: true }}
            className="custom-table"
            loading={studentsLoading}
          />
        </Card>
      </Card>

      <style>
        {`
          .custom-table .ant-table {
            border-radius: 12px;
            overflow: hidden;
          }
          
          .custom-table .ant-table-container {
            overflow: hidden !important;
            border-radius: 12px;
          }
          
          .custom-table .ant-table-body {
            overflow-y: auto !important;
            overflow-x: hidden !important;
            border-radius: 0 0 12px 12px;
          }

          .custom-table .ant-table-body::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          .custom-table .ant-table-body::-webkit-scrollbar-thumb {
            background: rgba(159, 179, 223, 0.3);
            border-radius: 3px;
          }

          .custom-table .ant-table-body::-webkit-scrollbar-track {
            background: rgba(159, 179, 223, 0.1);
            border-radius: 3px;
          }
          
          .custom-table .ant-table-thead > tr > th:first-child {
            border-top-left-radius: 12px;
          }
          
          .custom-table .ant-table-thead > tr > th:last-child {
            border-top-right-radius: 12px;
          }

          .custom-table .ant-table-thead > tr > th {
            background: rgba(159, 179, 223, 0.1) !important;
            color: #7B83EB !important;
            font-weight: 600;
            border-bottom: 2px solid rgba(159, 179, 223, 0.2);
            padding: 12px 16px !important;
          }
          
          .custom-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid rgba(159, 179, 223, 0.1);
            padding: 12px 16px !important;
          }
          
          .custom-table .ant-table-tbody > tr:hover > td {
            background: rgba(159, 179, 223, 0.05) !important;
          }

          .custom-table .ant-btn {
            border-radius: 6px;
            transition: all 0.3s ease;
          }

          .custom-table .ant-btn-primary {
            background: #7B83EB !important;
            border-color: #7B83EB !important;
            box-shadow: 0 2px 6px rgba(159, 179, 223, 0.15) !important;
          }

          .custom-table .ant-btn-primary:hover {
            background: #8ba1d1 !important;
            border-color: #8ba1d1 !important;
            box-shadow: 0 4px 12px rgba(159, 179, 223, 0.25) !important;
          }

          .custom-table .ant-btn-default {
            border-color: rgba(159, 179, 223, 0.3) !important;
            color: #7B83EB !important;
          }

          .custom-table .ant-btn-default:hover {
            border-color: #7B83EB !important;
            color: #8ba1d1 !important;
            background: rgba(159, 179, 223, 0.05) !important;
          }

          .ant-select-selector {
            border-color: rgba(159, 179, 223, 0.3) !important;
            box-shadow: 0 2px 6px rgba(159, 179, 223, 0.15) !important;
            border-radius: 6px !important;
          }

          .ant-select-selector:hover {
            border-color: #7B83EB !important;
          }

          .ant-select-focused .ant-select-selector {
            border-color: #7B83EB !important;
            box-shadow: 0 0 0 2px rgba(159, 179, 223, 0.2) !important;
          }

          .ant-picker {
            border-color: rgba(159, 179, 223, 0.3) !important;
            box-shadow: 0 2px 6px rgba(159, 179, 223, 0.15) !important;
            border-radius: 6px !important;
          }

          .ant-picker:hover {
            border-color: #7B83EB !important;
          }

          .ant-picker-focused {
            border-color: #7B83EB !important;
            box-shadow: 0 0 0 2px rgba(159, 179, 223, 0.2) !important;
          }
        `}
      </style>
    </div>
  );
};

export default Attendance; 
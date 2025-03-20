import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Select, DatePicker, Card, message, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { addAttendance, getAttendance, subscribeToCollection, getStudents, getClasses } from '../firebase/services';
import moment from 'moment';

const { Option } = Select;

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});

  useEffect(() => {
    const unsubscribeStudents = subscribeToCollection('students', (data) => {
      setStudents(data);
    });
    const unsubscribeClasses = subscribeToCollection('classes', (data) => {
      setClasses(data);
    });
    const unsubscribeAttendance = subscribeToCollection('attendance', (data) => {
      setAttendance(data);
    });
    return () => {
      unsubscribeStudents();
      unsubscribeClasses();
      unsubscribeAttendance();
    };
  }, []);

  useEffect(() => {
    if (selectedDate && selectedClass) {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const classAttendance = attendance.filter(
        record => record.date === dateStr && record.classId === selectedClass
      );
      
      const statusMap = {};
      classAttendance.forEach(record => {
        statusMap[record.studentId] = record.status;
      });
      setAttendanceStatus(statusMap);
    }
  }, [selectedDate, selectedClass, attendance]);

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

    setLoading(true);
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const classStudents = students.filter(s => s.classId === selectedClass);
      
      // Create attendance records for all students in the class
      const attendanceRecords = classStudents.map(student => ({
        studentId: student.id,
        classId: selectedClass,
        date: dateStr,
        status: attendanceStatus[student.id] || 'Absent',
        timestamp: new Date().toISOString()
      }));

      // Save all attendance records
      await Promise.all(attendanceRecords.map(record => addAttendance(record)));
      
      message.success('Attendance saved successfully');
    } catch (error) {
      message.error('Error saving attendance');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Roll Number',
      dataIndex: 'rollNumber',
      key: 'rollNumber',
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
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="Select Class"
              onChange={handleClassChange}
              value={selectedClass}
            >
              {classes.map(cls => (
                <Option key={cls.id} value={cls.id}>
                  {cls.className} - {cls.section}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Button
              type="primary"
              onClick={handleSaveAttendance}
              loading={loading}
              disabled={!selectedClass}
              style={{ width: '100%' }}
            >
              Save Attendance
            </Button>
          </Col>
        </Row>
      </Card>

      {selectedClass && (
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
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={students.filter(student => student.classId === selectedClass)}
          rowKey="id"
          pagination={false}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default Attendance; 
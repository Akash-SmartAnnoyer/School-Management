import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Select, DatePicker, Card, message, Row, Col, Statistic, Typography, Radio, Input, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, TeamOutlined, CalendarOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../services/api';
import moment from 'moment';

const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [timetableId, setTimetableId] = useState(null);
  const [viewMode, setViewMode] = useState('mark'); // 'mark' or 'view'
  const [dateRange, setDateRange] = useState([moment().subtract(7, 'days'), moment()]);
  const [searchText, setSearchText] = useState('');
  const [filteredAttendance, setFilteredAttendance] = useState([]);

  useEffect(() => {
    loadClasses();
    loadTeachers();
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate && selectedTeacher) {
      loadStudents();
      loadTimetable();
    }
  }, [selectedClass, selectedDate, selectedTeacher]);

  const loadClasses = async () => {
    setClassesLoading(true);
    try {
      const response = await api.class.getClasses();
      console.log('Classes API Response:', response);
      if (response && response.data && response.data.results) {
        setClasses(response.data.results || []);
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

  const loadTeachers = async () => {
    setTeachersLoading(true);
    try {
      const response = await api.teacher.getTeachers();
      if (response && response.data && response.data.results) {
        setTeachers(response.data.results || []);
      } else {
        console.error('Unexpected API response structure:', response);
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
      message.error('Failed to load teachers');
      setTeachers([]);
    } finally {
      setTeachersLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await api.subject.getSubjects();
      if (response && response.data && response.data.results) {
        setSubjects(response.data.results);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      message.error('Failed to load subjects');
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : `Subject (${subjectId})`;
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
        // Get all periods for the selected class and teacher
        const periods = response.data.results.filter(t => 
          t.classroom === selectedClass && 
          t.teacher === selectedTeacher
        );
        
        console.log('Available periods:', periods);
        
        if (periods.length > 0) {
          setAvailablePeriods(periods);
          // Reset selected period when periods change
          setSelectedPeriod(null);
        } else {
          console.log('No periods found for class:', selectedClass, 'and teacher:', selectedTeacher);
          message.error('No periods found for selected class and teacher');
          setAvailablePeriods([]);
          setSelectedPeriod(null);
        }
      } else {
        console.log('No timetable data available');
        message.error('No timetable data available');
        setAvailablePeriods([]);
        setSelectedPeriod(null);
      }
    } catch (error) {
      console.error('Error loading timetable:', error);
      message.error('Failed to load timetable');
      setAvailablePeriods([]);
      setSelectedPeriod(null);
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

  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId);
    const period = availablePeriods.find(p => p.id === periodId);
    if (period) {
      setTimetableId(period.id);
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setSelectedTeacher(null);
    setSelectedPeriod(null);
    setAvailablePeriods([]);
  };

  const handleTeacherChange = (teacherId) => {
    setSelectedTeacher(teacherId);
    setSelectedPeriod(null);
    setAvailablePeriods([]);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const getDayShortForm = (day) => {
    const dayMap = {
      'monday': 'mon',
      'tuesday': 'tue',
      'wednesday': 'wed',
      'thursday': 'thu',
      'friday': 'fri',
      'saturday': 'sat',
      'sunday': 'sun'
    };
    return dayMap[day.toLowerCase()] || day.toLowerCase();
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) {
      message.error('Please select a class');
      return;
    }

    if (!selectedTeacher) {
      message.error('Please select a teacher');
      return;
    }

    if (!selectedPeriod) {
      message.error('Please select a period');
      return;
    }

    // Get the selected period details
    const selectedPeriodDetails = availablePeriods.find(p => p.id === selectedPeriod);
    if (!selectedPeriodDetails) {
      message.error('Invalid period selected');
      return;
    }

    // Check if selected date matches the period's day
    const selectedDay = getDayShortForm(selectedDate.format('dddd'));
    if (selectedDay !== selectedPeriodDetails.day.toLowerCase()) {
      message.error(`Selected date (${selectedDay}) does not match the period's day (${selectedPeriodDetails.day})`);
      return;
    }

    setLoading(true);
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const classStudents = students.filter(s => s.classId === selectedClass);
      
      console.log('Saving attendance with:', {
        timetableId: selectedPeriod,
        teacherId: selectedTeacher,
        date: dateStr,
        classId: selectedClass,
        day: selectedDay
      });
      
      // Create attendance records for all students in the class
      const attendanceRecords = classStudents.map(student => ({
        student: student.id,
        timetable: selectedPeriod,
        classroom: selectedClass,
        status: attendanceStatus[student.id]?.toLowerCase() || 'absent',
        date: dateStr,
        taken_by_teacher: selectedTeacher
      }));

      // Use bulk creation endpoint
      const response = await api.attendance.createBulkAttendance(attendanceRecords);
      
      if (response.success_count > 0) {
        message.success(`Successfully marked attendance for ${response.success_count} students`);
      }
      
      if (response.fail_count > 0) {
        message.warning(`Failed to mark attendance for ${response.fail_count} students`);
        // Log errors for failed records
        response.errors.forEach((error, index) => {
          console.error(`Error for student ${attendanceRecords[index].student}:`, error);
        });
      }
      
      loadAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      if (error.message?.includes('already exists')) {
        message.error('Attendance already marked for some students');
      } else if (error.message?.includes('Date must be today or yesterday')) {
        message.error('Attendance can only be marked for today or yesterday');
      } else if (error.message?.includes('Day does not match timetable day')) {
        message.error('Selected date does not match the timetable day');
      } else if (error.message?.includes('Invalid pk')) {
        if (error.message?.includes('timetable')) {
          message.error('Invalid timetable selected. Please try again.');
        } else if (error.message?.includes('taken_by_teacher')) {
          message.error('Invalid teacher information. Please contact support.');
        } else {
          message.error('Invalid data. Please try again.');
        }
      } else {
        message.error('Error saving attendance');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      
      const params = {
        startDate,
        endDate
      };
      
      if (selectedClass) {
        params.classroom = selectedClass;
      }
      
      const response = await api.attendance.getFilteredAttendance(params);
      
      if (response && response.data && response.data.results) {
        // Get unique timetable IDs from attendance records
        const timetableIds = [...new Set(response.data.results.map(record => record.timetable))];
        
        // Fetch timetable details for all unique IDs
        const timetablePromises = timetableIds.map(id => api.timetable.getById(id));
        const timetableResponses = await Promise.all(timetablePromises);
        
        // Create a map of timetable details
        const timetableMap = timetableResponses.reduce((acc, response) => {
          if (response && response.data) {
            acc[response.data.id] = response.data;
          }
          return acc;
        }, {});
        
        // Add timetable details to attendance records
        const attendanceWithTimetable = response.data.results.map(record => ({
          ...record,
          timetableDetails: timetableMap[record.timetable]
        }));
        
        setAttendance(attendanceWithTimetable);
        setFilteredAttendance(attendanceWithTimetable);
      } else {
        setAttendance([]);
        setFilteredAttendance([]);
      }
    } catch (error) {
      console.error('Error loading attendance records:', error);
      message.error('Failed to load attendance records');
      setAttendance([]);
      setFilteredAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredAttendance(attendance);
      return;
    }
    
    const filtered = attendance.filter(record => {
      const student = students.find(s => s.id === record.student);
      return student && (
        student.name.toLowerCase().includes(value.toLowerCase()) ||
        student.rollNumber.toString().includes(value)
      );
    });
    setFilteredAttendance(filtered);
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

  const viewColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD MMM YYYY'),
    },
    {
      title: 'Roll Number',
      dataIndex: 'student',
      key: 'rollNumber',
      render: (studentId) => {
        const student = students.find(s => s.id === studentId);
        return student ? student.rollNumber : '-';
      },
    },
    {
      title: 'Name',
      dataIndex: 'student',
      key: 'name',
      render: (studentId) => {
        const student = students.find(s => s.id === studentId);
        return student ? student.name : '-';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'present' ? 'success' : 'error'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Period',
      dataIndex: 'timetableDetails',
      key: 'period',
      render: (timetableDetails) => {
        if (!timetableDetails) return '-';
        return (
          <div>
            <div>{getSubjectName(timetableDetails.subject)}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {moment(timetableDetails.start_time, 'HH:mm:ss').format('hh:mm A')} - 
              {moment(timetableDetails.end_time, 'HH:mm:ss').format('hh:mm A')}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {timetableDetails.day.charAt(0).toUpperCase() + timetableDetails.day.slice(1)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Teacher',
      dataIndex: 'timetableDetails',
      key: 'teacher',
      render: (timetableDetails) => {
        if (!timetableDetails) return '-';
        const teacher = teachers.find(t => t.id === timetableDetails.teacher);
        return teacher ? teacher.name : '-';
      },
    }
  ];

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
            <img src="/attendance.png" alt="Attendance" style={{ width: '40px', height: '40px' }} />
            Attendance Management
          </Title>
        </Col>
        <Col>
          <Radio.Group 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            buttonStyle="solid"
            style={{ marginRight: '16px' }}
          >
            <Radio.Button value="mark">Mark Attendance</Radio.Button>
            <Radio.Button value="view">View Attendance</Radio.Button>
          </Radio.Group>
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
        {viewMode === 'mark' ? (
          <>
            <Row gutter={[16, 16]} style={{ padding: '16px' }}>
              <Col xs={24} sm={12} md={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select Class"
                  onChange={handleClassChange}
                  value={selectedClass}
                  loading={classesLoading}
                >
                  {classes.map(cls => (
                    <Option key={cls.id} value={cls.id}>
                      {cls.class_name} - {cls.section}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select Teacher"
                  onChange={handleTeacherChange}
                  value={selectedTeacher}
                  loading={teachersLoading}
                  disabled={!selectedClass}
                >
                  {teachers.map(teacher => (
                    <Option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select Period"
                  onChange={handlePeriodChange}
                  value={selectedPeriod}
                  disabled={!selectedTeacher || availablePeriods.length === 0}
                >
                  {availablePeriods.map(period => (
                    <Option key={period.id} value={period.id}>
                      {getSubjectName(period.subject)} ({period.start_time} - {period.end_time})
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <DatePicker
                  style={{ width: '100%' }}
                  value={selectedDate}
                  onChange={setSelectedDate}
                  format="YYYY-MM-DD"
                />
              </Col>
            </Row>

            <Card style={{ margin: '0 16px 16px 16px' }}>
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

            <Card style={{ margin: '0 16px 16px 16px' }}>
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

            <div style={{ padding: '16px', textAlign: 'right' }}>
              <Button
                type="primary"
                onClick={handleSaveAttendance}
                loading={loading}
                disabled={!selectedClass || !selectedTeacher || !selectedPeriod}
              >
                Save Attendance
              </Button>
            </div>
          </>
        ) : (
          <>
            <Row gutter={[16, 16]} style={{ padding: '16px' }}>
              <Col xs={24} sm={12} md={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select Class"
                  onChange={handleClassChange}
                  value={selectedClass}
                  loading={classesLoading}
                >
                  {classes.map(cls => (
                    <Option key={cls.id} value={cls.id}>
                      {cls.class_name} - {cls.section}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <RangePicker
                  style={{ width: '100%' }}
                  value={dateRange}
                  onChange={setDateRange}
                  format="YYYY-MM-DD"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Input
                  placeholder="Search by name or roll number"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  onClick={loadAttendanceRecords}
                  loading={loading}
                >
                  Load Records
                </Button>
              </Col>
            </Row>

            <Card style={{ margin: '0 16px 16px 16px' }}>
              <Table
                columns={viewColumns}
                dataSource={filteredAttendance}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: true }}
                className="custom-table"
                loading={loading}
              />
            </Card>
          </>
        )}
      </Card>
    </div>
  );
};

export default Attendance;
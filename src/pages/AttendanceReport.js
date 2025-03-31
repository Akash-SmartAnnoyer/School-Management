import React, { useState, useEffect } from 'react';
import { Table, Card, DatePicker, Select, Row, Col, Statistic, Tabs, Progress } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import { subscribeToCollection, getAttendance } from '../firebase/services';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const AttendanceReport = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('1');

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

  // Calculate attendance statistics
  const calculateAttendanceStats = (data, type) => {
    const stats = {
      total: 0,
      present: 0,
      absent: 0,
      percentage: 0
    };

    data.forEach(record => {
      stats.total++;
      if (record.status === 'Present') {
        stats.present++;
      } else {
        stats.absent++;
      }
    });

    stats.percentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
    return stats;
  };

  // Filter attendance data based on date range
  const getFilteredAttendance = (data) => {
    return data.filter(record => {
      const recordDate = moment(record.date);
      return recordDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
    });
  };

  // Get class-wise attendance
  const getClassAttendance = () => {
    const filteredAttendance = getFilteredAttendance(attendance);
    const classStats = {};

    classes.forEach(cls => {
      const classAttendance = filteredAttendance.filter(record => record.classId === cls.id);
      classStats[cls.id] = {
        className: cls.className,
        section: cls.section,
        ...calculateAttendanceStats(classAttendance)
      };
    });

    return Object.values(classStats);
  };

  // Get student-wise attendance
  const getStudentAttendance = (studentId) => {
    const filteredAttendance = getFilteredAttendance(attendance);
    const studentAttendance = filteredAttendance.filter(record => record.studentId === studentId);
    return calculateAttendanceStats(studentAttendance);
  };

  // Get date-wise attendance
  const getDateWiseAttendance = () => {
    const filteredAttendance = getFilteredAttendance(attendance);
    const dateStats = {};

    filteredAttendance.forEach(record => {
      if (!dateStats[record.date]) {
        dateStats[record.date] = {
          date: record.date,
          total: 0,
          present: 0,
          absent: 0
        };
      }
      dateStats[record.date].total++;
      if (record.status === 'Present') {
        dateStats[record.date].present++;
      } else {
        dateStats[record.date].absent++;
      }
    });

    return Object.values(dateStats).sort((a, b) => moment(a.date).diff(moment(b.date)));
  };

  const classColumns = [
    {
      title: 'Class',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
    },
    {
      title: 'Total Days',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'Present',
      dataIndex: 'present',
      key: 'present',
    },
    {
      title: 'Absent',
      dataIndex: 'absent',
      key: 'absent',
    },
    {
      title: 'Attendance %',
      key: 'percentage',
      render: (_, record) => (
        <Progress
          percent={Math.round(record.percentage)}
          status={record.percentage >= 75 ? 'success' : record.percentage >= 60 ? 'normal' : 'exception'}
        />
      ),
    },
  ];

  const dateWiseColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD MMM YYYY'),
    },
    {
      title: 'Total Students',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'Present',
      dataIndex: 'present',
      key: 'present',
    },
    {
      title: 'Absent',
      dataIndex: 'absent',
      key: 'absent',
    },
    {
      title: 'Attendance %',
      key: 'percentage',
      render: (_, record) => (
        <Progress
          percent={Math.round((record.present / record.total) * 100)}
          status={(record.present / record.total) * 100 >= 75 ? 'success' : (record.present / record.total) * 100 >= 60 ? 'normal' : 'exception'}
        />
      ),
    },
  ];

  const studentColumns = [
    {
      title: 'Roll Number',
      dataIndex: 'rollNumber',
      key: 'rollNumber',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Total Days',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'Present',
      dataIndex: 'present',
      key: 'present',
    },
    {
      title: 'Absent',
      dataIndex: 'absent',
      key: 'absent',
    },
    {
      title: 'Attendance %',
      key: 'percentage',
      render: (_, record) => (
        <Progress
          percent={Math.round(record.percentage)}
          status={record.percentage >= 75 ? 'success' : record.percentage >= 60 ? 'normal' : 'exception'}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              style={{ width: '100%' }}
              placeholder="Select Class"
              onChange={setSelectedClass}
              value={selectedClass}
            >
              {classes.map(cls => (
                <Option key={cls.id} value={cls.id}>
                  {cls.className} - {cls.section}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Class-wise Attendance" key="1">
          <Table
            columns={classColumns}
            dataSource={getClassAttendance()}
            rowKey="className"
            pagination={false}
          />
        </TabPane>

        <TabPane tab="Date-wise Attendance" key="2">
          <Table
            columns={dateWiseColumns}
            dataSource={getDateWiseAttendance()}
            rowKey="date"
            pagination={false}
          />
        </TabPane>

        <TabPane tab="Student-wise Attendance" key="3">
          <Select
            style={{ width: '100%', marginBottom: '16px' }}
            placeholder="Select Student"
            onChange={setSelectedStudent}
            value={selectedStudent}
          >
            {students
              .filter(student => !selectedClass || student.classId === selectedClass)
              .map(student => (
                <Option key={student.id} value={student.id}>
                  {student.name} - {student.rollNumber}
                </Option>
              ))}
          </Select>

          {selectedStudent && (
            <Table
              columns={studentColumns}
              dataSource={[getStudentAttendance(selectedStudent)]}
              rowKey="studentId"
              pagination={false}
            />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AttendanceReport; 
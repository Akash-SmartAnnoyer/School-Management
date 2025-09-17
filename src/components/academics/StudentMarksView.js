import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Tag,
  Button,
  Modal,
  Table,
  Progress,
  Statistic,
  Space,
  Divider,
  Empty,
  Tooltip,
  Badge,
  Pagination,
  Input
} from 'antd';
import {
  UserOutlined,
  TrophyOutlined,
  BookOutlined,
  BarChartOutlined,
  EyeOutlined,
  LineChartOutlined,
  StarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';

const { Title, Text } = Typography;

const StudentProgressModal = ({ 
  visible, 
  onCancel, 
  studentData, 
  subjects, 
  exams,
  onEditMarks 
}) => {
  
  const handleEditMarks = (record) => {
    // Close the progress modal first
    onCancel();
    // Then trigger the edit in the parent component
    setTimeout(() => {
      onEditMarks(record);
    }, 100); // Small delay to ensure modal is closed
  };
  if (!studentData) return null;

  const { student, marks } = studentData;

  // Calculate overall statistics
  const totalMarks = marks.reduce((sum, mark) => sum + parseFloat(mark.marks || 0), 0);
  const averageMarks = marks.length > 0 ? (totalMarks / marks.length).toFixed(1) : 0;
  const highestMark = marks.length > 0 ? Math.max(...marks.map(m => parseFloat(m.marks || 0))) : 0;
  const lowestMark = marks.length > 0 ? Math.min(...marks.map(m => parseFloat(m.marks || 0))) : 0;

  // Group marks by subject for better visualization
  const marksBySubject = marks.reduce((acc, mark) => {
    const subject = subjects.find(s => s.id === mark.subject);
    const subjectName = subject?.name || `Subject ${mark.subject}`;
    
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(mark);
    return acc;
  }, {});

  // Prepare data for charts
  const chartData = marks.map(mark => {
    const exam = exams.find(e => e.id === mark.exam);
    const subject = subjects.find(s => s.id === mark.subject);
    return {
      exam: exam?.name || `Exam ${mark.exam}`,
      subject: subject?.name || `Subject ${mark.subject}`,
      marks: parseFloat(mark.marks || 0),
      maxMarks: exam?.maximum_marks || 100,
      percentage: ((parseFloat(mark.marks || 0) / (exam?.maximum_marks || 100)) * 100).toFixed(1)
    };
  });

  const columns = [
    {
      title: 'Exam',
      dataIndex: 'exam',
      key: 'exam',
      render: (examId) => {
        const exam = exams.find(e => e.id === examId);
        return exam?.name || `Exam ${examId}`;
      }
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (subjectId) => {
        const subject = subjects.find(s => s.id === subjectId);
        return subject?.name || `Subject ${subjectId}`;
      }
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
      render: (marks, record) => {
        const exam = exams.find(e => e.id === record.exam);
        const maxMarks = exam?.maximum_marks || 100;
        const percentage = (parseFloat(marks) / maxMarks) * 100;
        
        return (
          <Space>
            <Tag 
              color={
                percentage >= 90 ? 'green' :
                percentage >= 80 ? 'blue' :
                percentage >= 70 ? 'orange' :
                percentage >= 60 ? 'gold' : 'red'
              }
              style={{ 
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: 500
              }}
            >
              {marks}/{maxMarks}
            </Tag>
            <Text type="secondary">({percentage.toFixed(1)}%)</Text>
          </Space>
        );
      }
    },
    {
      title: 'Grade',
      key: 'grade',
      render: (_, record) => {
        const exam = exams.find(e => e.id === record.exam);
        const maxMarks = exam?.maximum_marks || 100;
        const percentage = (parseFloat(record.marks) / maxMarks) * 100;
        
        let grade = 'F';
        let color = 'red';
        
        if (percentage >= 90) { grade = 'A+'; color = 'green'; }
        else if (percentage >= 80) { grade = 'A'; color = 'blue'; }
        else if (percentage >= 70) { grade = 'B'; color = 'orange'; }
        else if (percentage >= 60) { grade = 'C'; color = 'gold'; }
        else if (percentage >= 50) { grade = 'D'; color = 'volcano'; }
        
        return <Tag color={color}>{grade}</Tag>;
      }
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (remarks) => remarks || '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEditMarks(record)}
        >
          Edit
        </Button>
      )
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <Avatar 
            size={40} 
            icon={<UserOutlined />}
            style={{ backgroundColor: '#7B83EB' }}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {student.name || `${student.user?.first_name} ${student.user?.last_name}` || 'Student'}
            </Title>
            <Text type="secondary">Progress Report</Text>
          </div>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      style={{ top: 20 }}
    >
      <div style={{ padding: '20px 0' }}>
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Total Exams"
                value={marks.length}
                prefix={<TrophyOutlined style={{ color: '#7B83EB' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Average Marks"
                value={averageMarks}
                suffix="%"
                precision={1}
                prefix={<BarChartOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Highest Score"
                value={highestMark}
                prefix={<StarOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Subjects"
                value={Object.keys(marksBySubject).length}
                prefix={<BookOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Performance Chart */}
        {chartData.length > 0 && (
          <Card 
            title={
              <Space>
                <LineChartOutlined style={{ color: '#7B83EB' }} />
                Performance Trend
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Line
                  data={chartData}
                  xField="exam"
                  yField="marks"
                  seriesField="subject"
                  height={200}
                  point={{ size: 5, shape: 'diamond' }}
                  label={{
                    style: {
                      fill: '#aaa',
                      fontSize: 12,
                    },
                  }}
                />
              </Col>
              <Col span={12}>
                <Column
                  data={chartData}
                  xField="exam"
                  yField="percentage"
                  seriesField="subject"
                  height={200}
                  label={{
                    position: 'top',
                    style: {
                      fill: '#666',
                      fontSize: 10,
                    },
                    formatter: (datum) => `${datum.percentage}%`
                  }}
                />
              </Col>
            </Row>
          </Card>
        )}

        {/* Subject-wise Performance */}
        <Card 
          title={
            <Space>
              <BookOutlined style={{ color: '#7B83EB' }} />
              Subject-wise Performance
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={[16, 16]}>
            {Object.entries(marksBySubject).map(([subjectName, subjectMarks]) => {
              const avgMarks = (subjectMarks.reduce((sum, mark) => sum + parseFloat(mark.marks || 0), 0) / subjectMarks.length).toFixed(1);
              const avgPercentage = (avgMarks / 100) * 100; // Assuming 100 as max marks for percentage calculation
              
              return (
                <Col span={8} key={subjectName}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Title level={5}>{subjectName}</Title>
                    <Progress
                      type="circle"
                      percent={avgPercentage}
                      format={() => `${avgMarks}`}
                      size={80}
                      strokeColor={
                        avgPercentage >= 90 ? '#52c41a' :
                        avgPercentage >= 80 ? '#1890ff' :
                        avgPercentage >= 70 ? '#faad14' :
                        avgPercentage >= 60 ? '#fa8c16' : '#f5222d'
                      }
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">{subjectMarks.length} exams</Text>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>

        {/* Detailed Marks Table */}
        <Card 
          title={
            <Space>
              <TrophyOutlined style={{ color: '#7B83EB' }} />
              Detailed Marks
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={marks}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ y: 300 }}
          />
        </Card>
      </div>
    </Modal>
  );
};

const StudentCard = ({ 
  student, 
  marks, 
  subjects, 
  exams, 
  onViewProgress, 
  onEditMarks 
}) => {
  // Calculate student statistics
  const totalExams = marks.length;
  const totalMarks = marks.reduce((sum, mark) => sum + parseFloat(mark.marks || 0), 0);
  const averageMarks = totalExams > 0 ? (totalMarks / totalExams).toFixed(1) : 0;
  const averagePercentage = (averageMarks / 100) * 100; // Assuming 100 as max marks
  
  // Get unique subjects
  const uniqueSubjects = [...new Set(marks.map(mark => mark.subject))];
  
  // Calculate performance status
  const getPerformanceStatus = (percentage) => {
    if (percentage >= 90) return { status: 'excellent', color: '#52c41a', icon: <CheckCircleOutlined /> };
    if (percentage >= 80) return { status: 'good', color: '#1890ff', icon: <CheckCircleOutlined /> };
    if (percentage >= 70) return { status: 'average', color: '#faad14', icon: <CheckCircleOutlined /> };
    if (percentage >= 60) return { status: 'below average', color: '#fa8c16', icon: <CloseCircleOutlined /> };
    return { status: 'poor', color: '#f5222d', icon: <CloseCircleOutlined /> };
  };

  const performance = getPerformanceStatus(averagePercentage);

  return (
    <Card
      hoverable
      style={{ 
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        height: '100%',
        minHeight: '200px'
      }}
      bodyStyle={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 20 }}>
        <Avatar 
          size={56} 
          icon={<UserOutlined />}
          style={{ 
            backgroundColor: '#7B83EB',
            marginRight: 16,
            flexShrink: 0
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Title 
            level={4} 
            style={{ 
              margin: 0, 
              marginBottom: 6,
              fontSize: '16px',
              lineHeight: '1.3',
              wordBreak: 'break-word'
            }}
            title={student.name || `${student.user?.first_name} ${student.user?.last_name}` || 'Student'}
          >
            {student.name || `${student.user?.first_name} ${student.user?.last_name}` || 'Student'}
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Roll: {student.rollNumber || student.roll || 'N/A'}
            </Text>
            <Badge 
              color={performance.color}
              text={performance.status}
              style={{ 
                fontSize: '11px', 
                fontWeight: 500,
                textTransform: 'capitalize'
              }}
            />
          </div>
        </div>
      </div>


      {/* Performance Section */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong style={{ fontSize: '13px' }}>Overall Performance</Text>
          <Text style={{ fontSize: '12px', color: performance.color, fontWeight: 500 }}>
            {averagePercentage.toFixed(1)}%
          </Text>
        </div>
        <Progress
          percent={averagePercentage}
          strokeColor={performance.color}
          size="small"
          showInfo={false}
          strokeWidth={6}
        />
      </div>

      {/* Subjects Section */}
      <div style={{ marginBottom: 20, flex: 1 }}>
        <Text strong style={{ marginBottom: 8, display: 'block', fontSize: '13px' }}>
          Subjects ({uniqueSubjects.length})
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {uniqueSubjects.slice(0, 4).map(subjectId => {
            const subject = subjects.find(s => s.id === subjectId);
            return (
              <Tag 
                key={subjectId} 
                style={{ 
                  marginBottom: 4,
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                {subject?.name || `Subject ${subjectId}`}
              </Tag>
            );
          })}
          {uniqueSubjects.length > 4 && (
            <Tag 
              style={{ 
                marginBottom: 4,
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: '#f0f0f0',
                border: '1px dashed #d9d9d9'
              }}
            >
              +{uniqueSubjects.length - 4} more
            </Tag>
          )}
        </div>
      </div>

      {/* Actions Section */}
      <div style={{ marginTop: 'auto' }}>
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => onViewProgress({ student, marks })}
          style={{ 
            width: '100%',
            height: '36px',
            borderRadius: '6px',
            fontSize: '13px'
          }}
        >
          View Progress
        </Button>
      </div>
    </Card>
  );
};

const StudentMarksView = ({ 
  marks = [], 
  students = [], 
  subjects = [], 
  exams = [],
  onEditMarks,
  loading = false
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(12); // Default cards per page

  // Group marks by student
  const groupedMarks = useMemo(() => {
    return marks.reduce((acc, mark) => {
      const studentId = mark.student;
      if (!acc[studentId]) {
        acc[studentId] = [];
      }
      acc[studentId].push(mark);
      return acc;
    }, {});
  }, [marks]);

  // Create student data with their marks and apply search filter
  const filteredStudentData = useMemo(() => {
    const allStudentData = Object.entries(groupedMarks).map(([studentId, studentMarks]) => {
      const student = students.find(s => s.id === parseInt(studentId)) || { id: studentId, name: `Student ${studentId}` };
      return {
        student,
        marks: studentMarks
      };
    }).sort((a, b) => {
      // Sort by student name
      const nameA = a.student.name || `${a.student.user?.first_name} ${a.student.user?.last_name}` || 'Student';
      const nameB = b.student.name || `${b.student.user?.first_name} ${b.student.user?.last_name}` || 'Student';
      return nameA.localeCompare(nameB);
    });

    // Apply search filter
    if (!searchTerm) return allStudentData;
    
    return allStudentData.filter(({ student }) => {
      const studentName = (student.name || `${student.user?.first_name} ${student.user?.last_name}` || 'Student').toLowerCase();
      const rollNumber = (student.rollNumber || student.roll || '').toString().toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return studentName.includes(search) || rollNumber.includes(search);
    });
  }, [groupedMarks, students, searchTerm]);

  // Paginate the filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredStudentData.slice(startIndex, endIndex);
  }, [filteredStudentData, currentPage, pageSize]);

  const handleViewProgress = (data) => {
    setSelectedStudent(data);
    setProgressModalVisible(true);
  };

  const handleCloseProgress = () => {
    setProgressModalVisible(false);
    setSelectedStudent(null);
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size !== pageSize) {
      setPageSize(size);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Loading student data...</Title>
      </div>
    );
  }

  if (filteredStudentData.length === 0 && !searchTerm) {
    return (
      <Empty
        description="No student marks found"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: '50px' }}
      >
        <Text type="secondary">
          Start by adding marks for students to see their progress reports here.
        </Text>
      </Empty>
    );
  }

  return (
    <div>
      {/* Header with Search */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <Title level={3} style={{ marginBottom: 8, margin: 0 }}>
              <TrophyOutlined style={{ marginRight: 8, color: '#7B83EB' }} />
              Student Performance Overview
            </Title>
            <Text type="secondary">
              {filteredStudentData.length} student{filteredStudentData.length !== 1 ? 's' : ''} • Click on any card to view detailed progress
            </Text>
          </div>
          <Input.Search
            placeholder="Search students by name or roll number..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ 
              width: 300,
              marginLeft: 16
            }}
            prefix={<SearchOutlined style={{ color: '#7B83EB' }} />}
          />
        </div>
      </div>

      {/* No Results Message */}
      {filteredStudentData.length === 0 && searchTerm && (
        <Empty
          description={`No students found matching "${searchTerm}"`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '50px' }}
        >
          <Button onClick={() => handleSearch('')}>Clear Search</Button>
        </Empty>
      )}

      {/* Student Cards Grid */}
      {filteredStudentData.length > 0 && (
        <>
          <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
            {paginatedData.map(({ student, marks }) => (
              <Col 
                xs={24} 
                sm={12} 
                md={12} 
                lg={8} 
                xl={6} 
                xxl={4} 
                key={student.id}
              >
                <StudentCard
                  student={student}
                  marks={marks}
                  subjects={subjects}
                  exams={exams}
                  onViewProgress={handleViewProgress}
                  onEditMarks={onEditMarks}
                />
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {filteredStudentData.length > pageSize && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Pagination
                current={currentPage}
                total={filteredStudentData.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} of ${total} students`
                }
                pageSizeOptions={['8', '12', '16', '24', '32']}
                style={{
                  padding: '16px',
                  background: '#fafafa',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}
              />
            </div>
          )}
        </>
      )}

      <StudentProgressModal
        visible={progressModalVisible}
        onCancel={handleCloseProgress}
        studentData={selectedStudent}
        subjects={subjects}
        exams={exams}
        onEditMarks={onEditMarks}
      />
    </div>
  );
};

export default StudentMarksView;

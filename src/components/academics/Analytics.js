import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Statistic,
  Progress,
  Table,
  Tag,
  Typography,
  Space,
  Button,
  DatePicker,
  Tooltip
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TeamOutlined,
  TrophyOutlined,
  StarOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Analytics = ({ marks, students, classes, subjects, examTypes, onExamSelect }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedExamType, setSelectedExamType] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  const calculateClassAverage = () => {
    if (!marks.length) return 0;
    const total = marks.reduce((sum, mark) => sum + (mark.marks / mark.maxMarks) * 100, 0);
    return (total / marks.length).toFixed(2);
  };

  const calculatePassPercentage = () => {
    if (!marks.length) return 0;
    const passingMarks = marks.filter(mark => (mark.marks / mark.maxMarks) * 100 >= 40);
    return ((passingMarks.length / marks.length) * 100).toFixed(2);
  };

  const getSubjectPerformance = () => {
    const subjectData = {};
    marks.forEach(mark => {
      if (!subjectData[mark.subject]) {
        subjectData[mark.subject] = {
          total: 0,
          count: 0,
          name: subjects.find(s => s.value === mark.subject)?.label || mark.subject
        };
      }
      subjectData[mark.subject].total += (mark.marks / mark.maxMarks) * 100;
      subjectData[mark.subject].count += 1;
    });

    return Object.entries(subjectData).map(([subject, data]) => ({
      subject,
      average: (data.total / data.count).toFixed(2),
      name: data.name
    }));
  };

  const getStudentPerformance = () => {
    const studentData = {};
    marks.forEach(mark => {
      if (!studentData[mark.studentId]) {
        const student = students.find(s => s.id === mark.studentId);
        studentData[mark.studentId] = {
          name: student?.name || 'Unknown',
          total: 0,
          count: 0
        };
      }
      studentData[mark.studentId].total += (mark.marks / mark.maxMarks) * 100;
      studentData[mark.studentId].count += 1;
    });

    return Object.entries(studentData).map(([studentId, data]) => ({
      studentId,
      name: data.name,
      average: (data.total / data.count).toFixed(2)
    })).sort((a, b) => b.average - a.average);
  };

  const subjectPerformanceData = getSubjectPerformance();
  const studentPerformanceData = getStudentPerformance();

  const subjectChartConfig = {
    data: subjectPerformanceData,
    xField: 'name',
    yField: 'average',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      average: {
        alias: 'Average Score',
      },
    },
  };

  const studentChartConfig = {
    data: studentPerformanceData.slice(0, 10),
    xField: 'name',
    yField: 'average',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      average: {
        alias: 'Average Score',
      },
    },
  };

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
            <BarChartOutlined style={{ fontSize: '24px', color: '#7B83EB' }} />
            Academic Reports
          </Title>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              style={{
                height: '32px',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                background: '#7B83EB',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.3s ease',
                padding: '0 12px'
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
              Export
            </Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              style={{
                height: '32px',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                background: '#7B83EB',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.3s ease',
                padding: '0 12px'
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
              Print
            </Button>
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
        <Card
          style={{
            margin: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
            border: '1px solid rgba(159, 179, 223, 0.3)'
          }}
        >
          <Space wrap>
            <Select
              style={{ 
                width: 200,
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
              placeholder="Select Class"
              onChange={setSelectedClass}
              allowClear
              suffixIcon={<FilterOutlined style={{ color: '#7B83EB' }} />}
            >
              {classes.map(cls => (
                <Select.Option key={cls.id} value={cls.id}>
                  {cls.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              style={{ 
                width: 200,
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
              placeholder="Select Subject"
              onChange={setSelectedSubject}
              allowClear
              suffixIcon={<FilterOutlined style={{ color: '#7B83EB' }} />}
            >
              {subjects.map(subject => (
                <Select.Option key={subject.value} value={subject.value}>
                  {subject.label}
                </Select.Option>
              ))}
            </Select>
            <Select
              style={{ 
                width: 200,
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
              placeholder="Select Exam Type"
              onChange={setSelectedExamType}
              allowClear
              suffixIcon={<FilterOutlined style={{ color: '#7B83EB' }} />}
            >
              {examTypes.map(type => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>
            <RangePicker
              onChange={setDateRange}
              style={{ 
                width: 250,
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
            />
          </Space>
        </Card>

        <Row gutter={[16, 16]} style={{ padding: '0 16px' }}>
          <Col span={8}>
            <Card
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)',
                background: 'linear-gradient(135deg, #7B83EB 0%, #8ba1d1 100%)',
                color: 'white'
              }}
            >
              <Statistic
                title={<span style={{ color: 'white' }}>Class Average</span>}
                value={calculateClassAverage()}
                suffix="%"
                prefix={<TeamOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
              <Progress
                percent={parseFloat(calculateClassAverage())}
                status="active"
                style={{ marginTop: 16 }}
                strokeColor="white"
                trailColor="rgba(255, 255, 255, 0.2)"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)',
                background: 'linear-gradient(135deg, #7B83EB 0%, #8ba1d1 100%)',
                color: 'white'
              }}
            >
              <Statistic
                title={<span style={{ color: 'white' }}>Pass Percentage</span>}
                value={calculatePassPercentage()}
                suffix="%"
                prefix={<TrophyOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
              <Progress
                percent={parseFloat(calculatePassPercentage())}
                status="active"
                style={{ marginTop: 16 }}
                strokeColor="white"
                trailColor="rgba(255, 255, 255, 0.2)"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)',
                background: 'linear-gradient(135deg, #7B83EB 0%, #8ba1d1 100%)',
                color: 'white'
              }}
            >
              <Statistic
                title={<span style={{ color: 'white' }}>Top Student Average</span>}
                value={studentPerformanceData[0]?.average || 0}
                suffix="%"
                prefix={<StarOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
              <Text style={{ color: 'white', display: 'block', marginTop: 8 }}>
                {studentPerformanceData[0]?.name || 'N/A'}
              </Text>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ padding: '16px' }}>
          <Col span={12}>
            <Card
              title="Subject-wise Performance"
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
            >
              <Column {...subjectChartConfig} />
            </Card>
          </Col>
          <Col span={12}>
            <Card
              title="Top 10 Students"
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
            >
              <Column {...studentChartConfig} />
            </Card>
          </Col>
        </Row>

        <Row style={{ padding: '0 16px 16px 16px' }}>
          <Col span={24}>
            <Card
              title="Detailed Performance"
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(159, 179, 223, 0.2)',
                border: '1px solid rgba(159, 179, 223, 0.3)'
              }}
            >
              <Table
                dataSource={studentPerformanceData}
                columns={[
                  {
                    title: 'Student Name',
                    dataIndex: 'name',
                    key: 'name',
                  },
                  {
                    title: 'Average Score',
                    dataIndex: 'average',
                    key: 'average',
                    render: (value) => (
                      <Tag color={value >= 90 ? 'green' : value >= 80 ? 'blue' : value >= 70 ? 'orange' : value >= 60 ? 'red' : 'red'}>
                        {value}%
                      </Tag>
                    ),
                  },
                  {
                    title: 'Grade',
                    key: 'grade',
                    render: (_, record) => {
                      const value = parseFloat(record.average);
                      let grade = 'F';
                      if (value >= 90) grade = 'A';
                      else if (value >= 80) grade = 'B';
                      else if (value >= 70) grade = 'C';
                      else if (value >= 60) grade = 'D';
                      return (
                        <Tag color={grade === 'A' ? 'green' : grade === 'B' ? 'blue' : grade === 'C' ? 'orange' : grade === 'D' ? 'red' : 'red'}>
                          {grade}
                        </Tag>
                      );
                    },
                  },
                ]}
                rowKey="studentId"
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <style>
        {`
          .ant-select-selector {
            border-color: rgba(159, 179, 223, 0.3) !important;
            border-radius: 6px !important;
          }

          .ant-select:hover .ant-select-selector {
            border-color: #7B83EB !important;
          }

          .ant-select-focused .ant-select-selector {
            border-color: #7B83EB !important;
            box-shadow: 0 0 0 2px rgba(159, 179, 223, 0.2) !important;
          }

          .ant-picker {
            border-color: rgba(159, 179, 223, 0.3) !important;
            border-radius: 6px !important;
          }

          .ant-picker:hover {
            border-color: #7B83EB !important;
          }

          .ant-picker-focused {
            border-color: #7B83EB !important;
            box-shadow: 0 0 0 2px rgba(159, 179, 223, 0.2) !important;
          }

          .ant-table {
            border-radius: 8px;
            overflow: hidden;
          }

          .ant-table-thead > tr > th {
            background: rgba(159, 179, 223, 0.1) !important;
            color: #7B83EB !important;
            font-weight: 600;
          }

          .ant-table-tbody > tr:hover > td {
            background: rgba(159, 179, 223, 0.05) !important;
          }

          .ant-tag {
            border-radius: 4px;
            padding: 0 8px;
            height: 24px;
            line-height: 22px;
            font-weight: 500;
          }

          .ant-card-head {
            border-bottom: 1px solid rgba(159, 179, 223, 0.2);
            padding: 16px 24px;
          }

          .ant-card-head-title {
            color: #7B83EB;
            font-weight: 600;
          }

          .ant-statistic-title {
            color: rgba(255, 255, 255, 0.85);
          }

          .ant-statistic-content {
            color: white;
          }

          .ant-progress-text {
            color: white !important;
          }
        `}
      </style>
    </div>
  );
};

export default Analytics; 
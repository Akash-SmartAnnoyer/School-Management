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
  PrinterOutlined
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
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space>
            <Select
                style={{ width: 200 }}
                placeholder="Select Class"
                onChange={setSelectedClass}
                allowClear
              >
                {classes.map(cls => (
                  <Select.Option key={cls.id} value={cls.id}>
                    {cls.name}
                  </Select.Option>
              ))}
            </Select>
            <Select
                style={{ width: 200 }}
                placeholder="Select Subject"
                onChange={setSelectedSubject}
                allowClear
              >
                {subjects.map(subject => (
                  <Select.Option key={subject.value} value={subject.value}>
                    {subject.label}
                  </Select.Option>
              ))}
            </Select>
              <Select
                style={{ width: 200 }}
                placeholder="Select Exam Type"
                onChange={setSelectedExamType}
                allowClear
              >
                {examTypes.map(type => (
                  <Select.Option key={type.value} value={type.value}>
                    {type.label}
                  </Select.Option>
                ))}
              </Select>
              <RangePicker
                onChange={setDateRange}
                style={{ width: 250 }}
              />
              <Space>
                <Button icon={<DownloadOutlined />}>Export</Button>
                <Button icon={<PrinterOutlined />}>Print</Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Class Average"
              value={calculateClassAverage()}
              suffix="%"
              prefix={<TeamOutlined />}
            />
            <Progress
              percent={parseFloat(calculateClassAverage())}
              status="active"
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Pass Percentage"
              value={calculatePassPercentage()}
              suffix="%"
              prefix={<TrophyOutlined />}
            />
            <Progress
              percent={parseFloat(calculatePassPercentage())}
              status="active"
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Top Student Average"
              value={studentPerformanceData[0]?.average || 0}
              suffix="%"
              prefix={<StarOutlined />}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              {studentPerformanceData[0]?.name || 'N/A'}
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Subject-wise Performance">
            <Column {...subjectChartConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top 10 Students">
            <Column {...studentChartConfig} />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Detailed Performance">
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
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics; 
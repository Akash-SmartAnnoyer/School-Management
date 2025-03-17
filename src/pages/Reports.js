import React, { useState } from 'react';
import { Card, Table, Button, DatePicker, Select, Space, Row, Col, Statistic } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const Reports = () => {
  const [reportType, setReportType] = useState('academic');
  const [dateRange, setDateRange] = useState(null);

  // Sample data - replace with actual data from Firestore
  const academicPerformanceData = [
    {
      key: '1',
      studentId: 'ST001',
      name: 'John Doe',
      class: '10A',
      subject: 'Mathematics',
      marks: 85,
      grade: 'A',
      attendance: '95%',
    },
    // Add more sample data
  ];

  const attendanceData = [
    {
      key: '1',
      date: '2024-03-01',
      class: '10A',
      totalStudents: 40,
      present: 38,
      absent: 2,
      late: 1,
    },
    // Add more sample data
  ];

  const financialData = [
    {
      key: '1',
      month: 'March 2024',
      income: 50000,
      expenses: 35000,
      balance: 15000,
      status: 'Positive',
    },
    // Add more sample data
  ];

  const academicColumns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'Attendance',
      dataIndex: 'attendance',
      key: 'attendance',
    },
  ];

  const attendanceColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Total Students',
      dataIndex: 'totalStudents',
      key: 'totalStudents',
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
      title: 'Late',
      dataIndex: 'late',
      key: 'late',
    },
  ];

  const financialColumns = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Income',
      dataIndex: 'income',
      key: 'income',
      render: (text) => `₹${text.toLocaleString()}`,
    },
    {
      title: 'Expenses',
      dataIndex: 'expenses',
      key: 'expenses',
      render: (text) => `₹${text.toLocaleString()}`,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (text) => `₹${text.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const handleExport = (format) => {
    // Implement export functionality
    console.log(`Exporting ${reportType} report in ${format} format`);
  };

  return (
    <div className="reports-page">
      <Card title="Reports" className="reports-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={16} align="middle">
            <Col>
              <Select
                defaultValue="academic"
                style={{ width: 200 }}
                onChange={setReportType}
                options={[
                  { value: 'academic', label: 'Academic Performance' },
                  { value: 'attendance', label: 'Attendance' },
                  { value: 'financial', label: 'Financial' },
                ]}
              />
            </Col>
            <Col>
              <RangePicker onChange={setDateRange} />
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={() => handleExport('excel')}
                >
                  Export Excel
                </Button>
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  onClick={() => handleExport('pdf')}
                >
                  Export PDF
                </Button>
              </Space>
            </Col>
          </Row>

          {reportType === 'academic' && (
            <>
              <Row gutter={16}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Average Score"
                      value={85}
                      suffix="%"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Pass Rate"
                      value={92}
                      suffix="%"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Top Performers"
                      value={15}
                      suffix="students"
                    />
                  </Card>
                </Col>
              </Row>
              <Table
                columns={academicColumns}
                dataSource={academicPerformanceData}
                scroll={{ x: true }}
              />
            </>
          )}

          {reportType === 'attendance' && (
            <>
              <Row gutter={16}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Average Attendance"
                      value={95}
                      suffix="%"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Total Absences"
                      value={45}
                      suffix="days"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Late Arrivals"
                      value={12}
                      suffix="times"
                    />
                  </Card>
                </Col>
              </Row>
              <Table
                columns={attendanceColumns}
                dataSource={attendanceData}
                scroll={{ x: true }}
              />
            </>
          )}

          {reportType === 'financial' && (
            <>
              <Row gutter={16}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Total Income"
                      value={500000}
                      prefix="₹"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Total Expenses"
                      value={350000}
                      prefix="₹"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Net Balance"
                      value={150000}
                      prefix="₹"
                    />
                  </Card>
                </Col>
              </Row>
              <Table
                columns={financialColumns}
                dataSource={financialData}
                scroll={{ x: true }}
              />
            </>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default Reports; 
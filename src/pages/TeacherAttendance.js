import React, { useState, useEffect } from 'react';
import { Table, Button, Space, DatePicker, Card, message, Row, Col, Statistic, Typography, Input, Select, Form, Radio, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, TeamOutlined, CalendarOutlined, FilterOutlined, UserOutlined } from '@ant-design/icons';
import api from '../services/api';
import moment from 'moment';

const { Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const TeacherAttendance = () => {
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [loading, setLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [attendanceDetails, setAttendanceDetails] = useState({});
  const [filterForm] = Form.useForm();
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [viewMode, setViewMode] = useState('mark'); // 'mark' or 'view'
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    loadTeachers();
    if (viewMode === 'view') {
      loadAttendance();
    }
  }, [selectedDate, selectedTeacher, dateRange, viewMode]);

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
      const params = {};
      
      if (selectedTeacher) {
        params.teacher = selectedTeacher;
      }
      
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }

      const response = await api.teacherAttendance.getByDateRange(params.start_date, params.end_date, params);
      const attendanceData = response.data.results || [];
      
      if (viewMode === 'mark') {
        // Initialize attendance status and details from existing records
        const status = {};
        const details = {};
        attendanceData.forEach(record => {
          status[record.teacher] = record.status;
          details[record.teacher] = record.details;
        });
        
        setAttendanceStatus(status);
        setAttendanceDetails(details);
      }
      
      setAttendance(attendanceData);
      setFilteredAttendance(attendanceData);
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
    // Clear details if status is not leave
    if (status !== 'leave') {
      setAttendanceDetails(prev => ({
        ...prev,
        [teacherId]: ''
      }));
    }
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
      
      // Save each attendance record individually
      for (const [teacherId, status] of Object.entries(attendanceStatus)) {
        const attendanceRecord = {
          teacher: parseInt(teacherId),
          date,
          status: status.toLowerCase(),
          details: status === 'leave' ? (attendanceDetails[teacherId] || '') : ''
        };

        try {
          // First try to find existing attendance record
          const existingAttendance = attendance.find(
            record => record.teacher === parseInt(teacherId) && record.date === date
          );

          if (existingAttendance) {
            // Update existing record using PUT method
            await api.teacherAttendance.update(existingAttendance.id, attendanceRecord);
          } else {
            try {
              // Try to create new record
              await api.teacherAttendance.create(attendanceRecord);
            } catch (createError) {
              // If creation fails due to unique constraint, try to find and update
              if (createError.response?.data?.non_field_errors?.includes('The fields teacher, date must make a unique set')) {
                // Fetch the existing record
                const response = await api.teacherAttendance.getByDateRange(date, date, { teacher: teacherId });
                const existingRecord = response.data.results?.[0];
                
                if (existingRecord) {
                  // Update the existing record
                  await api.teacherAttendance.update(existingRecord.id, attendanceRecord);
                } else {
                  throw createError; // Re-throw if we can't find the record
                }
              } else {
                throw createError; // Re-throw other errors
              }
            }
          }
        } catch (error) {
          console.error(`Error saving attendance for teacher ${teacherId}:`, error);
          if (error.response?.data?.date) {
            message.error('Attendance can only be marked for today or yesterday');
          } else if (error.response?.data?.non_field_errors) {
            message.error(error.response.data.non_field_errors[0]);
          } else {
            message.error(`Error saving attendance for teacher ID ${teacherId}`);
          }
          throw error; // Re-throw to stop the process
        }
      }

      message.success('Attendance saved successfully');
      loadAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      // Error messages are already shown in the loop
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (values) => {
    setSelectedTeacher(values.teacher);
    if (values.dateRange) {
      setDateRange(values.dateRange);
    }
  };

  const handleResetFilters = () => {
    filterForm.resetFields();
    setSelectedTeacher(null);
    setDateRange([moment().subtract(30, 'days'), moment()]);
  };

  const handleUpdateAttendance = async (recordId, newStatus) => {
    try {
      setUpdateLoading(true);
      const response = await api.teacherAttendance.update(recordId, { status: newStatus.toLowerCase() });
      if (response && response.data) {
        message.success('Attendance updated successfully');
        loadAttendance();
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      message.error('Failed to update attendance');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedRecords.length === 0) {
      message.warning('Please select records to update');
      return;
    }

    try {
      setUpdateLoading(true);
      const updateData = selectedRecords.map(record => ({
        id: record.id,
        status: record.status.toLowerCase()
      }));

      const response = await api.teacherAttendance.updateBulk(updateData);
      if (response && response.data) {
        message.success(`Successfully updated ${response.data.updated.length} records`);
        setSelectedRecords([]);
        loadAttendance();
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      message.error('Failed to update attendance records');
    } finally {
      setUpdateLoading(false);
    }
  };

  const markColumns = [
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
          {attendanceStatus[record.id] === 'leave' && (
            <TextArea
              placeholder="Enter leave details"
              value={attendanceDetails[record.id] || ''}
              onChange={(e) => handleDetailsChange(record.id, e.target.value)}
              rows={2}
              required
            />
          )}
        </Space>
      ),
    },
  ];

  const viewColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 150,
      render: (date) => (
        <Tag 
          style={{ 
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: '#f5f5f5',
            color: '#595959',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '24px',
            lineHeight: '1',
            margin: 0
          }}
        >
          <CalendarOutlined style={{ marginRight: '4px', color: '#7B83EB' }} />
          {moment(date).format('DD MMM YYYY')}
        </Tag>
      ),
    },
    {
      title: 'Employee ID',
      dataIndex: 'teacher',
      key: 'employeeId',
      width: 120,
      render: (teacherId) => {
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher ? (
          <Tag 
            style={{ 
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              background: '#f5f5f5',
              color: '#595959',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '24px',
              lineHeight: '1',
              margin: 0
            }}
          >
            {teacher.employeeId}
          </Tag>
        ) : '-';
      },
    },
    {
      title: 'Name',
      dataIndex: 'teacher',
      key: 'name',
      width: 200,
      render: (teacherId) => {
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher ? (
          <Button 
            type="link" 
            style={{ 
              padding: 0, 
              height: 'auto',
              fontSize: '15px',
              fontWeight: 500,
              color: '#595959',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#8c8c8c';
              e.currentTarget.style.transform = 'translateX(5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#595959';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            {teacher.name}
          </Button>
        ) : '-';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag 
          style={{ 
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            background: '#f5f5f5',
            color: status === 'present' ? '#73d13d' : status === 'absent' ? '#ffa940' : '#faad14',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'inline-flex',
            alignItems: 'center',
            height: '24px',
            lineHeight: '1'
          }}
        >
          {status === 'present' ? (
            <CheckCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#73d13d' }} />
          ) : status === 'absent' ? (
            <CloseCircleOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#ffa940' }} />
          ) : (
            <CalendarOutlined style={{ fontSize: '14px', marginRight: '4px', color: '#faad14' }} />
          )} 
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      width: 300,
      render: (details) => (
        <div style={{ 
          fontSize: '13px',
          color: '#595959',
          lineHeight: '1.5',
          maxWidth: '300px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {details || '-'}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        const isSelected = selectedRecords.some(r => r.id === record.id);
        if (!isSelected) return null;
        
        return (
          <Space>
            <Button
              type={record.status === 'present' ? 'primary' : 'default'}
              icon={<CheckCircleOutlined />}
              onClick={() => handleUpdateAttendance(record.id, 'present')}
              size="small"
              loading={updateLoading}
              style={{
                height: '24px',
                padding: '0 8px',
                fontSize: '12px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Present
            </Button>
            <Button
              type={record.status === 'absent' ? 'primary' : 'default'}
              icon={<CloseCircleOutlined />}
              onClick={() => handleUpdateAttendance(record.id, 'absent')}
              size="small"
              loading={updateLoading}
              style={{
                height: '24px',
                padding: '0 8px',
                fontSize: '12px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Absent
            </Button>
            <Button
              type={record.status === 'leave' ? 'primary' : 'default'}
              icon={<CalendarOutlined />}
              onClick={() => handleUpdateAttendance(record.id, 'leave')}
              size="small"
              loading={updateLoading}
              style={{
                height: '24px',
                padding: '0 8px',
                fontSize: '12px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Leave
            </Button>
          </Space>
        );
      },
    },
  ];

  const presentCount = Object.values(attendanceStatus).filter(status => status === 'present').length;
  const absentCount = Object.values(attendanceStatus).filter(status => status === 'absent').length;
  const leaveCount = Object.values(attendanceStatus).filter(status => status === 'leave').length;
  const totalCount = teachers.length;

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
            <img src="/business.png" alt="Attendance" style={{ width: '40px', height: '40px' }} />
            Teacher Attendance Management
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
              <Col xs={24} sm={12} md={12}>
                <DatePicker
                  style={{ width: '100%' }}
                  value={selectedDate}
                  onChange={setSelectedDate}
                  format="YYYY-MM-DD"
                  disabledDate={date => date.isAfter(moment())}
                />
              </Col>
            </Row>

            <Card style={{ margin: '0 16px 16px 16px' }}>
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

            <Card style={{ margin: '0 16px 16px 16px' }}>
              <Table
                columns={markColumns}
                dataSource={teachers}
                rowKey="id"
                pagination={false}
                scroll={{ x: true }}
                className="custom-table"
                loading={loading}
              />
            </Card>

            <div style={{ padding: '16px', textAlign: 'right' }}>
              <Button
                type="primary"
                onClick={handleSaveAttendance}
                loading={loading}
                disabled={Object.keys(attendanceStatus).length === 0}
              >
                Save Attendance
              </Button>
            </div>
          </>
        ) : (
          <>
            <Row gutter={[16, 16]} style={{ padding: '16px' }}>
              <Col xs={24} sm={12} md={8}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select Teacher"
                  onChange={setSelectedTeacher}
                  value={selectedTeacher}
                  allowClear
                >
                  {teachers.map(teacher => (
                    <Select.Option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <RangePicker
                  style={{ width: '100%' }}
                  value={dateRange}
                  onChange={setDateRange}
                  format="YYYY-MM-DD"
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Button
                  type="primary"
                  onClick={loadAttendance}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Load Records
                </Button>
              </Col>
            </Row>

            <Card style={{ margin: '0 16px 16px 16px' }}>
              <div style={{ 
                marginBottom: '16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0 16px'
              }}>
                <Typography.Text strong>
                  Selected Records: {selectedRecords.length}
                </Typography.Text>
                <Button
                  type="primary"
                  onClick={handleBulkUpdate}
                  disabled={selectedRecords.length === 0}
                  loading={updateLoading}
                >
                  Update Selected
                </Button>
              </div>
              <div style={{ 
                flex: 1, 
                overflow: 'hidden',
                padding: '0 16px 16px 16px'
              }}>
                <Table
                  columns={viewColumns}
                  dataSource={filteredAttendance}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: '100%', y: 500 }}
                  className="attendance-table"
                  loading={loading}
                  rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: selectedRecords.map(r => r.id),
                    onChange: (selectedRowKeys, selectedRows) => {
                      setSelectedRecords(selectedRows);
                    },
                    columnWidth: 40,
                    fixed: 'left'
                  }}
                  locale={{
                    emptyText: (
                      <div style={{ 
                        padding: '32px 0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px',
                        height: '500px',
                        justifyContent: 'center',
                        background: '#fafafa',
                        borderRadius: '8px',
                        margin: '16px'
                      }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          background: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '16px'
                        }}>
                          <img 
                            src="/business.png" 
                            alt="No Data" 
                            style={{ 
                              width: '40px', 
                              height: '40px',
                              opacity: 0.5
                            }} 
                          />
                        </div>
                        <Typography.Title level={4} style={{ 
                          color: '#8c8c8c',
                          margin: 0
                        }}>
                          No Data Available
                        </Typography.Title>
                        <Typography.Text style={{ 
                          color: '#bfbfbf',
                          fontSize: '14px',
                          textAlign: 'center',
                          maxWidth: '400px'
                        }}>
                          Select a teacher and date range to view attendance records. 
                          The data will appear here once you make your selection.
                        </Typography.Text>
                      </div>
                    )
                  }}
                />
              </div>
            </Card>
          </>
        )}
      </Card>

      <style>
        {`
          .attendance-table {
            flex: 1;
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #f0f0f0;
            height: 100%;
          }

          .attendance-table .ant-table {
            border-radius: 8px;
            overflow: hidden;
          }

          .attendance-table .ant-table-container {
            border-radius: 8px;
            overflow: hidden;
          }

          .attendance-table .ant-table-body {
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }

          .attendance-table .ant-spin-nested-loading {
            height: 100%;
          }

          .attendance-table .ant-spin-container {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .attendance-table .ant-table-placeholder {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent !important;
            height: 500px !important;
          }

          .attendance-table .ant-spin {
            max-height: none;
          }

          .attendance-table .ant-spin-blur {
            opacity: 0.5;
            filter: blur(1px);
            pointer-events: none;
          }

          .attendance-table .ant-spin-blur::after {
            opacity: 0.4;
            background: #fff;
          }

          .attendance-table .ant-table-thead > tr > th {
            background: rgba(123, 131, 235, 0.1) !important;
            color: #7B83EB !important;
            font-weight: 600;
            border-bottom: 1px solid #f0f0f0;
            padding: 4px 12px !important;
            white-space: nowrap;
            height: 32px;
            line-height: 1.2;
            font-size: 13px;
          }

          .attendance-table .ant-table-tbody > tr > td {
            padding: 4px 12px !important;
            white-space: nowrap;
            border-bottom: 1px solid #f0f0f0;
            height: 32px;
            line-height: 1.2;
            font-size: 13px;
          }

          .attendance-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none;
          }

          .attendance-table .ant-table-cell {
            padding: 4px 12px !important;
          }

          .attendance-table .ant-table-cell .ant-tag {
            margin: 0;
            padding: 4px 8px;
            font-size: 13px;
            height: 24px;
            line-height: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
          }

          .attendance-table .ant-table-cell .ant-btn {
            padding: 0 4px;
            height: 22px;
            font-size: 12px;
          }

          .attendance-table .ant-table-pagination {
            margin: 16px 0 !important;
            padding: 8px 8px !important;
            height: 32px;
            border-top: 1px solid #f0f0f0;
            background: #ffffff;
          }

          .attendance-table .ant-pagination-item {
            min-width: 24px;
            height: 24px;
            line-height: 22px;
            font-size: 12px;
            margin: 0 4px;
          }

          .attendance-table .ant-pagination-prev .ant-pagination-item-link,
          .attendance-table .ant-pagination-next .ant-pagination-item-link {
            min-width: 24px;
            height: 24px;
            line-height: 22px;
            font-size: 12px;
          }

          .attendance-table .ant-pagination-options {
            margin-left: 8px;
          }

          .attendance-table .ant-pagination-options-size-changer {
            margin-right: 0;
          }

          .attendance-table .ant-select-selector {
            height: 24px !important;
            line-height: 22px !important;
            padding: 0 8px !important;
          }

          .attendance-table .ant-select-selection-item {
            line-height: 22px !important;
            font-size: 12px;
          }

          .attendance-table .ant-pagination-item-active {
            background: #7B83EB !important;
            border-color: #7B83EB !important;
          }

          .attendance-table .ant-pagination-item-active a {
            color: white !important;
          }

          .attendance-table .ant-pagination-item:hover {
            border-color: #7B83EB !important;
          }

          .attendance-table .ant-pagination-prev:hover .ant-pagination-item-link,
          .attendance-table .ant-pagination-next:hover .ant-pagination-item-link {
            border-color: #7B83EB !important;
            color: #7B83EB !important;
          }

          .attendance-table .ant-checkbox-wrapper:hover .ant-checkbox-inner,
          .attendance-table .ant-checkbox:hover .ant-checkbox-inner,
          .attendance-table .ant-checkbox-input:focus + .ant-checkbox-inner {
            border-color: #7B83EB !important;
          }

          .attendance-table .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #7B83EB !important;
            border-color: #7B83EB !important;
          }

          .attendance-table .ant-checkbox-indeterminate .ant-checkbox-inner::after {
            background-color: #7B83EB !important;
          }
        `}
      </style>
    </div>
  );
};

export default TeacherAttendance; 
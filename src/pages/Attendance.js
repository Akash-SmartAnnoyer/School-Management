import React, { useState } from 'react';
import { Table, Select, Button, DatePicker, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const Attendance = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);

  const columns = [
    {
      title: 'Roll Number',
      dataIndex: 'rollNumber',
      key: 'rollNumber',
    },
    {
      title: 'Student Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Space>
          <Button
            type={status === 'present' ? 'primary' : 'default'}
            icon={<CheckOutlined />}
            onClick={() => handleStatusChange(record, 'present')}
          >
            Present
          </Button>
          <Button
            type={status === 'absent' ? 'primary' : 'default'}
            icon={<CloseOutlined />}
            onClick={() => handleStatusChange(record, 'absent')}
          >
            Absent
          </Button>
        </Space>
      ),
    },
  ];

  const handleClassChange = (value) => {
    setSelectedClass(value);
    // Fetch students for selected class
    // This is a mock data
    setAttendanceData([
      { id: 1, rollNumber: '001', name: 'John Doe', status: 'present' },
      { id: 2, rollNumber: '002', name: 'Jane Smith', status: 'absent' },
      { id: 3, rollNumber: '003', name: 'Mike Johnson', status: 'present' },
    ]);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleStatusChange = (record, status) => {
    const newData = attendanceData.map(item => {
      if (item.id === record.id) {
        return { ...item, status };
      }
      return item;
    });
    setAttendanceData(newData);
  };

  const handleSaveAttendance = () => {
    if (!selectedClass || !selectedDate) {
      message.error('Please select class and date');
      return;
    }
    // Implement save functionality
    message.success('Attendance saved successfully');
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200 }}
          placeholder="Select Class"
          onChange={handleClassChange}
        >
          <Select.Option value="1">Class 1</Select.Option>
          <Select.Option value="2">Class 2</Select.Option>
          <Select.Option value="3">Class 3</Select.Option>
          <Select.Option value="4">Class 4</Select.Option>
          <Select.Option value="5">Class 5</Select.Option>
        </Select>
        <DatePicker
          onChange={handleDateChange}
          placeholder="Select Date"
        />
        <Button
          type="primary"
          onClick={handleSaveAttendance}
        >
          Save Attendance
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={attendanceData}
        rowKey="id"
      />
    </div>
  );
};

export default Attendance; 
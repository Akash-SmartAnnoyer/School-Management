import React, { useState, useEffect, useContext } from 'react';
import { Modal, Input, Select, Space, Button, Typography, Divider, Alert } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useClasses } from '../contexts/ClassesContext';
import { useTeachers } from '../contexts/TeachersContext';

const { Title, Text } = Typography;
const { Option } = Select;

const SearchModal = ({ visible, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [transportationStatus, setTransportationStatus] = useState(null);
  const { classes } = useClasses();
  const { teachers } = useTeachers();

  // Reset all filters
  const handleReset = () => {
    setSearchText('');
    setSelectedClass(null);
    setSelectedTeacher(null);
    setTransportationStatus(null);
  };

  // Handle search
  const handleSearch = () => {
    // Implement search logic here
    console.log('Searching with:', {
      searchText,
      selectedClass,
      selectedTeacher,
      transportationStatus
    });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose]);

  return (
    <Modal
      title={
        <Space>
          <SearchOutlined style={{ color: '#7B83EB' }} />
          <Title level={5} style={{ margin: 0, color: '#7B83EB' }}>Search Students</Title>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      style={{ top: 20 }}
    >
      {/* <Alert
        message="Search Instructions"
        description={
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Search by student name, roll number, or admission number</li>
            <li>For multiple students, separate names with commas</li>
            <li>Use filters to narrow down results by class, teacher, or transportation status</li>
            <li>You can use both search and filters together</li>
          </ul>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      /> */}

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text strong>Search Student(s)</Text>
          <Input
            placeholder="Enter student name, roll number, or admission number"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined style={{ color: '#7B83EB' }} />}
            allowClear
          />
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
            For multiple students, separate names with commas (e.g., John Doe, Jane Smith)
          </Text>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        <div>
          <Text strong>Apply Filters</Text>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Class</Text>
              <Select
                style={{ width: '100%' }}
                placeholder="Select class"
                value={selectedClass}
                onChange={setSelectedClass}
                allowClear
              >
                {classes.map(cls => (
                  <Option key={cls.id} value={cls.id}>
                    {cls.class_name} - Section {cls.section}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Teacher</Text>
              <Select
                style={{ width: '100%' }}
                placeholder="Select teacher"
                value={selectedTeacher}
                onChange={setSelectedTeacher}
                allowClear
              >
                {teachers.map(teacher => (
                  <Option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Transportation Status</Text>
              <Select
                style={{ width: '100%' }}
                placeholder="Select transportation status"
                value={transportationStatus}
                onChange={setTransportationStatus}
                allowClear
              >
                <Option value="yes">Using Transportation</Option>
                <Option value="no">Not Using Transportation</Option>
              </Select>
            </div>
          </Space>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button 
            type="primary" 
            icon={<SearchOutlined />} 
            onClick={handleSearch}
            style={{ background: '#7B83EB' }}
          >
            Search
          </Button>
        </div>
      </Space>
    </Modal>
  );
};

export default SearchModal; 
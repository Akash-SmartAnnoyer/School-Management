import React, { useState, useEffect, useContext } from 'react';
import { Modal, Input, Select, Space, Button, Typography, Divider, Alert, Card, Radio } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined, UserOutlined, BookOutlined, CarOutlined, CloseOutlined } from '@ant-design/icons';
import { useClasses } from '../contexts/ClassesContext';
import { useTeachers } from '../contexts/TeachersContext';

const { Title, Text } = Typography;
const { Option } = Select;

const SearchModal = ({ visible, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [transportationStatus, setTransportationStatus] = useState(null);
  const [searchMode, setSearchMode] = useState('quick'); // 'quick' or 'filter'
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
    if (searchMode === 'quick' && !searchText.trim()) {
      return;
    }
    if (searchMode === 'filter' && !selectedClass && !selectedTeacher && !transportationStatus) {
      return;
    }
    // Implement search logic here
    console.log('Searching with:', {
      searchText,
      selectedClass,
      selectedTeacher,
      transportationStatus,
      searchMode
    });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault(); // Prevent browser's default search
        // You can add logic here to open the modal if needed
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose, searchMode, searchText, selectedClass, selectedTeacher, transportationStatus]);

  const modalStyles = {
    overlay: {
      backdropFilter: 'blur(8px)',
      background: 'rgba(0, 0, 0, 0.4)',
    },
    content: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      maxHeight: '80vh',
      overflowY: 'auto'
    }
  };

  const inputStyles = {
    borderRadius: '12px',
    border: '2px solid rgba(123, 131, 235, 0.1)',
    background: 'rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: '15px',
    padding: '12px 16px',
  };

  const selectStyles = {
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.8)',
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={680}
      style={{ top: 40 }}
      styles={{
        mask: modalStyles.overlay,
        content: modalStyles.content,
      }}
      destroyOnClose
      closeIcon={<div style={{ 
        position: 'absolute',
        right: '16px',
        top: '16px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}>
        <CloseOutlined style={{ fontSize: '12px', color: '#7B83EB' }} />
      </div>}
    >
      <div style={{ padding: '8px 0' }}>
        <Radio.Group 
          value={searchMode} 
          onChange={(e) => setSearchMode(e.target.value)}
          style={{ 
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px'
          }}
        >
          <Radio.Button value="quick" style={{ 
            borderRadius: '8px',
            padding: '4px 16px',
            fontWeight: '700',
            borderColor: searchMode === 'quick' ? '#7B83EB' : undefined,
            color: searchMode === 'quick' ? '#7B83EB' : undefined
          }}>
            Quick Search
          </Radio.Button>
          <Radio.Button value="filter" style={{ 
            borderRadius: '8px',
            fontWeight: '700',
            padding: '4px 16px',
            borderColor: searchMode === 'filter' ? '#7B83EB' : undefined,
            color: searchMode === 'filter' ? '#7B83EB' : undefined
          }}>
            Advanced Filters
          </Radio.Button>
        </Radio.Group>

        {searchMode === 'quick' ? (
          <Card
            style={{
              marginBottom: '24px',
              background: 'rgba(255, 255, 255, 0.6)',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ marginBottom: '12px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: '12px' 
              }}>
                <UserOutlined style={{ color: '#7B83EB', fontSize: '16px' }} />
                <Text strong style={{ fontSize: '16px', color: '#2c3e50' }}>
                  Quick Student Search
                </Text>
              </div>
              <Input
                placeholder="Search by name, roll number, or admission number..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined style={{ color: '#7B83EB', marginRight: '8px' }} />}
                allowClear
                size="large"
                style={{
                  ...inputStyles,
                  fontSize: '16px',
                  height: '50px',
                }}
                onPressEnter={handleSearch}
              />
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: '13px', 
                  display: 'block', 
                  marginTop: '8px',
                  fontStyle: 'italic'
                }}
              >
                💡 Tip: Separate multiple names with commas for batch search
              </Text>
            </div>
          </Card>
        ) : (
          <Card
            style={{
              marginBottom: '24px',
              background: 'rgba(255, 255, 255, 0.6)',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginBottom: '20px' 
            }}>
              <FilterOutlined style={{ color: '#7B83EB', fontSize: '16px' }} />
              <Text strong style={{ fontSize: '16px', color: '#2c3e50' }}>
                Advanced Filters
              </Text>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px' 
            }}>
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  marginBottom: '8px' 
                }}>
                  <BookOutlined style={{ color: '#7B83EB', fontSize: '14px' }} />
                  <Text style={{ fontWeight: '500', color: '#34495e' }}>Class</Text>
                </div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select class"
                  value={selectedClass}
                  onChange={setSelectedClass}
                  allowClear
                  size="large"
                  dropdownStyle={{
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {classes.map(cls => (
                    <Option key={cls.id} value={cls.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOutlined style={{ color: '#7B83EB', fontSize: '12px' }} />
                        {cls.class_name} - Section {cls.section}
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  marginBottom: '8px' 
                }}>
                  <UserOutlined style={{ color: '#7B83EB', fontSize: '14px' }} />
                  <Text style={{ fontWeight: '500', color: '#34495e' }}>Teacher</Text>
                </div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select teacher"
                  value={selectedTeacher}
                  onChange={setSelectedTeacher}
                  allowClear
                  size="large"
                  dropdownStyle={{
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {teachers.map(teacher => (
                    <Option key={teacher.id} value={teacher.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserOutlined style={{ color: '#7B83EB', fontSize: '12px' }} />
                        {teacher.name}
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  marginBottom: '8px' 
                }}>
                  <CarOutlined style={{ color: '#7B83EB', fontSize: '14px' }} />
                  <Text style={{ fontWeight: '500', color: '#34495e' }}>Transport</Text>
                </div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Transportation status"
                  value={transportationStatus}
                  onChange={setTransportationStatus}
                  allowClear
                  size="large"
                  dropdownStyle={{
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <Option value="yes">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CarOutlined style={{ color: '#27ae60', fontSize: '12px' }} />
                      Using Transportation
                    </div>
                  </Option>
                  <Option value="no">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserOutlined style={{ color: '#e74c3c', fontSize: '12px' }} />
                      Not Using Transportation
                    </div>
                  </Option>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          marginTop: '24px'
        }}>
          <Space size="middle">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleReset}
              size="large"
              style={{
                borderRadius: '12px',
                border: '2px solid rgba(123, 131, 235, 0.2)',
                color: '#7B83EB',
                fontWeight: '500',
                height: '44px',
                transition: 'all 0.3s ease',
              }}
              className="reset-btn"
            >
              Reset {searchMode === 'filter' ? 'Filters' : 'Search'}
            </Button>
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              onClick={handleSearch}
              size="large"
              style={{
                background: 'linear-gradient(135deg, #7B83EB 0%, #9B59B6 100%)',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                height: '44px',
                minWidth: '140px',
                boxShadow: '0 8px 25px rgba(123, 131, 235, 0.4)',
                transition: 'all 0.3s ease',
              }}
              className="search-btn"
            >
              Search Students
            </Button>
          </Space>
        </div>
      </div>

      <style jsx>{`
        .reset-btn:hover {
          border-color: #7B83EB !important;
          color: #7B83EB !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(123, 131, 235, 0.2);
        }
        
        .search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(123, 131, 235, 0.5) !important;
        }

        .ant-select-selector {
          border-radius: 12px !important;
          border: 2px solid rgba(123, 131, 235, 0.1) !important;
          background: rgba(255, 255, 255, 0.8) !important;
          transition: all 0.3s ease !important;
        }

        .ant-select-focused .ant-select-selector {
          border-color: #7B83EB !important;
          box-shadow: 0 0 0 4px rgba(123, 131, 235, 0.1) !important;
        }

        .ant-input:focus, .ant-input-focused {
          border-color: #7B83EB !important;
          box-shadow: 0 0 0 4px rgba(123, 131, 235, 0.1) !important;
        }

        .ant-card {
          transition: all 0.3s ease;
        }

        .ant-card:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
          transform: translateY(-2px);
        }

        .ant-radio-button-wrapper {
          border-radius: 8px !important;
          margin: 0 4px;
        }

        .ant-radio-button-wrapper:first-child {
          border-radius: 8px 0 0 8px !important;
        }

        .ant-radio-button-wrapper:last-child {
          border-radius: 0 8px 8px 0 !important;
        }
      `}</style>
    </Modal>
  );
};

export default SearchModal;
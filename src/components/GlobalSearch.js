import React, { useState, useEffect, useRef } from 'react';
import { Input, Card, Avatar, List, Tag, Typography, Spin, Empty, Space, Drawer, Button } from 'antd';
import { SearchOutlined, UserOutlined, TeamOutlined, BookOutlined, HomeOutlined, MailOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { getCloudinaryImage } from '../services/imageService';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToCollection } from '../firebase/services';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Text, Title } = Typography;

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dyr02bpil'
  }
});

const GlobalSearch = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);

  useEffect(() => {
    const unsubscribeStudents = subscribeToCollection('students', (data) => {
      setStudents(data);
    });
    const unsubscribeTeachers = subscribeToCollection('teachers', (data) => {
      setTeachers(data);
    });
    const unsubscribeParents = subscribeToCollection('parents', (data) => {
      setParents(data);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeTeachers();
      unsubscribeParents();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterResults = (data, searchTerm) => {
    if (!searchTerm) return [];
    return data.filter(item => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact?.includes(searchTerm)
    );
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    setLoading(true);
    setShowResults(true);

    // Filter results based on user role
    let results = [];
    const searchTerm = value.toLowerCase();

    if (currentUser.role === 'PRINCIPAL') {
      results = [
        ...filterResults(students, searchTerm).map(s => ({ ...s, type: 'student' })),
        ...filterResults(teachers, searchTerm).map(t => ({ ...t, type: 'teacher' })),
        ...filterResults(parents, searchTerm).map(p => ({ ...p, type: 'parent' }))
      ];
    } else if (currentUser.role === 'TEACHER') {
      // Teachers can only see their students and their parents
      const teacherStudents = students.filter(s => s.teacherId === currentUser.id);
      results = [
        ...filterResults(teacherStudents, searchTerm).map(s => ({ ...s, type: 'student' })),
        ...filterResults(parents.filter(p => 
          teacherStudents.some(s => s.parentId === p.id)
        ), searchTerm).map(p => ({ ...p, type: 'parent' }))
      ];
    } else if (currentUser.role === 'PARENT') {
      // Parents can only see their children and their teachers
      const parentStudents = students.filter(s => s.parentId === currentUser.id);
      results = [
        ...filterResults(parentStudents, searchTerm).map(s => ({ ...s, type: 'student' })),
        ...filterResults(teachers.filter(t => 
          parentStudents.some(s => s.teacherId === t.id)
        ), searchTerm).map(t => ({ ...t, type: 'teacher' }))
      ];
    } else if (currentUser.role === 'STUDENT') {
      // Students can only see their own info and their teachers
      results = [
        ...filterResults(students.filter(s => s.id === currentUser.id), searchTerm).map(s => ({ ...s, type: 'student' })),
        ...filterResults(teachers.filter(t => t.id === currentUser.teacherId), searchTerm).map(t => ({ ...t, type: 'teacher' }))
      ];
    }

    setSearchResults(results);
    setLoading(false);
  };

  const getAvatarColor = (type) => {
    switch (type) {
      case 'student': return '#1890ff';
      case 'teacher': return '#52c41a';
      case 'parent': return '#722ed1';
      default: return '#1890ff';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'student': return <UserOutlined />;
      case 'teacher': return <TeamOutlined />;
      case 'parent': return <HomeOutlined />;
      default: return <UserOutlined />;
    }
  };

  const renderAvatar = (item) => {
    if (item.profilePublicId) {
      return (
        <AdvancedImage 
          cldImg={getCloudinaryImage(item.profilePublicId)}
          style={{ width: 40, height: 40, borderRadius: '50%' }}
        />
      );
    }
    return (
      <Avatar 
        style={{ backgroundColor: getAvatarColor(item.type) }}
        icon={getIcon(item.type)}
      />
    );
  };

  const handleUserClick = (item) => {
    setSelectedUser(item);
    setDrawerVisible(true);
    setShowResults(false);
  };

  const handleViewDetails = () => {
    setDrawerVisible(false);
    switch (selectedUser.type) {
      case 'student':
        navigate(`/students?view=${selectedUser.id}&highlight=true`);
        break;
      case 'teacher':
        navigate(`/teachers?view=${selectedUser.id}&highlight=true`);
        break;
      case 'parent':
        navigate(`/parents?view=${selectedUser.id}&highlight=true`);
        break;
      default:
        break;
    }
  };

  const renderUserDetails = () => {
    if (!selectedUser) return null;

    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {selectedUser.profilePublicId ? (
            <AdvancedImage 
              cldImg={getCloudinaryImage(selectedUser.profilePublicId)}
              style={{ width: 120, height: 120, borderRadius: '50%', marginBottom: 16 }}
            />
          ) : (
            <Avatar 
              size={120}
              style={{ backgroundColor: getAvatarColor(selectedUser.type) }}
              icon={getIcon(selectedUser.type)}
            />
          )}
          <Title level={3}>{selectedUser.name}</Title>
          <Tag color={getAvatarColor(selectedUser.type)} style={{ fontSize: '16px', padding: '4px 12px' }}>
            {selectedUser.type.charAt(0).toUpperCase() + selectedUser.type.slice(1)}
          </Tag>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Title level={4}>Contact Information</Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space>
              <MailOutlined />
              <Text>{selectedUser.email}</Text>
            </Space>
            {selectedUser.contact && (
              <Space>
                <PhoneOutlined />
                <Text>{selectedUser.contact}</Text>
              </Space>
            )}
          </Space>
        </div>

        {selectedUser.type === 'student' && (
          <div style={{ marginBottom: 24 }}>
            <Title level={4}>Academic Information</Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {selectedUser.className && (
                <Space>
                  <BookOutlined />
                  <Text>Class: {selectedUser.className}</Text>
                </Space>
              )}
              {selectedUser.rollNumber && (
                <Space>
                  <CalendarOutlined />
                  <Text>Roll Number: {selectedUser.rollNumber}</Text>
                </Space>
              )}
            </Space>
          </div>
        )}

        {selectedUser.type === 'teacher' && (
          <div style={{ marginBottom: 24 }}>
            <Title level={4}>Professional Information</Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {selectedUser.subject && (
                <Space>
                  <BookOutlined />
                  <Text>Subject: {selectedUser.subject}</Text>
                </Space>
              )}
              {selectedUser.qualification && (
                <Space>
                  <CalendarOutlined />
                  <Text>Qualification: {selectedUser.qualification}</Text>
                </Space>
              )}
            </Space>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <Button type="primary" size="large" onClick={handleViewDetails}>
            View Full Profile
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
      <Search
        placeholder="Search for students, teachers, or parents..."
        allowClear
        enterButton={<SearchOutlined />}
        size="small"
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        onSearch={handleSearch}
        style={{ width: '100%' }}
      />
      
      {showResults && (
        <Card
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            marginTop: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxHeight: '400px',
            overflow: 'auto'
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
            </div>
          ) : searchResults.length > 0 ? (
            <List
              dataSource={searchResults}
              renderItem={item => (
                <List.Item 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleUserClick(item)}
                >
                  <List.Item.Meta
                    avatar={renderAvatar(item)}
                    title={
                      <Space>
                        <Text strong>{item.name}</Text>
                        <Tag color={getAvatarColor(item.type)}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">{item.email}</Text>
                        {item.contact && <Text type="secondary">{item.contact}</Text>}
                        {item.type === 'student' && item.className && (
                          <Text type="secondary">Class: {item.className}</Text>
                        )}
                        {item.type === 'teacher' && item.subject && (
                          <Text type="secondary">Subject: {item.subject}</Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description="No results found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '20px' }}
            />
          )}
        </Card>
      )}

      <Drawer
        title="User Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        {renderUserDetails()}
      </Drawer>
    </div>
  );
};

export default GlobalSearch; 
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Input, Space, Avatar, Badge, Dropdown, Tooltip, ConfigProvider, message } from 'antd';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { getCloudinaryImage } from './services/imageService';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  BankOutlined,
  FileTextOutlined,
  MessageOutlined,
  SettingOutlined,
  ShopOutlined,
  CarOutlined,
  HomeOutlined,
  WalletOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  SearchOutlined,
  PlusOutlined,
  FileAddOutlined,
  NotificationOutlined,
  FormatPainterOutlined,
  LockOutlined
} from '@ant-design/icons';
import './App.css';
import GlobalSearch from './components/GlobalSearch';
import ThemeConfigurator from './components/ThemeConfigurator';
import TeacherManagement from './pages/TeacherManagement';
import Profile from './pages/Profile';
import AccountSettings from './pages/AccountSettings';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import SchoolLoader from './components/SchoolLoader';

// Import pages
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Login from './pages/Login';
import Academics from './pages/Academics';
import ExamManagement from './pages/ExamManagement';
import AcademicCalendar from './pages/AcademicCalendar';
import TeacherAttendance from './pages/TeacherAttendance';
import Timetable from './pages/Timetable';
import AttendanceReport from './pages/AttendanceReport';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MessageProvider } from './contexts/MessageContext';
import SchoolLogo from './components/SchoolLogo';
import FeeManagement from './pages/FeeManagement';
import { StudentsProvider } from './contexts/StudentsContext';
import { TeachersProvider } from './contexts/TeachersContext';
import { ClassesProvider } from './contexts/ClassesContext';
import AcademyLanding from './pages/AcademyLanding';
import SearchModal from './components/SearchModal';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, loading } = useAuth();
  const { isLoading } = useLoading();

  if (loading || isLoading) {
    return <SchoolLoader />;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [themeVisible, setThemeVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  // Add useEffect to load saved theme colors
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeColors');
    if (savedTheme) {
      const themeColors = JSON.parse(savedTheme);
      Object.entries(themeColors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });
    } else {
      // Set default theme if no saved theme exists
      const defaultTheme = {
        'primary-color': '#FF6B6B',
        'secondary-color': '#4ECDC4',
        'accent-color': '#FFE66D',
        'background-color': '#f7f9fc',
        'surface-color': '#ffffff',
        'text-primary': '#2D3436',
        'text-secondary': '#636E72',
        'border-color': '#DFE6E9',
        'hover-color': '#f1f2f6',
        'success-color': '#00B894',
        'warning-color': '#FDCB6E',
        'error-color': '#FF7675',
        'side-menu-bg': '#ffffff',
      };
      Object.entries(defaultTheme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });
      localStorage.setItem('themeColors', JSON.stringify(defaultTheme));
    }
  }, []);

  const menuItems = [
    { 
      key: 'search', 
      icon: <SearchOutlined />, 
      label: (
        <Space>
          <span>Search</span>
          <span style={{ 
            fontSize: '12px', 
            color: '#8c8c8c',
            background: '#f5f5f5',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #f0f0f0'
          }}>
            {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
          </span>
        </Space>
      ),
      onClick: () => setSearchModalVisible(true)
    },
    { key: '1', label: 'Dashboard', icon: <DashboardOutlined />, path: '/' },
    { key: '2', label: 'Academic Calendar', icon: <CalendarOutlined />, path: '/academic-calendar' },
    { key: '3', label: 'Students', icon: <UserOutlined />, path: '/students' },
    { key: '4', label: 'Teachers', icon: <TeamOutlined />, path: '/teachers' },
    { key: '5', label: 'Classes', icon: <BookOutlined />, path: '/classes' },
    { key: '6', label: 'Attendance', icon: <CalendarOutlined />, path: '/attendance' },
    { key: '7', label: 'Teacher Attendance', icon: <CalendarOutlined />, path: '/teacher-attendance' },
    // { key: '8', label: 'Attendance Reports', icon: <BarChartOutlined />, path: '/attendance-reports' },
    { key: '9', label: 'Academics', icon: <FileTextOutlined />, path: '/academics' },
    { key: '10', label: 'Timetable', icon: <CalendarOutlined />, path: '/timetable' },
    { key: '11', label: 'Fee Management', icon: <WalletOutlined />, path: '/fee-management' }
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      key: 'academy',
      icon: <BookOutlined />,
      label: '360 Academy',
      onClick: () => {
        const academyUrl = window.location.origin + '/360academy';
        window.open(academyUrl, '_blank', 'noopener,noreferrer');
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => {
        navigate('/login');
      },
    },
  ];

  const quickActions = [
    {
      key: 'addStudent',
      icon: <UserOutlined />,
      label: 'Add Student',
      onClick: () => navigate('/students'),
    },
    {
      key: 'addTeacher',
      icon: <TeamOutlined />,
      label: 'Add Teacher',
      onClick: () => navigate('/teachers'),
    },
    {
      key: 'markAttendance',
      icon: <CalendarOutlined />,
      label: 'Mark Attendance',
      onClick: () => navigate('/attendance'),
    },
    {
      key: 'addEvent',
      icon: <CalendarOutlined />,
      label: 'Add Calendar Event',
      onClick: () => navigate('/academic-calendar'),
    },
    {
      type: 'divider',
    },
    {
      key: 'theme',
      icon: <FormatPainterOutlined />,
      label: 'Theme Settings',
      onClick: () => setThemeVisible(true),
    },
  ];

  const handleThemeChange = (field, value) => {
    if (field === 'reset') {
      // Reset to default theme
      const defaultTheme = {
        'primary-color': '#FF6B6B',
        'secondary-color': '#4ECDC4',
        'accent-color': '#FFE66D',
        'background-color': '#f7f9fc',
        'surface-color': '#ffffff',
        'text-primary': '#2D3436',
        'text-secondary': '#636E72',
        'border-color': '#DFE6E9',
        'hover-color': '#f1f2f6',
        'success-color': '#00B894',
        'warning-color': '#FDCB6E',
        'error-color': '#FF7675',
        'side-menu-bg': '#ffffff',
      };
      Object.entries(defaultTheme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });
      localStorage.setItem('themeColors', JSON.stringify(defaultTheme));
    } else {
      // Update specific color
      const cssVar = field.replace(/([A-Z])/g, '-$1').toLowerCase();
      document.documentElement.style.setProperty(`--${cssVar}`, value);

      // Save to localStorage
      const savedTheme = JSON.parse(localStorage.getItem('themeColors') || '{}');
      savedTheme[cssVar] = value;
      localStorage.setItem('themeColors', JSON.stringify(savedTheme));
    }
  };

  const handleMenuClick = ({ key }) => {
    const selectedItem = menuItems.find(item => item.key === key);
    if (selectedItem) {
      navigate(selectedItem.path);
      if (window.innerWidth < 992) {
        setCollapsed(true);
      }
    }
  };

  const handleDropdownClick = ({ key }) => {
    switch (key) {
      case 'profile':
        navigate('/profile');
        break;
      case 'password':
        navigate('/change-password');
        break;
      case 'theme':
        setThemeVisible(true);
        break;
      case 'academy':
        navigate('/360academy');
        break;
      case 'signout':
        navigate('/login');
        break;
      default:
        break;
    }
  };

  // Add this function to get the current selected key
  const getSelectedKey = () => {
    const currentPath = location.pathname;
    const selectedItem = menuItems.find(item => item.path === currentPath);
    return selectedItem ? [selectedItem.key] : [];
  };

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalVisible(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: '#ffffff',
          boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div 
          className="logo" 
          style={{ 
            height: 'auto', 
            padding: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexDirection: collapsed ? 'column' : 'row', 
            gap: 8,
            margin: '16px 16px 4px 16px',
            borderRadius: '8px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '1px solid #e0e0e0',
            backgroundColor: 'transparent',
            boxShadow: 'none'
          }}
        >
          <div className="school-icon">
            <img
              src="/logo-transparent-png.png"
              alt="App Logo"
              style={{
                width: collapsed ? '32px' : '24px',
                height: collapsed ? '32px' : '24px',
                objectFit: 'contain',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
          {!collapsed && (
            <Title level={5} style={{ 
              color: '#7B83EB', 
              margin: 0, 
              fontWeight: 500, 
              fontSize: '11px',
              // lineHeight: '1.2'
            }}>
              360 Schooling
            </Title>
          )}
        </div>
        <div style={{
          height: '1px',
          backgroundColor: '#e0e0e0',
          margin: '0 8px 8px 8px',
          width: 'calc(100% - 16px)'
        }} />
        <div style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={getSelectedKey()}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0 8px',
              flex: 1,
              overflow: 'auto'
            }}
            className="custom-menu"
          />
        </div>
        <div style={{
          height: '1px',
          backgroundColor: '#e0e0e0',
          margin: '0 8px 8px 8px',
          width: 'calc(100% - 16px)'
        }} />
        <div style={{
          padding: '8px',
          marginBottom: '8px'
        }}>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'title',
                  label: (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      padding: '8px 0',
                      marginBottom: '2px'
                    }}>
                      <img
                        src="/logo-transparent-png.png"
                        alt="App Logo"
                        style={{
                          width: '24px',
                          height: '24px',
                          objectFit: 'contain'
                        }}
                      />
                      <span style={{ 
                        color: '#7B83EB', 
                        fontWeight: 500, 
                        fontSize: '11px',
                        // lineHeight: '1.2'
                      }}>
                        360 Schooling
                      </span>
                    </div>
                  ),
                  disabled: true
                },
                {
                  type: 'divider'
                },
                {
                  key: 'profile',
                  icon: <UserOutlined />,
                  label: 'Edit Profile',
                },
                {
                  key: 'password',
                  icon: <LockOutlined />,
                  label: 'Change Password',
                },
                {
                  key: 'theme',
                  icon: <FormatPainterOutlined />,
                  label: 'Theme Settings',
                },
                {
                  key: 'academy',
                  icon: <BookOutlined />,
                  label: '360 Academy',
                },
                {
                  type: 'divider',
                },
                {
                  key: 'signout',
                  icon: <LogoutOutlined />,
                  label: 'Sign Out',
                  danger: true,
                },
              ],
              onClick: handleDropdownClick
            }}
            placement="topRight"
            trigger={['hover']}
          >
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                ':hover': {
                  borderColor: '#7B83EB',
                }
              }}
            >
              <Avatar
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#7B83EB',
                  width: collapsed ? '32px' : '24px',
                  height: collapsed ? '32px' : '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
              {!collapsed && (
                <span style={{
                  color: '#7B83EB',
                  fontSize: '11px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  Usha Vidyalayam
                </span>
              )}
            </div>
          </Dropdown>
        </div>
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          height: '64px',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          {/* Left Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: '1'
          }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 0,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7B83EB'
              }}
            />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: '200px'
            }}>
              <Title level={5} style={{ margin: 0, color: '#7B83EB' }}>
                Usha Vidyalayam
              </Title>
            </div>
          </div>

          {/* Center Section - Search */}
          <div style={{
            flex: '2',
            maxWidth: '300px',
            margin: '0 24px',
            marginTop: '40px'
          }}>
            <GlobalSearch />
          </div>

          {/* Right Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flex: '1',
            justifyContent: 'flex-end'
          }}>
            <Space>
              <Dropdown menu={{ items: quickActions }} placement="bottomRight">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    background: '#7B83EB',
                    borderColor: '#7B83EB',
                    boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                    transition: 'all 0.3s ease'
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
                  size="small"
                >
                  Quick Actions
                </Button>
              </Dropdown>

              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Space style={{
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.3s',
                  ':hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}>
                  <Avatar
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: '#7B83EB',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(159, 179, 223, 0.2)'
                    }}
                  />
                  <span style={{
                    color: '#1f1f1f',
                    fontWeight: 500
                  }}>
                    Admin
                  </span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content style={{
          margin: '16px',
          padding: '16px',
          background: '#fff',
          borderRadius: '4px',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          minHeight: 'calc(100vh - 96px)'
        }}>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/students" element={
              <ProtectedRoute>
                <Students />
              </ProtectedRoute>
            } />
            <Route path="/teachers" element={
              <ProtectedRoute>
                <Teachers />
              </ProtectedRoute>
            } />
            <Route path="/classes" element={
              <ProtectedRoute>
                <Classes />
              </ProtectedRoute>
            } />
            <Route path="/attendance" element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            } />
            <Route path="/academics" element={
              <ProtectedRoute>
                <Academics />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/exam-management" element={
              <ProtectedRoute>
                <ExamManagement />
              </ProtectedRoute>
            } />
            <Route path="/academic-calendar" element={
              <ProtectedRoute>
                <AcademicCalendar />
              </ProtectedRoute>
            } />
            <Route path="/teacher-attendance" element={
              <ProtectedRoute>
                <TeacherAttendance />
              </ProtectedRoute>
            } />
            <Route path="/attendance-reports" element={
              <ProtectedRoute>
                <AttendanceReport />
              </ProtectedRoute>
            } />
            <Route path="/timetable/*" element={
              <ProtectedRoute>
                <Timetable />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            } />
            <Route path="/fee-management" element={
              <ProtectedRoute>
                <FeeManagement />
              </ProtectedRoute>
            } />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <Profile showPasswordSection={true} />
              </ProtectedRoute>
            } />
          </Routes>
        </Content>
      </Layout>
      <ThemeConfigurator
        visible={themeVisible}
        onClose={() => setThemeVisible(false)}
        onThemeChange={handleThemeChange}
      />
      <SearchModal 
        visible={searchModalVisible} 
        onClose={() => setSearchModalVisible(false)} 
      />
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <MessageProvider>
        <StudentsProvider>
          <TeachersProvider>
            <ClassesProvider>
              <LoadingProvider>
                <Router>
                  <ConfigProvider
                    theme={{
                      token: {
                        colorPrimary: '#7B83EB',
                      },
                    }}
                  >
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/360academy" element={<AcademyLanding />} />
                      <Route
                        path="/*"
                        element={
                          <ProtectedRoute>
                            <MainLayout />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </ConfigProvider>
                </Router>
              </LoadingProvider>
            </ClassesProvider>
          </TeachersProvider>
        </StudentsProvider>
      </MessageProvider>
    </AuthProvider>
  );
}

export default App;

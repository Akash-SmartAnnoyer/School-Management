import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
  FormatPainterOutlined
} from '@ant-design/icons';
import './App.css';
import GlobalSearch from './components/GlobalSearch';
import ThemeConfigurator from './components/ThemeConfigurator';
import TeacherManagement from './pages/TeacherManagement';
import Profile from './pages/Profile';
import AccountSettings from './pages/AccountSettings';
import Sidebar from './components/Sidebar';

// Import pages
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Login from './pages/Login';
import Academics from './pages/Academics';
import AuthProvider, { useAuth, ROLES } from './contexts/AuthContext';
import ExamManagement from './pages/ExamManagement';
import AcademicCalendar from './pages/AcademicCalendar';
import TeacherAttendance from './pages/TeacherAttendance';
import Timetable from './pages/Timetable';
import AttendanceReport from './pages/AttendanceReport';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser } = useAuth();
  
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
  const { currentUser, logout, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [themeVisible, setThemeVisible] = useState(false);

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
        'side-menu-bg': '#001529',
      };
      Object.entries(defaultTheme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });
      localStorage.setItem('themeColors', JSON.stringify(defaultTheme));
    }
  }, []);

  // Add loading check
  if (loading) {
    return null; // or return a loading spinner component
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const menuItems = [
    { key: '1', label: 'Dashboard', icon: <DashboardOutlined />, path: '/' },
    { key: '2', label: 'Academic Calendar', icon: <CalendarOutlined />, path: '/academic-calendar' },
    { key: '3', label: 'Students', icon: <UserOutlined />, path: '/students' },
    { key: '4', label: 'Teachers', icon: <TeamOutlined />, path: '/teachers' },
    { key: '5', label: 'Classes', icon: <BookOutlined />, path: '/classes' },
    { key: '6', label: 'Attendance', icon: <CalendarOutlined />, path: '/attendance' },
    { key: '7', label: 'Teacher Attendance', icon: <CalendarOutlined />, path: '/teacher-attendance' },
    { key: '8', label: 'Attendance Reports', icon: <BarChartOutlined />, path: '/attendance-reports' },
    { key: '9', label: 'Academics', icon: <FileTextOutlined />, path: '/academics' },
    { key: '10', label: 'Timetable', icon: <CalendarOutlined />, path: '/timetable' }
  ].filter(item => {
    // Add null check for currentUser
    if (!currentUser?.role) {
      return true; // Return all items if role is not defined
    }

    // Filter menu items based on user role
    if (currentUser.role === ROLES.TEACHER) {
      return !['teachers', 'teacher-attendance'].includes(item.path?.slice(1));
    }
    if (currentUser.role === ROLES.PARENT || currentUser.role === ROLES.STUDENT) {
      return ['/', '/academic-calendar', '/attendance', '/academics', '/attendance-reports'].includes(item.path);
    }
    return true; // Show all items for PRINCIPAL
  });

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
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => {
        logout();
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
  ].filter(action => {
    // Filter quick actions based on user role
    if (currentUser.role === ROLES.TEACHER) {
      return ['markAttendance', 'addNotice', 'theme'].includes(action.key);
    }
    if (currentUser.role === ROLES.PARENT || currentUser.role === ROLES.STUDENT) {
      return ['theme'].includes(action.key);
    }
    return true; // Show all actions for PRINCIPAL
  });

  const teacherMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'students',
      icon: <TeamOutlined />,
      label: 'Students',
    },
    {
      key: 'exams',
      icon: <FileTextOutlined />,
      label: 'Exam Management',
    },
    {
      key: 'attendance',
      icon: <CalendarOutlined />,
      label: 'Attendance',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
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
        'side-menu-bg': '#001529',
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
          background: 'var(--side-menu-bg)',
        }}
      >
        <div 
          className="logo" 
          style={{ 
            height: 64,
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            margin: '16px',
            borderRadius: '4px',
            overflow: 'hidden',
            transition: 'all 0.3s'
          }}
        >
          <Title 
            level={4} 
            style={{ 
              color: '#fff',
              margin: 0,
              whiteSpace: 'nowrap',
              opacity: collapsed ? 0 : 1,
              transition: 'opacity 0.3s',
              fontSize: collapsed ? '0' : '18px',
              textAlign: 'center',
              borderRadius: '16px'
            }}
          >
            Smart Schooling
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={menuItems}
          onClick={({ key }) => {
            const selectedItem = menuItems.find(item => item.key === key);
            if (selectedItem) {
              navigate(selectedItem.path);
              if (window.innerWidth < 992) {
                setCollapsed(true);
              }
            }
          }}
          style={{
            borderRight: 'none',
            padding: '0 4px',
            background: 'var(--side-menu-bg)',
            color: '#fff'
          }}
        />
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
                width: 48, 
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              minWidth: '200px'
            }}>
              <img 
                src={currentUser?.schoolLogo || "https://via.placeholder.com/40"} 
                alt="School Logo" 
                style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <Title level={5} style={{ margin: 0, color: '#1f1f1f' }}>
                {currentUser?.schoolName || 'School Name'}
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
                    gap: '2px'
                  }}
                  size="small"
                >
                  Quick Actions
                </Button>
              </Dropdown>
              
              {/* <Badge count={5}>
                <Button 
                  type="text" 
                  icon={<BellOutlined />}
                  style={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
              </Badge> */}
              
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
                  {currentUser?.profilePic ? (
                    <Avatar 
                      src={currentUser.profilePic}
                      style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Avatar 
                      icon={<UserOutlined />}
                      style={{ 
                        backgroundColor: '#1890ff',
                        width: 32,
                        height: 32
                      }}
                    />
                  )}
                  <span style={{ 
                    color: '#1f1f1f',
                    fontWeight: 500
                  }}>
                    {currentUser?.name || 'Admin'}
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="exam-management" element={<ExamManagement />} />
            <Route path="academic-calendar" element={<AcademicCalendar />} />
            <Route path="teacher-attendance" element={<TeacherAttendance />} />
            <Route path="attendance-reports" element={<AttendanceReport />} />
            <Route path="timetable/*" element={<Timetable />} />
            <Route
              path="/teachers"
              element={
                <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
                  <TeacherManagement />
                </ProtectedRoute>
              }
            />
            <Route path="/settings" element={<AccountSettings />} />
          </Routes>
        </Content>
      </Layout>
      <ThemeConfigurator 
        visible={themeVisible}
        onClose={() => setThemeVisible(false)}
        onThemeChange={handleThemeChange}
      />
    </Layout>
  );
}

// Create and export MessageContext
export const MessageContext = React.createContext(null);

function App() {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <MessageContext.Provider value={messageApi}>
        {contextHolder}
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={<MainLayout />} />
            </Routes>
          </Router>
        </AuthProvider>
      </MessageContext.Provider>
    </ConfigProvider>
  );
}

export default App;

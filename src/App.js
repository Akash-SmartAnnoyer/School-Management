import React, { useState, useEffect, useRef } from 'react';
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
  LockOutlined,
  UploadOutlined
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
import './styles/menu.css';

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
import QuickActionsModal from './components/QuickActionsModal';

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
  const [quickActionsModalVisible, setQuickActionsModalVisible] = useState(false);
  const [isStudentsPage, setIsStudentsPage] = useState(false);
  const [isTeachersPage, setIsTeachersPage] = useState(false);
  const [isClassesPage, setIsClassesPage] = useState(false);
  const [isStudentFormVisible, setIsStudentFormVisible] = useState(false);
  const studentsRef = useRef();
  const teachersRef = useRef(null);
  const classesRef = useRef(null);

  useEffect(() => {
    const path = location.pathname;
    setIsStudentsPage(path.startsWith('/students'));
    setIsTeachersPage(path === '/teachers');
    setIsClassesPage(path === '/classes');
    // Reset form visibility when path changes
    setIsStudentFormVisible(path.includes('/students/add') || path.includes('/students/edit/'));
  }, [location]);

  // Listen for student form visibility changes
  useEffect(() => {
    const studentsElement = document.querySelector('.students-page');
    if (studentsElement) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-form-visible') {
            const isVisible = studentsElement.getAttribute('data-form-visible') === 'true';
            setIsStudentFormVisible(isVisible);
            // Update URL when form visibility changes
            if (isVisible && !location.pathname.includes('/students/add') && 
                !location.pathname.includes('/students/edit/') && 
                !location.pathname.includes('/students/view/')) {
              navigate('/students/add');
            } else if (!isVisible && (location.pathname.includes('/students/add') || 
                location.pathname.includes('/students/edit/') || 
                location.pathname.includes('/students/view/'))) {
              navigate('/students');
            }
          }
        });
      });

      observer.observe(studentsElement, { attributes: true });
      return () => observer.disconnect();
    }
  }, [isStudentsPage, location, navigate]);

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

  const styles = {
    menuItem: {
      fontSize: '12px',
      height: '40px',
      lineHeight: '40px',
      margin: '4px 0',
      // padding: '0 12px'
    },
    menuIcon: {
      fontSize: '16px',
      minWidth: '16px',
      marginRight: '2px'
    },
    logoContainer: {
      height: 'auto',
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexDirection: collapsed => collapsed ? 'column' : 'row',
      gap: 2,
      margin: '16px 0 4px 0',
      borderRadius: '8px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: 'none',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      position: 'relative',
      cursor: 'default'
    }
  };

  const menuItems = [
    { 
      key: 'search', 
      icon: <SearchOutlined style={styles.menuIcon} />, 
      label: (
        <Space size={4}>
          <span style={styles.menuItem}>Search</span>
          <span style={{ 
            fontSize: '10px', 
            color: '#8c8c8c',
            background: '#f5f5f5',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #f0f0f0'
          }}>
            {navigator.platform.includes('Mac') ? '⌘ + k' : 'ctrl + k'}
          </span>
        </Space>
      ),
      onClick: () => setSearchModalVisible(true)
    },
    { 
      key: '1', 
      label: <span style={styles.menuItem}>Dashboard</span>, 
      icon: <DashboardOutlined style={styles.menuIcon} />, 
      path: '/' 
    },
    { 
      key: '2', 
      label: <span style={styles.menuItem}>Academic Calendar</span>, 
      icon: <CalendarOutlined style={styles.menuIcon} />, 
      path: '/academic-calendar' 
    },
    { 
      key: '3', 
      label: <span style={styles.menuItem}>Students</span>, 
      icon: <UserOutlined style={styles.menuIcon} />, 
      path: '/students' 
    },
    { 
      key: '4', 
      label: <span style={styles.menuItem}>Teachers</span>, 
      icon: <TeamOutlined style={styles.menuIcon} />, 
      path: '/teachers' 
    },
    { 
      key: '5', 
      label: <span style={styles.menuItem}>Classes</span>, 
      icon: <BookOutlined style={styles.menuIcon} />, 
      path: '/classes' 
    },
    { 
      key: '6', 
      label: <span style={styles.menuItem}>Attendance</span>, 
      icon: <CalendarOutlined style={styles.menuIcon} />, 
      path: '/attendance' 
    },
    { 
      key: '7', 
      label: <span style={styles.menuItem}>Teacher Attendance</span>, 
      icon: <CalendarOutlined style={styles.menuIcon} />, 
      path: '/teacher-attendance' 
    },
    { 
      key: '9', 
      label: <span style={styles.menuItem}>Academics</span>, 
      icon: <FileTextOutlined style={styles.menuIcon} />, 
      path: '/academics' 
    },
    { 
      key: '10', 
      label: <span style={styles.menuItem}>Timetable</span>, 
      icon: <CalendarOutlined style={styles.menuIcon} />, 
      path: '/timetable' 
    },
    { 
      key: '11', 
      label: <span style={styles.menuItem}>Fee Management</span>, 
      icon: <WalletOutlined style={styles.menuIcon} />, 
      path: '/fee-management' 
    }
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

  const handleQuickActionClick = (action) => {
    switch (action.key) {
      case 'addStudent':
        navigate('/students');
        break;
      case 'addTeacher':
        navigate('/teachers');
        break;
      case 'markAttendance':
        navigate('/attendance');
        break;
      case 'addEvent':
        navigate('/academic-calendar');
        break;
      case 'theme':
        setThemeVisible(true);
        break;
      default:
        break;
    }
  };

  const handleCreateStudent = () => {
    if (studentsRef.current) {
      studentsRef.current.handleAdd();
    }
  };

  const handleCreateTeacher = () => {
    if (isTeachersPage) {
      // If we're on the teachers page, trigger the add teacher form
      if (teachersRef.current) {
        teachersRef.current.handleAdd();
      }
    } else {
      // If we're not on the teachers page, navigate there first
      navigate('/teachers');
    }
  };

  const handleCreateClass = () => {
    if (isClassesPage) {
      // If we're on the classes page, trigger the add class form
      if (classesRef.current) {
        classesRef.current.handleAdd();
      }
    } else {
      // If we're not on the classes page, navigate there first
      navigate('/classes');
    }
  };

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
          flexDirection: 'column',
          zIndex: 1000
        }}
        onMouseEnter={() => {
          if (collapsed) {
            const toggleIcon = document.querySelector('.sidebar-toggle');
            if (toggleIcon) {
              toggleIcon.style.opacity = '1';
              toggleIcon.style.transform = 'translateX(0)';
            }
          }
        }}
        onMouseLeave={() => {
          if (collapsed) {
            const toggleIcon = document.querySelector('.sidebar-toggle');
            if (toggleIcon) {
              toggleIcon.style.opacity = '0';
              toggleIcon.style.transform = 'translateX(-10px)';
            }
          }
        }}
      >
        <div 
          className="logo" 
          style={{ 
            height: 'auto', 
            padding: '0 12px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-start',
            flexDirection: collapsed ? 'column' : 'row', 
            gap: 2,
            margin: '16px 0 4px 0',
            borderRadius: '8px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: 'none',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            position: 'relative',
            cursor: 'default'
          }}
        >
          <div className="school-icon" style={{ 
            cursor: 'default',
            minWidth: '16px',
            display: 'flex',
            alignItems: 'center',
            marginRight: 2
          }}>
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
            <>
              <Title level={5} style={{ 
                color: '#7B83EB', 
                margin: 0, 
                padding: 0,
                fontWeight: 600, 
                fontSize: '14px',
                cursor: 'default',
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center',
                width: '100%'
              }}>
                360 Schooling
              </Title>
              <Tooltip title="Click to minimize the side menu" placement="right">
                <div
                  onClick={() => setCollapsed(true)}
                  style={{
                    position: 'absolute',
                    right: '-12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    zIndex: 1001,
                    background: '#fff',
                    borderRadius: '50%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    marginRight: '12px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(123, 131, 235, 0.2)';
                    e.currentTarget.style.background = '#f8f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                    e.currentTarget.style.background = '#fff';
                  }}
                >
                  <img
                    src="/close.png"
                    alt="Close"
                    style={{
                      width: '16px',
                      height: '16px',
                      objectFit: 'contain',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </Tooltip>
            </>
          )}
        </div>
        {/* <div style={{
          height: '1px',
          backgroundColor: '#e0e0e0',
          margin: '0 8px 8px 8px',
          width: 'calc(100% - 16px)'
        }} /> */}
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
              overflow: 'auto',
              fontSize: '12px'
            }}
            className="custom-menu"
            rootClassName="custom-menu-root"
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
                        fontSize: '10px',
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
                  fontSize: '10px',
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
      
      {/* Only show expand icon when sidebar is collapsed */}
      {collapsed && (
        <Tooltip title="Click to expand the side menu" placement="right">
          <div
            className="sidebar-toggle"
            onClick={() => setCollapsed(false)}
            style={{
              position: 'fixed',
              left: '65px',
              top: '20px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 9999,
              background: '#fff',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              opacity: 0,
              transform: 'translateX(-10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(123, 131, 235, 0.2)';
              e.currentTarget.style.background = '#f8f9ff';
            }}
            onMouseLeave={(e) => {
              const sidebar = document.querySelector('.ant-layout-sider');
              if (!sidebar?.matches(':hover')) {
                e.currentTarget.style.opacity = '0';
                e.currentTarget.style.transform = 'translateX(-10px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                e.currentTarget.style.background = '#fff';
              }
            }}
          >
            <img
              src="/open.png"
              alt="Open"
              style={{
                width: '16px',
                height: '16px',
                objectFit: 'contain',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
        </Tooltip>
      )}

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{
          padding: '0 24px',
          background: '#E6EBF0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          margin: 0,
          display: isStudentFormVisible ? 'none' : 'flex'
        }}>
          {/* Left Section - Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: '1'
          }}>
            {collapsed && (
              <div
                className="sidebar-toggle"
                onClick={() => setCollapsed(false)}
                style={{
                  position: 'fixed',
                  left: '65px',
                  top: '20px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  zIndex: 9999,
                  background: '#fff',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  opacity: 0,
                  transform: 'translateX(-10px)'
                }}
              >
                <img
                  src="/open.png"
                  alt="Open"
                  style={{
                    width: '16px',
                    height: '16px',
                    objectFit: 'contain',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: '200px'
            }}>
              <Title level={5} style={{ 
                margin: 0, 
                color: '#1f1f1f',
                fontWeight: 500,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {isStudentsPage ? (
                  <>
                    <img 
                      src="/students.png" 
                      alt="Students" 
                      style={{ 
                        width: '24px', 
                        height: '24px',
                        objectFit: 'contain'
                      }} 
                    />
                    <span>
                      <span style={{ color: '#1f1f1f' }}>Student </span>
                      <span style={{ color: '#f54278' }}>Management</span>
                      <span style={{ color: '#1f1f1f' }}> Portal</span>
                    </span>
                  </>
                ) : isTeachersPage ? (
                  <>
                    <img 
                      src="/training.png" 
                      alt="Teachers" 
                      style={{ 
                        width: '24px', 
                        height: '24px',
                        objectFit: 'contain'
                      }} 
                    />
                    <span>
                      <span style={{ color: '#1f1f1f' }}>Teacher </span>
                      <span style={{ color: '#44cf65' }}>Management</span>
                      <span style={{ color: '#1f1f1f' }}> Portal</span>
                    </span>
                  </>
                ) : isClassesPage ? (
                  <>
                    <img 
                      src="/seminar.png" 
                      alt="Classes" 
                      style={{ 
                        width: '24px', 
                        height: '24px',
                        objectFit: 'contain'
                      }} 
                    />
                    <span>
                      <span style={{ color: '#1f1f1f' }}>Class </span>
                      <span style={{ color: '#49e7f5' }}>Management</span>
                      <span style={{ color: '#1f1f1f' }}> Portal</span>
                    </span>
                  </>
                ) : location.pathname === '/' ? (
                  <>
                    <img 
                      src="/dashboard.png" 
                      alt="Dashboard" 
                      style={{ 
                        width: '24px', 
                        height: '24px',
                        objectFit: 'contain'
                      }} 
                    />
                    <span>
                      <span style={{ color: '#1f1f1f' }}>Dashboard </span>
                      <span style={{ color: '#7B83EB' }}>Overview</span>
                    </span>
                  </>
                ) : location.pathname === '/academic-calendar' ? (
                  <>
                    <img 
                      src="/calendar.png" 
                      alt="Academic Calendar" 
                      style={{ 
                        width: '24px', 
                        height: '24px',
                        objectFit: 'contain'
                      }} 
                    />
                    <span>
                      <span style={{ color: '#1f1f1f' }}>Academic </span>
                      <span style={{ color: '#FF6B6B' }}>Calendar</span>
                    </span>
                  </>
                ) : location.pathname === '/attendance' ? (
                  <>
                    <img 
                      src="/attendance.png" 
                      alt="Attendance" 
                      style={{ 
                        width: '24px', 
                        height: '24px',
                        objectFit: 'contain'
                      }} 
                    />
                    <span>
                      <span style={{ color: '#1f1f1f' }}>Student </span>
                      <span style={{ color: '#4ECDC4' }}>Attendance</span>
                    </span>
                  </>
                ) : location.pathname === '/academics' ? (
                  <>
                    <img 
                      src="/academics.png" 
                      alt="Academics" 
                      style={{ 
                        width: '24px', 
                        height: '24px',
                        objectFit: 'contain'
                      }} 
                    />
                    <span>
                      <span style={{ color: '#1f1f1f' }}>Academic </span>
                      <span style={{ color: '#FFE66D' }}>Management</span>
                    </span>
                  </>
                ) : location.pathname === '/timetable' ? (
                  <>
                    <img 
                      src="/timetable.png" 
                      alt="Timetable" 
                      style={{ 
                        width: '24px', 
                        height: '24px',
                        objectFit: 'contain'
                      }} 
                    />
                    <span>
                      <span style={{ color: '#1f1f1f' }}>Class </span>
                      <span style={{ color: '#00B894' }}>Timetable</span>
                    </span>
                  </>
                ) : location.pathname === '/fee-management' ? (
                  <>
                    <img 
                      src="/fee.png" 
                      alt="Fee Management" 
                      style={{ 
                        width: '24px', 
                        height: '24px',
                        objectFit: 'contain'
                      }} 
                    />
                    <span>
                      <span style={{ color: '#1f1f1f' }}>Fee </span>
                      <span style={{ color: '#FDCB6E' }}>Management</span>
                    </span>
                  </>
                ) : location.pathname === '/teacher-attendance' ? (
                  <>
                    <img 
                      src="/teacher-attendance.png" 
                      alt="Teacher Attendance" 
                      style={{ 
                        width: '24px', 
                        height: '24px',
                        objectFit: 'contain'
                      }} 
                    />
                    <span>
                      <span style={{ color: '#1f1f1f' }}>Teacher </span>
                      <span style={{ color: '#FF6B6B' }}>Attendance</span>
                    </span>
                  </>
                ) : (
                  <>
                    <img 
                      src="/logo-transparent-png.png" 
                      alt="Logo" 
                      style={{ 
                        width: '24px', 
                        height: '24px',
                        objectFit: 'contain'
                      }} 
                    />
                    <span>360 Schooling</span>
                  </>
                )}
              </Title>
            </div>
          </div>

          {/* Right Section - Quick Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            justifyContent: 'flex-end'
          }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setQuickActionsModalVisible(true)}
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
          </div>
        </Header>
        <Content style={{ margin: '0 16px', overflow: 'initial' }}>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/students" element={
              <ProtectedRoute>
                <Students ref={studentsRef} />
              </ProtectedRoute>
            } />
            <Route path="/students/add" element={
              <ProtectedRoute>
                <Students ref={studentsRef} />
              </ProtectedRoute>
            } />
            <Route path="/students/edit/:id" element={
              <ProtectedRoute>
                <Students ref={studentsRef} />
              </ProtectedRoute>
            } />
            <Route path="/students/view/:id" element={
              <ProtectedRoute>
                <Students ref={studentsRef} />
              </ProtectedRoute>
            } />
            <Route path="/teachers" element={
              <ProtectedRoute>
                <Teachers ref={teachersRef} />
              </ProtectedRoute>
            } />
            <Route path="/classes" element={
              <ProtectedRoute>
                <Classes ref={classesRef} />
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
      <QuickActionsModal
        visible={quickActionsModalVisible}
        onClose={() => setQuickActionsModalVisible(false)}
        onActionClick={handleQuickActionClick}
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

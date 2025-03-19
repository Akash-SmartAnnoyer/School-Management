import React, { useState } from 'react';
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
  NotificationOutlined
} from '@ant-design/icons';
import './App.css';
import GlobalSearch from './components/GlobalSearch';

// Import pages
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Login from './pages/Login';
import Academics from './pages/Academics';
import Parents from './pages/Parents';
import Administration from './pages/Administration';
import Finance from './pages/Finance';
import Reports from './pages/Reports';
import Communication from './pages/Communication';
import Profile from './pages/Profile';
import AuthProvider, { useAuth, ROLES } from './contexts/AuthContext';
import ExamManagement from './pages/ExamManagement';

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
  const { currentUser, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { key: '1', label: 'Dashboard', icon: <DashboardOutlined />, path: '/' },
    { key: '2', label: 'Students', icon: <UserOutlined />, path: '/students' },
    { key: '3', label: 'Teachers', icon: <TeamOutlined />, path: '/teachers' },
    { key: '4', label: 'Classes', icon: <BookOutlined />, path: '/classes' },
    { key: '5', label: 'Attendance', icon: <CalendarOutlined />, path: '/attendance' },
    { key: '6', label: 'Academics', icon: <FileTextOutlined />, path: '/academics' },
    { key: '7', label: 'Parents', icon: <HomeOutlined />, path: '/parents' },
    { key: '8', label: 'Administration', icon: <SettingOutlined />, path: '/administration' },
    { key: '9', label: 'Finance', icon: <WalletOutlined />, path: '/finance' },
    { key: '10', label: 'Reports', icon: <BarChartOutlined />, path: '/reports' },
    { key: '11', label: 'Communication', icon: <MessageOutlined />, path: '/communication' },
  ].filter(item => {
    // Filter menu items based on user role
    if (currentUser.role === ROLES.TEACHER) {
      return !['teachers', 'administration', 'finance'].includes(item.path.slice(1));
    }
    if (currentUser.role === ROLES.PARENT || currentUser.role === ROLES.STUDENT) {
      return ['/', '/attendance', '/academics', '/communication'].includes(item.path);
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
      key: 'addNotice',
      icon: <NotificationOutlined />,
      label: 'Add Notice',
      onClick: () => navigate('/communication'),
    },
  ].filter(action => {
    // Filter quick actions based on user role
    if (currentUser.role === ROLES.TEACHER) {
      return ['markAttendance', 'addNotice'].includes(action.key);
    }
    if (currentUser.role === ROLES.PARENT || currentUser.role === ROLES.STUDENT) {
      return false;
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

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

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
              textAlign: 'center'
            }}
          >
            Smart School
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
            padding: '0 4px'
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
                  {currentUser?.profilePublicId ? (
                    <AdvancedImage 
                      cldImg={getCloudinaryImage(currentUser.profilePublicId)}
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
            <Route path="/parents" element={<Parents />} />
            <Route path="/administration" element={<Administration />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/communication" element={<Communication />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="teacher/exams"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                  <ExamManagement />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Content>
      </Layout>
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
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="students" element={<Students />} />
                <Route path="teachers" element={<Teachers />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="finance" element={<Finance />} />
                <Route path="communication" element={<Communication />} />
                <Route path="profile" element={<Profile />} />
                <Route
                  path="teacher/exams"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                      <ExamManagement />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </MessageContext.Provider>
    </ConfigProvider>
  );
}

export default App;

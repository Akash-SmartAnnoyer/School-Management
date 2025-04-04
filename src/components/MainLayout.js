import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  PaletteOutlined,
} from '@ant-design/icons';
import SchoolLogo from './SchoolLogo';
import ThemeConfigurator from './ThemeConfigurator';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { getCloudinaryImage } from '../services/imageService';
import { saveThemeColors, getThemeColors } from '../services/themeService';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dyr02bpil'
  }
});

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [themeVisible, setThemeVisible] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Load saved theme from database and localStorage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const colors = await getThemeColors();
        applyThemeColors(colors);
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, []);

  const handleThemeChange = async (field, value) => {
    try {
      if (field === 'reset') {
        // Reset to default theme
        const defaultTheme = await getThemeColors();
        await saveThemeColors(defaultTheme);
        return;
      }

      // Update specific color
      const savedTheme = JSON.parse(localStorage.getItem('themeColors') || '{}');
      savedTheme[field] = value;
      
      // Save to database and apply changes
      await saveThemeColors(savedTheme);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      roles: ['PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']
    },
    {
      key: '/academic-calendar',
      icon: <CalendarOutlined />,
      label: 'Academic Calendar',
      roles: ['PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']
    },
    {
      key: '/students',
      icon: <UserOutlined />,
      label: 'Students',
      roles: ['PRINCIPAL', 'TEACHER']
    },
    {
      key: '/teachers',
      icon: <TeamOutlined />,
      label: 'Teachers',
      roles: ['PRINCIPAL']
    },
    {
      key: '/classes',
      icon: <BookOutlined />,
      label: 'Classes',
      roles: ['PRINCIPAL', 'TEACHER']
    },
    {
      key: '/attendance',
      icon: <CalendarOutlined />,
      label: 'Attendance',
      roles: ['PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']
    },
    {
      key: '/teacher-attendance',
      icon: <CalendarOutlined />,
      label: 'Teacher Attendance',
      roles: ['PRINCIPAL']
    },
    {
      key: '/academics',
      icon: <BookOutlined />,
      label: 'Academics',
      roles: ['PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    console.log('Checking menu item:', item.label, 'Roles:', item.roles, 'Current user role:', currentUser?.role);
    return item.roles.includes(currentUser?.role);
  });

  console.log('Filtered menu items:', filteredMenuItems);

  const handleMenuClick = ({ key }) => {
    console.log('Menu clicked:', key);
    if (key === 'theme') {
      console.log('Opening theme configurator');
      setThemeVisible(true);
    } else {
      navigate(key);
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        Profile
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: 'var(--primary-color)',
          boxShadow: '2px 0 8px var(--shadow-color)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div 
          className="logo" 
          style={{ 
            height: 64, 
            padding: 16, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexDirection: collapsed ? 'column' : 'row', 
            gap: 8,
            background: 'rgba(255, 255, 255, 0.15)',
            margin: '16px',
            borderRadius: '12px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(5px)',
          }}
        >
          <div className="school-icon">
            <SchoolLogo size={collapsed ? 32 : 40} />
          </div>
          {!collapsed && currentUser?.schoolName && (
            <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 500 }}>
              {currentUser.schoolName}
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={filteredMenuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            border: 'none',
          }}
        />
      </Sider>
      <Layout>
        <Header 
          style={{ 
            padding: '0 24px', 
            background: 'var(--surface-color)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px var(--shadow-color)',
            borderBottom: '1px solid var(--border-color)',
            height: '64px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ 
                fontSize: '18px', 
                width: 48, 
                height: 48,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                color: 'var(--text-primary)',
              }}
            />
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img
                    src="/logo-transparent-png.png"
                    alt="App Logo"
                    style={{
                      width: 32,
                      height: 32,
                      objectFit: 'contain'
                    }}
                  />
                  <SchoolLogo size="medium" />
                </div>
                {currentUser?.schoolName && (
                  <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
                    {currentUser.schoolName}
                  </Title>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ 
                fontSize: '18px', 
                width: 48, 
                height: 48,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--hover-color)',
              }}
            />
            <Button
              type="text"
              icon={<PaletteOutlined />}
              onClick={() => setThemeVisible(true)}
              title="Theme Settings"
              style={{ 
                fontSize: '18px', 
                width: 48, 
                height: 48,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--hover-color)',
              }}
            />
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space 
                style={{ 
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: 'var(--text-primary)',
                }}
              >
                {currentUser?.profilePublicId ? (
                  <AdvancedImage 
                    cldImg={getCloudinaryImage(currentUser.profilePublicId)}
                    style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%',
                      border: '2px solid var(--border-color)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                ) : (
                  <Avatar 
                    icon={<UserOutlined />} 
                    size={40}
                    style={{ 
                      backgroundColor: 'var(--primary-color)',
                      border: '2px solid var(--border-color)',
                    }}
                  />
                )}
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {currentUser?.name}
                </span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content 
          style={{ 
            margin: '24px 16px', 
            padding: 24, 
            background: 'var(--surface-color)',
            borderRadius: '16px',
            boxShadow: '0 2px 8px var(--shadow-color)',
            minHeight: 'calc(100vh - 112px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {children}
        </Content>
      </Layout>
      <ThemeConfigurator 
        visible={themeVisible}
        onClose={() => {
          console.log('Closing theme configurator');
          setThemeVisible(false);
        }}
        onThemeChange={handleThemeChange}
      />
    </Layout>
  );
};

export default MainLayout; 
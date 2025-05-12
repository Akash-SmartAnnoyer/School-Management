import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Space, Avatar, Dropdown, message, Typography } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  UserOutlined, 
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DollarOutlined,
  BellOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getThemeColors } from '../../services/themeService';
import ThemeConfigurator from '../ThemeConfigurator';
import '../styles/SideMenu.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [themeDrawerVisible, setThemeDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Initialize theme on component mount
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const colors = await getThemeColors();
        console.log('Theme initialized:', colors);
        // Theme colors will be automatically applied by getThemeColors
      } catch (error) {
        console.error('Failed to initialize theme:', error);
      }
    };
    initializeTheme();
  }, []);

  const handleThemeChange = (action) => {
    if (action === 'saved' || action === 'reset') {
      message.success(`Theme ${action === 'saved' ? 'saved' : 'reset'} successfully`);
    }
  };

  const menuItems = [
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
      key: 'teachers',
      icon: <UserOutlined />,
      label: 'Teachers',
    },
    {
      key: 'academics',
      icon: <BookOutlined />,
      label: 'Academics',
    },
    {
      key: 'timetable',
      icon: <CalendarOutlined />,
      label: 'Timetable',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
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
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(`/${key}`);
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      // Handle logout
      navigate('/login');
    } else {
      navigate(`/${key}`);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="side-menu"
      >
        <div className="side-menu-logo">
          <div className="school-icon">
            <BookOutlined style={{ fontSize: collapsed ? '32px' : '24px' }} />
          </div>
          {!collapsed && <h5>Smart Schooling</h5>}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname.split('/')[1]]}
          items={menuItems}
          onClick={handleMenuClick}
          className="side-menu"
        />
      </Sider>
      <Layout>
        <Header>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div style={{ float: 'right', marginRight: '24px' }}>
            <Space>
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: '#7B83EB',
                  background: 'transparent',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(159, 179, 223, 0.05)';
                  e.currentTarget.style.color = '#8ba1d1';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#7B83EB';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              />
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                }}
                placement="bottomRight"
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    cursor: 'pointer',
                    background: '#7B83EB',
                    boxShadow: '0 2px 6px rgba(159, 179, 223, 0.15)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(159, 179, 223, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(159, 179, 223, 0.15)';
                  }}
                />
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: '#ffffff',
            borderRadius: '16px',
            minHeight: 280,
            boxShadow: '0 4px 20px rgba(159, 179, 223, 0.15)',
            border: '1px solid rgba(159, 179, 223, 0.2)',
          }}
        >
          {children}
        </Content>
      </Layout>
      <ThemeConfigurator 
        visible={themeDrawerVisible} 
        onClose={() => setThemeDrawerVisible(false)}
        onThemeChange={handleThemeChange}
      />
    </Layout>
  );
};

export default MainLayout; 
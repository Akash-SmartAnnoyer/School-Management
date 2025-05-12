import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Space, Avatar, Dropdown, message } from 'antd';
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
            <BookOutlined style={{ fontSize: '24px' }} />
          </div>
          <h5>School Management</h5>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname.split('/')[1]]}
          items={menuItems}
          onClick={handleMenuClick}
          className="side-menu"
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: 'var(--surface-color)' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              color: 'var(--text-primary)',
            }}
          />
          <div style={{ float: 'right', marginRight: '24px' }}>
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
                  background: 'var(--primary-color)',
                }}
              />
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: 'var(--surface-color)',
            borderRadius: '8px',
            minHeight: 280,
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
import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
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
} from '@ant-design/icons';
import SchoolLogo from './SchoolLogo';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { getCloudinaryImage } from '../services/imageService';

const { Header, Sider, Content } = Layout;

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dyr02bpil'
  }
});

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
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
      key: '/academics',
      icon: <BookOutlined />,
      label: 'Academics',
      roles: ['PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']
    },
    {
      key: '/parents',
      icon: <TeamOutlined />,
      label: 'Parents',
      roles: ['PRINCIPAL', 'TEACHER']
    },
    {
      key: '/administration',
      icon: <SettingOutlined />,
      label: 'Administration',
      roles: ['PRINCIPAL']
    },
    {
      key: '/finance',
      icon: <BankOutlined />,
      label: 'Finance',
      roles: ['PRINCIPAL']
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
      roles: ['PRINCIPAL', 'TEACHER']
    },
    {
      key: '/communication',
      icon: <MessageOutlined />,
      label: 'Communication',
      roles: ['PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Profile',
      roles: ['PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(currentUser?.role)
  );

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
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" style={{ height: 64, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: collapsed ? 'column' : 'row', gap: 8 }}>
          <SchoolLogo size={collapsed ? 32 : 40} />
          {!collapsed && currentUser?.schoolName && (
            <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
              {currentUser.schoolName}
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={filteredMenuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            {!collapsed && currentUser?.schoolName && (
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {currentUser.schoolName}
              </span>
            )}
          </div>
          <div style={{ paddingRight: 24 }}>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                {currentUser?.profilePublicId ? (
                  <AdvancedImage 
                    cldImg={getCloudinaryImage(currentUser.profilePublicId)}
                    style={{ width: 32, height: 32, borderRadius: '50%' }}
                  />
                ) : (
                  <Avatar icon={<UserOutlined />} />
                )}
                <span>{currentUser?.name}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 
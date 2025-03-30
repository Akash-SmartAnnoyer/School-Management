import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    ...(currentUser?.role === 'PRINCIPAL' ? [
      {
        key: '/teachers',
        icon: <TeamOutlined />,
        label: 'Teacher Management'
      }
    ] : []),
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Profile'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout();
        navigate('/login');
      }
    }
  ];

  return (
    <Sider
      width={250}
      style={{
        background: '#fff',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)'
      }}
    >
      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>School Management</h2>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => {
          if (key !== 'logout') {
            navigate(key);
          }
        }}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar; 
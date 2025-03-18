import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';
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
  MenuUnfoldOutlined
} from '@ant-design/icons';
import './App.css';

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

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function MainLayout() {
  const navigate = useNavigate();
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
  ];

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
            School Management
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
              // Collapse menu on mobile after selection
              if (window.innerWidth < 992) {
                setCollapsed(true);
              }
            }
          }}
          style={{
            borderRight: 'none',
            padding: '0 8px'
          }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
        <Header style={{ 
          background: '#fff', 
          padding: 0,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          height: '64px'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </Header>
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: '#fff',
          borderRadius: '4px',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          minHeight: 'calc(100vh - 112px)'
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
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;

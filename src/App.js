import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
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
  BarChartOutlined
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

function MainLayout() {
  const navigate = useNavigate();

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
      <Sider width={250} theme="dark">
        <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }}>
          School Management
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
            }
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
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

import React, { useState } from 'react';
import { Layout, Menu, Card, Typography } from 'antd';
import FeeDueManagement from '../components/fees/FeeDueManagement';
import PaymentManagement from '../components/fees/PaymentManagement';
import PaymentHistory from '../components/fees/PaymentHistory';

const { Content } = Layout;
const { Title } = Typography;

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('fee-due');

  const menuItems = [
    {
      key: 'fee-due',
      label: 'Fee Due Management',
    },
    {
      key: 'payment',
      label: 'Payment Management',
    },
    {
      key: 'history',
      label: 'Payment History',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'fee-due':
        return <FeeDueManagement />;
      case 'payment':
        return <PaymentManagement />;
      case 'history':
        return <PaymentHistory />;
      default:
        return <FeeDueManagement />;
    }
  };

  return (
    <Layout style={{ padding: '24px' }}>
      <Content>
        <Title level={2}>Fee Management</Title>
        <Card>
          <Menu
            mode="horizontal"
            selectedKeys={[activeTab]}
            items={menuItems}
            onClick={({ key }) => setActiveTab(key)}
            style={{ marginBottom: '24px' }}
          />
          {renderContent()}
        </Card>
      </Content>
    </Layout>
  );
};

export default FeeManagement; 
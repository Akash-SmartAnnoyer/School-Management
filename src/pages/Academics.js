import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  Tabs,
  Typography,
} from 'antd';
import {
  TrophyOutlined,
  BookOutlined,
  EditOutlined,
  BarChartOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { MessageContext } from '../App';
import {
  Box,
  Container,
} from '@mui/material';
import ExamManagement from '../components/academics/ExamManagement';
import MarksEntry from '../components/academics/MarksEntry';
import Analytics from '../components/academics/Analytics';
import SubManagement from '../components/academics/SubManagement';

const { Title } = Typography;

const Academics = () => {
  const [activeTab, setActiveTab] = useState('1');
  const messageApi = useContext(MessageContext);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', mt: 3 }}>
        <Card>
          <Title level={4} style={{ marginBottom: 24 }}>Academic Management</Title>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            type="card"
            items={[
              {
                key: '1',
                label: (
                  <span>
                    <TrophyOutlined />
                    Exam Management
                  </span>
                ),
                children: <ExamManagement />
              },
              {
                key: '2',
                label: (
                  <span>
                    <BookOutlined />
                    Subject Management
                  </span>
                ),
                children: <SubManagement />
              },
              {
                key: '3',
                label: (
                  <span>
                    <EditOutlined />
                    Marks Entry
                  </span>
                ),
                children: <MarksEntry />
              },
              {
                key: '4',
                label: (
                  <span>
                    <BarChartOutlined />
                    Analytics
                  </span>
                ),
                children: <Analytics />
              }
            ]}
          />
        </Card>
      </Box>
    </Container>
  );
};

export default Academics; 
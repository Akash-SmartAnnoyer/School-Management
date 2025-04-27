import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './LoadingSpinner.css';

const { Text } = Typography;

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <Spin 
        indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />} 
        size="large"
      />
      <Text className="loading-text">Loading...</Text>
    </div>
  );
};

export default LoadingSpinner; 
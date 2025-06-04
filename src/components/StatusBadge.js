import React from 'react';
import { Tag } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ManOutlined,
  WomanOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  CheckCircleFilled,
  CloseCircleFilled
} from '@ant-design/icons';

const StatusBadge = ({ type, value, style }) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'status':
        if (value === 'Active' || value === 'Inactive') {
          return {
            icon: value === 'Active' ? <CheckCircleOutlined /> : <CloseCircleOutlined />,
            color: value === 'Active' ? '#73d13d' : '#ffa940',
            background: value === 'Active' ? '#f6ffed' : '#fff7e6',
            borderColor: value === 'Active' ? '#b7eb8f' : '#ffd591'
          };
        } else {
          // Event status types
          return {
            icon: 
              value === 'upcoming' ? <ClockCircleOutlined /> :
              value === 'ongoing' ? <LoadingOutlined /> :
              value === 'completed' ? <CheckCircleFilled /> :
              <CloseCircleFilled />,
            color: 
              value === 'upcoming' ? '#1890ff' :
              value === 'ongoing' ? '#52c41a' :
              value === 'completed' ? '#73d13d' :
              '#ff4d4f',
            background: 
              value === 'upcoming' ? '#e6f7ff' :
              value === 'ongoing' ? '#f6ffed' :
              value === 'completed' ? '#f6ffed' :
              '#fff1f0',
            borderColor: 
              value === 'upcoming' ? '#91d5ff' :
              value === 'ongoing' ? '#b7eb8f' :
              value === 'completed' ? '#b7eb8f' :
              '#ffa39e'
          };
        }
      case 'gender':
        return {
          icon: value === 'M' ? <ManOutlined /> : <WomanOutlined />,
          color: value === 'M' ? '#40a9ff' : '#ff85c0',
          background: value === 'M' ? '#e6f7ff' : '#fff0f6',
          borderColor: value === 'M' ? '#91d5ff' : '#ffadd2'
        };
      case 'event':
        return {
          icon: null,
          color: 
            value === 'holiday' ? '#ff4d4f' :
            value === 'sports' ? '#52c41a' :
            value === 'school' ? '#1890ff' :
            '#722ed1',
          background: 
            value === 'holiday' ? '#fff1f0' :
            value === 'sports' ? '#f6ffed' :
            value === 'school' ? '#e6f7ff' :
            '#f9f0ff',
          borderColor: 
            value === 'holiday' ? '#ffa39e' :
            value === 'sports' ? '#b7eb8f' :
            value === 'school' ? '#91d5ff' :
            '#d3adf7'
        };
      default:
        return {
          icon: null,
          color: '#595959',
          background: '#f5f5f5',
          borderColor: '#d9d9d9'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <Tag
      style={{
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 500,
        background: config.background,
        color: config.color,
        border: `1px solid ${config.borderColor}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        display: 'inline-flex',
        alignItems: 'center',
        height: '24px',
        lineHeight: '1',
        margin: 0,
        ...style
      }}
    >
      {config.icon && (
        <span style={{ 
          marginRight: '4px', 
          fontSize: '14px',
          display: 'inline-flex',
          alignItems: 'center'
        }}>
          {config.icon}
        </span>
      )}
      {value}
    </Tag>
  );
};

export default StatusBadge; 
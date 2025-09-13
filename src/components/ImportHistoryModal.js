import React, { useState, useEffect } from 'react';
import { Modal, Table, Tag, Button, Space, Typography, Tooltip, Progress, Descriptions, Alert, Empty, Spin } from 'antd';
import { 
  HistoryOutlined, 
  DownloadOutlined, 
  EyeOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined,
  FileExcelOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import StyledModal from './StyledModal';
import moment from 'moment';

const { Title, Text } = Typography;

const ImportHistoryModal = ({ 
  visible, 
  onClose, 
  title, 
  brandColor = '#7B83EB',
  importHistory = [],
  loading = false,
  onDownloadFile,
  onViewDetails
}) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'processing':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'processing':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'filename',
      key: 'filename',
      render: (text, record) => (
        <Space>
          <FileExcelOutlined style={{ color: brandColor }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Space>
          {getStatusIcon(status)}
          <Tag color={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress, record) => (
        <div style={{ width: 100 }}>
          <Progress 
            percent={progress} 
            size="small" 
            status={record.status === 'failed' ? 'exception' : 'normal'}
            strokeColor={brandColor}
          />
        </div>
      ),
    },
    {
      title: 'Records',
      dataIndex: 'records',
      key: 'records',
      render: (records) => (
        <Text>
          {records?.successful || 0} / {records?.total || 0}
        </Text>
      ),
    },
    {
      title: 'Uploaded',
      dataIndex: 'uploaded_at',
      key: 'uploaded_at',
      render: (date) => (
        <Text type="secondary">
          {moment(date).format('MMM DD, YYYY HH:mm')}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedRecord(record);
                setDetailsVisible(true);
              }}
              style={{ color: brandColor }}
            />
          </Tooltip>
          {record.status === 'completed' && (
            <Tooltip title="Download Results">
              <Button
                type="text"
                icon={<DownloadOutlined />}
                onClick={() => onDownloadFile && onDownloadFile(record)}
                style={{ color: brandColor }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const ImportDetailsModal = () => (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined style={{ color: brandColor }} />
          <span>Import Details</span>
        </Space>
      }
      visible={detailsVisible}
      onCancel={() => setDetailsVisible(false)}
      footer={[
        <Button key="close" onClick={() => setDetailsVisible(false)}>
          Close
        </Button>
      ]}
      width={800}
    >
      {selectedRecord && (
        <div>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="File Name" span={2}>
              <Space>
                <FileExcelOutlined style={{ color: brandColor }} />
                {selectedRecord.filename}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Space>
                {getStatusIcon(selectedRecord.status)}
                <Tag color={getStatusColor(selectedRecord.status)}>
                  {selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}
                </Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Progress">
              <Progress 
                percent={selectedRecord.progress} 
                size="small"
                strokeColor={brandColor}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Total Records">
              {selectedRecord.records?.total || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Successful">
              <Text style={{ color: '#52c41a' }}>
                {selectedRecord.records?.successful || 0}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Failed">
              <Text style={{ color: '#ff4d4f' }}>
                {selectedRecord.records?.failed || 0}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Uploaded At">
              {moment(selectedRecord.uploaded_at).format('MMMM DD, YYYY HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Completed At">
              {selectedRecord.completed_at ? 
                moment(selectedRecord.completed_at).format('MMMM DD, YYYY HH:mm:ss') : 
                'N/A'
              }
            </Descriptions.Item>
          </Descriptions>

          {selectedRecord.errors && selectedRecord.errors.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <Title level={5} style={{ color: '#ff4d4f', marginBottom: 12 }}>
                Validation Errors
              </Title>
              <Alert
                message={`${selectedRecord.errors.length} errors found`}
                type="error"
                showIcon
                style={{ marginBottom: 12 }}
              />
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {selectedRecord.errors.map((error, index) => (
                  <div key={index} style={{ 
                    padding: '8px 12px', 
                    marginBottom: '4px', 
                    background: '#fff2f0', 
                    border: '1px solid #ffccc7',
                    borderRadius: '4px'
                  }}>
                    <Text strong>Row {error.row}:</Text> {error.field} - {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedRecord.message && (
            <div style={{ marginTop: 24 }}>
              <Alert
                message={selectedRecord.message}
                type={selectedRecord.status === 'completed' ? 'success' : 'error'}
                showIcon
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  );

  return (
    <>
      <StyledModal
        visible={visible}
        onClose={onClose}
        title={
          <Space>
            <HistoryOutlined style={{ color: brandColor }} />
            <span>{title}</span>
          </Space>
        }
        width={1000}
        className="import-history-modal"
        style={{
          maxHeight: 'none',
          overflowY: 'visible'
        }}
      >
        <div className="import-history-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>Loading import history...</Text>
              </div>
            </div>
          ) : importHistory.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No import history found"
              style={{ padding: '40px' }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={importHistory}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} imports`
              }}
              size="small"
            />
          )}
        </div>

        <style jsx>{`
          .import-history-modal .ant-modal-content {
            border-radius: 12px;
            overflow: hidden;
          }

          .import-history-modal .ant-modal-header {
            border-bottom: 1px solid #f0f0f0;
            padding: 16px 24px;
            margin: 0;
          }

          .import-history-modal .ant-modal-body {
            padding: 24px;
            max-height: none;
            overflow-y: visible;
          }

          .import-history-content {
            padding: 0;
          }

          .ant-table-thead > tr > th {
            background: #fafafa;
            font-weight: 600;
          }

          .ant-table-tbody > tr:hover > td {
            background: rgba(${parseInt(brandColor.slice(1, 3), 16)}, ${parseInt(brandColor.slice(3, 5), 16)}, ${parseInt(brandColor.slice(5, 7), 16)}, 0.05);
          }
        `}</style>
      </StyledModal>

      <ImportDetailsModal />
    </>
  );
};

export default ImportHistoryModal;

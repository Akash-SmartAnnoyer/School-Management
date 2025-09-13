import React, { useState } from 'react';
import { Modal, Upload, Button, Alert, Progress, Typography, Space, Divider, List, Tag, Tabs, Table, Tooltip, Descriptions, Spin, Empty } from 'antd';
import { UploadOutlined, DownloadOutlined, FileExcelOutlined, InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, HistoryOutlined, EyeOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import StyledModal from './StyledModal';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;

const ImportModal = ({ 
  visible, 
  onClose, 
  onImport, 
  title, 
  sampleFileUrl, // Can be a URL string or a function that handles download
  requiredFields = [], 
  optionalFields = [],
  brandColor = '#7B83EB',
  loading = false,
  importProgress = 0,
  importStatus = 'idle', // 'idle', 'uploading', 'processing', 'success', 'error'
  importHistory = [],
  historyLoading = false,
  onLoadHistory,
  onDownloadFile,
  showHistoryTab = true
}) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('import');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const handleUpload = (info) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1); // Only keep the latest file
    setFileList(newFileList);
  };

  const handleImport = () => {
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      onImport(file);
    }
  };

  const handleClose = () => {
    setFileList([]);
    setActiveTab('import');
    onClose();
  };

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

  const getStatusText = () => {
    switch (importStatus) {
      case 'success':
        return 'Import completed successfully!';
      case 'error':
        return 'Import failed. Please check your file format.';
      case 'uploading':
        return 'Uploading file...';
      case 'processing':
        return 'Processing data...';
      default:
        return 'Select an Excel file to import';
    }
  };

  const historyColumns = [
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
          {moment(date).format('MMM DD, HH:mm')}
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
              size="small"
            />
          </Tooltip>
          {record.status === 'completed' && (
            <Tooltip title="Download Results">
              <Button
                type="text"
                icon={<DownloadOutlined />}
                onClick={() => onDownloadFile && onDownloadFile(record)}
                style={{ color: brandColor }}
                size="small"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const uploadProps = {
    name: 'file',
    fileList,
    onChange: handleUpload,
    beforeUpload: () => false, // Prevent auto upload
    accept: '.xlsx,.xls',
    maxCount: 1,
  };

  return (
    <>
      <StyledModal
        visible={visible}
        onClose={handleClose}
        title={
          <Space>
            {getStatusIcon(importStatus)}
            <span>{title}</span>
          </Space>
        }
        width={800}
        className="import-modal"
        style={{
          maxHeight: 'none',
          overflowY: 'visible'
        }}
      >
        <div className="import-modal-content">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'import',
                label: (
                  <Space>
                    <FileTextOutlined />
                    Import Data
                  </Space>
                ),
                children: (
                  <div>
                    {/* Sample File Download Section */}
                    <div className="sample-file-section">
                      <Title level={5} style={{ color: brandColor, marginBottom: 12 }}>
                        <DownloadOutlined style={{ marginRight: 8 }} />
                        Download Sample File
                      </Title>
                      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                        Download the sample Excel file to see the correct format and required fields.
                      </Paragraph>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={typeof sampleFileUrl === 'function' ? sampleFileUrl : () => window.open(sampleFileUrl)}
                        style={{
                          background: brandColor,
                          borderColor: brandColor,
                          marginBottom: 20
                        }}
                      >
                        Download Sample File
                      </Button>
                    </div>

                    <Divider />

                    {/* Field Requirements */}
                    <div className="field-requirements">
                      <Title level={5} style={{ color: brandColor, marginBottom: 12 }}>
                        <InfoCircleOutlined style={{ marginRight: 8 }} />
                        Field Requirements
                      </Title>
                      
                      {requiredFields.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <Text strong style={{ color: '#ff4d4f' }}>Required Fields:</Text>
                          <div style={{ marginTop: 8 }}>
                            {requiredFields.map((field, index) => (
                              <Tag key={index} color="red" style={{ margin: '2px 4px' }}>
                                {field}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}

                      {optionalFields.length > 0 && (
                        <div>
                          <Text strong style={{ color: '#52c41a' }}>Optional Fields:</Text>
                          <div style={{ marginTop: 8 }}>
                            {optionalFields.map((field, index) => (
                              <Tag key={index} color="green" style={{ margin: '2px 4px' }}>
                                {field}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Divider />

                    {/* File Upload Section */}
                    <div className="upload-section">
                      <Title level={5} style={{ color: brandColor, marginBottom: 12 }}>
                        Upload Excel File
                      </Title>
                      
                      <Upload {...uploadProps}>
                        <Button 
                          icon={<UploadOutlined />} 
                          size="large"
                          style={{ 
                            width: '100%',
                            height: '60px',
                            border: `2px dashed ${brandColor}`,
                            background: 'transparent',
                            color: brandColor
                          }}
                        >
                          Click or drag file to this area to upload
                        </Button>
                      </Upload>

                      {fileList.length > 0 && (
                        <Alert
                          message={`Selected file: ${fileList[0].name}`}
                          type="info"
                          style={{ marginTop: 12 }}
                          showIcon
                        />
                      )}
                    </div>

                    {/* Import Progress */}
                    {(importStatus === 'uploading' || importStatus === 'processing') && (
                      <div className="progress-section" style={{ marginTop: 20 }}>
                        <Progress 
                          percent={importProgress} 
                          status={importStatus === 'error' ? 'exception' : 'active'}
                          strokeColor={brandColor}
                        />
                      </div>
                    )}

                    {/* Status Messages */}
                    {importStatus !== 'idle' && (
                      <Alert
                        message={getStatusText()}
                        type={importStatus === 'success' ? 'success' : importStatus === 'error' ? 'error' : 'info'}
                        style={{ marginTop: 16 }}
                        showIcon
                      />
                    )}

                    {/* Action Buttons */}
                    <div className="action-buttons" style={{ marginTop: 24, textAlign: 'right' }}>
                      <Space>
                        <Button onClick={handleClose}>
                          Cancel
                        </Button>
                        <Button
                          type="primary"
                          onClick={handleImport}
                          loading={loading || uploading}
                          disabled={fileList.length === 0 || importStatus === 'uploading' || importStatus === 'processing'}
                          style={{
                            background: brandColor,
                            borderColor: brandColor
                          }}
                        >
                          {importStatus === 'success' ? 'Close' : 'Import Data'}
                        </Button>
                      </Space>
                    </div>
                  </div>
                )
              },
              ...(showHistoryTab ? [{
                key: 'history',
                label: (
                  <Space>
                    <HistoryOutlined />
                    Import History
                  </Space>
                ),
                children: (
                  <div>
                    {historyLoading ? (
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
                        columns={historyColumns}
                        dataSource={importHistory}
                        rowKey="id"
                        pagination={{
                          pageSize: 5,
                          showSizeChanger: false,
                          showQuickJumper: false,
                          showTotal: (total, range) => 
                            `${range[0]}-${range[1]} of ${total} imports`
                        }}
                        size="small"
                      />
                    )}
                  </div>
                )
              }] : [])
            ]}
          />
        </div>

        <style jsx>{`
          .import-modal .ant-modal-content {
            border-radius: 12px;
            overflow: hidden;
          }

          .import-modal .ant-modal-header {
            border-bottom: 1px solid #f0f0f0;
            padding: 16px 24px;
            margin: 0;
          }

          .import-modal .ant-modal-body {
            padding: 24px;
            max-height: none;
            overflow-y: visible;
          }

          .import-modal-content {
            padding: 0;
          }

          .sample-file-section {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }

          .field-requirements {
            background: #fff;
          }

          .upload-section {
            background: #fff;
          }

          .ant-upload-drag {
            border: 2px dashed ${brandColor} !important;
            background: transparent !important;
          }

          .ant-upload-drag:hover {
            border-color: ${brandColor} !important;
            background: rgba(${parseInt(brandColor.slice(1, 3), 16)}, ${parseInt(brandColor.slice(3, 5), 16)}, ${parseInt(brandColor.slice(5, 7), 16)}, 0.1) !important;
          }

          .ant-tag {
            border-radius: 4px;
            font-size: 12px;
            padding: 2px 8px;
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

      {/* Import Details Modal */}
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
    </>
  );
};

export default ImportModal;
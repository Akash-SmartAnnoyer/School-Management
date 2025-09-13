import React, { useState } from 'react';
import { Modal, Upload, Button, Alert, Progress, Typography, Space, Divider, List, Tag } from 'antd';
import { UploadOutlined, DownloadOutlined, FileExcelOutlined, InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import StyledModal from './StyledModal';

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
  onShowHistory,
  showHistoryButton = true
}) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

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
    onClose();
  };

  const uploadProps = {
    name: 'file',
    fileList,
    onChange: handleUpload,
    beforeUpload: () => false, // Prevent auto upload
    accept: '.xlsx,.xls',
    maxCount: 1,
  };

  const getStatusIcon = () => {
    switch (importStatus) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />;
      case 'uploading':
      case 'processing':
        return <Progress type="circle" size={20} percent={importProgress} />;
      default:
        return <FileExcelOutlined style={{ color: brandColor, fontSize: '20px' }} />;
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

  return (
    <StyledModal
      visible={visible}
      onClose={handleClose}
      title={
        <Space>
          {getStatusIcon()}
          <span>{title}</span>
        </Space>
      }
      width={600}
      className="import-modal"
      style={{
        maxHeight: 'none',
        overflowY: 'visible'
      }}
    >
      <div className="import-modal-content">
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
            {showHistoryButton && (
              <Button 
                icon={<HistoryOutlined />}
                onClick={onShowHistory}
                style={{ color: brandColor }}
              >
                View History
              </Button>
            )}
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
      `}</style>
    </StyledModal>
  );
};

export default ImportModal;

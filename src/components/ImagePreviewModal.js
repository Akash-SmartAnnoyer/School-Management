import React from 'react';
import { Modal, Button } from 'antd';

const ImagePreviewModal = ({ visible, imageUrl, onCancel, onUpload, loading }) => {
  return (
    <Modal
      title="Preview Profile Picture"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="upload" 
          type="primary" 
          onClick={onUpload}
          loading={loading}
        >
          Upload
        </Button>
      ]}
    >
      <div style={{ textAlign: 'center' }}>
        <img 
          src={imageUrl} 
          alt="Preview" 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '300px',
            objectFit: 'contain',
            borderRadius: '8px'
          }} 
        />
      </div>
    </Modal>
  );
};

export default ImagePreviewModal; 
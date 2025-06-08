import React from 'react';
import { Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const StyledModal = ({ 
  visible, 
  onClose, 
  children, 
  width = 680,
  style = {},
  ...props 
}) => {
  const modalStyles = {
    overlay: {
      backdropFilter: 'blur(8px)',
      background: 'rgba(0, 0, 0, 0.4)',
    },
    content: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      maxHeight: '80vh',
      overflowY: 'auto',
      ...style
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={width}
      style={{ top: 40 }}
      styles={{
        mask: modalStyles.overlay,
        content: modalStyles.content,
      }}
      destroyOnClose
      {...props}
    >
      <div style={{ padding: '8px 0' }}>
        {children}
      </div>

      <style jsx>{`
        .ant-modal-close {
          position: absolute !important;
          right: 16px !important;
          top: 16px !important;
          width: 24px !important;
          height: 24px !important;
          background: rgba(255, 255, 255, 0.9) !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
          padding: 0 !important;
          margin: 0 !important;
          line-height: 1 !important;
          border: none !important;
        }

        .ant-modal-close:hover {
          background: rgba(255, 255, 255, 1) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          transform: scale(1.05) !important;
        }

        .ant-modal-close .anticon {
          font-size: 12px !important;
          color: #7B83EB !important;
          transition: all 0.3s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .ant-modal-close:hover .anticon {
          transform: rotate(90deg) !important;
        }

        .ant-modal-close:before {
          display: none !important;
        }
      `}</style>
    </Modal>
  );
};

export default StyledModal; 
import React, { useState, useEffect } from 'react';
import { Image } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const SchoolLogo = ({ size = 40 }) => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const storage = getStorage();
        const logoRef = ref(storage, 'school-logo/default-logo.png');
        const url = await getDownloadURL(logoRef);
        setLogoUrl(url);
      } catch (error) {
        console.error('Error fetching school logo:', error);
        setError(true);
      }
    };

    fetchLogo();
  }, []);

  if (error) {
    return (
      <div style={{ 
        width: size, 
        height: size, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f0f0f0',
        borderRadius: '4px'
      }}>
        <BankOutlined style={{ fontSize: size * 0.6, color: '#999' }} />
      </div>
    );
  }

  return (
    <Image
      src={logoUrl}
      alt="School Logo"
      width={size}
      height={size}
      preview={false}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default SchoolLogo; 
import React from 'react';

const SchoolLogo = ({ size = 'medium', style = {} }) => {
  // Define sizes for different contexts
  const sizes = {
    small: { width: 32, height: 32 },
    medium: { width: 48, height: 48 },
    large: { width: 64, height: 64 }
  };

  const logoSize = sizes[size] || sizes.medium;

  return (
    <img
      src="../../logo-transparent-png.png"
      alt="School Logo"
      style={{
        width: logoSize.width,
        height: logoSize.height,
        objectFit: 'contain',
        ...style
      }}
    />
  );
};

export default SchoolLogo; 
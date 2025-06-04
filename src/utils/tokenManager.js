import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_TOKEN_SECRET || 'your-secret-key-here';
const TOKEN_EXPIRY = 150 * 60 * 1000; // 15 minutes for access token
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days for refresh token

// Encrypt data before storing
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

// Decrypt data when retrieving
const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Store tokens securely
export const storeTokens = (accessToken, refreshToken, user) => {
  const encryptedAccessToken = encryptData({
    token: accessToken,
    expiry: Date.now() + TOKEN_EXPIRY
  });
  
  const encryptedRefreshToken = encryptData({
    token: refreshToken,
    expiry: Date.now() + REFRESH_TOKEN_EXPIRY
  });
  
  const encryptedUser = encryptData(user);
  
  // Store in localStorage for persistence across tabs
  localStorage.setItem('accessToken', encryptedAccessToken);
  localStorage.setItem('refreshToken', encryptedRefreshToken);
  localStorage.setItem('currentUser', encryptedUser);
};

// Get stored tokens
export const getTokens = () => {
  const encryptedAccessToken = localStorage.getItem('accessToken');
  const encryptedRefreshToken = localStorage.getItem('refreshToken');
  const encryptedUser = localStorage.getItem('currentUser');
  
  if (!encryptedAccessToken || !encryptedRefreshToken || !encryptedUser) {
    return null;
  }
  
  const accessTokenData = decryptData(encryptedAccessToken);
  const refreshTokenData = decryptData(encryptedRefreshToken);
  const user = decryptData(encryptedUser);
  
  if (!accessTokenData || !refreshTokenData || !user) {
    clearTokens();
    return null;  
  }
  
  // Check if tokens are expired
  if (Date.now() > accessTokenData.expiry) {
    if (Date.now() > refreshTokenData.expiry) {
      clearTokens();
      return null;
    }
    return { refreshToken: refreshTokenData.token, user };
  }
  
  return {
    accessToken: accessTokenData.token,
    refreshToken: refreshTokenData.token,
    user
  };
};

// Clear all tokens
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUser');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const tokens = getTokens();
  return !!tokens;
};

// Get current user
export const getCurrentUser = () => {
  const tokens = getTokens();
  return tokens?.user || null;
};

// Get access token
export const getAccessToken = () => {
  const tokens = getTokens();
  return tokens?.accessToken || null;
};

// Get refresh token
export const getRefreshToken = () => {
  const tokens = getTokens();
  return tokens?.refreshToken || null;
}; 
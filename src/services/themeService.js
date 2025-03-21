import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const THEME_STORAGE_KEY = 'school_management_theme';

// Check if backend is available
const isBackendAvailable = async () => {
  try {
    await axios.get(`${API_URL}/health`);
    return true;
  } catch (error) {
    console.warn('Backend is not available:', error.message);
    return false;
  }
};

export const saveThemeColors = async (colors) => {
  try {
    // Save to localStorage first for immediate persistence
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(colors));
    
    // Apply colors to CSS variables immediately
    applyThemeColors(colors);

    // Try to save to database if backend is available
    const backendAvailable = await isBackendAvailable();
    if (backendAvailable) {
      try {
        await axios.post(`${API_URL}/theme/colors`, { colors });
      } catch (dbError) {
        console.warn('Failed to save theme to database:', dbError.message);
        // Continue even if database save fails - we still have localStorage
      }
    }

    return colors;
  } catch (error) {
    console.error('Error saving theme colors:', error);
    // Even if there's an error, try to save to localStorage as fallback
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(colors));
      applyThemeColors(colors);
    } catch (localError) {
      console.error('Failed to save to localStorage:', localError);
    }
    throw error;
  }
};

export const getThemeColors = async () => {
  try {
    // First try to get from localStorage for immediate access
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        // Validate the theme structure
        if (isValidTheme(parsedTheme)) {
          applyThemeColors(parsedTheme);
          return parsedTheme;
        } else {
          console.warn('Invalid theme structure in localStorage');
          localStorage.removeItem(THEME_STORAGE_KEY);
        }
      } catch (parseError) {
        console.warn('Failed to parse saved theme:', parseError);
        localStorage.removeItem(THEME_STORAGE_KEY);
      }
    }
    
    // If no localStorage, try database if available
    const backendAvailable = await isBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await axios.get(`${API_URL}/theme/colors`);
        if (response.data && isValidTheme(response.data)) {
          // Save to localStorage for future use
          localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(response.data));
          applyThemeColors(response.data);
          return response.data;
        }
      } catch (dbError) {
        console.warn('Failed to fetch theme from database:', dbError.message);
      }
    }
    
    // Return default theme if no saved colors found
    const defaultTheme = getDefaultTheme();
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(defaultTheme));
    applyThemeColors(defaultTheme);
    return defaultTheme;
  } catch (error) {
    console.error('Error getting theme colors:', error);
    // Return default theme in case of any error
    const defaultTheme = getDefaultTheme();
    applyThemeColors(defaultTheme);
    return defaultTheme;
  }
};

export const applyThemeColors = (colors) => {
  try {
    // Map of theme keys to CSS variable names
    const cssVarMap = {
      loginPrimaryBlue: '--login-primary-blue',
      loginSecondaryBlue: '--login-secondary-blue',
      loginBackground: '--login-background',
      loginCardBg: '--login-card-bg',
      loginTextDark: '--login-text-dark',
      loginTextMedium: '--login-text-medium',
      loginTextLight: '--login-text-light',
      loginBorder: '--login-border',
      loginGradientStart: '--login-gradient-start',
      loginGradientEnd: '--login-gradient-end',
      loginShadow: '--login-shadow',
      loginShadowLight: '--login-shadow-light',
      primaryColor: '--primary-color',
      secondaryColor: '--secondary-color',
      accentColor: '--accent-color',
      backgroundColor: '--background-color',
      surfaceColor: '--surface-color',
      textPrimary: '--text-primary',
      textSecondary: '--text-secondary',
      textTertiary: '--text-tertiary',
      borderColor: '--border-color',
      hoverColor: '--hover-color',
      successColor: '--success-color',
      warningColor: '--warning-color',
      errorColor: '--error-color',
      sideMenuBg: '--side-menu-bg'
    };

    // Apply each color to its corresponding CSS variable
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = cssVarMap[key];
      if (cssVar) {
        document.documentElement.style.setProperty(cssVar, value);
      }
    });
  } catch (error) {
    console.error('Error applying theme colors:', error);
  }
};

const isValidTheme = (theme) => {
  const requiredColors = [
    'loginPrimaryBlue',
    'loginSecondaryBlue',
    'loginBackground',
    'loginCardBg',
    'loginTextDark',
    'loginTextMedium',
    'loginTextLight',
    'loginBorder',
    'loginGradientStart',
    'loginGradientEnd',
    'loginShadow',
    'loginShadowLight',
    'primaryColor',
    'secondaryColor',
    'accentColor',
    'backgroundColor',
    'surfaceColor',
    'textPrimary',
    'textSecondary',
    'textTertiary',
    'borderColor',
    'hoverColor',
    'successColor',
    'warningColor',
    'errorColor',
    'sideMenuBg'
  ];
  
  const isValidColor = (color) => {
    // Check if it's a hex color
    if (color.startsWith('#')) {
      return /^#[0-9A-Fa-f]{6}$/.test(color);
    }
    // Check if it's an rgba color
    if (color.startsWith('rgba')) {
      return /^rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*(?:0|[0-9]*\.?[0-9]+)\)$/.test(color);
    }
    return false;
  };
  
  return requiredColors.every(color => 
    theme[color] && 
    typeof theme[color] === 'string' && 
    isValidColor(theme[color])
  );
};

const getDefaultTheme = () => ({
  // Login Page Colors
  loginPrimaryBlue: '#3b82f6',
  loginSecondaryBlue: '#60a5fa',
  loginBackground: '#f8fafc',
  loginCardBg: '#ffffff',
  loginTextDark: '#1e293b',
  loginTextMedium: '#64748b',
  loginTextLight: '#475569',
  loginBorder: '#e2e8f0',
  loginGradientStart: '#1e293b',
  loginGradientEnd: '#334155',
  loginShadow: 'rgba(0, 0, 0, 0.1)',
  loginShadowLight: 'rgba(0, 0, 0, 0.06)',
  
  // Global Theme Colors
  primaryColor: '#3b82f6',
  secondaryColor: '#60a5fa',
  accentColor: '#FFE66D',
  backgroundColor: '#f8fafc',
  surfaceColor: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textTertiary: '#475569',
  borderColor: '#e2e8f0',
  hoverColor: '#f1f2f6',
  successColor: '#00B894',
  warningColor: '#FDCB6E',
  errorColor: '#FF7675',
  sideMenuBg: '#001529',
}); 
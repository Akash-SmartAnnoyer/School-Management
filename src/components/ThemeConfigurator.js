import React, { useState, useEffect } from 'react';
import { Drawer, Form, ColorPicker, Button, Space, Typography, Divider, Tooltip, message } from 'antd';
import { SettingOutlined, InfoCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { saveThemeColors, getThemeColors } from '../services/themeService';

const { Title, Text } = Typography;

const ThemeConfigurator = ({ visible, onClose, onThemeChange }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset form when drawer opens
      form.resetFields();
      setHasChanges(false);
    }
  }, [visible, form]);

  const handleColorChange = (color, field) => {
    const hexColor = color.toHexString();
    form.setFieldsValue({ [field]: hexColor });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await saveThemeColors(values);
      setHasChanges(false);
      message.success('Theme colors saved successfully');
      onThemeChange('saved');
    } catch (error) {
      console.error('Error saving theme:', error);
      message.error('Failed to save theme colors');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      form.resetFields();
      const defaultTheme = await getThemeColors();
      await saveThemeColors(defaultTheme);
      setHasChanges(false);
      message.success('Theme colors reset to default');
      onThemeChange('reset');
    } catch (error) {
      console.error('Error resetting theme:', error);
      message.error('Failed to reset theme colors');
    } finally {
      setLoading(false);
    }
  };

  const renderColorPicker = (label, name, description) => (
    <Form.Item 
      label={
        <Space>
          {label}
          <Tooltip title={description}>
            <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        </Space>
      } 
      name={name}
    >
      <ColorPicker onChange={(color) => handleColorChange(color, name)} />
    </Form.Item>
  );

  return (
    <Drawer
      title={
        <Space>
          <SettingOutlined />
          <span>Theme Configuration</span>
        </Space>
      }
      placement="right"
      onClose={() => {
        if (hasChanges) {
          message.warning('You have unsaved changes. Are you sure you want to close?');
        }
        onClose();
      }}
      open={visible}
      width={400}
      style={{ zIndex: 1000 }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
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
        }}
      >
        <Title level={5}>Login Page Colors</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Colors specific to the login page and authentication screens
        </Text>
        {renderColorPicker(
          "Login Primary Blue",
          "loginPrimaryBlue",
          "Main blue color used for primary buttons and important elements in the login page"
        )}
        {renderColorPicker(
          "Login Secondary Blue",
          "loginSecondaryBlue",
          "Lighter blue used for secondary elements and hover states in the login page"
        )}
        {renderColorPicker(
          "Login Background",
          "loginBackground",
          "Background color of the login page"
        )}
        {renderColorPicker(
          "Login Card Background",
          "loginCardBg",
          "Background color of the login form card"
        )}
        {renderColorPicker(
          "Login Text Dark",
          "loginTextDark",
          "Dark text color for headings and important text in login page"
        )}
        {renderColorPicker(
          "Login Text Medium",
          "loginTextMedium",
          "Medium text color for secondary text in login page"
        )}
        {renderColorPicker(
          "Login Text Light",
          "loginTextLight",
          "Light text color for tertiary text in login page"
        )}
        {renderColorPicker(
          "Login Border",
          "loginBorder",
          "Border color for input fields and dividers in login page"
        )}
        {renderColorPicker(
          "Login Gradient Start",
          "loginGradientStart",
          "Starting color of the gradient background in login page"
        )}
        {renderColorPicker(
          "Login Gradient End",
          "loginGradientEnd",
          "Ending color of the gradient background in login page"
        )}
        {renderColorPicker(
          "Login Shadow",
          "loginShadow",
          "Shadow color for cards and elevated elements in login page"
        )}
        {renderColorPicker(
          "Login Light Shadow",
          "loginShadowLight",
          "Lighter shadow color for subtle elevation in login page"
        )}

        <Divider />

        <Title level={5}>Global Theme Colors</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Colors that affect the entire application's look and feel
        </Text>
        {renderColorPicker(
          "Primary Color",
          "primaryColor",
          "Main brand color used for primary buttons, links, and important UI elements"
        )}
        {renderColorPicker(
          "Secondary Color",
          "secondaryColor",
          "Complementary color used for secondary elements and hover states"
        )}
        {renderColorPicker(
          "Accent Color",
          "accentColor",
          "Highlight color used for special elements and emphasis"
        )}
        {renderColorPicker(
          "Background Color",
          "backgroundColor",
          "Main background color of the application"
        )}
        {renderColorPicker(
          "Surface Color",
          "surfaceColor",
          "Color for cards, panels, and elevated surfaces"
        )}
        {renderColorPicker(
          "Text Primary",
          "textPrimary",
          "Main text color for headings and important content"
        )}
        {renderColorPicker(
          "Text Secondary",
          "textSecondary",
          "Secondary text color for less important content"
        )}
        {renderColorPicker(
          "Text Tertiary",
          "textTertiary",
          "Tertiary text color for subtle or supporting text"
        )}
        {renderColorPicker(
          "Border Color",
          "borderColor",
          "Color for borders, dividers, and separators"
        )}
        {renderColorPicker(
          "Hover Color",
          "hoverColor",
          "Background color for hover states on interactive elements"
        )}
        {renderColorPicker(
          "Success Color",
          "successColor",
          "Color for success states, positive actions, and confirmations"
        )}
        {renderColorPicker(
          "Warning Color",
          "warningColor",
          "Color for warning states and cautionary messages"
        )}
        {renderColorPicker(
          "Error Color",
          "errorColor",
          "Color for error states and critical messages"
        )}
        {renderColorPicker(
          "Side Menu Background",
          "sideMenuBg",
          "Background color of the main navigation sidebar"
        )}

        <Divider />

        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={handleReset} loading={loading}>
            Reset to Default
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave}
            loading={loading}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </Space>
      </Form>
    </Drawer>
  );
};

export default ThemeConfigurator; 
import React from 'react';
import { Drawer, Form, ColorPicker, Button, Space, Typography, Divider } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ThemeConfigurator = ({ visible, onClose, onThemeChange }) => {
  const [form] = Form.useForm();

  const handleColorChange = (color, field) => {
    console.log('Color change:', field, color.toHexString());
    const hexColor = color.toHexString();
    onThemeChange(field, hexColor);
  };

  const handleReset = () => {
    console.log('Resetting theme');
    form.resetFields();
    onThemeChange('reset');
  };

  return (
    <Drawer
      title={
        <Space>
          <SettingOutlined />
          <span>Theme Configuration</span>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={320}
      style={{ zIndex: 1000 }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          primaryColor: '#FF6B6B',
          secondaryColor: '#4ECDC4',
          accentColor: '#FFE66D',
          backgroundColor: '#f7f9fc',
          surfaceColor: '#ffffff',
          textPrimary: '#2D3436',
          textSecondary: '#636E72',
          borderColor: '#DFE6E9',
          hoverColor: '#f1f2f6',
          successColor: '#00B894',
          warningColor: '#FDCB6E',
          errorColor: '#FF7675',
          sideMenuBg: '#001529',
        }}
      >
        <Title level={5}>Main Colors</Title>
        <Form.Item label="Primary Color" name="primaryColor">
          <ColorPicker onChange={(color) => handleColorChange(color, 'primaryColor')} />
        </Form.Item>
        <Form.Item label="Secondary Color" name="secondaryColor">
          <ColorPicker onChange={(color) => handleColorChange(color, 'secondaryColor')} />
        </Form.Item>
        <Form.Item label="Accent Color" name="accentColor">
          <ColorPicker onChange={(color) => handleColorChange(color, 'accentColor')} />
        </Form.Item>

        <Divider />

        <Title level={5}>Background Colors</Title>
        <Form.Item label="Background Color" name="backgroundColor">
          <ColorPicker onChange={(color) => handleColorChange(color, 'backgroundColor')} />
        </Form.Item>
        <Form.Item label="Surface Color" name="surfaceColor">
          <ColorPicker onChange={(color) => handleColorChange(color, 'surfaceColor')} />
        </Form.Item>
        <Form.Item label="Side Menu Background" name="sideMenuBg">
          <ColorPicker onChange={(color) => handleColorChange(color, 'sideMenuBg')} />
        </Form.Item>
        <Form.Item label="Hover Color" name="hoverColor">
          <ColorPicker onChange={(color) => handleColorChange(color, 'hoverColor')} />
        </Form.Item>

        <Divider />

        <Title level={5}>Text Colors</Title>
        <Form.Item label="Primary Text" name="textPrimary">
          <ColorPicker onChange={(color) => handleColorChange(color, 'textPrimary')} />
        </Form.Item>
        <Form.Item label="Secondary Text" name="textSecondary">
          <ColorPicker onChange={(color) => handleColorChange(color, 'textSecondary')} />
        </Form.Item>
        <Form.Item label="Border Color" name="borderColor">
          <ColorPicker onChange={(color) => handleColorChange(color, 'borderColor')} />
        </Form.Item>

        <Divider />

        <Title level={5}>Status Colors</Title>
        <Form.Item label="Success Color" name="successColor">
          <ColorPicker onChange={(color) => handleColorChange(color, 'successColor')} />
        </Form.Item>
        <Form.Item label="Warning Color" name="warningColor">
          <ColorPicker onChange={(color) => handleColorChange(color, 'warningColor')} />
        </Form.Item>
        <Form.Item label="Error Color" name="errorColor">
          <ColorPicker onChange={(color) => handleColorChange(color, 'errorColor')} />
        </Form.Item>

        <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: 24 }}>
          <Button onClick={handleReset}>Reset to Default</Button>
          <Button type="primary" onClick={onClose}>
            Done
          </Button>
        </Space>
      </Form>
    </Drawer>
  );
};

export default ThemeConfigurator; 
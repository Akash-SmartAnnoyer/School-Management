import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import academicsService from '../services/academicsService';

const SubjectForm = ({ visible, onClose, editingSubject }) => {
  const [form] = Form.useForm();
  const isEditing = !!editingSubject;

  useEffect(() => {
    if (editingSubject) {
      form.setFieldsValue(editingSubject);
    } else {
      form.resetFields();
    }
  }, [editingSubject, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (isEditing) {
        await academicsService.subjects.update(editingSubject.id, values);
        message.success('Subject updated successfully');
      } else {
        await academicsService.subjects.create(values);
        message.success('Subject created successfully');
      }
      
      onClose();
      form.resetFields();
    } catch (error) {
      if (error.isAxiosError) {
        message.error('Failed to save subject. Please try again.');
      }
      console.error('Error saving subject:', error);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Subject' : 'Add Subject'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText={isEditing ? 'Update' : 'Create'}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={editingSubject}
      >
        <Form.Item
          name="name"
          label="Subject Name"
          rules={[
            { required: true, message: 'Please enter the subject name' },
            { max: 100, message: 'Subject name cannot exceed 100 characters' }
          ]}
        >
          <Input placeholder="Enter subject name" />
        </Form.Item>

        <Form.Item
          name="code"
          label="Subject Code"
          rules={[
            { required: true, message: 'Please enter the subject code' },
            { max: 20, message: 'Subject code cannot exceed 20 characters' }
          ]}
        >
          <Input placeholder="Enter subject code" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { max: 500, message: 'Description cannot exceed 500 characters' }
          ]}
        >
          <Input.TextArea
            placeholder="Enter subject description"
            rows={4}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubjectForm; 
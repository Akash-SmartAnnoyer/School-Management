import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { subjectAPI } from '../../services/api';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectAPI.getSubjects();
      console.log('Subjects data:', data); // Debug log
      setSubjects(data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      message.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingSubject) {
        await subjectAPI.updateSubject(editingSubject.id, values);
        message.success('Subject updated successfully');
      } else {
        await subjectAPI.createSubject(values);
        message.success('Subject created successfully');
      }
      setSubjectModalVisible(false);
      form.resetFields();
      loadSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      message.error(error.message || 'Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectDelete = async (id) => {
    try {
      setLoading(true);
      await subjectAPI.deleteSubject(id);
      message.success('Subject deleted successfully');
      loadSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      message.error(error.message || 'Failed to delete subject');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingSubject(record);
              form.setFieldsValue(record);
              setSubjectModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleSubjectDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setEditingSubject(null);
          form.resetFields();
          setSubjectModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Add Subject
      </Button>

      <Table
        columns={columns}
        dataSource={subjects}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
        open={subjectModalVisible}
        onCancel={() => setSubjectModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubjectSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter subject name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: 'Please enter subject code' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubjectManagement; 
import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, message, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import academicsService from '../services/academicsService';

const ExamList = ({ onEdit, onAdd }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await academicsService.exams.getAll();
      setExams(response.data);
    } catch (error) {
      message.error('Failed to fetch exams');
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async (id) => {
    try {
      await academicsService.exams.delete(id);
      message.success('Exam deleted successfully');
      fetchExams();
    } catch (error) {
      message.error('Failed to delete exam');
      console.error('Error deleting exam:', error);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Exam Code',
      dataIndex: 'exam_code',
      key: 'exam_code',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'quiz' ? 'blue' : 'green'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'exam_date',
      key: 'exam_date',
      sorter: (a, b) => new Date(a.exam_date) - new Date(b.exam_date),
    },
    {
      title: 'Time',
      dataIndex: 'start_time',
      key: 'start_time',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Max Marks',
      dataIndex: 'maximum_marks',
      key: 'maximum_marks',
      sorter: (a, b) => a.maximum_marks - b.maximum_marks,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this exam?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          Add Exam
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={exams}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} exams`,
        }}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default ExamList; 
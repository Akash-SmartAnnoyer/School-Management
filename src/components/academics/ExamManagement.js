import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, TimePicker, message, Space, Spin } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { examAPI, subjectAPI, teacherAPI } from '../../services/api';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      console.log('Loading initial data...');
      
      // Load subjects
      const subjectsData = await subjectAPI.getSubjects();
      console.log('Subjects response:', subjectsData);
      setSubjects(subjectsData || []);

      // Load teachers
      const teachersData = await teacherAPI.getAll();
      console.log('Teachers response:', teachersData);
      // Ensure teachers data is properly formatted
      const formattedTeachers = teachersData.map(teacher => ({
        ...teacher,
        user_id: teacher.user_id || teacher.id // Handle both user_id and id cases
      }));
      setTeachers(formattedTeachers);

      // Load exams
      const examsData = await examAPI.getExams();
      console.log('Exams response:', examsData);
      setExams(examsData || []);

    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      message.error(`Failed to load initial data: ${error.message}`);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleExamSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('Form values:', values); // Debug log
      const examData = {
        ...values,
        exam_date: values.exam_date.format('YYYY-MM-DD'),
        start_time: values.start_time.format('HH:mm:ss'),
        duration: values.duration.format('HH:mm:ss'),
        subjects: values.subjects || [],
        teacher_id: values.teacher // Changed from teacher to teacher_id
      };
      console.log('Exam data to submit:', examData); // Debug log

      if (editingExam) {
        await examAPI.updateExam(editingExam.id, examData);
        message.success('Exam updated successfully');
      } else {
        await examAPI.createExam(examData);
        message.success('Exam created successfully');
      }
      setExamModalVisible(false);
      form.resetFields();
      loadInitialData();
    } catch (error) {
      console.error('Error saving exam:', error);
      message.error(error.message || 'Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  const handleExamDelete = async (id) => {
    try {
      setLoading(true);
      await examAPI.deleteExam(id);
      message.success('Exam deleted successfully');
      loadInitialData();
    } catch (error) {
      console.error('Error deleting exam:', error);
      message.error(error.message || 'Failed to delete exam');
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
      title: 'Exam Code',
      dataIndex: 'exam_code',
      key: 'exam_code',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Date',
      dataIndex: 'exam_date',
      key: 'exam_date',
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
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
              setEditingExam(record);
              form.setFieldsValue({
                ...record,
                exam_date: moment(record.exam_date),
                start_time: moment(record.start_time, 'HH:mm:ss'),
                duration: moment(record.duration, 'HH:mm:ss'),
                teacher: record.teacher_id
              });
              setExamModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleExamDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const renderTeacherOptions = () => {
    if (!teachers || teachers.length === 0) {
      return <Option disabled>No teachers available</Option>;
    }
    console.log('Teachers data:', teachers); // Debug log
    return teachers.map(teacher => (
      <Option key={teacher.user_id} value={teacher.user_id}>
        {teacher.name} ({teacher.subject})
      </Option>
    ));
  };

  const renderSubjectOptions = () => {
    if (!subjects || subjects.length === 0) {
      return <Option disabled>No subjects available</Option>;
    }
    return subjects.map(subject => (
      <Option key={subject.id} value={subject.id}>
        {subject.name}
      </Option>
    ));
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setEditingExam(null);
          form.resetFields();
          setExamModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
        disabled={initialLoading}
      >
        Add Exam
      </Button>

      <Spin spinning={initialLoading}>
        <Table
          columns={columns}
          dataSource={exams}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Spin>

      <Modal
        title={editingExam ? 'Edit Exam' : 'Add Exam'}
        open={examModalVisible}
        onCancel={() => setExamModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleExamSubmit}
        >
          <Form.Item
            name="name"
            label="Exam Name"
            rules={[{ required: true, message: 'Please enter exam name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="exam_code"
            label="Exam Code"
            rules={[{ required: true, message: 'Please enter exam code' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Exam Type"
            rules={[{ required: true, message: 'Please select exam type' }]}
          >
            <Select>
              <Option value="quiz">Quiz</Option>
              <Option value="midterm">Midterm</Option>
              <Option value="final">Final</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="subjects"
            label="Subjects"
            rules={[{ required: true, message: 'Please select at least one subject' }]}
          >
            <Select mode="multiple" loading={initialLoading}>
              {renderSubjectOptions()}
            </Select>
          </Form.Item>

          <Form.Item
            name="teacher"
            label="Teacher"
            rules={[{ required: true, message: 'Please select a teacher' }]}
          >
            <Select 
              loading={initialLoading}
              placeholder="Select a teacher"
              style={{ width: '100%' }}
            >
              {teachers.map(teacher => (
                <Option 
                  key={teacher.user_id} 
                  value={teacher.user_id}
                >
                  {teacher.name} ({teacher.subject})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="exam_date"
            label="Exam Date"
            rules={[{ required: true, message: 'Please select exam date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="start_time"
            label="Start Time"
            rules={[{ required: true, message: 'Please select start time' }]}
          >
            <TimePicker format="HH:mm:ss" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration"
            rules={[{ required: true, message: 'Please select duration' }]}
          >
            <TimePicker format="HH:mm:ss" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="maximum_marks"
            label="Maximum Marks"
            rules={[{ required: true, message: 'Please enter maximum marks' }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="instructions"
            label="Instructions"
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamManagement; 
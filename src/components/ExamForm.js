import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, TimePicker, InputNumber, message } from 'antd';
import moment from 'moment';
import academicsService from '../services/academicsService';

const { Option } = Select;

const ExamForm = ({ visible, onClose, editingExam }) => {
  const [form] = Form.useForm();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const isEditing = !!editingExam;

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (editingExam) {
      form.setFieldsValue({
        ...editingExam,
        exam_date: moment(editingExam.exam_date),
        start_time: moment(editingExam.start_time, 'HH:mm:ss'),
        duration: moment(editingExam.duration, 'HH:mm:ss'),
      });
    } else {
      form.resetFields();
    }
  }, [editingExam, form]);

  const fetchSubjects = async () => {
    try {
      const response = await academicsService.subjects.getAll();
      setSubjects(response.data);
    } catch (error) {
      message.error('Failed to fetch subjects');
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Format the date and time values
      const formattedValues = {
        ...values,
        exam_date: values.exam_date.format('YYYY-MM-DD'),
        start_time: values.start_time.format('HH:mm:ss'),
        duration: values.duration.format('HH:mm:ss'),
      };

      if (isEditing) {
        await academicsService.exams.update(editingExam.id, formattedValues);
        message.success('Exam updated successfully');
      } else {
        await academicsService.exams.create(formattedValues);
        message.success('Exam created successfully');
      }
      
      onClose();
      form.resetFields();
    } catch (error) {
      if (error.isAxiosError) {
        message.error('Failed to save exam. Please try again.');
      }
      console.error('Error saving exam:', error);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Exam' : 'Add Exam'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText={isEditing ? 'Update' : 'Create'}
      maskClosable={false}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'quiz',
          maximum_marks: 100,
        }}
      >
        <Form.Item
          name="name"
          label="Exam Name"
          rules={[
            { required: true, message: 'Please enter the exam name' },
            { max: 100, message: 'Exam name cannot exceed 100 characters' }
          ]}
        >
          <Input placeholder="Enter exam name" />
        </Form.Item>

        <Form.Item
          name="exam_code"
          label="Exam Code"
          rules={[
            { required: true, message: 'Please enter the exam code' },
            { max: 20, message: 'Exam code cannot exceed 20 characters' }
          ]}
        >
          <Input placeholder="Enter exam code" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Exam Type"
          rules={[{ required: true, message: 'Please select the exam type' }]}
        >
          <Select placeholder="Select exam type">
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
          <Select
            mode="multiple"
            placeholder="Select subjects"
            loading={loading}
          >
            {subjects.map(subject => (
              <Option key={subject.id} value={subject.id}>
                {subject.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="exam_date"
          label="Exam Date"
          rules={[{ required: true, message: 'Please select the exam date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="start_time"
          label="Start Time"
          rules={[{ required: true, message: 'Please select the start time' }]}
        >
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="duration"
          label="Duration"
          rules={[{ required: true, message: 'Please select the duration' }]}
        >
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="maximum_marks"
          label="Maximum Marks"
          rules={[{ required: true, message: 'Please enter the maximum marks' }]}
        >
          <InputNumber min={0} max={1000} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="instructions"
          label="Instructions"
          rules={[
            { max: 1000, message: 'Instructions cannot exceed 1000 characters' }
          ]}
        >
          <Input.TextArea
            placeholder="Enter exam instructions"
            rows={4}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExamForm; 
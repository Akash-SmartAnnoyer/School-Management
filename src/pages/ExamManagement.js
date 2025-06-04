import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  message,
  Card,
  Row,
  Col,
  Statistic
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';
import moment from 'moment';

const { Option } = Select;

const ExamManagement = () => {
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form] = Form.useForm();
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Physics', 'Chemistry',
    'Biology', 'Computer Science', 'Economics', 'Geography', 'Political Science',
    'Sociology', 'Psychology', 'Physical Education', 'Art', 'Music', 'Languages',
    'Environmental Science', 'Business Studies', 'Accountancy'
  ];

  const examTypes = ['Unit Test', 'Mid Term', 'Final Exam', 'Quiz', 'Assignment'];

  useEffect(() => {
    fetchStudents();
    fetchExams();
  }, [selectedClass, selectedSubject]);

  const fetchStudents = async () => {
    // TODO: Implement with new database
    setStudents([]);
  };

  const fetchExams = async () => {
    // TODO: Implement with new database
    setExams([]);
    setLoading(false);
  };

  const handleAddExam = async (values) => {
    // TODO: Implement with new database
    message.success('Exam added successfully');
    setModalVisible(false);
    form.resetFields();
    fetchExams();
  };

  const handleEditExam = async (values) => {
    // TODO: Implement with new database
    message.success('Exam updated successfully');
    setModalVisible(false);
    form.resetFields();
    setEditingExam(null);
    fetchExams();
  };

  const handleDeleteExam = async (examId) => {
    // TODO: Implement with new database
    message.success('Exam deleted successfully');
    fetchExams();
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const examData = {
        ...values,
        date: values.date.toISOString(),
        createdAt: new Date().toISOString()
      };

      if (editingExam) {
        await handleEditExam(examData);
      } else {
        await handleAddExam(examData);
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      message.error('Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Exam Type',
      dataIndex: 'examType',
      key: 'examType',
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
      render: (marks) => `${marks}%`,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditExam(record)}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteExam(record.id)}
          />
        </>
      ),
    },
  ];

  const performanceData = exams.map(exam => ({
    date: exam.date,
    marks: exam.marks,
    student: exam.studentName
  }));

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select Class"
            onChange={setSelectedClass}
            allowClear
          >
            {Array.from(new Set(students.map(s => s.className))).map(className => (
              <Option key={className} value={className}>{className}</Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select Subject"
            onChange={setSelectedSubject}
            allowClear
          >
            {subjects.map(subject => (
              <Option key={subject} value={subject}>{subject}</Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingExam(null);
              setModalVisible(true);
            }}
            style={{ width: '100%' }}
          >
            Add Exam Record
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Average Score"
              value={exams.reduce((acc, curr) => acc + curr.marks, 0) / exams.length || 0}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Exams"
              value={exams.length}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Pass Rate"
              value={(exams.filter(exam => exam.marks >= 40).length / exams.length * 100) || 0}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Performance Trend" style={{ marginBottom: 24 }}>
        <Line
          data={performanceData}
          xField="date"
          yField="marks"
          seriesField="student"
          smooth
          animation={{
            appear: {
              animation: 'path-in',
              duration: 1000,
            },
          }}
        />
      </Card>

      <Table
        columns={columns}
        dataSource={exams}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingExam ? 'Edit Exam Record' : 'Add Exam Record'}
        open={modalVisible}
        onOk={form.submit}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="studentId"
            label="Student"
            rules={[{ required: true }]}
          >
            <Select>
              {students.map(student => (
                <Option key={student.id} value={student.id}>
                  {student.name} ({student.rollNumber})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true }]}
          >
            <Select>
              {subjects.map(subject => (
                <Option key={subject} value={subject}>{subject}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="examType"
            label="Exam Type"
            rules={[{ required: true }]}
          >
            <Select>
              {examTypes.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="marks"
            label="Marks (%)"
            rules={[
              { required: true },
              { type: 'number', min: 0, max: 100 }
            ]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamManagement; 
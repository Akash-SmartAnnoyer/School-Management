import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Avatar, Tabs, Card, Row, Col, Statistic, Empty, Typography, Tag, Table } from 'antd';
import { UserOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import api from '../services/api';

const { TabPane } = Tabs;
const { Title } = Typography;

const StudentDetailsDrawer = ({ visible, onClose, student }) => {
  const [marks, setMarks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!student?.id) return;
      
      try {
        const [marksResponse, subjectsResponse, examsResponse] = await Promise.all([
          api.marks.getByStudent(student.id),
          api.subject.getAll(),
          api.exam.getAll()
        ]);
        setMarks(marksResponse.data.data);
        setSubjects(subjectsResponse.data.data);
        setExams(examsResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [student?.id]);

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const getExamMaxMarks = (examId) => {
    const exam = exams.find(e => e.id === examId);
    return exam ? exam.maxMarks : 0;
  };

  const getExamName = (examId) => {
    const exam = exams.find(e => e.id === examId);
    return exam ? exam.name : 'Unknown Exam';
  };

  const calculateAverage = (subjectId) => {
    const subjectMarks = marks.filter(m => m.subjectId === subjectId);
    if (subjectMarks.length === 0) return 0;
    
    const totalMarks = subjectMarks.reduce((acc, curr) => {
      const maxMarks = getExamMaxMarks(curr.examId);
      return acc + (curr.marks / maxMarks) * 100;
    }, 0);
    
    return (totalMarks / subjectMarks.length).toFixed(2);
  };

  const getPerformanceData = () => {
    const subjectPerformance = subjects.map(subject => ({
      subject: subject.name,
      average: parseFloat(calculateAverage(subject.id))
    }));

    return subjectPerformance;
  };

  return (
    <Drawer
      title="Student Details"
      placement="right"
      onClose={onClose}
      open={visible}
      width={800}
    >
      {student ? (
        <div>
          <Descriptions bordered>
            <Descriptions.Item label="Name">{student.name}</Descriptions.Item>
            <Descriptions.Item label="Roll Number">{student.rollNumber}</Descriptions.Item>
            <Descriptions.Item label="Class">{student.className}</Descriptions.Item>
            <Descriptions.Item label="Section">{student.section}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={student.status === 'Active' ? 'green' : 'red'}>
                {student.status}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Tabs defaultActiveKey="1" style={{ marginTop: 24 }}>
            <TabPane 
              tab={
                <span>
                  <TrophyOutlined />
                  Performance
                </span>
              } 
              key="1"
            >
              <Card>
                <Line
                  data={getPerformanceData()}
                  xField="subject"
                  yField="average"
                  label={{
                    position: 'middle',
                    style: {
                      fill: '#FFFFFF',
                    },
                  }}
                  point={{
                    size: 5,
                    shape: 'diamond',
                  }}
                />
              </Card>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <BookOutlined />
                  Marks History
                </span>
              } 
              key="2"
            >
              <Table
                dataSource={marks}
                columns={[
                  {
                    title: 'Exam',
                    dataIndex: 'examId',
                    key: 'examId',
                    render: (examId) => getExamName(examId),
                  },
                  {
                    title: 'Subject',
                    dataIndex: 'subjectId',
                    key: 'subjectId',
                    render: (subjectId) => getSubjectName(subjectId),
                  },
                  {
                    title: 'Marks',
                    dataIndex: 'marks',
                    key: 'marks',
                    render: (marks, record) => {
                      const maxMarks = getExamMaxMarks(record.examId);
                      return `${marks}/${maxMarks}`;
                    },
                  },
                  {
                    title: 'Percentage',
                    key: 'percentage',
                    render: (_, record) => {
                      const maxMarks = getExamMaxMarks(record.examId);
                      return `${((record.marks / maxMarks) * 100).toFixed(2)}%`;
                    },
                  },
                ]}
                rowKey="id"
                loading={loading}
                pagination={false}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No marks found"
                    />
                  )
                }}
              />
            </TabPane>
          </Tabs>
        </div>
      ) : (
        <Empty description="No student information available" />
      )}
    </Drawer>
  );
};

export default StudentDetailsDrawer; 
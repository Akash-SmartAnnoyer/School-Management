import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Avatar, Tabs, Card, Row, Col, Statistic, Empty, Typography } from 'antd';
import { UserOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getMarksByStudent, getSubjects, getExams } from '../firebase/services';

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
        const [marksData, subjectsData, examsData] = await Promise.all([
          getMarksByStudent(student.id),
          getSubjects(),
          getExams()
        ]);
        setMarks(marksData);
        setSubjects(subjectsData);
        setExams(examsData);
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

  const stats = {
    averageScore: marks.length > 0 
      ? (marks.reduce((acc, mark) => {
          const maxMarks = getExamMaxMarks(mark.examId);
          const percentage = maxMarks > 0 ? (mark.marks / maxMarks) * 100 : 0;
          return acc + percentage;
        }, 0) / marks.length)
      : 0,
    totalExams: marks.length,
    passRate: marks.length > 0
      ? (marks.filter(mark => {
          const maxMarks = getExamMaxMarks(mark.examId);
          return maxMarks > 0 && (mark.marks / maxMarks) * 100 >= 40;
        }).length / marks.length) * 100
      : 0,
    recentExams: marks.slice(0, 3)
  };

  const performanceData = marks.length > 0
    ? marks.map(mark => {
        const maxMarks = getExamMaxMarks(mark.examId);
        return {
          date: mark.createdAt?.split('T')[0] || '',
          marks: maxMarks > 0 ? (mark.marks / maxMarks) * 100 : 0
        };
      })
    : [];

  return (
    <Drawer
      title="Student Details"
      placement="right"
      onClose={onClose}
      open={visible}
      width={720}
      bodyStyle={{ padding: '24px' }}
    >
      {student && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Avatar 
              size={120} 
              src={student.photoURL} 
              icon={<UserOutlined />}
              style={{ marginBottom: '16px' }}
            />
            <Title level={3}>{student.name}</Title>
            <Typography.Text type="secondary">Roll No: {student.rollNumber}</Typography.Text>
          </div>

          <Tabs defaultActiveKey="1">
            <TabPane tab="Personal Information" key="1">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Class">{student.class}</Descriptions.Item>
                <Descriptions.Item label="Section">{student.section}</Descriptions.Item>
                <Descriptions.Item label="Gender">{student.gender}</Descriptions.Item>
                <Descriptions.Item label="Email">{student.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{student.phone}</Descriptions.Item>
                <Descriptions.Item label="Status">{student.status}</Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Academic Performance" key="2">
              <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Average Score"
                      value={stats.averageScore}
                      suffix="%"
                      precision={1}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Total Exams"
                      value={stats.totalExams}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Pass Rate"
                      value={stats.passRate}
                      suffix="%"
                      precision={1}
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="Performance Trend" style={{ marginBottom: '24px' }}>
                {performanceData.length > 0 ? (
                  <Line
                    data={performanceData}
                    xField="date"
                    yField="marks"
                    smooth
                    point={{
                      size: 5,
                      shape: 'circle',
                    }}
                    label={{
                      style: {
                        fill: '#aaa',
                      },
                    }}
                  />
                ) : (
                  <Empty description="No performance data available" />
                )}
              </Card>

              <Card title="Recent Exams">
                {stats.recentExams.length > 0 ? (
                  <Descriptions bordered>
                    {stats.recentExams.map((mark, index) => {
                      const maxMarks = getExamMaxMarks(mark.examId);
                      const percentage = maxMarks > 0 ? (mark.marks / maxMarks) * 100 : 0;
                      return (
                        <Descriptions.Item key={index} label={getSubjectName(mark.subjectId)}>
                          {mark.marks}/{maxMarks} marks ({percentage.toFixed(1)}%)
                        </Descriptions.Item>
                      );
                    })}
                  </Descriptions>
                ) : (
                  <Empty description="No exam records found" />
                )}
              </Card>
            </TabPane>

            <TabPane tab="Attendance" key="3">
              <Card>
                <Statistic
                  title="Attendance Rate"
                  value={93.5}
                  suffix="%"
                  precision={1}
                />
              </Card>
            </TabPane>
          </Tabs>
        </div>
      )}
    </Drawer>
  );
};

export default StudentDetailsDrawer; 
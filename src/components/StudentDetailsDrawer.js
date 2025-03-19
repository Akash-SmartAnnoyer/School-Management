import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Avatar, Tabs, Card, Row, Col, Statistic, Empty, Typography } from 'antd';
import { UserOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const { TabPane } = Tabs;
const { Title } = Typography;

const StudentDetailsDrawer = ({ visible, onClose, student }) => {
  const [academicRecords, setAcademicRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcademicRecords = async () => {
      if (!student?.id) return;
      
      try {
        const q = query(
          collection(db, 'academicRecords'),
          where('studentId', '==', student.id)
        );
        const querySnapshot = await getDocs(q);
        const records = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAcademicRecords(records);
      } catch (error) {
        console.error('Error fetching academic records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicRecords();
  }, [student?.id]);

  const stats = {
    averageScore: academicRecords.length > 0 
      ? academicRecords.reduce((acc, record) => acc + (record.marks || 0), 0) / academicRecords.length 
      : 0,
    totalExams: academicRecords.length,
    passRate: academicRecords.length > 0
      ? (academicRecords.filter(record => (record.marks || 0) >= 40).length / academicRecords.length) * 100
      : 0,
    recentExams: academicRecords.slice(0, 3)
  };

  const performanceData = academicRecords.length > 0
    ? academicRecords.map(record => ({
        date: record.date?.toDate().toLocaleDateString() || '',
        marks: record.marks || 0
      }))
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
                      shape: 'diamond',
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
                    {stats.recentExams.map((exam, index) => (
                      <Descriptions.Item key={index} label={exam.subject}>
                        {exam.marks}% ({exam.examType})
                      </Descriptions.Item>
                    ))}
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
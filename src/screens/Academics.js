import React, { useState } from 'react';
import { Layout, Tabs, Typography } from 'antd';
import SubjectList from '../components/SubjectList';
import SubjectForm from '../components/SubjectForm';
import ExamList from '../components/ExamList';
import ExamForm from '../components/ExamForm';

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const Academics = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingExam, setEditingExam] = useState(null);

  const handleSubjectEdit = (subject) => {
    setEditingSubject(subject);
    setShowSubjectForm(true);
  };

  const handleExamEdit = (exam) => {
    setEditingExam(exam);
    setShowExamForm(true);
  };

  const handleSubjectFormClose = () => {
    setShowSubjectForm(false);
    setEditingSubject(null);
  };

  const handleExamFormClose = () => {
    setShowExamForm(false);
    setEditingExam(null);
  };

  return (
    <Layout style={{ padding: '24px' }}>
      <Content
        style={{
          background: '#fff',
          padding: 24,
          margin: 0,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
        }}
      >
        <Title level={2} style={{ marginBottom: 24 }}>Academics</Title>
        
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Subjects" key="1">
            <SubjectList
              onEdit={handleSubjectEdit}
              onAdd={() => setShowSubjectForm(true)}
            />
            {showSubjectForm && (
              <SubjectForm
                visible={showSubjectForm}
                onClose={handleSubjectFormClose}
                editingSubject={editingSubject}
              />
            )}
          </TabPane>
          
          <TabPane tab="Exams" key="2">
            <ExamList
              onEdit={handleExamEdit}
              onAdd={() => setShowExamForm(true)}
            />
            {showExamForm && (
              <ExamForm
                visible={showExamForm}
                onClose={handleExamFormClose}
                editingExam={editingExam}
              />
            )}
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default Academics; 
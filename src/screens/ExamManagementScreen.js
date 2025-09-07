import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { useAuth } from '../context/AuthContext';
import { 
  getAllExams, 
  deleteExam, 
  getAllSubjects, 
  deleteSubject 
} from '../services/examService';
import ExamList from '../components/ExamList';
import SubjectList from '../components/SubjectList';
import ExamForm from '../components/ExamForm';
import SubjectForm from '../components/SubjectForm';

const ExamManagementScreen = () => {
  const { token } = useAuth();
  const [index, setIndex] = useState(0);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showExamForm, setShowExamForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const routes = [
    { key: 'exams', title: 'Exams' },
    { key: 'subjects', title: 'Subjects' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examsData, subjectsData] = await Promise.all([
        getAllExams(token),
        getAllSubjects(token)
      ]);
      setExams(examsData);
      setSubjects(subjectsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const handleDeleteExam = async (id) => {
    try {
      await deleteExam(id, token);
      setExams(exams.filter(exam => exam.id !== id));
      Alert.alert('Success', 'Exam deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete exam');
    }
  };

  const handleDeleteSubject = async (id) => {
    try {
      await deleteSubject(id, token);
      setSubjects(subjects.filter(subject => subject.id !== id));
      Alert.alert('Success', 'Subject deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete subject');
    }
  };

  const handleEditExam = (exam) => {
    setSelectedExam(exam);
    setShowExamForm(true);
  };

  const handleEditSubject = (subject) => {
    setSelectedSubject(subject);
    setShowSubjectForm(true);
  };

  const handleFormSubmit = () => {
    setShowExamForm(false);
    setShowSubjectForm(false);
    setSelectedExam(null);
    setSelectedSubject(null);
    loadData();
  };

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'exams':
        return (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setSelectedExam(null);
                setShowExamForm(true);
              }}
            >
              <Text style={styles.addButtonText}>Add New Exam</Text>
            </TouchableOpacity>
            <ExamList
              exams={exams}
              onDelete={handleDeleteExam}
              onEdit={handleEditExam}
            />
          </View>
        );
      case 'subjects':
        return (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setSelectedSubject(null);
                setShowSubjectForm(true);
              }}
            >
              <Text style={styles.addButtonText}>Add New Subject</Text>
            </TouchableOpacity>
            <SubjectList
              subjects={subjects}
              onDelete={handleDeleteSubject}
              onEdit={handleEditSubject}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={props => (
          <TabBar
            {...props}
            style={styles.tabBar}
            indicatorStyle={styles.tabIndicator}
            labelStyle={styles.tabLabel}
          />
        )}
      />
      
      {showExamForm && (
        <ExamForm
          exam={selectedExam}
          onClose={() => {
            setShowExamForm(false);
            setSelectedExam(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      {showSubjectForm && (
        <SubjectForm
          subject={selectedSubject}
          onClose={() => {
            setShowSubjectForm(false);
            setSelectedSubject(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  tabIndicator: {
    backgroundColor: '#2196F3',
  },
  tabLabel: {
    color: '#000',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExamManagementScreen; 
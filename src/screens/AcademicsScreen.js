import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, StatusBar } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ExamList from '../components/ExamList';
import SubjectList from '../components/SubjectList';
import ExamForm from '../components/ExamForm';
import SubjectForm from '../components/SubjectForm';
import { getAllExams, getAllSubjects, deleteExam, deleteSubject } from '../services/examService';

const AcademicsScreen = () => {
  const { token } = useAuth();
  const [index, setIndex] = useState(0);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showExamForm, setShowExamForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  const routes = [
    { key: 'exams', title: 'Exams', icon: 'calendar' },
    { key: 'subjects', title: 'Subjects', icon: 'book' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examsData, subjectsData] = await Promise.all([
        getAllExams(token),
        getAllSubjects(token)
      ]);
      setExams(examsData);
      setSubjects(subjectsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
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
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Exams</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setSelectedExam(null);
                  setShowExamForm(true);
                }}
              >
                <Ionicons name="add-circle" size={24} color="#fff" />
                <Text style={styles.addButtonText}>Add New Exam</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text>Loading exams...</Text>
              </View>
            ) : (
              <ExamList
                exams={exams}
                onDelete={handleDeleteExam}
                onEdit={handleEditExam}
              />
            )}
          </View>
        );
      case 'subjects':
        return (
          <View style={styles.tabContent}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Subjects</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setSelectedSubject(null);
                  setShowSubjectForm(true);
                }}
              >
                <Ionicons name="add-circle" size={24} color="#fff" />
                <Text style={styles.addButtonText}>Add New Subject</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text>Loading subjects...</Text>
              </View>
            ) : (
              <SubjectList
                subjects={subjects}
                onDelete={handleDeleteSubject}
                onEdit={handleEditSubject}
              />
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
            renderIcon={({ route, focused }) => (
              <Ionicons
                name={route.icon}
                size={24}
                color={focused ? '#2196F3' : '#666'}
              />
            )}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 2,
    height: 60,
  },
  tabIndicator: {
    backgroundColor: '#2196F3',
    height: 3,
  },
  tabLabel: {
    color: '#000',
    fontWeight: 'bold',
    textTransform: 'none',
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AcademicsScreen; 
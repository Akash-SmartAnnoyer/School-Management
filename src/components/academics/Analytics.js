import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import api from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Analytics = () => {
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [performanceData, setPerformanceData] = useState(null);

  useEffect(() => {
    fetchClasses();
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedExam) {
      fetchMarks();
    }
  }, [selectedClass, selectedExam]);

  useEffect(() => {
    if (marks.length > 0) {
      generateAnalytics();
    }
  }, [marks]);

  const fetchClasses = async () => {
    try {
      const response = await api.class.getAll();
      setClasses(response.data.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.student.getByClass(selectedClass);
      setStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await api.exam.getAll();
      setExams(response.data.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchMarks = async () => {
    try {
      const response = await api.marks.getByExam(selectedExam);
      const filteredMarks = response.data.data.filter(mark => mark.classId === selectedClass);
      setMarks(filteredMarks);
    } catch (error) {
      console.error('Error fetching marks:', error);
    }
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const generateAnalytics = () => {
    const selectedExamData = exams.find(e => e.id === selectedExam);
    if (!selectedExamData) return;

    // Calculate grade distribution
    const gradeDistribution = marks.reduce((acc, mark) => {
      const percentage = (mark.marks / selectedExamData.maxMarks) * 100;
      const grade = calculateGrade(percentage);
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    // Calculate subject-wise performance
    const subjectPerformance = marks.reduce((acc, mark) => {
      if (!acc[mark.subjectId]) {
        acc[mark.subjectId] = {
          totalMarks: 0,
          count: 0
        };
      }
      acc[mark.subjectId].totalMarks += mark.marks;
      acc[mark.subjectId].count += 1;
      return acc;
    }, {});

    // Calculate student-wise performance
    const studentPerformance = marks.reduce((acc, mark) => {
      if (!acc[mark.studentId]) {
        acc[mark.studentId] = {
          totalMarks: 0,
          count: 0
        };
      }
      acc[mark.studentId].totalMarks += mark.marks;
      acc[mark.studentId].count += 1;
      return acc;
    }, {});

    setPerformanceData({
      gradeDistribution: Object.entries(gradeDistribution).map(([grade, count]) => ({
        name: grade,
        value: count
      })),
      subjectPerformance: Object.entries(subjectPerformance).map(([subjectId, data]) => ({
        name: subjectId, // You might want to map this to subject name
        average: (data.totalMarks / (data.count * selectedExamData.maxMarks)) * 100
      })),
      studentPerformance: Object.entries(studentPerformance).map(([studentId, data]) => ({
        name: studentId, // You might want to map this to student name
        average: (data.totalMarks / (data.count * selectedExamData.maxMarks)) * 100
      }))
    });
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Class</InputLabel>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              label="Select Class"
            >
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.className} - Section {cls.section}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Exam</InputLabel>
            <Select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              label="Select Exam"
            >
              {exams.map((exam) => (
                <MenuItem key={exam.id} value={exam.id}>
                  {exam.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {performanceData && (
        <Grid container spacing={3} style={{ marginTop: 24 }}>
          <Grid item xs={12} md={6}>
            <Paper style={{ padding: 16 }}>
              <Typography variant="h6" gutterBottom>
                Grade Distribution
              </Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={performanceData.gradeDistribution}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceData.gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper style={{ padding: 16 }}>
              <Typography variant="h6" gutterBottom>
                Subject-wise Performance
              </Typography>
              <BarChart
                width={400}
                height={300}
                data={performanceData.subjectPerformance}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#8884d8" />
              </BarChart>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper style={{ padding: 16 }}>
              <Typography variant="h6" gutterBottom>
                Student-wise Performance
              </Typography>
              <LineChart
                width={800}
                height={300}
                data={performanceData.studentPerformance}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="average" stroke="#8884d8" />
              </LineChart>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Analytics; 
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
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

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
    const querySnapshot = await getDocs(collection(db, 'classes'));
    const classesList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setClasses(classesList);
  };

  const fetchStudents = async () => {
    const q = query(collection(db, 'students'), where('classId', '==', selectedClass));
    const querySnapshot = await getDocs(q);
    const studentsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setStudents(studentsList);
  };

  const fetchExams = async () => {
    const querySnapshot = await getDocs(collection(db, 'exams'));
    const examsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setExams(examsList);
  };

  const fetchMarks = async () => {
    const q = query(
      collection(db, 'marks'),
      where('classId', '==', selectedClass),
      where('examId', '==', selectedExam)
    );
    const querySnapshot = await getDocs(q);
    const marksList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setMarks(marksList);
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
    // Calculate class performance
    const classPerformance = students.map(student => {
      const studentMarks = marks.filter(mark => mark.studentId === student.id);
      if (studentMarks.length === 0) return null;

      const totalMarks = studentMarks.reduce((sum, mark) => sum + Number(mark.marks), 0);
      const maxMarks = studentMarks.reduce((sum, mark) => sum + Number(mark.maxMarks), 0);
      const percentage = (totalMarks / maxMarks) * 100;

      return {
        studentName: student.name,
        percentage,
        grade: calculateGrade(percentage)
      };
    }).filter(student => student !== null);

    // Calculate grade distribution
    const gradeDistribution = classPerformance.reduce((acc, student) => {
      acc[student.grade] = (acc[student.grade] || 0) + 1;
      return acc;
    }, {});

    // Calculate subject-wise performance
    const subjectPerformance = marks.reduce((acc, mark) => {
      if (!acc[mark.subject]) {
        acc[mark.subject] = {
          totalMarks: 0,
          maxMarks: 0,
          count: 0
        };
      }
      acc[mark.subject].totalMarks += Number(mark.marks);
      acc[mark.subject].maxMarks += Number(mark.maxMarks);
      acc[mark.subject].count += 1;
      return acc;
    }, {});

    // Calculate class statistics
    const percentages = classPerformance.map(student => student.percentage);
    const averagePercentage = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const maxPercentage = Math.max(...percentages);
    const minPercentage = Math.min(...percentages);
    const passPercentage = (percentages.filter(p => p >= 50).length / percentages.length) * 100;

    setPerformanceData({
      classPerformance,
      gradeDistribution,
      subjectPerformance,
      statistics: {
        averagePercentage,
        maxPercentage,
        minPercentage,
        passPercentage
      }
    });
  };

  return (
    <Box>
      <Card>
        <CardContent>
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
                      {cls.name}
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
        </CardContent>
      </Card>

      {performanceData && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Class Statistics */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Class Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Average Percentage
                      </Typography>
                      <Typography variant="h4">
                        {performanceData.statistics.averagePercentage.toFixed(2)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Highest Percentage
                      </Typography>
                      <Typography variant="h4">
                        {performanceData.statistics.maxPercentage.toFixed(2)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Lowest Percentage
                      </Typography>
                      <Typography variant="h4">
                        {performanceData.statistics.minPercentage.toFixed(2)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Pass Percentage
                      </Typography>
                      <Typography variant="h4">
                        {performanceData.statistics.passPercentage.toFixed(2)}%
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Grade Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Grade Distribution
                </Typography>
                <PieChart width={400} height={300}>
                  <Pie
                    data={Object.entries(performanceData.gradeDistribution).map(([grade, count]) => ({
                      name: grade,
                      value: count
                    }))}
                    cx={200}
                    cy={150}
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(performanceData.gradeDistribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </CardContent>
            </Card>
          </Grid>

          {/* Subject-wise Performance */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subject-wise Performance
                </Typography>
                <BarChart
                  width={400}
                  height={300}
                  data={Object.entries(performanceData.subjectPerformance).map(([subject, data]) => ({
                    subject,
                    percentage: (data.totalMarks / data.maxMarks) * 100
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="percentage" fill="#8884d8" name="Percentage" />
                </BarChart>
              </CardContent>
            </Card>
          </Grid>

          {/* Student Performance Trend */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Student Performance
                </Typography>
                <LineChart
                  width={800}
                  height={300}
                  data={performanceData.classPerformance}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="studentName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="percentage" stroke="#8884d8" name="Percentage" />
                </LineChart>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Analytics; 
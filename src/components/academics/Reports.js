import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Download as DownloadIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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
} from 'recharts';

const Reports = () => {
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [reportType, setReportType] = useState('class');
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Mock data - replace with actual data from backend
  const classPerformanceData = [
    { name: 'Class 1', average: 85, boys: 82, girls: 88 },
    { name: 'Class 2', average: 78, boys: 75, girls: 81 },
    { name: 'Class 3', average: 92, boys: 90, girls: 94 },
  ];

  const genderPerformanceData = [
    { name: 'Boys', value: 82 },
    { name: 'Girls', value: 88 },
  ];

  const COLORS = ['#0088FE', '#00C49F'];

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

  const calculateStudentPerformance = (studentId) => {
    const studentMarks = marks.filter(mark => mark.studentId === studentId);
    if (studentMarks.length === 0) return null;

    const totalMarks = studentMarks.reduce((sum, mark) => sum + Number(mark.marks), 0);
    const maxMarks = studentMarks.reduce((sum, mark) => sum + Number(mark.maxMarks), 0);
    const percentage = (totalMarks / maxMarks) * 100;

    return {
      totalMarks,
      maxMarks,
      percentage,
      grade: calculateGrade(percentage)
    };
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const generateClassReport = () => {
    const report = students.map(student => {
      const performance = calculateStudentPerformance(student.id);
      return {
        studentName: student.name,
        rollNumber: student.rollNumber,
        ...performance
      };
    }).filter(student => student.percentage !== null);

    report.sort((a, b) => b.percentage - a.percentage);
    return report;
  };

  const generateStudentReport = () => {
    if (!selectedStudent) return null;

    const student = students.find(s => s.id === selectedStudent);
    const performance = calculateStudentPerformance(selectedStudent);
    const subjectMarks = marks.filter(mark => mark.studentId === selectedStudent);

    return {
      studentInfo: student,
      performance,
      subjectMarks
    };
  };

  const handleGenerateReport = () => {
    let report;
    if (reportType === 'class') {
      report = generateClassReport();
    } else {
      report = generateStudentReport();
    }
    setReportData(report);
    setOpenReportDialog(true);
  };

  const handleDownloadReport = () => {
    // TODO: Implement report download logic
    console.log('Downloading report...');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Reports & Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Select Class</InputLabel>
                  <Select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    label="Select Class"
                  >
                    <MenuItem value="1">Class 1</MenuItem>
                    <MenuItem value="2">Class 2</MenuItem>
                    <MenuItem value="3">Class 3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Select Exam</InputLabel>
                  <Select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    label="Select Exam"
                  >
                    <MenuItem value="mid">Mid Term</MenuItem>
                    <MenuItem value="half">Half Yearly</MenuItem>
                    <MenuItem value="class">Class Test</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    label="Report Type"
                  >
                    <MenuItem value="class">Class Performance</MenuItem>
                    <MenuItem value="gender">Gender-wise Analysis</MenuItem>
                    <MenuItem value="individual">Individual Reports</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Class-wise Performance
              </Typography>
              <BarChart
                width={500}
                height={300}
                data={classPerformanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#8884d8" name="Average" />
                <Bar dataKey="boys" fill="#82ca9d" name="Boys" />
                <Bar dataKey="girls" fill="#ffc658" name="Girls" />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gender-wise Performance
              </Typography>
              <PieChart width={500} height={300}>
                <Pie
                  data={genderPerformanceData}
                  cx={250}
                  cy={150}
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {genderPerformanceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </CardContent>
          </Card>
        </Grid>

        {/* Rankings Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Class Rankings</Typography>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadReport}
                >
                  Download Report
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Student Name</TableCell>
                      <TableCell>Roll No</TableCell>
                      <TableCell>Total Marks</TableCell>
                      <TableCell>Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Add mock data or fetch from backend */}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Report Dialog */}
      <Dialog
        open={openReportDialog}
        onClose={() => setOpenReportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {reportType === 'class' ? 'Class Report' : 'Student Report'}
        </DialogTitle>
        <DialogContent>
          {reportData && (
            <Box>
              {reportType === 'class' ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>S.No</TableCell>
                        <TableCell>Student Name</TableCell>
                        <TableCell>Roll No</TableCell>
                        <TableCell>Marks</TableCell>
                        <TableCell>Percentage</TableCell>
                        <TableCell>Grade</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.map((student, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{student.studentName}</TableCell>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell>{`${student.totalMarks}/${student.maxMarks}`}</TableCell>
                          <TableCell>{`${student.percentage.toFixed(2)}%`}</TableCell>
                          <TableCell>{student.grade}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Student Information
                  </Typography>
                  <Typography>
                    Name: {reportData.studentInfo.name}
                    <br />
                    Roll No: {reportData.studentInfo.rollNumber}
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Performance Summary
                  </Typography>
                  <Typography>
                    Total Marks: {reportData.performance.totalMarks}/{reportData.performance.maxMarks}
                    <br />
                    Percentage: {reportData.performance.percentage.toFixed(2)}%
                    <br />
                    Grade: {reportData.performance.grade}
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Subject-wise Marks
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Subject</TableCell>
                          <TableCell>Marks</TableCell>
                          <TableCell>Percentage</TableCell>
                          <TableCell>Grade</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.subjectMarks.map((mark, index) => (
                          <TableRow key={index}>
                            <TableCell>{mark.subject}</TableCell>
                            <TableCell>{`${mark.marks}/${mark.maxMarks}`}</TableCell>
                            <TableCell>{`${((mark.marks / mark.maxMarks) * 100).toFixed(2)}%`}</TableCell>
                            <TableCell>{calculateGrade((mark.marks / mark.maxMarks) * 100)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportDialog(false)}>Close</Button>
          <Button onClick={handleDownloadReport} variant="contained" startIcon={<DownloadIcon />}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports; 
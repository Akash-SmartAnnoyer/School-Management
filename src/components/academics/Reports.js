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
  TextField,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
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
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import moment from 'moment';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: moment().subtract(6, 'months'),
    end: moment()
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, 'classes'));
      const classesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched classes:', classesList);
      setClasses(classesList);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to fetch classes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'students'), where('classId', '==', selectedClass));
      const querySnapshot = await getDocs(q);
      const studentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsList);
    } catch (err) {
      setError('Failed to fetch students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, 'exams'));
      const examsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched exams:', examsList);
      setExams(examsList);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to fetch exams: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarks = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!selectedClass || !selectedExam) {
        setError('Please select both class and exam');
        return;
      }

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
      console.log('Fetched marks:', marksList);
      setMarks(marksList);
    } catch (err) {
      console.error('Error fetching marks:', err);
      setError('Failed to fetch marks: ' + err.message);
    } finally {
      setLoading(false);
    }
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
      grade: calculateGrade(percentage),
      subjectPerformance: studentMarks.map(mark => ({
        subject: mark.subject,
        marks: Number(mark.marks),
        maxMarks: Number(mark.maxMarks),
        percentage: (Number(mark.marks) / Number(mark.maxMarks)) * 100,
        grade: calculateGrade((Number(mark.marks) / Number(mark.maxMarks)) * 100)
      }))
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
      subjectMarks,
      attendance: calculateAttendance(student.id),
      improvement: calculateImprovement(student.id)
    };
  };

  const calculateAttendance = (studentId) => {
    // TODO: Implement attendance calculation
    return {
      present: 85,
      absent: 15,
      percentage: 85
    };
  };

  const calculateImprovement = (studentId) => {
    // TODO: Implement improvement calculation
    return {
      previousScore: 75,
      currentScore: 85,
      improvement: 10
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
    const doc = new jsPDF();
    const exam = exams.find(e => e.id === selectedExam);
    
    // Add header
    doc.setFontSize(20);
    doc.text('Performance Report', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Class: ${classes.find(c => c.id === selectedClass)?.name || 'N/A'}`, 20, 30);
    doc.text(`Exam: ${exam?.name || 'N/A'}`, 20, 40);
    doc.text(`Date: ${moment().format('DD/MM/YYYY')}`, 20, 50);

    // Add table
    if (reportType === 'class') {
      const tableData = reportData.map((student, index) => [
        index + 1,
        student.studentName,
        student.rollNumber,
        `${student.totalMarks}/${student.maxMarks}`,
        `${student.percentage.toFixed(2)}%`,
        student.grade
      ]);

      doc.autoTable({
        head: [['S.No', 'Student Name', 'Roll No', 'Marks', 'Percentage', 'Grade']],
        body: tableData,
        startY: 60,
        theme: 'grid'
      });
    } else {
      // Individual student report
      const student = reportData.studentInfo;
      doc.text(`Student: ${student.name}`, 20, 60);
      doc.text(`Roll No: ${student.rollNumber}`, 20, 70);
      
      const performance = reportData.performance;
      doc.text(`Total Marks: ${performance.totalMarks}/${performance.maxMarks}`, 20, 80);
      doc.text(`Percentage: ${performance.percentage.toFixed(2)}%`, 20, 90);
      doc.text(`Grade: ${performance.grade}`, 20, 100);

      // Subject-wise marks table
      const subjectData = performance.subjectPerformance.map(subject => [
        subject.subject,
        `${subject.marks}/${subject.maxMarks}`,
        `${subject.percentage.toFixed(2)}%`,
        subject.grade
      ]);

      doc.autoTable({
        head: [['Subject', 'Marks', 'Percentage', 'Grade']],
        body: subjectData,
        startY: 110,
        theme: 'grid'
      });
    }

    // Save the PDF
    doc.save(`${reportType}_report_${moment().format('YYYYMMDD')}.pdf`);
  };

  const renderPerformanceCharts = () => {
    if (!marks.length) return null;

    const performanceData = marks.map(mark => ({
      name: students.find(s => s.id === mark.studentId)?.name || 'Unknown',
      marks: Number(mark.marks),
      percentage: (Number(mark.marks) / Number(mark.maxMarks)) * 100
    }));

    const gradeDistribution = {
      'A+': performanceData.filter(d => d.percentage >= 90).length,
      'A': performanceData.filter(d => d.percentage >= 80 && d.percentage < 90).length,
      'B+': performanceData.filter(d => d.percentage >= 70 && d.percentage < 80).length,
      'B': performanceData.filter(d => d.percentage >= 60 && d.percentage < 70).length,
      'C': performanceData.filter(d => d.percentage >= 50 && d.percentage < 60).length,
      'F': performanceData.filter(d => d.percentage < 50).length
    };

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Student Performance Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="percentage" fill="#8884d8" name="Percentage" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Grade Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(gradeDistribution).map(([grade, count]) => ({
                      name: grade,
                      value: count
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {Object.entries(gradeDistribution).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Reports & Analytics
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Select Class</InputLabel>
                  <Select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedExam(''); // Reset exam when class changes
                      setMarks([]); // Clear marks
                    }}
                    label="Select Class"
                    disabled={loading}
                  >
                    {classes && classes.length > 0 ? (
                      classes.map(cls => (
                        <MenuItem key={cls.id} value={cls.id}>
                          {cls.className || cls.name || `Class ${cls.id}`}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No classes available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Select Exam</InputLabel>
                  <Select
                    value={selectedExam}
                    onChange={(e) => {
                      setSelectedExam(e.target.value);
                      setMarks([]); // Clear marks
                    }}
                    label="Select Exam"
                    disabled={loading || !selectedClass}
                  >
                    {exams && exams.length > 0 ? (
                      exams.map(exam => (
                        <MenuItem key={exam.id} value={exam.id}>
                          {exam.examName || exam.name || `Exam ${exam.id}`}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No exams available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => {
                      setReportType(e.target.value);
                      setSelectedStudent(''); // Reset student when report type changes
                    }}
                    label="Report Type"
                  >
                    <MenuItem value="class">Class Performance</MenuItem>
                    <MenuItem value="individual">Individual Report</MenuItem>
                    <MenuItem value="analytics">Analytics</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {reportType === 'individual' && (
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Select Student</InputLabel>
                    <Select
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      label="Select Student"
                      disabled={loading || !selectedClass}
                    >
                      {students && students.length > 0 ? (
                        students.map(student => (
                          <MenuItem key={student.id} value={student.id}>
                            {student.name} - {student.rollNumber}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No students available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} md={reportType === 'individual' ? 12 : 3}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleGenerateReport}
                  disabled={
                    loading || 
                    !selectedClass || 
                    !selectedExam || 
                    (reportType === 'individual' && !selectedStudent)
                  }
                  startIcon={loading ? <CircularProgress size={20} /> : <AssessmentIcon />}
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Loading State */}
        {loading && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          </Grid>
        )}

        {/* Performance Summary Cards */}
        {!loading && marks.length > 0 && (
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Average Score
                    </Typography>
                    <Typography variant="h4">
                      {((marks.reduce((sum, mark) => sum + Number(mark.marks), 0) / marks.length) / 
                        (marks[0]?.maxMarks || 100) * 100).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Pass Percentage
                    </Typography>
                    <Typography variant="h4">
                      {(marks.filter(mark => Number(mark.marks) >= 40).length / marks.length * 100).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Highest Score
                    </Typography>
                    <Typography variant="h4">
                      {Math.max(...marks.map(m => Number(m.marks)))}/{marks[0]?.maxMarks || 100}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Lowest Score
                    </Typography>
                    <Typography variant="h4">
                      {Math.min(...marks.map(m => Number(m.marks)))}/{marks[0]?.maxMarks || 100}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Charts */}
        {!loading && marks.length > 0 && renderPerformanceCharts()}

        {/* Rankings Table */}
        {!loading && marks.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Class Rankings</Typography>
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={() => window.print()}
                      sx={{ mr: 1 }}
                    >
                      Print
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadReport}
                    >
                      Download PDF
                    </Button>
                  </Box>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Student Name</TableCell>
                        <TableCell>Roll No</TableCell>
                        <TableCell>Marks</TableCell>
                        <TableCell>Percentage</TableCell>
                        <TableCell>Grade</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {marks.map((mark, index) => {
                        const student = students.find(s => s.id === mark.studentId);
                        return (
                          <TableRow key={mark.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{student?.name || 'Unknown'}</TableCell>
                            <TableCell>{student?.rollNumber || 'N/A'}</TableCell>
                            <TableCell>{`${mark.marks}/${mark.maxMarks}`}</TableCell>
                            <TableCell>{`${((mark.marks / mark.maxMarks) * 100).toFixed(2)}%`}</TableCell>
                            <TableCell>
                              <Chip
                                label={calculateGrade((mark.marks / mark.maxMarks) * 100)}
                                color={
                                  calculateGrade((mark.marks / mark.maxMarks) * 100) === 'F'
                                    ? 'error'
                                    : calculateGrade((mark.marks / mark.maxMarks) * 100).includes('A')
                                    ? 'success'
                                    : 'primary'
                                }
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* No Data Message */}
        {!loading && selectedClass && selectedExam && marks.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h6" color="textSecondary">
                    No marks data available for the selected class and exam
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
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
                          <TableCell>
                            <Chip
                              label={student.grade}
                              color={
                                student.grade === 'F'
                                  ? 'error'
                                  : student.grade.includes('A')
                                  ? 'success'
                                  : 'primary'
                              }
                            />
                          </TableCell>
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
                        {reportData.performance.subjectPerformance.map((subject, index) => (
                          <TableRow key={index}>
                            <TableCell>{subject.subject}</TableCell>
                            <TableCell>{`${subject.marks}/${subject.maxMarks}`}</TableCell>
                            <TableCell>{`${subject.percentage.toFixed(2)}%`}</TableCell>
                            <TableCell>
                              <Chip
                                label={subject.grade}
                                color={
                                  subject.grade === 'F'
                                    ? 'error'
                                    : subject.grade.includes('A')
                                    ? 'success'
                                    : 'primary'
                                }
                              />
                            </TableCell>
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
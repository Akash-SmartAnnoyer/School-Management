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
  TextField,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Assessment as AssessmentIcon } from '@mui/icons-material';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

const MarksManagement = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [marks, setMarks] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [openMarksDialog, setOpenMarksDialog] = useState(false);
  const [editingMarks, setEditingMarks] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    marks: '',
    remarks: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);

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
    if (selectedClass && selectedExam && selectedSubject) {
      fetchMarks();
    }
  }, [selectedClass, selectedExam, selectedSubject]);

  const fetchClasses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'classes'));
      const classesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClasses(classesList);
    } catch (error) {
      setError('Error fetching classes');
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const q = query(collection(db, 'students'), where('classId', '==', selectedClass));
      const querySnapshot = await getDocs(q);
      const studentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsList);
    } catch (error) {
      setError('Error fetching students');
      console.error('Error fetching students:', error);
    }
  };

  const fetchExams = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'exams'));
      const examsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExams(examsList);
    } catch (error) {
      setError('Error fetching exams');
      console.error('Error fetching exams:', error);
    }
  };

  const fetchMarks = async () => {
    try {
      const q = query(
        collection(db, 'marks'),
        where('classId', '==', selectedClass),
        where('examId', '==', selectedExam),
        where('subject', '==', selectedSubject)
      );
      const querySnapshot = await getDocs(q);
      const marksList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMarks(marksList);
    } catch (error) {
      setError('Error fetching marks');
      console.error('Error fetching marks:', error);
    }
  };

  const handleOpenMarksDialog = (marksData = null) => {
    if (marksData) {
      setEditingMarks(marksData);
      setFormData({
        studentId: marksData.studentId,
        marks: marksData.marks,
        remarks: marksData.remarks || '',
      });
    } else {
      setEditingMarks(null);
      setFormData({
        studentId: '',
        marks: '',
        remarks: '',
      });
    }
    setOpenMarksDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenMarksDialog(false);
    setEditingMarks(null);
    setFormData({
      studentId: '',
      marks: '',
      remarks: '',
    });
  };

  const handleSubmitMarks = async () => {
    try {
      setError('');
      setSuccess('');

      if (!formData.studentId || !formData.marks) {
        setError('Please fill in all required fields');
        return;
      }

      const marksData = {
        ...formData,
        classId: selectedClass,
        examId: selectedExam,
        subject: selectedSubject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingMarks) {
        await updateDoc(doc(db, 'marks', editingMarks.id), marksData);
        setSuccess('Marks updated successfully');
      } else {
        await addDoc(collection(db, 'marks'), marksData);
        setSuccess('Marks added successfully');
      }
      handleCloseDialog();
      fetchMarks();
    } catch (error) {
      setError('Error saving marks');
      console.error('Error saving marks:', error);
    }
  };

  const handleDeleteMarks = async (marksId) => {
    try {
      await deleteDoc(doc(db, 'marks', marksId));
      setSuccess('Marks deleted successfully');
      fetchMarks();
    } catch (error) {
      setError('Error deleting marks');
      console.error('Error deleting marks:', error);
    }
  };

  const generateReport = () => {
    const exam = exams.find(e => e.id === selectedExam);
    const maxMarks = exam?.maxMarks || 100;
    
    const report = {
      examName: exam?.name || 'Unknown',
      subject: selectedSubject,
      totalStudents: students.length,
      marksEntered: marks.length,
      averageMarks: marks.reduce((acc, curr) => acc + Number(curr.marks), 0) / marks.length || 0,
      highestMarks: Math.max(...marks.map(m => Number(m.marks)), 0),
      lowestMarks: Math.min(...marks.map(m => Number(m.marks)), 100),
      passPercentage: (marks.filter(m => Number(m.marks) >= 40).length / marks.length) * 100 || 0,
      gradeDistribution: {
        A: marks.filter(m => Number(m.marks) >= 90).length,
        B: marks.filter(m => Number(m.marks) >= 80 && Number(m.marks) < 90).length,
        C: marks.filter(m => Number(m.marks) >= 70 && Number(m.marks) < 80).length,
        D: marks.filter(m => Number(m.marks) >= 60 && Number(m.marks) < 70).length,
        E: marks.filter(m => Number(m.marks) >= 40 && Number(m.marks) < 60).length,
        F: marks.filter(m => Number(m.marks) < 40).length,
      },
      studentPerformance: marks.map(mark => ({
        studentName: getStudentName(mark.studentId),
        rollNumber: students.find(s => s.id === mark.studentId)?.rollNumber,
        marks: Number(mark.marks),
        percentage: (Number(mark.marks) / maxMarks) * 100,
        grade: getGrade(Number(mark.marks)),
      })).sort((a, b) => b.marks - a.marks),
    };

    setReportData(report);
    setShowReport(true);
  };

  const getGrade = (marks) => {
    if (marks >= 90) return 'A';
    if (marks >= 80) return 'B';
    if (marks >= 70) return 'C';
    if (marks >= 60) return 'D';
    if (marks >= 40) return 'E';
    return 'F';
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown';
  };

  const getExamName = (examId) => {
    const exam = exams.find(e => e.id === examId);
    return exam ? exam.name : 'Unknown';
  };

  const getSelectedExam = () => {
    return exams.find(e => e.id === selectedExam);
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select Subject</InputLabel>
                <Select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  label="Select Subject"
                >
                  {getSelectedExam()?.subjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {selectedClass && selectedExam && selectedSubject && (
            <Box mt={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Marks Entry for {getExamName(selectedExam)} - {selectedSubject}
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<AssessmentIcon />}
                    onClick={generateReport}
                    sx={{ mr: 2 }}
                  >
                    Generate Report
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenMarksDialog()}
                  >
                    Add Marks
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student Name</TableCell>
                      <TableCell>Roll Number</TableCell>
                      <TableCell>Marks</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Remarks</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {marks.map((mark) => (
                      <TableRow key={mark.id}>
                        <TableCell>{getStudentName(mark.studentId)}</TableCell>
                        <TableCell>{students.find(s => s.id === mark.studentId)?.rollNumber}</TableCell>
                        <TableCell>{mark.marks}</TableCell>
                        <TableCell>
                          <Chip
                            label={getGrade(Number(mark.marks))}
                            color={
                              getGrade(Number(mark.marks)) === 'A' ? 'success' :
                              getGrade(Number(mark.marks)) === 'B' ? 'primary' :
                              getGrade(Number(mark.marks)) === 'C' ? 'info' :
                              getGrade(Number(mark.marks)) === 'D' ? 'warning' :
                              getGrade(Number(mark.marks)) === 'E' ? 'secondary' :
                              'error'
                            }
                          />
                        </TableCell>
                        <TableCell>{mark.remarks}</TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleOpenMarksDialog(mark)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleDeleteMarks(mark.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Marks Dialog */}
      <Dialog open={openMarksDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMarks ? 'Edit Marks' : 'Add New Marks'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Student</InputLabel>
              <Select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                label="Student"
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.name} - {student.rollNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Marks"
              type="number"
              value={formData.marks}
              onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
              fullWidth
              inputProps={{ min: 0, max: getSelectedExam()?.maxMarks || 100 }}
            />
            <TextField
              label="Remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmitMarks} variant="contained" startIcon={<SaveIcon />}>
            {editingMarks ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReport} onClose={() => setShowReport(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Performance Report - {reportData?.examName} - {reportData?.subject}
        </DialogTitle>
        <DialogContent>
          {reportData && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Total Students</Typography>
                      <Typography variant="h4">{reportData.totalStudents}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Average Marks</Typography>
                      <Typography variant="h4">{reportData.averageMarks.toFixed(2)}%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Highest Marks</Typography>
                      <Typography variant="h4">{reportData.highestMarks}%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Pass Percentage</Typography>
                      <Typography variant="h4">{reportData.passPercentage.toFixed(1)}%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Grade Distribution</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {Object.entries(reportData.gradeDistribution).map(([grade, count]) => (
                  <Grid item xs={12} sm={6} md={4} key={grade}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">Grade {grade}</Typography>
                        <Typography variant="h4">{count} students</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="h6" gutterBottom>Student Performance</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Student Name</TableCell>
                      <TableCell>Roll Number</TableCell>
                      <TableCell>Marks</TableCell>
                      <TableCell>Percentage</TableCell>
                      <TableCell>Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.studentPerformance.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>{student.marks}</TableCell>
                        <TableCell>{student.percentage.toFixed(2)}%</TableCell>
                        <TableCell>
                          <Chip
                            label={student.grade}
                            color={
                              student.grade === 'A' ? 'success' :
                              student.grade === 'B' ? 'primary' :
                              student.grade === 'C' ? 'info' :
                              student.grade === 'D' ? 'warning' :
                              student.grade === 'E' ? 'secondary' :
                              'error'
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReport(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarksManagement; 
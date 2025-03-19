import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  Tab,
  Tabs,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Grade as GradeIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import {
  getSubjects,
  addSubject,
  getExams,
  addExam,
  getMarksByExam,
  addMarks,
  getReportCard,
  generateReportCard
} from '../firebase/services';
import { getStudents } from '../firebase/services';
import { getClasses } from '../firebase/services';

const Academics = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [marks, setMarks] = useState([]);
  const [reportCards, setReportCards] = useState([]);
  
  // Dialog states
  const [openSubjectDialog, setOpenSubjectDialog] = useState(false);
  const [openExamDialog, setOpenExamDialog] = useState(false);
  const [openMarksDialog, setOpenMarksDialog] = useState(false);
  const [openReportCardDialog, setOpenReportCardDialog] = useState(false);
  
  // Form states
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [examForm, setExamForm] = useState({
    name: '',
    subjectId: '',
    classId: '',
    date: '',
    maxScore: ''
  });
  const [marksForm, setMarksForm] = useState({
    examId: '',
    studentId: '',
    score: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const subjectsData = await getSubjects();
      const examsData = await getExams();
      const studentsData = await getStudents();
      const classesData = await getClasses();
      
      setSubjects(subjectsData);
      setExams(examsData);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Subject Management
  const handleAddSubject = async () => {
    try {
      await addSubject(subjectForm);
      setOpenSubjectDialog(false);
      setSubjectForm({ name: '', code: '', description: '' });
      loadData();
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  // Exam Management
  const handleAddExam = async () => {
    try {
      await addExam(examForm);
      setOpenExamDialog(false);
      setExamForm({ name: '', subjectId: '', classId: '', date: '', maxScore: '' });
      loadData();
    } catch (error) {
      console.error('Error adding exam:', error);
    }
  };

  // Marks Management
  const handleAddMarks = async () => {
    try {
      await addMarks(marksForm);
      setOpenMarksDialog(false);
      setMarksForm({ examId: '', studentId: '', score: '' });
      loadData();
    } catch (error) {
      console.error('Error adding marks:', error);
    }
  };

  // Report Card Management
  const handleGenerateReportCard = async (studentId) => {
    try {
      const currentYear = new Date().getFullYear();
      await generateReportCard(studentId, currentYear);
      const reportCard = await getReportCard(studentId, currentYear);
      setReportCards([...reportCards, reportCard]);
    } catch (error) {
      console.error('Error generating report card:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Academics Management
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab icon={<SchoolIcon />} label="Subjects" />
        <Tab icon={<AssessmentIcon />} label="Exams" />
        <Tab icon={<GradeIcon />} label="Marks" />
        <Tab icon={<DescriptionIcon />} label="Report Cards" />
      </Tabs>

      {/* Subjects Tab */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Subjects</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenSubjectDialog(true)}
            >
              Add Subject
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.description}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton>
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

      {/* Exams Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Exams</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenExamDialog(true)}
            >
              Add Exam
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Max Score</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>{exam.name}</TableCell>
                    <TableCell>
                      {subjects.find(s => s.id === exam.subjectId)?.name}
                    </TableCell>
                    <TableCell>
                      {classes.find(c => c.id === exam.classId)?.name}
                    </TableCell>
                    <TableCell>{exam.date}</TableCell>
                    <TableCell>{exam.maxScore}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton>
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

      {/* Marks Tab */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Marks</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenMarksDialog(true)}
            >
              Add Marks
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Exam</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marks.map((mark) => (
                  <TableRow key={mark.id}>
                    <TableCell>
                      {students.find(s => s.id === mark.studentId)?.name}
                    </TableCell>
                    <TableCell>
                      {exams.find(e => e.id === mark.examId)?.name}
                    </TableCell>
                    <TableCell>{mark.score}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton>
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

      {/* Report Cards Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Report Cards
          </Typography>
          <Grid container spacing={3}>
            {students.map((student) => (
              <Grid item xs={12} md={6} key={student.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{student.name}</Typography>
                    <Typography color="textSecondary">
                      Class: {classes.find(c => c.id === student.classId)?.name}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleGenerateReportCard(student.id)}
                      >
                        Generate Report Card
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Add Subject Dialog */}
      <Dialog open={openSubjectDialog} onClose={() => setOpenSubjectDialog(false)}>
        <DialogTitle>Add Subject</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Subject Name"
            fullWidth
            value={subjectForm.name}
            onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Subject Code"
            fullWidth
            value={subjectForm.code}
            onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={subjectForm.description}
            onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubjectDialog(false)}>Cancel</Button>
          <Button onClick={handleAddSubject} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Exam Dialog */}
      <Dialog open={openExamDialog} onClose={() => setOpenExamDialog(false)}>
        <DialogTitle>Add Exam</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Exam Name"
            fullWidth
            value={examForm.name}
            onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Subject</InputLabel>
            <Select
              value={examForm.subjectId}
              onChange={(e) => setExamForm({ ...examForm, subjectId: e.target.value })}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Class</InputLabel>
            <Select
              value={examForm.classId}
              onChange={(e) => setExamForm({ ...examForm, classId: e.target.value })}
            >
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={examForm.date}
            onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Max Score"
            type="number"
            fullWidth
            value={examForm.maxScore}
            onChange={(e) => setExamForm({ ...examForm, maxScore: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExamDialog(false)}>Cancel</Button>
          <Button onClick={handleAddExam} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Marks Dialog */}
      <Dialog open={openMarksDialog} onClose={() => setOpenMarksDialog(false)}>
        <DialogTitle>Add Marks</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Exam</InputLabel>
            <Select
              value={marksForm.examId}
              onChange={(e) => setMarksForm({ ...marksForm, examId: e.target.value })}
            >
              {exams.map((exam) => (
                <MenuItem key={exam.id} value={exam.id}>
                  {exam.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Student</InputLabel>
            <Select
              value={marksForm.studentId}
              onChange={(e) => setMarksForm({ ...marksForm, studentId: e.target.value })}
            >
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Score"
            type="number"
            fullWidth
            value={marksForm.score}
            onChange={(e) => setMarksForm({ ...marksForm, score: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMarksDialog(false)}>Cancel</Button>
          <Button onClick={handleAddMarks} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Academics; 
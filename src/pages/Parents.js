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
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import {
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Message as MessageIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import {
  getStudents,
  getMarksByExam,
  getReportCard,
  getAttendance,
  addMessage,
  getMessages
} from '../firebase/services';

const Parents = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [reportCards, setReportCards] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Dialog states
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [openReportCardDialog, setOpenReportCardDialog] = useState(false);
  
  // Form states
  const [messageForm, setMessageForm] = useState({
    subject: '',
    content: '',
    recipientId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const studentsData = await getStudents();
      setStudents(studentsData);
      
      if (studentsData.length > 0) {
        setSelectedStudent(studentsData[0]);
        await loadStudentData(studentsData[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadStudentData = async (studentId) => {
    try {
      const currentYear = new Date().getFullYear();
      const [marksData, reportCardData, attendanceData, messagesData] = await Promise.all([
        getMarksByExam(studentId),
        getReportCard(studentId, currentYear),
        getAttendance(new Date().toISOString().split('T')[0], studentId),
        getMessages(studentId)
      ]);
      
      setMarks(marksData);
      setReportCards(reportCardData);
      setAttendance(attendanceData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    loadStudentData(student.id);
  };

  const handleSendMessage = async () => {
    try {
      await addMessage({
        ...messageForm,
        studentId: selectedStudent.id,
        senderId: 'parent', // This should be the actual parent ID
        createdAt: new Date().toISOString()
      });
      setOpenMessageDialog(false);
      setMessageForm({ subject: '', content: '', recipientId: '' });
      loadStudentData(selectedStudent.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Parent Portal
      </Typography>

      {/* Student Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Student
          </Typography>
          <Grid container spacing={2}>
            {students.map((student) => (
              <Grid item xs={12} sm={6} md={4} key={student.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedStudent?.id === student.id ? '2px solid #1976d2' : 'none'
                  }}
                  onClick={() => handleStudentSelect(student)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">{student.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Class: {student.className}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {selectedStudent && (
        <>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab icon={<AssessmentIcon />} label="Academic Progress" />
            <Tab icon={<EventIcon />} label="Attendance" />
            <Tab icon={<MessageIcon />} label="Messages" />
            <Tab icon={<GradeIcon />} label="Report Cards" />
          </Tabs>

          {/* Academic Progress Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Recent Exam Results
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Exam</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Max Score</TableCell>
                      <TableCell>Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {marks.map((mark) => (
                      <TableRow key={mark.id}>
                        <TableCell>{mark.subject}</TableCell>
                        <TableCell>{mark.examName}</TableCell>
                        <TableCell>{mark.score}</TableCell>
                        <TableCell>{mark.maxScore}</TableCell>
                        <TableCell>
                          {((mark.score / mark.maxScore) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Attendance Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Attendance Record
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.status}</TableCell>
                        <TableCell>{record.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Messages Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Messages</Typography>
                <Button
                  variant="contained"
                  startIcon={<MessageIcon />}
                  onClick={() => setOpenMessageDialog(true)}
                >
                  Send Message
                </Button>
              </Box>
              <List>
                {messages.map((message) => (
                  <React.Fragment key={message.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={message.subject}
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {message.content}
                            </Typography>
                            <br />
                            <Typography component="span" variant="caption" color="textSecondary">
                              {new Date(message.createdAt).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {/* Report Cards Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Report Cards
              </Typography>
              <Grid container spacing={3}>
                {reportCards.map((reportCard) => (
                  <Grid item xs={12} md={6} key={reportCard.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">
                          Academic Year: {reportCard.academicYear}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                          Generated on: {new Date(reportCard.generatedAt).toLocaleDateString()}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1">
                            Overall Performance
                          </Typography>
                          <Typography>
                            Total Marks: {reportCard.performance.totalMarks}
                          </Typography>
                          <Typography>
                            Max Marks: {reportCard.performance.maxMarks}
                          </Typography>
                          <Typography>
                            Percentage: {reportCard.performance.percentage.toFixed(1)}%
                          </Typography>
                          <Typography>
                            Grade: {reportCard.performance.grade}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Send Message Dialog */}
          <Dialog open={openMessageDialog} onClose={() => setOpenMessageDialog(false)}>
            <DialogTitle>Send Message to Teacher</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Subject"
                fullWidth
                value={messageForm.subject}
                onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Message"
                fullWidth
                multiline
                rows={4}
                value={messageForm.content}
                onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenMessageDialog(false)}>Cancel</Button>
              <Button onClick={handleSendMessage} variant="contained">
                Send
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default Parents; 
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import {
  getStudents,
  getTeachers,
  getClasses,
  getAttendance,
  getMarks,
  getFees,
  getPayments,
  getExpenses,
  generateReport
} from '../firebase/services';

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  
  // Dialog states
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    subject: '',
    examType: '',
    feeType: '',
    expenseCategory: ''
  });
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const data = await generateReport(reportType, dateRange, filters);
      setReportData(data);
      setOpenReportDialog(false);
      showNotification('Report generated successfully', 'success');
    } catch (error) {
      console.error('Error generating report:', error);
      showNotification('Error generating report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    // Implement report download functionality
    showNotification('Report downloaded successfully', 'success');
  };

  const handlePrintReport = () => {
    // Implement report printing functionality
    showNotification('Report printed successfully', 'success');
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'academic':
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Exam</TableCell>
                  <TableCell>Marks</TableCell>
                  <TableCell>Grade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.studentId}</TableCell>
                    <TableCell>{record.studentName}</TableCell>
                    <TableCell>{record.class}</TableCell>
                    <TableCell>{record.subject}</TableCell>
                    <TableCell>{record.exam}</TableCell>
                    <TableCell>{record.marks}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.grade}
                        color={
                          record.grade === 'A' ? 'success' :
                          record.grade === 'B' ? 'primary' :
                          record.grade === 'C' ? 'warning' :
                          'error'
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'attendance':
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Total Students</TableCell>
                  <TableCell>Present</TableCell>
                  <TableCell>Absent</TableCell>
                  <TableCell>Late</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.class}</TableCell>
                    <TableCell>{record.totalStudents}</TableCell>
                    <TableCell>{record.present}</TableCell>
                    <TableCell>{record.absent}</TableCell>
                    <TableCell>{record.late}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'financial':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Fee Collection Summary
                  </Typography>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Fees</TableCell>
                        <TableCell>₹{reportData.totalFees.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Collected</TableCell>
                        <TableCell>₹{reportData.collectedFees.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pending</TableCell>
                        <TableCell>₹{reportData.pendingFees.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Expense Summary
                  </Typography>
                  <Table>
                    <TableBody>
                      {Object.entries(reportData.expenses).map(([category, amount]) => (
                        <TableRow key={category}>
                          <TableCell>{category}</TableCell>
                          <TableCell>₹{amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 'performance':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Class Performance
                  </Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Class</TableCell>
                        <TableCell>Average Score</TableCell>
                        <TableCell>Pass Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.classPerformance.map((record) => (
                        <TableRow key={record.class}>
                          <TableCell>{record.class}</TableCell>
                          <TableCell>{record.averageScore}%</TableCell>
                          <TableCell>{record.passRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Subject Performance
                  </Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Average Score</TableCell>
                        <TableCell>Pass Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.subjectPerformance.map((record) => (
                        <TableRow key={record.subject}>
                          <TableCell>{record.subject}</TableCell>
                          <TableCell>{record.averageScore}%</TableCell>
                          <TableCell>{record.passRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab icon={<AssessmentIcon />} label="Academic Reports" />
        <Tab icon={<SchoolIcon />} label="Attendance Reports" />
        <Tab icon={<TrendingUpIcon />} label="Financial Reports" />
        <Tab icon={<PersonIcon />} label="Performance Analytics" />
      </Tabs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AssessmentIcon />}
          onClick={() => setOpenReportDialog(true)}
        >
          Generate Report
        </Button>
        <Box>
          <Tooltip title="Download Report">
            <IconButton onClick={handleDownloadReport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print Report">
            <IconButton onClick={handlePrintReport}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter Report">
            <IconButton onClick={() => setOpenFilterDialog(true)}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        renderReportContent()
      )}

      {/* Generate Report Dialog */}
      <Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)}>
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="academic">Academic Report</MenuItem>
              <MenuItem value="attendance">Attendance Report</MenuItem>
              <MenuItem value="financial">Financial Report</MenuItem>
              <MenuItem value="performance">Performance Analytics</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerateReport} variant="contained">
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)}>
        <DialogTitle>Filter Report</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Class</InputLabel>
            <Select
              value={filters.class}
              onChange={(e) => setFilters({ ...filters, class: e.target.value })}
            >
              <MenuItem value="">All Classes</MenuItem>
              <MenuItem value="1">Class 1</MenuItem>
              <MenuItem value="2">Class 2</MenuItem>
              <MenuItem value="3">Class 3</MenuItem>
              {/* Add more classes */}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Section</InputLabel>
            <Select
              value={filters.section}
              onChange={(e) => setFilters({ ...filters, section: e.target.value })}
            >
              <MenuItem value="">All Sections</MenuItem>
              <MenuItem value="A">Section A</MenuItem>
              <MenuItem value="B">Section B</MenuItem>
              <MenuItem value="C">Section C</MenuItem>
              {/* Add more sections */}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Subject</InputLabel>
            <Select
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            >
              <MenuItem value="">All Subjects</MenuItem>
              <MenuItem value="math">Mathematics</MenuItem>
              <MenuItem value="science">Science</MenuItem>
              <MenuItem value="english">English</MenuItem>
              {/* Add more subjects */}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Exam Type</InputLabel>
            <Select
              value={filters.examType}
              onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
            >
              <MenuItem value="">All Exams</MenuItem>
              <MenuItem value="midterm">Mid-term</MenuItem>
              <MenuItem value="final">Final</MenuItem>
              <MenuItem value="quiz">Quiz</MenuItem>
              {/* Add more exam types */}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Fee Type</InputLabel>
            <Select
              value={filters.feeType}
              onChange={(e) => setFilters({ ...filters, feeType: e.target.value })}
            >
              <MenuItem value="">All Fees</MenuItem>
              <MenuItem value="tuition">Tuition Fee</MenuItem>
              <MenuItem value="transport">Transport Fee</MenuItem>
              <MenuItem value="hostel">Hostel Fee</MenuItem>
              {/* Add more fee types */}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Expense Category</InputLabel>
            <Select
              value={filters.expenseCategory}
              onChange={(e) => setFilters({ ...filters, expenseCategory: e.target.value })}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="utilities">Utilities</MenuItem>
              <MenuItem value="salaries">Salaries</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              {/* Add more categories */}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilterDialog(false)}>Cancel</Button>
          <Button onClick={() => {
            setOpenFilterDialog(false);
            handleGenerateReport();
          }} variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports; 
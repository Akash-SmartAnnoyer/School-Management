import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { db } from '../firebase/config';

const AcademicYear = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentYear, setCurrentYear] = useState({
    startDate: '',
    endDate: '',
    isActive: false,
    name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'academicYears'));
      const years = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAcademicYears(years.sort((a, b) => b.startDate.localeCompare(a.startDate)));
    } catch (error) {
      setError('Error fetching academic years');
      console.error(error);
    }
  };

  const handleOpenDialog = (year = null) => {
    if (year) {
      setCurrentYear(year);
    } else {
      setCurrentYear({
        startDate: '',
        endDate: '',
        isActive: false,
        name: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    try {
      if (!currentYear.startDate || !currentYear.endDate || !currentYear.name) {
        setError('Please fill in all required fields');
        return;
      }

      // Check for overlapping dates
      const overlapping = academicYears.some(year => {
        if (year.id === currentYear.id) return false;
        return (
          (currentYear.startDate >= year.startDate && currentYear.startDate <= year.endDate) ||
          (currentYear.endDate >= year.startDate && currentYear.endDate <= year.endDate)
        );
      });

      if (overlapping) {
        setError('This academic year overlaps with an existing one');
        return;
      }

      if (currentYear.id) {
        // Update existing academic year
        await updateDoc(doc(db, 'academicYears', currentYear.id), currentYear);
        setSuccess('Academic year updated successfully');
      } else {
        // Add new academic year
        await addDoc(collection(db, 'academicYears'), currentYear);
        setSuccess('Academic year added successfully');
      }

      handleCloseDialog();
      fetchAcademicYears();
    } catch (error) {
      setError('Error saving academic year');
      console.error(error);
    }
  };

  const handlePromoteStudents = async () => {
    try {
      const activeYear = academicYears.find(year => year.isActive);
      if (!activeYear) {
        setError('No active academic year found');
        return;
      }

      // Get all students
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const students = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Promote each student to the next class
      for (const student of students) {
        const currentClass = student.class || '1';
        const nextClass = parseInt(currentClass) + 1;
        
        if (nextClass <= 12) { // Assuming maximum class is 12
          await updateDoc(doc(db, 'students', student.id), {
            class: nextClass.toString(),
            academicYear: activeYear.id
          });
        }
      }

      setSuccess('Students promoted successfully');
    } catch (error) {
      setError('Error promoting students');
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Academic Year Management</Typography>
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ mr: 2 }}
                  >
                    Add Academic Year
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handlePromoteStudents}
                  >
                    Promote Students
                  </Button>
                </Box>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {academicYears.map((year) => (
                      <TableRow key={year.id}>
                        <TableCell>{year.name}</TableCell>
                        <TableCell>{new Date(year.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(year.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Typography
                            color={year.isActive ? 'success.main' : 'text.secondary'}
                          >
                            {year.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(year)}
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentYear.id ? 'Edit Academic Year' : 'Add New Academic Year'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Academic Year Name"
              value={currentYear.name}
              onChange={(e) => setCurrentYear({ ...currentYear, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={currentYear.startDate}
              onChange={(e) => setCurrentYear({ ...currentYear, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={currentYear.endDate}
              onChange={(e) => setCurrentYear({ ...currentYear, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCurrentYear({ ...currentYear, isActive: !currentYear.isActive })}
              sx={{ mb: 2 }}
            >
              {currentYear.isActive ? 'Deactivate Year' : 'Activate Year'}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AcademicYear; 
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
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Settings as SettingsIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Event as EventIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getUserRole,
  updateSchoolSettings,
  getSchoolSettings
} from '../firebase/services';

const Administration = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [schoolSettings, setSchoolSettings] = useState({
    name: '',
    address: '',
    contact: '',
    email: '',
    website: '',
    academicYear: '',
    termDates: {
      start: '',
      end: ''
    }
  });
  
  // Dialog states
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  
  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    status: 'active'
  });
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, settingsData] = await Promise.all([
        getUsers(),
        getSchoolSettings()
      ]);
      
      setUsers(usersData);
      if (settingsData) {
        setSchoolSettings(settingsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Error loading data', 'error');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddUser = async () => {
    try {
      await addUser(userForm);
      setOpenUserDialog(false);
      setUserForm({
        name: '',
        email: '',
        role: '',
        department: '',
        status: 'active'
      });
      loadData();
      showNotification('User added successfully', 'success');
    } catch (error) {
      console.error('Error adding user:', error);
      showNotification('Error adding user', 'error');
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await updateSchoolSettings(schoolSettings);
      setOpenSettingsDialog(false);
      loadData();
      showNotification('School settings updated successfully', 'success');
    } catch (error) {
      console.error('Error updating settings:', error);
      showNotification('Error updating settings', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      loadData();
      showNotification('User deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Error deleting user', 'error');
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await updateUser(userId, { status: newStatus });
      showNotification('User status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating user status:', error);
      showNotification('Error updating user status', 'error');
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Administration
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab icon={<SettingsIcon />} label="School Settings" />
        <Tab icon={<PeopleIcon />} label="User Management" />
        <Tab icon={<SecurityIcon />} label="Access Control" />
        <Tab icon={<SchoolIcon />} label="Academic Calendar" />
      </Tabs>

      {/* School Settings Tab */}
      {activeTab === 0 && (
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">School Information</Typography>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setOpenSettingsDialog(true)}
                >
                  Edit Settings
                </Button>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">School Name</Typography>
                  <Typography>{schoolSettings.name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Contact</Typography>
                  <Typography>{schoolSettings.contact}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Email</Typography>
                  <Typography>{schoolSettings.email}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Website</Typography>
                  <Typography>{schoolSettings.website}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Academic Year</Typography>
                  <Typography>{schoolSettings.academicYear}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Term Dates</Typography>
                  <Typography>
                    {schoolSettings.termDates.start} - {schoolSettings.termDates.end}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* User Management Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">User Management</Typography>
            <Button
              variant="contained"
              startIcon={<PeopleIcon />}
              onClick={() => setOpenUserDialog(true)}
            >
              Add User
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={user.status === 'active'}
                            onChange={() => handleUpdateUserStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}
                          />
                        }
                        label={user.status}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteUser(user.id)}>
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

      {/* Access Control Tab */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Role Permissions
          </Typography>
          <Grid container spacing={3}>
            {['Admin', 'Teacher', 'Staff', 'Parent'].map((role) => (
              <Grid item xs={12} md={6} key={role}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {role}
                    </Typography>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="View Dashboard"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Manage Students"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Manage Classes"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Manage Attendance"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Manage Exams"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Generate Reports"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Academic Calendar Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Academic Calendar
          </Typography>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Current Term</Typography>
                  <Typography>
                    {schoolSettings.termDates.start} - {schoolSettings.termDates.end}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Upcoming Events</Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Parent-Teacher Meeting"
                        secondary="March 25, 2024"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Annual Sports Day"
                        secondary="April 15, 2024"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="School Annual Day"
                        secondary="May 5, 2024"
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Add User Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="parent">Parent</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Department"
            fullWidth
            value={userForm.department}
            onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* School Settings Dialog */}
      <Dialog open={openSettingsDialog} onClose={() => setOpenSettingsDialog(false)}>
        <DialogTitle>Edit School Settings</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="School Name"
            fullWidth
            value={schoolSettings.name}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Contact"
            fullWidth
            value={schoolSettings.contact}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, contact: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={schoolSettings.email}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Website"
            fullWidth
            value={schoolSettings.website}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, website: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Academic Year"
            fullWidth
            value={schoolSettings.academicYear}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, academicYear: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Term Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={schoolSettings.termDates.start}
            onChange={(e) => setSchoolSettings({
              ...schoolSettings,
              termDates: { ...schoolSettings.termDates, start: e.target.value }
            })}
          />
          <TextField
            margin="dense"
            label="Term End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={schoolSettings.termDates.end}
            onChange={(e) => setSchoolSettings({
              ...schoolSettings,
              termDates: { ...schoolSettings.termDates, end: e.target.value }
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettingsDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateSettings} variant="contained">
            Save
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

export default Administration; 
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
  Chip
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import {
  getFees,
  addFee,
  updateFee,
  deleteFee,
  getPayments,
  addPayment,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  generateFinancialReport
} from '../firebase/services';

const Finance = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [financialReport, setFinancialReport] = useState(null);
  
  // Dialog states
  const [openFeeDialog, setOpenFeeDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  
  // Form states
  const [feeForm, setFeeForm] = useState({
    name: '',
    amount: '',
    dueDate: '',
    type: 'regular',
    description: ''
  });
  
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    feeId: '',
    amount: '',
    paymentDate: '',
    paymentMethod: 'cash',
    reference: ''
  });
  
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    description: '',
    amount: '',
    date: '',
    paymentMethod: 'cash',
    reference: ''
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
      const [feesData, paymentsData, expensesData, reportData] = await Promise.all([
        getFees(),
        getPayments(),
        getExpenses(),
        generateFinancialReport()
      ]);
      
      setFees(feesData);
      setPayments(paymentsData);
      setExpenses(expensesData);
      setFinancialReport(reportData);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Error loading data', 'error');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddFee = async () => {
    try {
      await addFee(feeForm);
      setOpenFeeDialog(false);
      setFeeForm({
        name: '',
        amount: '',
        dueDate: '',
        type: 'regular',
        description: ''
      });
      loadData();
      showNotification('Fee added successfully', 'success');
    } catch (error) {
      console.error('Error adding fee:', error);
      showNotification('Error adding fee', 'error');
    }
  };

  const handleAddPayment = async () => {
    try {
      await addPayment(paymentForm);
      setOpenPaymentDialog(false);
      setPaymentForm({
        studentId: '',
        feeId: '',
        amount: '',
        paymentDate: '',
        paymentMethod: 'cash',
        reference: ''
      });
      loadData();
      showNotification('Payment added successfully', 'success');
    } catch (error) {
      console.error('Error adding payment:', error);
      showNotification('Error adding payment', 'error');
    }
  };

  const handleAddExpense = async () => {
    try {
      await addExpense(expenseForm);
      setOpenExpenseDialog(false);
      setExpenseForm({
        category: '',
        description: '',
        amount: '',
        date: '',
        paymentMethod: 'cash',
        reference: ''
      });
      loadData();
      showNotification('Expense added successfully', 'success');
    } catch (error) {
      console.error('Error adding expense:', error);
      showNotification('Error adding expense', 'error');
    }
  };

  const handleDeleteFee = async (feeId) => {
    try {
      await deleteFee(feeId);
      loadData();
      showNotification('Fee deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting fee:', error);
      showNotification('Error deleting fee', 'error');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteExpense(expenseId);
      loadData();
      showNotification('Expense deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting expense:', error);
      showNotification('Error deleting expense', 'error');
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
        Finance Management
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab icon={<AccountBalanceIcon />} label="Overview" />
        <Tab icon={<ReceiptIcon />} label="Fees" />
        <Tab icon={<PaymentIcon />} label="Payments" />
        <Tab icon={<AssessmentIcon />} label="Expenses" />
      </Tabs>

      {/* Overview Tab */}
      {activeTab === 0 && financialReport && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4" color="success.main">
                  ₹{financialReport.totalRevenue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Expenses
                </Typography>
                <Typography variant="h4" color="error.main">
                  ₹{financialReport.totalExpenses.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Net Balance
                </Typography>
                <Typography variant="h4" color={financialReport.netBalance >= 0 ? 'success.main' : 'error.main'}>
                  ₹{financialReport.netBalance.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Fees Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Fee Structure</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenFeeDialog(true)}
            >
              Add Fee
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>{fee.name}</TableCell>
                    <TableCell>₹{fee.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={fee.type}
                        color={fee.type === 'regular' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{fee.description}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteFee(fee.id)}>
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

      {/* Payments Tab */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Payment Records</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenPaymentDialog(true)}
            >
              Add Payment
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Fee</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.studentId}</TableCell>
                    <TableCell>{payment.feeId}</TableCell>
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>{payment.reference}</TableCell>
                    <TableCell>
                      <Tooltip title="Print Receipt">
                        <IconButton>
                          <PrintIcon />
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

      {/* Expenses Tab */}
      {activeTab === 3 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Expense Records</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenExpenseDialog(true)}
            >
              Add Expense
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>₹{expense.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.paymentMethod}</TableCell>
                    <TableCell>{expense.reference}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteExpense(expense.id)}>
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

      {/* Add Fee Dialog */}
      <Dialog open={openFeeDialog} onClose={() => setOpenFeeDialog(false)}>
        <DialogTitle>Add New Fee</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Fee Name"
            fullWidth
            value={feeForm.name}
            onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={feeForm.amount}
            onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={feeForm.dueDate}
            onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              value={feeForm.type}
              onChange={(e) => setFeeForm({ ...feeForm, type: e.target.value })}
            >
              <MenuItem value="regular">Regular</MenuItem>
              <MenuItem value="one-time">One-time</MenuItem>
              <MenuItem value="late">Late Fee</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={feeForm.description}
            onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFeeDialog(false)}>Cancel</Button>
          <Button onClick={handleAddFee} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
        <DialogTitle>Add New Payment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Student ID"
            fullWidth
            value={paymentForm.studentId}
            onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Fee</InputLabel>
            <Select
              value={paymentForm.feeId}
              onChange={(e) => setPaymentForm({ ...paymentForm, feeId: e.target.value })}
            >
              {fees.map((fee) => (
                <MenuItem key={fee.id} value={fee.id}>
                  {fee.name} - ₹{fee.amount}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Payment Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={paymentForm.paymentDate}
            onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="bank">Bank Transfer</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Reference"
            fullWidth
            value={paymentForm.reference}
            onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddPayment} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={openExpenseDialog} onClose={() => setOpenExpenseDialog(false)}>
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
            >
              <MenuItem value="utilities">Utilities</MenuItem>
              <MenuItem value="salaries">Salaries</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="supplies">Supplies</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={expenseForm.date}
            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={expenseForm.paymentMethod}
              onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="bank">Bank Transfer</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Reference"
            fullWidth
            value={expenseForm.reference}
            onChange={(e) => setExpenseForm({ ...expenseForm, reference: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExpenseDialog(false)}>Cancel</Button>
          <Button onClick={handleAddExpense} variant="contained">
            Add
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

export default Finance; 
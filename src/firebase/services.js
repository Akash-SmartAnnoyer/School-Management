import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db } from './config';

// Generic functions
export const subscribeToCollection = (collectionName, callback) => {
  const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
};

// Students Collection
export const studentsCollection = collection(db, 'students');

export const addStudent = async (studentData) => {
  try {
    const docRef = await addDoc(collection(db, 'students'), {
      ...studentData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding student:', error);
    throw error;
  }
};

export const getStudents = async () => {
  try {
    const querySnapshot = await getDocs(studentsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting students:', error);
    throw error;
  }
};

export const updateStudent = async (studentId, studentData) => {
  try {
    const studentRef = doc(db, 'students', studentId);
    await updateDoc(studentRef, {
      ...studentData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

export const deleteStudent = async (studentId) => {
  try {
    const studentRef = doc(db, 'students', studentId);
    await deleteDoc(studentRef);
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

// Teachers Collection
export const teachersCollection = collection(db, 'teachers');

export const addTeacher = async (teacherData) => {
  try {
    const docRef = await addDoc(collection(db, 'teachers'), {
      ...teacherData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding teacher:', error);
    throw error;
  }
};

export const getTeachers = async () => {
  try {
    const querySnapshot = await getDocs(teachersCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting teachers:', error);
    throw error;
  }
};

export const updateTeacher = async (teacherId, teacherData) => {
  try {
    const teacherRef = doc(db, 'teachers', teacherId);
    await updateDoc(teacherRef, {
      ...teacherData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    throw error;
  }
};

export const deleteTeacher = async (teacherId) => {
  try {
    const teacherRef = doc(db, 'teachers', teacherId);
    await deleteDoc(teacherRef);
  } catch (error) {
    console.error('Error deleting teacher:', error);
    throw error;
  }
};

// Classes Collection
export const classesCollection = collection(db, 'classes');

export const addClass = async (classData) => {
  try {
    const docRef = await addDoc(collection(db, 'classes'), {
      ...classData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding class:', error);
    throw error;
  }
};

export const getClasses = async () => {
  try {
    const querySnapshot = await getDocs(classesCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting classes:', error);
    throw error;
  }
};

export const updateClass = async (classId, classData) => {
  try {
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
      ...classData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating class:', error);
    throw error;
  }
};

export const deleteClass = async (classId) => {
  try {
    const classRef = doc(db, 'classes', classId);
    await deleteDoc(classRef);
  } catch (error) {
    console.error('Error deleting class:', error);
    throw error;
  }
};

// Attendance Collection
export const attendanceCollection = collection(db, 'attendance');

export const addAttendance = async (attendanceData, collectionName = 'attendance') => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...attendanceData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding attendance:', error);
    throw error;
  }
};

export const getAttendance = async (date, classId, collectionName = 'attendance') => {
  try {
    let q;
    if (collectionName === 'attendance') {
      q = query(
        collection(db, collectionName),
        where('date', '==', date),
        where('classId', '==', classId)
      );
    } else {
      q = query(
        collection(db, collectionName),
        where('date', '==', date)
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting attendance:', error);
    throw error;
  }
};

// Finance Collection
export const financeCollection = collection(db, 'finance');

export const addTransaction = async (transactionData) => {
  try {
    const docRef = await addDoc(collection(db, 'finance'), {
      ...transactionData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const getTransactions = async () => {
  try {
    const querySnapshot = await getDocs(financeCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

export const updateTransaction = async (transactionId, transactionData) => {
  try {
    const transactionRef = doc(db, 'finance', transactionId);
    await updateDoc(transactionRef, {
      ...transactionData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId) => {
  try {
    const transactionRef = doc(db, 'finance', transactionId);
    await deleteDoc(transactionRef);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Subjects Collection
export const subjectsCollection = collection(db, 'subjects');

export const addSubject = async (subjectData) => {
  try {
    const docRef = await addDoc(collection(db, 'subjects'), {
      ...subjectData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding subject:', error);
    throw error;
  }
};

export const getSubjects = async () => {
  try {
    const querySnapshot = await getDocs(subjectsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting subjects:', error);
    throw error;
  }
};

// Exams Collection
export const examsCollection = collection(db, 'exams');

export const addExam = async (examData) => {
  try {
    const docRef = await addDoc(collection(db, 'exams'), {
      ...examData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding exam:', error);
    throw error;
  }
};

export const getExams = async () => {
  try {
    const querySnapshot = await getDocs(examsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting exams:', error);
    throw error;
  }
};

export const getExamsByClass = async (classId) => {
  try {
    const q = query(
      collection(db, 'exams'),
      where('classId', '==', classId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting exams by class:', error);
    throw error;
  }
};

// Marks Collection
export const marksCollection = collection(db, 'marks');

export const addMarks = async (marksData) => {
  try {
    const docRef = await addDoc(collection(db, 'marks'), {
      ...marksData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding marks:', error);
    throw error;
  }
};

export const getMarksByExam = async (examId) => {
  try {
    const q = query(
      collection(db, 'marks'),
      where('examId', '==', examId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting marks by exam:', error);
    throw error;
  }
};

export const getStudentMarks = async (studentId) => {
  try {
    const q = query(
      collection(db, 'marks'),
      where('studentId', '==', studentId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting student marks:', error);
    throw error;
  }
};

// Report Cards Collection
export const reportCardsCollection = collection(db, 'reportCards');

export const addReportCard = async (reportCardData) => {
  try {
    const docRef = await addDoc(collection(db, 'reportCards'), {
      ...reportCardData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding report card:', error);
    throw error;
  }
};

export const getReportCard = async (studentId, academicYear) => {
  try {
    const q = query(
      collection(db, 'reportCards'),
      where('studentId', '==', studentId),
      where('academicYear', '==', academicYear)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting report card:', error);
    throw error;
  }
};

export const generateReportCard = async (studentId, academicYear) => {
  try {
    // Get all marks for the student in the academic year
    const marks = await getStudentMarks(studentId);
    
    // Calculate performance metrics
    const performance = calculatePerformance(marks);
    
    // Create report card
    const reportCardData = {
      studentId,
      academicYear,
      performance,
      marks,
      generatedAt: new Date().toISOString()
    };
    
    return await addReportCard(reportCardData);
  } catch (error) {
    console.error('Error generating report card:', error);
    throw error;
  }
};

// Helper function to calculate performance metrics
const calculatePerformance = (marks) => {
  const totalMarks = marks.reduce((sum, mark) => sum + mark.score, 0);
  const maxMarks = marks.reduce((sum, mark) => sum + mark.maxScore, 0);
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

// Parents
export const addParent = async (parentData) => {
  try {
    const docRef = await addDoc(collection(db, 'parents'), {
      ...parentData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding parent:', error);
    throw error;
  }
};

export const updateParent = async (parentId, parentData) => {
  try {
    const parentRef = doc(db, 'parents', parentId);
    await updateDoc(parentRef, {
      ...parentData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating parent:', error);
    throw error;
  }
};

export const deleteParent = async (parentId) => {
  try {
    const parentRef = doc(db, 'parents', parentId);
    await deleteDoc(parentRef);
  } catch (error) {
    console.error('Error deleting parent:', error);
    throw error;
  }
};

// Communication
export const addMessage = async (messageData) => {
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...messageData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

export const updateMessage = async (messageId, messageData) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      ...messageData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Reports
export const generateReport = async (reportData) => {
  try {
    const docRef = await addDoc(collection(db, 'reports'), {
      ...reportData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

export const updateReport = async (reportId, reportData) => {
  try {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      ...reportData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
};

export const deleteReport = async (reportId) => {
  try {
    const reportRef = doc(db, 'reports', reportId);
    await deleteDoc(reportRef);
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

export const getReport = async (reportId) => {
  try {
    const reportRef = doc(db, 'reports', reportId);
    const reportDoc = await getDoc(reportRef);
    if (reportDoc.exists()) {
      return { id: reportDoc.id, ...reportDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting report:', error);
    throw error;
  }
};

// User Management
export const addUser = async (userData) => {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Update Profile
export const updateProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create the document if it doesn't exist
      await setDoc(userRef, {
        ...profileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Update the existing document
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// School Settings
export const getSchoolSettings = async () => {
  try {
    const docRef = doc(db, 'settings', 'school');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error getting school settings:', error);
    throw error;
  }
};

export const updateSchoolSettings = async (settings) => {
  try {
    const docRef = doc(db, 'settings', 'school');
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    console.error('Error updating school settings:', error);
    throw error;
  }
};

// User Management
export const getUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// Announcements
export const getAnnouncements = async () => {
  try {
    const announcementsRef = collection(db, 'announcements');
    const q = query(announcementsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting announcements:', error);
    throw error;
  }
};

export const addAnnouncement = async (announcementData) => {
  try {
    const announcementsRef = collection(db, 'announcements');
    const docRef = await addDoc(announcementsRef, {
      ...announcementData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding announcement:', error);
    throw error;
  }
};

export const deleteAnnouncement = async (announcementId) => {
  try {
    await deleteDoc(doc(db, 'announcements', announcementId));
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

// Messages
export const getMessages = async (userId) => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

export const sendMessage = async (messageData) => {
  try {
    const messagesRef = collection(db, 'messages');
    const docRef = await addDoc(messagesRef, {
      ...messageData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Events
export const getEvents = async () => {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting events:', error);
    throw error;
  }
};

export const addEvent = async (eventData) => {
  try {
    const eventsRef = collection(db, 'events');
    const docRef = await addDoc(eventsRef, {
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    await deleteDoc(doc(db, 'events', eventId));
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Financial Management
export const getFees = async () => {
  try {
    const feesRef = collection(db, 'fees');
    const q = query(feesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting fees:', error);
    throw error;
  }
};

export const getPayments = async () => {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting payments:', error);
    throw error;
  }
};

export const getExpenses = async () => {
  try {
    const expensesRef = collection(db, 'expenses');
    const q = query(expensesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
};

export const generateFinancialReport = async (startDate, endDate) => {
  try {
    const paymentsRef = collection(db, 'payments');
    const expensesRef = collection(db, 'expenses');

    const paymentsQuery = query(
      paymentsRef,
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate)
    );
    const expensesQuery = query(
      expensesRef,
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate)
    );

    const [paymentsSnapshot, expensesSnapshot] = await Promise.all([
      getDocs(paymentsQuery),
      getDocs(expensesQuery)
    ]);

    const payments = paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    const expenses = expensesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netBalance = totalRevenue - totalExpenses;

    return {
      payments,
      expenses,
      totalRevenue,
      totalExpenses,
      netBalance
    };
  } catch (error) {
    console.error('Error generating financial report:', error);
    throw error;
  }
};

export const addFee = async (feeData) => {
  try {
    const feesRef = collection(db, 'fees');
    const docRef = await addDoc(feesRef, {
      ...feeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding fee:', error);
    throw error;
  }
};

export const addPayment = async (paymentData) => {
  try {
    const paymentsRef = collection(db, 'payments');
    const docRef = await addDoc(paymentsRef, {
      ...paymentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding payment:', error);
    throw error;
  }
};

export const addExpense = async (expenseData) => {
  try {
    const expensesRef = collection(db, 'expenses');
    const docRef = await addDoc(expensesRef, {
      ...expenseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const deleteFee = async (feeId) => {
  try {
    await deleteDoc(doc(db, 'fees', feeId));
  } catch (error) {
    console.error('Error deleting fee:', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

export const deleteAllFromCollection = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error(`Error deleting all documents from ${collectionName}:`, error);
    throw error;
  }
};

export const initializeDatabase = async () => {
  try {
    // First, delete all existing data
    await deleteAllFromCollection('teachers');
    await deleteAllFromCollection('classes');
    await deleteAllFromCollection('students');
    await deleteAllFromCollection('attendance');
    await deleteAllFromCollection('fees');
    await deleteAllFromCollection('exams');
    await deleteAllFromCollection('examResults');

    // Sample data for teachers
    const subjects = [
      'Mathematics', 'Science', 'English', 'History', 'Geography', 
      'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics',
      'Political Science', 'Sociology', 'Psychology', 'Physical Education',
      'Art', 'Music', 'Languages', 'Environmental Science', 'Business Studies'
    ];

    const qualifications = [
      'M.Sc. Mathematics', 'M.Sc. Physics', 'M.A. English', 'M.A. History',
      'M.Sc. Chemistry', 'M.Sc. Biology', 'M.Tech Computer Science',
      'M.A. Economics', 'M.A. Political Science', 'M.A. Sociology',
      'M.A. Psychology', 'M.P.Ed', 'M.F.A', 'M.Music', 'M.A. Languages',
      'M.Sc. Environmental Science', 'M.B.A', 'Ph.D. Mathematics',
      'Ph.D. Physics', 'Ph.D. English'
    ];

    // Generate 20 teachers
    const teachers = Array.from({ length: 20 }, (_, index) => ({
      name: `Teacher ${index + 1}`,
      subject: subjects[index % subjects.length],
      qualification: qualifications[index % qualifications.length],
      email: `teacher${index + 1}@school.com`,
      phone: `1234567${String(index + 1).padStart(4, '0')}`,
      experience: Math.floor(Math.random() * 15) + 1,
      status: 'Active',
      // Using UI Faces for teacher profile images
      photoURL: `https://i.pravatar.cc/150?img=${index + 1}`,
      photoPublicId: `teacher-${index + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Create teachers first and store their IDs
    const createdTeachers = [];
    for (const teacher of teachers) {
      const teacherId = await addTeacher(teacher);
      createdTeachers.push({ id: teacherId, ...teacher });
    }

    // Generate 20 classes (10 classes with 2 sections each)
    const classes = [];
    for (let i = 1; i <= 10; i++) {
      for (let section of ['A', 'B']) {
        // Randomly select a teacher from the created teachers
        const randomTeacher = createdTeachers[Math.floor(Math.random() * createdTeachers.length)];
        
        classes.push({
          className: `Class ${i}`,
          section: section,
          teacherId: randomTeacher.id,
          capacity: 40,
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Create classes and store their IDs
    const createdClasses = [];
    for (const cls of classes) {
      const classId = await addClass(cls);
      createdClasses.push({ id: classId, ...cls });
    }

    // Generate 100 students
    const firstNames = [
      'Aarav', 'Aditya', 'Aisha', 'Akash', 'Ananya', 'Arjun', 'Avni', 'Bharat',
      'Chandra', 'Deepak', 'Esha', 'Farhan', 'Gita', 'Harsh', 'Isha', 'Jatin',
      'Kavita', 'Lakshmi', 'Madhav', 'Neha', 'Om', 'Priya', 'Rahul', 'Sneha',
      'Tanvi', 'Umesh', 'Varsha', 'Yash', 'Zara'
    ];

    const lastNames = [
      'Sharma', 'Patel', 'Singh', 'Kumar', 'Verma', 'Gupta', 'Reddy', 'Mishra',
      'Iyer', 'Nair', 'Menon', 'Pillai', 'Nambiar', 'Krishnan', 'Rajan', 'Nair',
      'Menon', 'Pillai', 'Nambiar', 'Krishnan', 'Rajan', 'Nair', 'Menon', 'Pillai',
      'Nambiar', 'Krishnan', 'Rajan', 'Nair', 'Menon', 'Pillai'
    ];

    // Create students
    for (let i = 0; i < 100; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const randomClass = createdClasses[Math.floor(Math.random() * createdClasses.length)];

      const student = {
        name: `${firstName} ${lastName}`,
        rollNumber: `ROLL${String(i + 1).padStart(4, '0')}`,
        classId: randomClass.id,
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        email: `${firstName.toLowerCase()}${i + 1}@school.com`,
        phone: `9876543${String(i + 1).padStart(4, '0')}`,
        status: 'Active',
        // Using UI Faces for student profile images
        photoURL: `https://i.pravatar.cc/150?img=${i + 100}`,
        photoPublicId: `student-${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addStudent(student);
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const getSectionsByClass = async (classId) => {
  try {
    const sectionsRef = collection(db, 'sections');
    const q = query(sectionsRef, where('classId', '==', classId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting sections:', error);
    throw error;
  }
}; 
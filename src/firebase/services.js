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

export const addAttendance = async (attendanceData) => {
  try {
    const docRef = await addDoc(collection(db, 'attendance'), {
      ...attendanceData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding attendance:', error);
    throw error;
  }
};

export const getAttendance = async (date, classId) => {
  try {
    const q = query(
      collection(db, 'attendance'),
      where('date', '==', date),
      where('classId', '==', classId)
    );
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

// Academics
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

export const updateExam = async (examId, examData) => {
  try {
    const examRef = doc(db, 'exams', examId);
    await updateDoc(examRef, {
      ...examData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    throw error;
  }
};

export const deleteExam = async (examId) => {
  try {
    const examRef = doc(db, 'exams', examId);
    await deleteDoc(examRef);
  } catch (error) {
    console.error('Error deleting exam:', error);
    throw error;
  }
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
export const updateSchoolSettings = async (userId, settingsData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...settingsData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating school settings:', error);
    throw error;
  }
};

// User Management
export const createUserDocument = async (user, role = 'user') => {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      role: role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return userRef.id;
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

export const getUserRole = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    throw error;
  }
}; 
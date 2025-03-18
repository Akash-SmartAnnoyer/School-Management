import { addDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const clearCollection = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);
    console.log(`Cleared ${collectionName} collection`);
  } catch (error) {
    console.error(`Error clearing ${collectionName} collection:`, error);
  }
};

export const uploadSampleData = async () => {
  try {
    // Clear existing data first
    await clearCollection('finance');
    await clearCollection('attendance');
    await clearCollection('students');
    await clearCollection('teachers');
    await clearCollection('classes');

    // Sample Classes with sections
    const classes = [
      { className: 'Class 1', section: 'A', teacher: 'John Doe', capacity: 30, status: 'Active' },
      { className: 'Class 1', section: 'B', teacher: 'Jane Smith', capacity: 30, status: 'Active' },
      { className: 'Class 2', section: 'A', teacher: 'Mike Johnson', capacity: 30, status: 'Active' },
      { className: 'Class 2', section: 'B', teacher: 'Sarah Williams', capacity: 30, status: 'Active' },
      { className: 'Class 3', section: 'A', teacher: 'David Brown', capacity: 30, status: 'Active' },
      { className: 'Class 3', section: 'B', teacher: 'Lisa Anderson', capacity: 30, status: 'Active' },
    ];

    // First, add classes and store their IDs
    const classIds = [];
    for (const cls of classes) {
      const docRef = await addDoc(collection(db, 'classes'), {
        ...cls,
        createdAt: new Date().toISOString()
      });
      classIds.push(docRef.id);
    }

    // Sample Teachers
    const teachers = [
      { name: 'John Doe', subject: 'Mathematics', qualification: 'M.Sc', status: 'Active', classId: classIds[0] },
      { name: 'Jane Smith', subject: 'Science', qualification: 'M.Sc', status: 'Active', classId: classIds[1] },
      { name: 'Mike Johnson', subject: 'English', qualification: 'M.A', status: 'Active', classId: classIds[2] },
      { name: 'Sarah Williams', subject: 'History', qualification: 'M.A', status: 'Active', classId: classIds[3] },
      { name: 'David Brown', subject: 'Physics', qualification: 'M.Sc', status: 'Active', classId: classIds[4] },
      { name: 'Lisa Anderson', subject: 'Chemistry', qualification: 'M.Sc', status: 'Active', classId: classIds[5] },
    ];

    // Add teachers and store their IDs
    const teacherIds = [];
    for (const teacher of teachers) {
      const docRef = await addDoc(collection(db, 'teachers'), {
        ...teacher,
        createdAt: new Date().toISOString()
      });
      teacherIds.push(docRef.id);
    }

    // Sample Students with proper class and section references
    const students = [
      { name: 'Rahul Kumar', classId: classIds[0], rollNumber: '1A01', gender: 'Male', status: 'Active' },
      { name: 'Priya Sharma', classId: classIds[0], rollNumber: '1A02', gender: 'Female', status: 'Active' },
      { name: 'Amit Patel', classId: classIds[1], rollNumber: '1B01', gender: 'Male', status: 'Active' },
      { name: 'Neha Gupta', classId: classIds[1], rollNumber: '1B02', gender: 'Female', status: 'Active' },
      { name: 'Arun Singh', classId: classIds[2], rollNumber: '2A01', gender: 'Male', status: 'Active' },
      { name: 'Pooja Verma', classId: classIds[2], rollNumber: '2A02', gender: 'Female', status: 'Active' },
      { name: 'Vikram Kumar', classId: classIds[3], rollNumber: '2B01', gender: 'Male', status: 'Active' },
      { name: 'Anjali Sharma', classId: classIds[3], rollNumber: '2B02', gender: 'Female', status: 'Active' },
      { name: 'Rohit Patel', classId: classIds[4], rollNumber: '3A01', gender: 'Male', status: 'Active' },
      { name: 'Meera Gupta', classId: classIds[4], rollNumber: '3A02', gender: 'Female', status: 'Active' },
      { name: 'Aditya Singh', classId: classIds[5], rollNumber: '3B01', gender: 'Male', status: 'Active' },
      { name: 'Sneha Reddy', classId: classIds[5], rollNumber: '3B02', gender: 'Female', status: 'Active' },
    ];

    // Add students and store their IDs
    const studentIds = [];
    for (const student of students) {
      const docRef = await addDoc(collection(db, 'students'), {
        ...student,
        createdAt: new Date().toISOString()
      });
      studentIds.push(docRef.id);
    }

    // Sample Attendance for today
    const today = new Date().toISOString().split('T')[0];
    const attendance = studentIds.map((studentId, index) => {
      const student = students[index];
      return {
        studentId: studentId,
        classId: student.classId,
        date: today,
        status: Math.random() > 0.2 ? 'Present' : 'Absent',
        timestamp: new Date().toISOString()
      };
    });

    // Add attendance records
    for (const record of attendance) {
      await addDoc(collection(db, 'attendance'), {
        ...record,
        createdAt: new Date().toISOString()
      });
    }

    // Sample Finance Transactions
    const finance = [
      { date: today, type: 'Income', category: 'Tuition Fee', description: 'Monthly fee collection', amount: 5000 },
      { date: today, type: 'Income', category: 'Transport Fee', description: 'Bus fee collection', amount: 1000 },
      { date: today, type: 'Expense', category: 'Salaries', description: 'Teacher salaries', amount: 3000 },
      { date: today, type: 'Expense', category: 'Utilities', description: 'Electricity bill', amount: 500 },
    ];

    // Add finance transactions
    for (const transaction of finance) {
      await addDoc(collection(db, 'finance'), {
        ...transaction,
        createdAt: new Date().toISOString()
      });
    }

    console.log('Sample data uploaded successfully');
  } catch (error) {
    console.error('Error uploading sample data:', error);
  }
}; 
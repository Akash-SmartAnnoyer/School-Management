import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

// Exam Management
export const createExam = async (examData) => {
  try {
    const docRef = await addDoc(collection(db, 'exams'), {
      ...examData,
      createdAt: new Date(),
    });
    return { id: docRef.id, ...examData };
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

export const getExams = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'exams'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};

export const updateExam = async (examId, examData) => {
  try {
    const examRef = doc(db, 'exams', examId);
    await updateDoc(examRef, examData);
    return { id: examId, ...examData };
  } catch (error) {
    console.error('Error updating exam:', error);
    throw error;
  }
};

export const deleteExam = async (examId) => {
  try {
    await deleteDoc(doc(db, 'exams', examId));
    return examId;
  } catch (error) {
    console.error('Error deleting exam:', error);
    throw error;
  }
};

// Marks Management
export const saveMarks = async (marksData) => {
  try {
    const batch = db.batch();
    marksData.forEach(mark => {
      const markRef = doc(collection(db, 'marks'));
      batch.set(markRef, {
        ...mark,
        createdAt: new Date(),
      });
    });
    await batch.commit();
    return marksData;
  } catch (error) {
    console.error('Error saving marks:', error);
    throw error;
  }
};

export const getMarks = async (examId, classId) => {
  try {
    const marksQuery = query(
      collection(db, 'marks'),
      where('examId', '==', examId),
      where('classId', '==', classId)
    );
    const querySnapshot = await getDocs(marksQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching marks:', error);
    throw error;
  }
};

// Reports
export const getClassPerformance = async (classId, examId) => {
  try {
    const marks = await getMarks(examId, classId);
    const students = await getStudentsByClass(classId);
    
    const performance = {
      average: 0,
      boys: { count: 0, average: 0 },
      girls: { count: 0, average: 0 },
      students: []
    };

    marks.forEach(mark => {
      const student = students.find(s => s.id === mark.studentId);
      if (student) {
        performance.students.push({
          ...mark,
          studentName: student.name,
          rollNo: student.rollNo
        });

        if (student.gender === 'male') {
          performance.boys.count++;
          performance.boys.average += mark.marks;
        } else {
          performance.girls.count++;
          performance.girls.average += mark.marks;
        }
      }
    });

    // Calculate averages
    const totalStudents = performance.students.length;
    if (totalStudents > 0) {
      performance.average = performance.students.reduce((acc, curr) => acc + curr.marks, 0) / totalStudents;
      performance.boys.average = performance.boys.count > 0 ? performance.boys.average / performance.boys.count : 0;
      performance.girls.average = performance.girls.count > 0 ? performance.girls.average / performance.girls.count : 0;
    }

    return performance;
  } catch (error) {
    console.error('Error getting class performance:', error);
    throw error;
  }
};

export const getStudentReport = async (studentId, examId) => {
  try {
    const marks = await getMarks(examId);
    const studentMarks = marks.filter(mark => mark.studentId === studentId);
    const student = await getStudentById(studentId);
    
    return {
      studentInfo: student,
      subjectMarks: studentMarks,
      totalMarks: studentMarks.reduce((acc, curr) => acc + curr.marks, 0),
      percentage: (studentMarks.reduce((acc, curr) => acc + curr.marks, 0) / (studentMarks.length * 100)) * 100
    };
  } catch (error) {
    console.error('Error getting student report:', error);
    throw error;
  }
};

// Helper functions
const getStudentsByClass = async (classId) => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'students'), where('classId', '==', classId))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

const getStudentById = async (studentId) => {
  try {
    const docRef = doc(db, 'students', studentId);
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('Error fetching student:', error);
    throw error;
  }
}; 
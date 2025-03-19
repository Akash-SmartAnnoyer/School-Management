import { addDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const subjects = [
  'Mathematics', 'Science', 'English', 'History', 'Physics', 'Chemistry',
  'Biology', 'Computer Science', 'Economics', 'Geography', 'Political Science',
  'Sociology', 'Psychology', 'Physical Education', 'Art', 'Music', 'Languages',
  'Environmental Science', 'Business Studies', 'Accountancy'
];

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

// Helper function to generate random names
const generateName = (isTeacher = false) => {
  const firstNames = ['Rahul', 'Priya', 'Amit', 'Neha', 'Arun', 'Pooja', 'Vikram', 'Anjali', 'Rohit', 'Meera', 
    'Aditya', 'Sneha', 'Rajesh', 'Sunita', 'Mukesh', 'Rita', 'Sanjay', 'Deepa', 'Vijay', 'Kavita',
    'Ramesh', 'Lakshmi', 'Suresh', 'Geeta', 'Mahesh', 'Anita', 'Dinesh', 'Rekha', 'Prakash', 'Manju',
    'Krishna', 'Radha', 'Ganesh', 'Sita', 'Shiva', 'Parvati', 'Vishnu', 'Lakshmi', 'Brahma', 'Saraswati'];
  
  const lastNames = ['Kumar', 'Sharma', 'Patel', 'Gupta', 'Singh', 'Verma', 'Reddy', 'Pandey', 'Mishra', 'Yadav',
    'Iyer', 'Menon', 'Nair', 'Pillai', 'Krishnan', 'Nambiar', 'Menon', 'Kurup', 'Namboothiri', 'Thampi'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
};

// Helper function to generate random email
const generateEmail = (name) => {
  const email = name.toLowerCase().replace(/\s+/g, '.') + '@school.com';
  return email;
};

// Helper function to generate random phone
const generatePhone = () => {
  return '9' + Math.floor(Math.random() * 9000000000 + 1000000000).toString();
};

export const uploadSampleData = async () => {
  try {
    // Clear existing data first
    await clearCollection('finance');
    await clearCollection('attendance');
    await clearCollection('students');
    await clearCollection('teachers');
    await clearCollection('classes');
    await clearCollection('academicRecords');

    // Generate classes (10 classes with 2 sections each)
    const classes = [];
    for (let i = 1; i <= 10; i++) {
      for (let section of ['A', 'B']) {
        classes.push({
          className: `Class ${i}`,
          section: section,
          capacity: 30,
          status: 'Active'
        });
      }
    }

    // Add classes and store their IDs
    const classIds = [];
    for (const cls of classes) {
      const docRef = await addDoc(collection(db, 'classes'), {
        ...cls,
        createdAt: new Date().toISOString()
      });
      classIds.push(docRef.id);
    }

    // Generate 20 teachers
    const teachers = [];
    for (let i = 0; i < 20; i++) {
      const name = generateName(true);
      teachers.push({
        name: name,
        subject: subjects[i % subjects.length],
        qualification: Math.random() > 0.5 ? 'M.Sc' : 'M.A',
        status: 'Active',
        classId: classIds[i % classIds.length],
        username: `teacher${i + 1}`,
        password: 'teacher123',
        email: generateEmail(name),
        phone: generatePhone()
      });
    }

    // Add teachers and store their IDs
    const teacherIds = [];
    for (const teacher of teachers) {
      const docRef = await addDoc(collection(db, 'teachers'), {
        ...teacher,
        createdAt: new Date().toISOString()
      });
      teacherIds.push(docRef.id);
    }

    // Generate 100 students
    const students = [];
    for (let i = 0; i < 100; i++) {
      const name = generateName();
      const classIndex = Math.floor(i / 10) % classIds.length; // Distribute students across classes
      const classId = classIds[classIndex];
      const className = classes[classIndex].className;
      const section = classes[classIndex].section;
      const rollNumber = `${className.split(' ')[1]}${section}${(i % 30 + 1).toString().padStart(2, '0')}`;

      students.push({
        name: name,
        classId: classId,
        className: className,
        section: section,
        rollNumber: rollNumber,
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        status: 'Active',
        username: `student${i + 1}`,
        password: 'student123',
        email: generateEmail(name),
        phone: generatePhone(),
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` // Generate avatar URL
      });
    }

    // Add students and store their IDs
    const studentIds = [];
    for (const student of students) {
      const docRef = await addDoc(collection(db, 'students'), {
        ...student,
        createdAt: new Date().toISOString()
      });
      studentIds.push(docRef.id);
    }

    // Generate academic records for each student
    const examTypes = ['Unit Test', 'Mid Term', 'Final Exam', 'Quiz', 'Assignment'];

    for (let i = 0; i < studentIds.length; i++) {
      const student = students[i];
      
      // Generate 3-5 academic records per student
      const numRecords = Math.floor(Math.random() * 3) + 3;
      for (let j = 0; j < numRecords; j++) {
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const examType = examTypes[Math.floor(Math.random() * examTypes.length)];
        const marks = Math.floor(Math.random() * 30) + 40; // Marks between 40 and 70
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // Random date within last 90 days

        await addDoc(collection(db, 'academicRecords'), {
          studentId: studentIds[i],
          studentName: student.name,
          classId: student.classId,
          className: student.className,
          section: student.section,
          subject: subject,
          examType: examType,
          marks: marks,
          date: date.toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        });
      }
    }

    // Generate parents for each student
    for (let i = 0; i < studentIds.length; i++) {
      const parentName = generateName();
      await addDoc(collection(db, 'parents'), {
        name: parentName,
        email: generateEmail(parentName),
        phone: generatePhone(),
        address: `${Math.floor(Math.random() * 1000) + 1} Main St, City`,
        studentIds: [studentIds[i]],
        status: 'Active',
        username: `parent${i + 1}`,
        password: 'parent123',
        createdAt: new Date().toISOString()
      });
    }

    // Generate attendance for today
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < studentIds.length; i++) {
      const student = students[i];
      await addDoc(collection(db, 'attendance'), {
        studentId: studentIds[i],
        classId: student.classId,
        date: today,
        status: Math.random() > 0.2 ? 'Present' : 'Absent',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    }

    // Generate finance transactions for the last 30 days
    const financeCategories = [
      { type: 'Income', categories: ['Tuition Fee', 'Transport Fee', 'Library Fee', 'Sports Fee', 'Exam Fee'] },
      { type: 'Expense', categories: ['Salaries', 'Utilities', 'Maintenance', 'Supplies', 'Events'] }
    ];

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Generate 2-4 transactions per day
      const numTransactions = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < numTransactions; j++) {
        const categoryType = financeCategories[Math.floor(Math.random() * financeCategories.length)];
        const category = categoryType.categories[Math.floor(Math.random() * categoryType.categories.length)];
        const amount = categoryType.type === 'Income' 
          ? Math.floor(Math.random() * 5000) + 1000 
          : Math.floor(Math.random() * 3000) + 500;

        await addDoc(collection(db, 'finance'), {
          date: dateStr,
          type: categoryType.type,
          category: category,
          description: `${category} for ${dateStr}`,
          amount: amount,
          createdAt: new Date().toISOString()
        });
      }
    }

    console.log('Sample data uploaded successfully');
  } catch (error) {
    console.error('Error uploading sample data:', error);
    throw error;
  }
}; 
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
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Helper function to generate random names
const generateName = (isTeacher = false) => {
  const firstNames = [
    'Aarav', 'Aditya', 'Aisha', 'Akash', 'Ananya', 'Arjun', 'Avni', 'Bharat',
    'Chandra', 'Deepak', 'Esha', 'Farhan', 'Gita', 'Harsh', 'Isha', 'Jatin',
    'Kavita', 'Lakshmi', 'Madhav', 'Neha', 'Om', 'Priya', 'Rahul', 'Sneha',
    'Tanvi', 'Umesh', 'Varsha', 'Yash', 'Zara', 'Rahul', 'Priya', 'Amit',
    'Neha', 'Arun', 'Pooja', 'Vikram', 'Anjali', 'Rohit', 'Meera', 'Aditya'
  ];
  
  const lastNames = [
    'Sharma', 'Patel', 'Singh', 'Kumar', 'Verma', 'Gupta', 'Reddy', 'Mishra',
    'Iyer', 'Nair', 'Menon', 'Pillai', 'Nambiar', 'Krishnan', 'Rajan', 'Nair',
    'Menon', 'Pillai', 'Nambiar', 'Krishnan', 'Rajan', 'Nair', 'Menon', 'Pillai',
    'Nambiar', 'Krishnan', 'Rajan', 'Nair', 'Menon', 'Pillai'
  ];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
};

// Helper function to generate random phone
const generatePhone = () => {
  return '9' + Math.floor(Math.random() * 9000000000 + 1000000000).toString();
};

// Helper function to generate email
const generateEmail = (name) => {
  return name.toLowerCase().replace(/\s+/g, '') + '@school.com';
};

// Helper function to generate random date within a range
const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Helper function to generate random marks
const generateMarks = (maxMarks) => {
  return Math.floor(Math.random() * (maxMarks - 30) + 30); // Marks between 30 and maxMarks
};

export const initializeSchoolData = async () => {
  try {
    console.log('Starting data initialization...');
    
    // Clear existing data first
    const collections = [
      'teachers', 'classes', 'students', 'attendance', 'teacherAttendance',
      'subjects', 'exams', 'marks', 'academicCalendar', 'reports',
      'fees', 'payments', 'expenses', 'announcements', 'messages'
    ];

    console.log('Clearing existing collections...');
    for (const collectionName of collections) {
      try {
        console.log(`Clearing collection: ${collectionName}`);
        const querySnapshot = await getDocs(collection(db, collectionName));
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log(`Successfully cleared ${collectionName}`);
      } catch (error) {
        console.error(`Error clearing collection ${collectionName}:`, error);
        throw error;
      }
    }

    // Define subjects
    const subjects = [
      'Mathematics', 'Science', 'English', 'History', 'Geography', 
      'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics',
      'Political Science', 'Sociology', 'Psychology', 'Physical Education',
      'Art', 'Music', 'Languages', 'Environmental Science', 'Business Studies',
      'Accountancy'
    ];

    // Define qualifications
    const qualifications = [
      'M.Sc. Mathematics', 'M.Sc. Physics', 'M.A. English', 'M.A. History',
      'M.Sc. Chemistry', 'M.Sc. Biology', 'M.Tech Computer Science',
      'M.A. Economics', 'M.A. Political Science', 'M.A. Sociology',
      'M.A. Psychology', 'M.P.Ed', 'M.F.A', 'M.Music', 'M.A. Languages',
      'M.Sc. Environmental Science', 'M.B.A', 'Ph.D. Mathematics',
      'Ph.D. Physics', 'Ph.D. English'
    ];

    // Generate 20 teachers
    console.log('Generating teachers...');
    const teachers = [];
    for (let i = 0; i < 20; i++) {
      try {
        const name = generateName(true);
        const teacher = {
          name,
          subject: subjects[i % subjects.length],
          qualification: qualifications[i % qualifications.length],
          email: generateEmail(name),
          phone: generatePhone(),
          experience: Math.floor(Math.random() * 15) + 1,
          status: 'Active',
          photoURL: `https://i.pravatar.cc/150?img=${i + 1}`,
          photoPublicId: `teacher-${i + 1}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'teachers'), teacher);
        teachers.push({ id: docRef.id, ...teacher });
        console.log(`Added teacher ${i + 1}: ${name}`);
      } catch (error) {
        console.error(`Error adding teacher ${i + 1}:`, error);
        throw error;
      }
    }

    // Generate classes (10 classes with 2 sections each)
    console.log('Generating classes...');
    const classes = [];
    for (let i = 1; i <= 10; i++) {
      for (let section of ['A', 'B']) {
        try {
          const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
          const cls = {
            className: `Class ${i}`,
            section,
            teacherId: randomTeacher.id,
            capacity: 40,
            status: 'Active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          const docRef = await addDoc(collection(db, 'classes'), cls);
          classes.push({ id: docRef.id, ...cls });
          console.log(`Added class ${i}${section}`);
        } catch (error) {
          console.error(`Error adding class ${i}${section}:`, error);
          throw error;
        }
      }
    }

    // Generate 100 students
    console.log('Generating students...');
    const students = [];
    for (let i = 0; i < 100; i++) {
      try {
        const name = generateName();
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        const rollNumber = `${randomClass.className.split(' ')[1]}${randomClass.section}${(i % 40 + 1).toString().padStart(2, '0')}`;

        const student = {
          name,
          rollNumber,
          classId: randomClass.id,
          className: randomClass.className,
          section: randomClass.section,
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          email: generateEmail(name),
          phone: generatePhone(),
          status: 'Active',
          photoURL: `https://i.pravatar.cc/150?img=${i + 100}`,
          photoPublicId: `student-${i + 1}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'students'), student);
        students.push({ id: docRef.id, ...student });
        if ((i + 1) % 10 === 0) console.log(`Added ${i + 1} students`);
      } catch (error) {
        console.error(`Error adding student ${i + 1}:`, error);
        throw error;
      }
    }

    // Generate academic calendar for the year
    const academicCalendar = [];
    const currentYear = new Date().getFullYear();
    const events = [
      { title: 'School Opening Day', type: 'EVENT', description: 'First day of the academic year' },
      { title: 'Independence Day', type: 'HOLIDAY', description: 'National holiday' },
      { title: 'Teacher\'s Day', type: 'EVENT', description: 'Celebration of Teacher\'s Day' },
      { title: 'Mid-term Examination', type: 'EXAM', description: 'Mid-term examinations for all classes' },
      { title: 'Annual Sports Day', type: 'EVENT', description: 'Annual sports competition' },
      { title: 'Christmas Holiday', type: 'HOLIDAY', description: 'Christmas break' },
      { title: 'New Year', type: 'HOLIDAY', description: 'New Year celebration' },
      { title: 'Annual Day', type: 'EVENT', description: 'Annual day celebration' },
      { title: 'Final Examination', type: 'EXAM', description: 'Final examinations for all classes' },
      { title: 'School Closing Day', type: 'EVENT', description: 'Last day of the academic year' }
    ];

    for (const event of events) {
      const date = new Date(currentYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const calendarEvent = {
        ...event,
        date: date.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'academicCalendar'), calendarEvent);
      academicCalendar.push({ id: docRef.id, ...calendarEvent });
    }

    // Generate exams
    const examTypes = ['Mid-term', 'Final', 'Unit Test', 'Quiz'];
    const exams = [];
    for (const examType of examTypes) {
      for (const subject of subjects) {
        for (const cls of classes) {
          const exam = {
            name: `${examType} - ${subject}`,
            type: examType,
            subject,
            classId: cls.id,
            className: cls.className,
            section: cls.section,
            date: generateRandomDate(new Date(currentYear, 0, 1), new Date(currentYear, 11, 31)),
            maxMarks: examType === 'Unit Test' ? 20 : examType === 'Quiz' ? 10 : 100,
            duration: examType === 'Unit Test' ? 1 : examType === 'Quiz' ? 0.5 : 3,
            status: 'Scheduled',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          const docRef = await addDoc(collection(db, 'exams'), exam);
          exams.push({ id: docRef.id, ...exam });
        }
      }
    }

    // Generate marks for each exam
    for (const exam of exams) {
      const classStudents = students.filter(s => s.classId === exam.classId);
      for (const student of classStudents) {
        const marks = {
          examId: exam.id,
          examName: exam.name,
          studentId: student.id,
          studentName: student.name,
          classId: exam.classId,
          className: exam.className,
          section: exam.section,
          subject: exam.subject,
          marks: generateMarks(exam.maxMarks),
          maxMarks: exam.maxMarks,
          date: exam.date,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'marks'), marks);
      }
    }

    // Generate attendance for students (last 30 days)
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      for (const student of students) {
        const attendance = {
          studentId: student.id,
          studentName: student.name,
          classId: student.classId,
          className: student.className,
          section: student.section,
          date: dateStr,
          status: Math.random() > 0.1 ? 'Present' : 'Absent',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'attendance'), attendance);
      }
    }

    // Generate teacher attendance (last 30 days)
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      for (const teacher of teachers) {
        const attendance = {
          teacherId: teacher.id,
          teacherName: teacher.name,
          subject: teacher.subject,
          date: dateStr,
          status: Math.random() > 0.05 ? 'Present' : 'Absent',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'teacherAttendance'), attendance);
      }
    }

    // Generate reports for each student
    for (const student of students) {
      const studentMarks = await getDocs(query(
        collection(db, 'marks'),
        where('studentId', '==', student.id)
      ));

      const marks = studentMarks.docs.map(doc => doc.data());
      const totalMarks = marks.reduce((sum, mark) => sum + mark.marks, 0);
      const maxMarks = marks.reduce((sum, mark) => sum + mark.maxMarks, 0);
      const percentage = (totalMarks / maxMarks) * 100;

      const report = {
        studentId: student.id,
        studentName: student.name,
        classId: student.classId,
        className: student.className,
        section: student.section,
        academicYear: currentYear,
        totalMarks,
        maxMarks,
        percentage,
        grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : 
               percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'F',
        remarks: percentage >= 90 ? 'Excellent' : percentage >= 80 ? 'Very Good' : 
                 percentage >= 70 ? 'Good' : percentage >= 60 ? 'Fair' : 
                 percentage >= 50 ? 'Pass' : 'Needs Improvement',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'reports'), report);
    }

    // Generate fees
    const feeTypes = ['Tuition Fee', 'Transport Fee', 'Library Fee', 'Sports Fee', 'Exam Fee'];
    for (const feeType of feeTypes) {
      const fee = {
        name: feeType,
        amount: feeType === 'Tuition Fee' ? 5000 : 
                feeType === 'Transport Fee' ? 2000 :
                feeType === 'Library Fee' ? 500 :
                feeType === 'Sports Fee' ? 1000 : 500,
        frequency: feeType === 'Tuition Fee' ? 'Monthly' : 'Annually',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'fees'), fee);
    }

    // Generate payments for students
    for (const student of students) {
      const fees = await getDocs(collection(db, 'fees'));
      for (const fee of fees.docs) {
        const feeData = fee.data();
        const payment = {
          studentId: student.id,
          studentName: student.name,
          feeId: fee.id,
          feeName: feeData.name,
          amount: feeData.amount,
          status: Math.random() > 0.2 ? 'Paid' : 'Pending',
          paymentDate: generateRandomDate(new Date(currentYear, 0, 1), new Date(currentYear, 11, 31)),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'payments'), payment);
      }
    }

    // Generate expenses
    const expenseCategories = ['Salaries', 'Utilities', 'Maintenance', 'Supplies', 'Events'];
    for (let i = 0; i < 50; i++) {
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      const expense = {
        category,
        description: `${category} expense ${i + 1}`,
        amount: Math.floor(Math.random() * 5000) + 1000,
        date: generateRandomDate(new Date(currentYear, 0, 1), new Date(currentYear, 11, 31)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'expenses'), expense);
    }

    // Generate announcements
    const announcements = [
      'School reopening after summer break',
      'Parent-Teacher meeting scheduled',
      'Annual sports day preparation',
      'Holiday announcement for Independence Day',
      'Exam schedule released',
      'School annual day celebration',
      'New library books available',
      'School bus route changes',
      'Fee payment reminder',
      'School closure for maintenance'
    ];

    for (const announcement of announcements) {
      const announcementData = {
        title: announcement,
        content: `This is a detailed announcement about ${announcement.toLowerCase()}.`,
        priority: Math.random() > 0.7 ? 'High' : 'Normal',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'announcements'), announcementData);
    }

    // Generate messages
    for (let i = 0; i < 50; i++) {
      const sender = Math.random() > 0.5 ? 
        teachers[Math.floor(Math.random() * teachers.length)] :
        students[Math.floor(Math.random() * students.length)];
      
      const recipient = Math.random() > 0.5 ?
        teachers[Math.floor(Math.random() * teachers.length)] :
        students[Math.floor(Math.random() * students.length)];

      const message = {
        senderId: sender.id,
        senderName: sender.name,
        recipientId: recipient.id,
        recipientName: recipient.name,
        subject: `Message ${i + 1}`,
        content: `This is a sample message content ${i + 1}.`,
        status: Math.random() > 0.3 ? 'Read' : 'Unread',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'messages'), message);
    }

    console.log('Data initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Error in initializeSchoolData:', error);
    throw error;
  }
}; 
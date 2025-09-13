// Sample file generator for import functionality
import * as XLSX from 'xlsx';

export const generateSampleFile = (type, data) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, type);
  
  // Generate Excel file buffer
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  // Create blob and return URL
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return URL.createObjectURL(blob);
};

export const getStudentsSampleData = () => [
  {
    'First Name': 'John',
    'Last Name': 'Doe',
    'Student ID': 'STU001',
    'Email': 'john.doe@example.com',
    'Phone': '+1234567890',
    'Date of Birth': '2010-05-15',
    'Gender': 'Male',
    'Class': 'Class 10',
    'Section': 'A',
    'Address': '123 Main St, City, State',
    'Parent Name': 'Jane Doe',
    'Parent Phone': '+1234567891',
    'Parent Email': 'jane.doe@example.com',
    'Status': 'Active',
    'Admission Date': '2024-01-15'
  },
  {
    'First Name': 'Jane',
    'Last Name': 'Smith',
    'Student ID': 'STU002',
    'Email': 'jane.smith@example.com',
    'Phone': '+1234567892',
    'Date of Birth': '2010-08-20',
    'Gender': 'Female',
    'Class': 'Class 10',
    'Section': 'B',
    'Address': '456 Oak Ave, City, State',
    'Parent Name': 'Bob Smith',
    'Parent Phone': '+1234567893',
    'Parent Email': 'bob.smith@example.com',
    'Status': 'Active',
    'Admission Date': '2024-01-15'
  }
];

export const getTeachersSampleData = () => [
  {
    'First Name': 'Alice',
    'Last Name': 'Johnson',
    'Teacher ID': 'TCH001',
    'Email': 'alice.johnson@school.com',
    'Phone': '+1234567894',
    'Date of Birth': '1985-03-10',
    'Gender': 'Female',
    'Subject': 'Mathematics',
    'Qualification': 'M.Sc Mathematics',
    'Experience': '5 years',
    'Address': '789 Pine St, City, State',
    'Emergency Contact': 'David Johnson',
    'Emergency Phone': '+1234567895',
    'Status': 'Active',
    'Joining Date': '2020-06-01',
    'Salary': '50000'
  },
  {
    'First Name': 'Robert',
    'Last Name': 'Brown',
    'Teacher ID': 'TCH002',
    'Email': 'robert.brown@school.com',
    'Phone': '+1234567896',
    'Date of Birth': '1982-07-25',
    'Gender': 'Male',
    'Subject': 'Science',
    'Qualification': 'M.Sc Physics',
    'Experience': '8 years',
    'Address': '321 Elm St, City, State',
    'Emergency Contact': 'Sarah Brown',
    'Emergency Phone': '+1234567897',
    'Status': 'Active',
    'Joining Date': '2019-08-15',
    'Salary': '55000'
  }
];

export const getClassesSampleData = () => [
  {
    'Class Name': 'Class 10',
    'Section': 'A',
    'Teacher Name': 'Alice Johnson',
    'Teacher Email': 'alice.johnson@school.com',
    'Capacity': '30',
    'Room Number': '101',
    'Subject': 'Mathematics',
    'Schedule': 'Monday-Friday 9:00-10:00',
    'Status': 'Active',
    'Academic Year': '2024-2025',
    'Description': 'Advanced Mathematics for Class 10'
  },
  {
    'Class Name': 'Class 9',
    'Section': 'B',
    'Teacher Name': 'Robert Brown',
    'Teacher Email': 'robert.brown@school.com',
    'Capacity': '25',
    'Room Number': '102',
    'Subject': 'Science',
    'Schedule': 'Monday-Friday 10:00-11:00',
    'Status': 'Active',
    'Academic Year': '2024-2025',
    'Description': 'General Science for Class 9'
  }
];

export const downloadSampleFile = (type) => {
  let sampleData, fileName;
  
  switch (type) {
    case 'students':
      sampleData = getStudentsSampleData();
      fileName = 'students_sample.xlsx';
      break;
    case 'teachers':
      sampleData = getTeachersSampleData();
      fileName = 'teachers_sample.xlsx';
      break;
    case 'classes':
      sampleData = getClassesSampleData();
      fileName = 'classes_sample.xlsx';
      break;
    default:
      throw new Error('Invalid type');
  }
  
  const url = generateSampleFile(type, sampleData);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

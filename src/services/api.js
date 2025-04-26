import axios from 'axios';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://360schoolingdev.vercel.app/api';
const API_VERSION = 'v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error.response || error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/login/', credentials),
  register: (userData) => api.post('/register/', userData),
  logout: () => api.post('/logout/'),
};

// User Management APIs
export const userAPI = {
  // Get user by ID
  getUserById: (userId) => api.get(`/user/get/${userId}/`),
  
  // Update user by ID
  updateUser: (userId, userData) => api.patch(`/user/update/${userId}/`, userData),
  
  // Delete user by ID
  deleteUser: (userId) => api.delete(`/user/delete/${userId}/`),
  
  // Register student
  registerStudent: (studentData) => api.post('/register/', studentData),
  
  // Register teacher
  registerTeacher: (teacherData) => api.post('/register/', teacherData),
};

// Organization APIs
export const organizationAPI = {
  getDetails: () => api.get('/organizations/current/'),
  updateDetails: (orgData) => api.put('/organizations/current/', orgData),
  getSettings: () => api.get('/organizations/current/settings/'),
  updateSettings: (settings) => api.put('/organizations/current/settings/', settings),
};

// Student APIs
export const studentAPI = {
  getAll: () => api.get('/students/'),
  create: (studentData) => api.post('/students/', {
    ...studentData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  update: (id, studentData) => api.put(`/students/${id}/`, {
    ...studentData,
    updatedAt: new Date().toISOString()
  }),
  delete: (id) => api.delete(`/students/${id}/`),
  getByClass: (classId) => api.get(`/students/class/${classId}/`),
  getByOrganization: () => api.get('/students/organization/'),
  getAttendance: (studentId) => api.get(`/students/${studentId}/attendance/`),
  getMarks: (studentId) => api.get(`/students/${studentId}/marks/`),
};

// Teacher APIs
export const teacherAPI = {
  getAll: () => api.get('/teachers/'),
  create: (teacherData) => api.post('/teachers/', {
    ...teacherData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  update: (id, teacherData) => api.put(`/teachers/${id}/`, {
    ...teacherData,
    updatedAt: new Date().toISOString()
  }),
  delete: (id) => api.delete(`/teachers/${id}/`),
  getSchedule: (id) => api.get(`/teachers/${id}/schedule/`),
  getByOrganization: () => api.get('/teachers/organization/'),
  getAttendance: (teacherId) => api.get(`/teachers/${teacherId}/attendance/`),
  getClasses: (teacherId) => api.get(`/teachers/${teacherId}/classes/`),
};

// Class APIs
export const classAPI = {
  getAll: () => api.get('/classes/'),
  create: (classData) => api.post('/classes/', {
    ...classData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  update: (id, classData) => api.put(`/classes/${id}/`, {
    ...classData,
    updatedAt: new Date().toISOString()
  }),
  delete: (id) => api.delete(`/classes/${id}/`),
  getStudents: (classId) => api.get(`/classes/${classId}/students/`),
  getByOrganization: () => api.get('/classes/organization/'),
  getTimetable: (classId) => api.get(`/classes/${classId}/timetable/`),
  getAttendance: (classId) => api.get(`/classes/${classId}/attendance/`),
};

// Subject APIs
export const subjectAPI = {
  getAll: () => api.get('/subjects/'),
  create: (subjectData) => api.post('/subjects/', {
    ...subjectData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  update: (id, subjectData) => api.put(`/subjects/${id}/`, {
    ...subjectData,
    updatedAt: new Date().toISOString()
  }),
  delete: (id) => api.delete(`/subjects/${id}/`),
  getByOrganization: () => api.get('/subjects/organization/'),
  getTeachers: (subjectId) => api.get(`/subjects/${subjectId}/teachers/`),
};

// Exam APIs
export const examAPI = {
  getAll: () => api.get('/exams/'),
  create: (examData) => api.post('/exams/', {
    ...examData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  update: (id, examData) => api.put(`/exams/${id}/`, {
    ...examData,
    updatedAt: new Date().toISOString()
  }),
  delete: (id) => api.delete(`/exams/${id}/`),
  getMarks: (examId) => api.get(`/exams/${examId}/marks/`),
  getByOrganization: () => api.get('/exams/organization/'),
  getByClass: (classId) => api.get(`/exams/class/${classId}/`),
};

// Marks APIs
export const marksAPI = {
  getAll: () => api.get('/marks/'),
  create: (marksData) => api.post('/marks/', {
    ...marksData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  update: (id, marksData) => api.put(`/marks/${id}/`, {
    ...marksData,
    updatedAt: new Date().toISOString()
  }),
  delete: (id) => api.delete(`/marks/${id}/`),
  getByExam: (examId) => api.get(`/marks/exam/${examId}/`),
  getByStudent: (studentId) => api.get(`/marks/student/${studentId}/`),
  getByOrganization: () => api.get('/marks/organization/'),
  getByClass: (classId) => api.get(`/marks/class/${classId}/`),
};

// Attendance APIs
export const attendanceAPI = {
  getAll: () => api.get('/attendance/'),
  create: (attendanceData) => api.post('/attendance/', {
    ...attendanceData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  update: (id, attendanceData) => api.put(`/attendance/${id}/`, {
    ...attendanceData,
    updatedAt: new Date().toISOString()
  }),
  delete: (id) => api.delete(`/attendance/${id}/`),
  getByDate: (date) => api.get(`/attendance/date/${date}/`),
  getByOrganization: () => api.get('/attendance/organization/'),
  getByClass: (classId) => api.get(`/attendance/class/${classId}/`),
  getByStudent: (studentId) => api.get(`/attendance/student/${studentId}/`),
  getByTeacher: (teacherId) => api.get(`/attendance/teacher/${teacherId}/`),
};

// Timetable APIs
export const timetableAPI = {
  getAll: () => api.get('/timetables/'),
  create: (timetableData) => api.post('/timetables/', {
    ...timetableData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  update: (id, timetableData) => api.put(`/timetables/${id}/`, {
    ...timetableData,
    updatedAt: new Date().toISOString()
  }),
  delete: (id) => api.delete(`/timetables/${id}/`),
  getByClass: (classId) => api.get(`/timetables/class/${classId}/`),
  getByTeacher: (teacherId) => api.get(`/timetables/teacher/${teacherId}/`),
  getByOrganization: () => api.get('/timetables/organization/'),
};

// Analytics APIs
export const analyticsAPI = {
  getPerformance: () => api.get('/analytics/performance/'),
  getAttendance: () => api.get('/analytics/attendance/'),
  getFinance: () => api.get('/analytics/finance/'),
  getByOrganization: () => api.get('/analytics/organization/'),
};

// Export all APIs
export default {
  auth: authAPI,
  organization: organizationAPI,
  student: studentAPI,
  teacher: teacherAPI,
  class: classAPI,
  subject: subjectAPI,
  exam: examAPI,
  marks: marksAPI,
  attendance: attendanceAPI,
  timetable: timetableAPI,
  analytics: analyticsAPI,
  user: userAPI,
}; 
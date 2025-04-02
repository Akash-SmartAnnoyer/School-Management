import axios from 'axios';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const API_VERSION = 'v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication and organization ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (currentUser?.schoolId) {
      config.headers['X-Organization-ID'] = currentUser.schoolId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and response standardization
api.interceptors.response.use(
  (response) => {
    // Standardize successful response structure
    return {
      data: {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Operation successful'
      }
    };
  },
  (error) => {
    // Standardize error response structure
    const errorResponse = {
      data: {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'An error occurred',
        errors: error.response?.data?.errors || null
      }
    };

    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(errorResponse);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  resetPassword: (email) => api.post('/auth/reset-password/', { email }),
};

// Theme APIs
export const themeAPI = {
  getColors: () => api.get('/theme/colors/'),
  updateColors: (colors) => api.post('/theme/colors/', { colors }),
  checkHealth: () => api.get('/health/'),
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
};

// Analytics APIs
export const analyticsAPI = {
  getPerformance: () => api.get('/analytics/performance/'),
  getAttendance: () => api.get('/analytics/attendance/'),
  getFinance: () => api.get('/analytics/finance/'),
  getByOrganization: () => api.get('/analytics/organization/'),
};

// Organization APIs
export const organizationAPI = {
  getDetails: () => api.get('/organizations/current/'),
  updateDetails: (orgData) => api.put('/organizations/current/', orgData),
  getSettings: () => api.get('/organizations/current/settings/'),
  updateSettings: (settings) => api.put('/organizations/current/settings/', settings),
};

// Export all APIs
export default {
  auth: authAPI,
  organization: organizationAPI,
  theme: themeAPI,
  exam: examAPI,
  marks: marksAPI,
  class: classAPI,
  subject: subjectAPI,
  student: studentAPI,
  teacher: teacherAPI,
  attendance: attendanceAPI,
  analytics: analyticsAPI,
}; 
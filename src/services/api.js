// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://360schoolingdev.vercel.app/api';
const API_VERSION = 'v1';
const BASE_URL = `${API_URL}/${API_VERSION}`;

// Helper function to handle response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle specific status codes
    switch (response.status) {
      case 400:
        // Handle validation errors
        const errorMessage = errorData.non_field_errors?.[0] || 
                           Object.values(errorData)[0]?.[0] || 
                           'Invalid input data';
        throw new Error(errorMessage);
      
      case 401:
        // Clear tokens on unauthorized access
        const { clearTokens } = await import('../utils/tokenManager');
        clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      
      case 403:
        throw new Error('You do not have permission to perform this action');
      
      case 404:
        throw new Error('Resource not found');
      
      case 500:
        throw new Error('Server error. Please try again later');
      
      default:
        throw new Error(errorData.message || 'Something went wrong');
    }
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    return {
      status: response.status,
      data: data,
      success: response.status >= 200 && response.status < 300
    };
  }
  
  return {
    status: response.status,
    data: await response.text(),
    success: response.status >= 200 && response.status < 300
  };
};

// Helper function to get headers
const getHeaders = async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const { getAccessToken } = await import('../utils/tokenManager');
  const accessToken = getAccessToken();
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
};

// Helper function to make API calls
const makeRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: await getHeaders(),
    credentials: 'include',
    mode: 'cors'
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    return handleResponse(response);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${BASE_URL}/users/login/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(credentials),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  refreshToken: async (refreshToken) => {
    const response = await fetch(`${BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(refreshToken),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  register: async (userData) => {
    return makeRequest(`${BASE_URL}/users/register/`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  logout: async () => {
    return makeRequest(`${BASE_URL}/logout/`, {
      method: 'POST'
    });
  },
  getProfile: async () => {
    return makeRequest(`${BASE_URL}/profile/`, {
      method: 'GET'
    });
  },
  updateProfile: async (userData) => {
    return makeRequest(`${BASE_URL}/profile/`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }
};

// School APIs
export const schoolAPI = {
  getSchools: async () => {
    const response = await fetch(`${BASE_URL}/schools/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getSchool: async (id) => {
    const response = await fetch(`${BASE_URL}/schools/${id}/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createSchool: async (schoolData) => {
    const response = await fetch(`${BASE_URL}/schools/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(schoolData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateSchool: async (id, schoolData) => {
    const response = await fetch(`${BASE_URL}/schools/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(schoolData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteSchool: async (id) => {
    const response = await fetch(`${BASE_URL}/schools/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Student APIs
export const studentAPI = {
  getStudents: async (queryParams = '') => {
    try {
      const response = await fetch(`${BASE_URL}/users/students/${queryParams}`, {
        method: 'GET',
        headers: await getHeaders(),
        credentials: 'include'
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching students:', error);
      throw new Error('Failed to fetch students. Please try again.');
    }
  },
  getStudent: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/users/get/${id}/`, {
        method: 'GET',
        headers: await getHeaders(),
        credentials: 'include'
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching student:', error);
      throw new Error('Failed to fetch student details. Please try again.');
    }
  },
  createStudent: async (studentData) => {
    try {
      const response = await fetch(`${BASE_URL}/users/register/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(studentData),
        credentials: 'include'
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error creating student:', error);
      throw new Error('Failed to create student. Please check the data and try again.');
    }
  },
  updateStudent: async (id, studentData) => {
    try {
      const response = await fetch(`${BASE_URL}/users/update/${id}/`, {
        method: 'PUT',
        headers: await getHeaders(),
        body: JSON.stringify(studentData),
        credentials: 'include'
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error updating student:', error);
      throw new Error('Failed to update student. Please check the data and try again.');
    }
  },
  deleteStudent: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/users/delete/${id}/`, {
        method: 'DELETE',
        headers: await getHeaders(),
        credentials: 'include'
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error deleting student:', error);
      throw new Error('Failed to delete student. Please try again.');
    }
  },
  getStudentsByClass: async (classId) => {
    try {
      const response = await fetch(`${BASE_URL}/classrooms/${classId}/students/`, {
        method: 'GET',
        headers: await getHeaders(),
        credentials: 'include'
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching students by class:', error);
      throw new Error('Failed to fetch students. Please try again.');
    }
  },
  getAllStudents: async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/students/`, {
        method: 'GET',
        headers: await getHeaders(),
        credentials: 'include'
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching all students:', error);
      throw new Error('Failed to fetch students. Please try again.');
    }
  }
};

// Teacher APIs
export const teacherAPI = {
  getTeachers: async (queryParams = '') => {
    const response = await fetch(`${BASE_URL}/users/teachers/${queryParams}`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getTeacher: async (id) => {
    const response = await fetch(`${BASE_URL}/users/get/${id}/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createTeacher: async (teacherData) => {
    const response = await fetch(`${BASE_URL}/users/register/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(teacherData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateTeacher: async (id, teacherData) => {
    const response = await fetch(`${BASE_URL}/users/update/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(teacherData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteTeacher: async (id) => {
    const response = await fetch(`${BASE_URL}/users/delete/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Class APIs
export const classAPI = {
  getClasses: async (queryParams = '') => {
    const response = await fetch(`${BASE_URL}/classrooms/${queryParams}`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getClass: async (id) => {
    const response = await fetch(`${BASE_URL}/classrooms/${id}/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createClass: async (classData) => {
    const response = await fetch(`${BASE_URL}/classrooms/create/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({
        class_name: classData.className,
        section: classData.section,
        teacher: classData.teacherId,
        capacity: classData.capacity,
        status: classData.status.toLowerCase()
      }),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateClass: async (id, classData) => {
    const response = await fetch(`${BASE_URL}/classrooms/update/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify({
        class_name: classData.className,
        section: classData.section,
        teacher: classData.teacherId,
        capacity: classData.capacity,
        status: classData.status.toLowerCase()
      }),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteClass: async (id) => {
    const response = await fetch(`${BASE_URL}/classrooms/delete/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  addStudentsToClass: async (classId, studentIds) => {
    const response = await fetch(`${BASE_URL}/classrooms/${classId}/add-students/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ student_ids: studentIds }),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Subject APIs
export const subjectAPI = {
  getSubjects: async (queryParams = '') => {
    const response = await fetch(`${BASE_URL}/subjects/${queryParams}`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  getSubject: async (id) => {
    const response = await fetch(`${BASE_URL}/subjects/${id}/`, {
      method: 'GET',
      headers: await getHeaders()
    });
    return handleResponse(response);
  },

  createSubject: async (subjectData) => {
    const response = await fetch(`${BASE_URL}/subjects/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(subjectData)
    });
    return handleResponse(response);
  },

  updateSubject: async (id, subjectData) => {
    const response = await fetch(`${BASE_URL}/subjects/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(subjectData)
    });
    return handleResponse(response);
  },

  deleteSubject: async (id) => {
    const response = await fetch(`${BASE_URL}/subjects/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return handleResponse(response);
  }
};

// Attendance APIs
export const attendanceAPI = {
  getAttendances: async () => {
    const response = await fetch(`${BASE_URL}/attendances/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getAttendance: async (id) => {
    const response = await fetch(`${BASE_URL}/attendances/${id}/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createAttendance: async (attendanceData) => {
    const response = await fetch(`${BASE_URL}/attendance/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(attendanceData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateAttendance: async (id, attendanceData) => {
    const response = await fetch(`${BASE_URL}/attendances/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(attendanceData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteAttendance: async (id) => {
    const response = await fetch(`${BASE_URL}/attendances/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Exam APIs
export const examAPI = {
  getExams: async () => {
    const response = await fetch(`${BASE_URL}/exams/`, {
      method: 'GET',
      headers: await getHeaders()
    });
    return handleResponse(response);
  },

  getExam: async (id) => {
    const response = await fetch(`${BASE_URL}/exams/${id}/`, {
      method: 'GET',
      headers: await getHeaders()
    });
    return handleResponse(response);
  },

  createExam: async (examData) => {
    const response = await fetch(`${BASE_URL}/exams/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(examData)
    });
    return handleResponse(response);
  },

  updateExam: async (id, examData) => {
    const response = await fetch(`${BASE_URL}/exams/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(examData)
    });
    return handleResponse(response);
  },

  deleteExam: async (id) => {
    const response = await fetch(`${BASE_URL}/exams/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return handleResponse(response);
  }
};

// Result APIs
export const resultAPI = {
  getResults: async () => {
    const response = await fetch(`${BASE_URL}/results/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getResult: async (id) => {
    const response = await fetch(`${BASE_URL}/results/${id}/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createResult: async (resultData) => {
    const response = await fetch(`${BASE_URL}/results/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(resultData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateResult: async (id, resultData) => {
    const response = await fetch(`${BASE_URL}/results/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(resultData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteResult: async (id) => {
    const response = await fetch(`${BASE_URL}/results/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Fee APIs
export const feeAPI = {
  // Fee Due APIs
  getFeeDues: async (queryParams = '') => {
    return makeRequest(`${BASE_URL}/fees/${queryParams}`, {
      method: 'GET'
    });
  },
  getFeeDueById: async (id) => {
    return makeRequest(`${BASE_URL}/fees/${id}/`, {
      method: 'GET'
    });
  },
  createFeeDue: async (feeDueData) => {
    try {
      return await makeRequest(`${BASE_URL}/fees/`, {
        method: 'POST',
        body: JSON.stringify(feeDueData)
      });
    } catch (error) {
      if (error.message.includes('unique set')) {
        throw new Error('A fee due already exists for this student, period, and fee type combination.');
      }
      throw error;
    }
  },
  updateFeeDue: async (id, feeDueData) => {
    return makeRequest(`${BASE_URL}/fees/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(feeDueData)
    });
  },
  deleteFeeDue: async (id) => {
    return makeRequest(`${BASE_URL}/fees/${id}/`, {
      method: 'DELETE'
    });
  },
  getFeeDuesByStudent: async (studentId) => {
    return makeRequest(`${BASE_URL}/fees/by_student/?student_id=${studentId}`, {
      method: 'GET'
    });
  },
  getFeeDuesByClassroomMonth: async (classroomId, period, isPaid = null) => {
    let url = `${BASE_URL}/fee-due/?classroom_id=${classroomId}&period=${period}`;
    if (isPaid !== null) {
      url += `&is_paid=${isPaid}`;
    }
    return makeRequest(url, {
      method: 'GET'
    });
  },

  // Payment APIs
  getPayments: async (queryParams = '') => {
    return makeRequest(`${BASE_URL}/payments/${queryParams}`, {
      method: 'GET'
    });
  },
  getPaymentById: async (id) => {
    return makeRequest(`${BASE_URL}/payments/${id}/`, {
      method: 'GET'
    });
  },
  createPayment: async (paymentData) => {
    return makeRequest(`${BASE_URL}/payments/`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },
  deletePayment: async (id) => {
    return makeRequest(`${BASE_URL}/payments/${id}/`, {
      method: 'DELETE'
    });
  },
  getPaymentHistoryByStudent: async (studentId, year = null, month = null) => {
    let url = `${BASE_URL}/students/${studentId}/payment-history/`;
    if (year) {
      url += `?year=${year}`;
      if (month) {
        url += `&month=${month}`;
      }
    }
    return makeRequest(url, {
      method: 'GET'
    });
  }
};

// Notice APIs
export const noticeAPI = {
  getNotices: async () => {
    const response = await fetch(`${BASE_URL}/notices/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getNotice: async (id) => {
    const response = await fetch(`${BASE_URL}/notices/${id}/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createNotice: async (noticeData) => {
    const response = await fetch(`${BASE_URL}/notices/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(noticeData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateNotice: async (id, noticeData) => {
    const response = await fetch(`${BASE_URL}/notices/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(noticeData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteNotice: async (id) => {
    const response = await fetch(`${BASE_URL}/notices/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Event APIs
export const eventAPI = {
  getEvents: async () => {
    const response = await fetch(`${BASE_URL}/events/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getEvent: async (id) => {
    const response = await fetch(`${BASE_URL}/events/${id}/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createEvent: async (eventData) => {
    const response = await fetch(`${BASE_URL}/events/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(eventData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateEvent: async (id, eventData) => {
    const response = await fetch(`${BASE_URL}/events/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(eventData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteEvent: async (id) => {
    const response = await fetch(`${BASE_URL}/events/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Gallery APIs
export const galleryAPI = {
  getGalleries: async () => {
    const response = await fetch(`${BASE_URL}/galleries/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getGallery: async (id) => {
    const response = await fetch(`${BASE_URL}/galleries/${id}/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createGallery: async (galleryData) => {
    const response = await fetch(`${BASE_URL}/galleries/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(galleryData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateGallery: async (id, galleryData) => {
    const response = await fetch(`${BASE_URL}/galleries/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(galleryData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteGallery: async (id) => {
    const response = await fetch(`${BASE_URL}/galleries/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Contact APIs
export const contactAPI = {
  getContacts: async () => {
    const response = await fetch(`${BASE_URL}/contacts/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getContact: async (id) => {
    const response = await fetch(`${BASE_URL}/contacts/${id}/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createContact: async (contactData) => {
    const response = await fetch(`${BASE_URL}/contacts/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(contactData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateContact: async (id, contactData) => {
    const response = await fetch(`${BASE_URL}/contacts/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(contactData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteContact: async (id) => {
    const response = await fetch(`${BASE_URL}/contacts/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Marks APIs
export const marksAPI = {
  getMarksById: async (id) => {
    return makeRequest(`${BASE_URL}/marksentries/${id}/`, {
      method: 'GET'
    });
  },

  getAllMarks: async () => {
    return makeRequest(`${BASE_URL}/marksentries/`, {
      method: 'GET'
    });
  },

  createMarks: async (marksData) => {
    return makeRequest(`${BASE_URL}/marksentries/`, {
      method: 'POST',
      body: JSON.stringify(marksData)
    });
  },

  createBulkMarks: async (bulkData) => {
    return makeRequest(`${BASE_URL}/marksentries/`, {
      method: 'POST',
      body: JSON.stringify(bulkData)
    });
  },

  updateMarks: async (id, marksData) => {
    return makeRequest(`${BASE_URL}/marksentries/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(marksData)
    });
  },

  deleteMarks: async (id) => {
    return makeRequest(`${BASE_URL}/marksentries/${id}/`, {
      method: 'DELETE'
    });
  },

  getByExamClass: async (examId, classId, subjectId) => {
    const url = subjectId 
      ? `${BASE_URL}/marksentries/exam_class/?exam=${examId}&classroom=${classId}&subject=${subjectId}`
      : `${BASE_URL}/marksentries/exam_class/?exam=${examId}&classroom=${classId}`;
    return makeRequest(url, {
      method: 'GET'
    });
  },

  getByExam: async (examId) => {
    return makeRequest(`${BASE_URL}/marksentries/exam_class/?exam=${examId}`, {
      method: 'GET'
    });
  },

  getByStudent: async (studentId) => {
    return makeRequest(`${BASE_URL}/marksentries/student/${studentId}/`, {
      method: 'GET'
    });
  }
};

// Timetable APIs
export const timetableAPI = {
  // Get all timetables
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/timetable/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Get timetable by ID
  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/timetable/${id}/`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Get timetables by classroom
  getByClass: async (classroomId) => {
    const response = await fetch(`${BASE_URL}/timetable/?classroom=${classroomId}`, {
      method: 'GET',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Create timetable
  create: async (timetableData) => {
    const response = await fetch(`${BASE_URL}/timetable/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(timetableData),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Update timetable
  update: async (id, timetableData) => {
    const response = await fetch(`${BASE_URL}/timetable/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(timetableData),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Delete timetable
  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/timetable/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Bulk create timetables for a classroom
  bulkCreate: async (classroomId, entries) => {
    const response = await fetch(`${BASE_URL}/timetable/bulk-create/classroom/${classroomId}/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ entries }),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Bulk update timetables for a classroom
  bulkUpdate: async (classroomId, entries) => {
    const response = await fetch(`${BASE_URL}/timetable/bulk-update/classroom/${classroomId}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify({ entries }),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Export all APIs as a default export
export default {
  auth: authAPI,
  school: schoolAPI,
  student: studentAPI,
  teacher: teacherAPI,
  class: classAPI,
  subject: subjectAPI,
  attendance: attendanceAPI,
  exam: examAPI,
  result: resultAPI,
  marks: marksAPI,
  fee: feeAPI,
  notice: noticeAPI,
  event: eventAPI,
  gallery: galleryAPI,
  contact: contactAPI,
  timetable: timetableAPI
}; 
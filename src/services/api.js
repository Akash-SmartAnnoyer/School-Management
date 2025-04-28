// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://360schoolingdev.vercel.app/api';
const API_VERSION = 'v1';
const BASE_URL = `${API_URL}/${API_VERSION}`;

// Helper function to handle response
const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
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
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
};

// Helper function to make API calls
const makeRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: getHeaders(),
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
      headers: getHeaders(),
      body: JSON.stringify(credentials),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  refreshToken: async (refreshToken) => {
    const response = await fetch(`${BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: getHeaders(),
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
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getSchool: async (id) => {
    const response = await fetch(`${BASE_URL}/schools/${id}/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createSchool: async (schoolData) => {
    const response = await fetch(`${BASE_URL}/schools/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(schoolData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateSchool: async (id, schoolData) => {
    const response = await fetch(`${BASE_URL}/schools/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(schoolData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteSchool: async (id) => {
    const response = await fetch(`${BASE_URL}/schools/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Student APIs
export const studentAPI = {
  getStudents: async () => {
    const response = await fetch(`${BASE_URL}/users/students/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getStudent: async (id) => {
    const response = await fetch(`${BASE_URL}/students/${id}/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createStudent: async (studentData) => {
    const response = await fetch(`${BASE_URL}/users/register/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(studentData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateStudent: async (id, studentData) => {
    const response = await fetch(`${BASE_URL}/students/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(studentData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteStudent: async (id) => {
    const response = await fetch(`${BASE_URL}/users/students/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Teacher APIs
export const teacherAPI = {
  getTeachers: async () => {
    const response = await fetch(`${BASE_URL}/users/teachers/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getTeacher: async (id) => {
    const response = await fetch(`${BASE_URL}/teachers/${id}/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createTeacher: async (teacherData) => {
    const response = await fetch(`${BASE_URL}/users/register/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(teacherData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateTeacher: async (id, teacherData) => {
    const response = await fetch(`${BASE_URL}/teachers/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(teacherData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteTeacher: async (id) => {
    const response = await fetch(`${BASE_URL}/teachers/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Class APIs
export const classAPI = {
  getClasses: async () => {
    const response = await fetch(`${BASE_URL}/classrooms/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getClass: async (id) => {
    const response = await fetch(`${BASE_URL}/classrooms/${id}/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createClass: async (classData) => {
    const response = await fetch(`${BASE_URL}/classrooms/create/`, {
      method: 'POST',
      headers: getHeaders(),
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
      headers: getHeaders(),
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
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  addStudentsToClass: async (classId, studentIds) => {
    const response = await fetch(`${BASE_URL}/classrooms/${classId}/add-students/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ student_ids: studentIds }),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Subject APIs
export const subjectAPI = {
  getSubjects: async () => {
    const response = await fetch(`${BASE_URL}/subjects/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getSubject: async (id) => {
    const response = await fetch(`${BASE_URL}/subjects/${id}/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createSubject: async (subjectData) => {
    const response = await fetch(`${BASE_URL}/subjects/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(subjectData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateSubject: async (id, subjectData) => {
    const response = await fetch(`${BASE_URL}/subjects/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(subjectData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteSubject: async (id) => {
    const response = await fetch(`${BASE_URL}/subjects/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Attendance APIs
export const attendanceAPI = {
  getAttendances: async () => {
    const response = await fetch(`${BASE_URL}/attendances/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getAttendance: async (id) => {
    const response = await fetch(`${BASE_URL}/attendances/${id}/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createAttendance: async (attendanceData) => {
    const response = await fetch(`${BASE_URL}/attendances/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(attendanceData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateAttendance: async (id, attendanceData) => {
    const response = await fetch(`${BASE_URL}/attendances/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(attendanceData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteAttendance: async (id) => {
    const response = await fetch(`${BASE_URL}/attendances/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
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
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getExam: async (id) => {
    const response = await fetch(`${BASE_URL}/exams/${id}/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createExam: async (examData) => {
    const response = await fetch(`${BASE_URL}/exams/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(examData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateExam: async (id, examData) => {
    const response = await fetch(`${BASE_URL}/exams/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(examData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteExam: async (id) => {
    const response = await fetch(`${BASE_URL}/exams/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Result APIs
export const resultAPI = {
  getResults: async () => {
    const response = await fetch(`${BASE_URL}/results/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getResult: async (id) => {
    const response = await fetch(`${BASE_URL}/results/${id}/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createResult: async (resultData) => {
    const response = await fetch(`${BASE_URL}/results/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(resultData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateResult: async (id, resultData) => {
    const response = await fetch(`${BASE_URL}/results/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(resultData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteResult: async (id) => {
    const response = await fetch(`${BASE_URL}/results/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Fee APIs
export const feeAPI = {
  getFees: async () => {
    const response = await fetch(`${BASE_URL}/fees/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getFee: async (id) => {
    const response = await fetch(`${BASE_URL}/fees/${id}/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createFee: async (feeData) => {
    const response = await fetch(`${BASE_URL}/fees/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(feeData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateFee: async (id, feeData) => {
    const response = await fetch(`${BASE_URL}/fees/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(feeData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteFee: async (id) => {
    const response = await fetch(`${BASE_URL}/fees/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

// Notice APIs
export const noticeAPI = {
  getNotices: async () => {
    const response = await fetch(`${BASE_URL}/notices/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getNotice: async (id) => {
    const response = await fetch(`${BASE_URL}/notices/${id}/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createNotice: async (noticeData) => {
    const response = await fetch(`${BASE_URL}/notices/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(noticeData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateNotice: async (id, noticeData) => {
    const response = await fetch(`${BASE_URL}/notices/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(noticeData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteNotice: async (id) => {
    const response = await fetch(`${BASE_URL}/notices/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
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
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getEvent: async (id) => {
    const response = await fetch(`${BASE_URL}/events/${id}/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createEvent: async (eventData) => {
    const response = await fetch(`${BASE_URL}/events/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(eventData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateEvent: async (id, eventData) => {
    const response = await fetch(`${BASE_URL}/events/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(eventData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteEvent: async (id) => {
    const response = await fetch(`${BASE_URL}/events/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
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
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getGallery: async (id) => {
    const response = await fetch(`${BASE_URL}/galleries/${id}/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createGallery: async (galleryData) => {
    const response = await fetch(`${BASE_URL}/galleries/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(galleryData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateGallery: async (id, galleryData) => {
    const response = await fetch(`${BASE_URL}/galleries/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(galleryData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteGallery: async (id) => {
    const response = await fetch(`${BASE_URL}/galleries/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
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
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  getContact: async (id) => {
    const response = await fetch(`${BASE_URL}/contacts/${id}/`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  createContact: async (contactData) => {
    const response = await fetch(`${BASE_URL}/contacts/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(contactData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  updateContact: async (id, contactData) => {
    const response = await fetch(`${BASE_URL}/contacts/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(contactData),
      credentials: 'include'
    });
    return handleResponse(response);
  },
  deleteContact: async (id) => {
    const response = await fetch(`${BASE_URL}/contacts/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
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
  fee: feeAPI,
  notice: noticeAPI,
  event: eventAPI,
  gallery: galleryAPI,
  contact: contactAPI
}; 
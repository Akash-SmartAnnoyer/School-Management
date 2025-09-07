import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
const API_VERSION = 'v1';
const BASE_URL = `${API_URL}/api/${API_VERSION}`;

// Helper function to handle response
const handleResponse = async (response) => {
  console.log('API Response:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
      console.error('Error response data:', errorData);
    } catch (e) {
      console.error('Error parsing error response:', e);
      errorData = {};
    }
    
    // Handle specific status codes
    switch (response.status) {
      case 400:
        throw new Error(errorData.detail || 'Invalid request data');
      
      case 401:
        // Clear tokens on unauthorized access
        const { clearTokens } = await import('../utils/tokenManager');
        clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      
      case 403:
        throw new Error(errorData.detail || 'You do not have permission to perform this action');
      
      case 404:
        throw new Error(errorData.detail || 'Resource not found');
      
      case 500:
        throw new Error(errorData.detail || 'Server error. Please try again later');
      
      default:
        throw new Error(errorData.detail || 'Something went wrong');
    }
  }

  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Parsed response data:', data);
      return data;
    }
    
    const text = await response.text();
    console.log('Text response:', text);
    return text;
  } catch (error) {
    console.error('Error parsing response:', error);
    throw new Error('Failed to parse response data');
  }
};

// Helper function to get headers with auth token
const getHeaders = async () => {
  const token = localStorage.getItem('token');
  console.log('Using token:', token ? 'Present' : 'Missing');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Subject APIs
export const subjectAPI = {
  getSubjects: async () => {
    const response = await fetch(`${BASE_URL}/subjects/`, {
      method: 'GET',
      headers: await getHeaders()
    });
    const result = await handleResponse(response);
    console.log('Subject API Response:', result); // Debug log
    return result;
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

// Teacher APIs
export const teacherAPI = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/teachers/`, {
      method: 'GET',
      headers: await getHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/teachers/${id}/`, {
      method: 'GET',
      headers: await getHeaders()
    });
    return handleResponse(response);
  }
};

// Attendance APIs
export const attendanceAPI = {
  create: async (attendanceData) => {
    const response = await fetch(`${BASE_URL}/attendance/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(attendanceData)
    });
    return handleResponse(response);
  },

  createBulk: async (attendanceDataList) => {
    const response = await fetch(`${BASE_URL}/attendance/bulk-create/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(attendanceDataList)
    });
    return handleResponse(response);
  },

  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${BASE_URL}/attendance/${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET',
      headers: await getHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/attendance/${id}/`, {
      method: 'GET',
      headers: await getHeaders()
    });
    return handleResponse(response);
  },

  update: async (id, attendanceData) => {
    const response = await fetch(`${BASE_URL}/attendance/${id}/`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify(attendanceData)
    });
    return handleResponse(response);
  },

  updateBulk: async (attendanceDataList) => {
    const response = await fetch(`${BASE_URL}/attendance/bulk-update/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(attendanceDataList)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/attendance/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return handleResponse(response);
  }
};

// Class APIs
export const classAPI = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/classrooms/`, {
      method: 'GET',
      headers: await getHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/classrooms/${id}/`, {
      method: 'GET',
      headers: await getHeaders()
    });
    return handleResponse(response);
  },

  create: async (classData) => {
    const response = await fetch(`${BASE_URL}/classrooms/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(classData)
    });
    return handleResponse(response);
  },

  update: async (id, classData) => {
    const response = await fetch(`${BASE_URL}/classrooms/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(classData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/classrooms/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return handleResponse(response);
  }
};

// Student APIs
export const studentAPI = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/students/`, {
      method: 'GET',
      headers: await getHeaders()
    });
    return handleResponse(response);
  },

  getByClass: async (classId) => {
    const response = await fetch(`${BASE_URL}/students/?classroom=${classId}`, {
      method: 'GET',
      headers: await getHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/students/${id}/`, {
      method: 'GET',
      headers: await getHeaders()
    });
    return handleResponse(response);
  },

  create: async (studentData) => {
    const response = await fetch(`${BASE_URL}/students/`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(studentData)
    });
    return handleResponse(response);
  },

  update: async (id, studentData) => {
    const response = await fetch(`${BASE_URL}/students/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(studentData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/students/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders()
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
      body: JSON.stringify({
        event_title: eventData.event_title,
        event_type: eventData.event_type,
        description: eventData.description,
        start_datetime: eventData.start_datetime,
        end_datetime: eventData.end_datetime,
        status: eventData.status
      }),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  updateEvent: async (id, eventData) => {
    const response = await fetch(`${BASE_URL}/events/${id}/`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify({
        event_title: eventData.event_title,
        event_type: eventData.event_type,
        description: eventData.description,
        start_datetime: eventData.start_datetime,
        end_datetime: eventData.end_datetime,
        status: eventData.status
      }),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  updateEventPartial: async (id, eventData) => {
    const response = await fetch(`${BASE_URL}/events/${id}/`, {
      method: 'PATCH',
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

// Timetable APIs
export const timetableAPI = {
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
  },
};

// Export all APIs as a default export
export default {
  subject: subjectAPI,
  exam: examAPI,
  teacher: teacherAPI,
  attendance: attendanceAPI,
  class: classAPI,
  student: studentAPI,
  event: eventAPI,
  timetable: timetableAPI
}; 
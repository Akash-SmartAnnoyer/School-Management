import axios from 'axios';

const API_URL = 'https://360schoolingdev.vercel.app/api/v1';

// Subject API calls
export const createSubject = async (subjectData, token) => {
  try {
    const response = await axios.post(`${API_URL}/subjects/`, subjectData, {
      headers: { Authorization: token }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create subject');
  }
};

export const updateSubject = async (id, subjectData, token) => {
  try {
    const response = await axios.put(`${API_URL}/subjects/${id}/`, subjectData, {
      headers: { Authorization: token }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to update subject');
  }
};

export const getSubjectById = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/subjects/${id}/`, {
      headers: { Authorization: token }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get subject');
  }
};

export const getAllSubjects = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/subjects/`, {
      headers: { Authorization: token }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get subjects');
  }
};

export const deleteSubject = async (id, token) => {
  try {
    await axios.delete(`${API_URL}/subjects/${id}/`, {
      headers: { Authorization: token }
    });
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to delete subject');
  }
};

// Exam API calls
export const createExam = async (examData, token) => {
  try {
    const response = await axios.post(`${API_URL}/exams/`, examData, {
      headers: { Authorization: token }
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.subjects) {
      throw new Error('Invalid subject IDs provided');
    }
    throw new Error(error.response?.data?.detail || 'Failed to create exam');
  }
};

export const updateExam = async (id, examData, token) => {
  try {
    const response = await axios.put(`${API_URL}/exams/${id}/`, examData, {
      headers: { Authorization: token }
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.subjects) {
      throw new Error('Invalid subject IDs provided');
    }
    throw new Error(error.response?.data?.detail || 'Failed to update exam');
  }
};

export const getExamById = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/exams/${id}/`, {
      headers: { Authorization: token }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get exam');
  }
};

export const getAllExams = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/exams/`, {
      headers: { Authorization: token }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get exams');
  }
};

export const deleteExam = async (id, token) => {
  try {
    await axios.delete(`${API_URL}/exams/${id}/`, {
      headers: { Authorization: token }
    });
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to delete exam');
  }
}; 
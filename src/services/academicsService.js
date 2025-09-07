import axios from 'axios';
import { API_BASE_URL } from '../config';

const academicsService = {
  subjects: {
    getAll: () => axios.get(`${API_BASE_URL}/api/v1/subjects/`),
    getById: (id) => axios.get(`${API_BASE_URL}/api/v1/subjects/${id}/`),
    create: (data) => axios.post(`${API_BASE_URL}/api/v1/subjects/`, data),
    update: (id, data) => axios.put(`${API_BASE_URL}/api/v1/subjects/${id}/`, data),
    delete: (id) => axios.delete(`${API_BASE_URL}/api/v1/subjects/${id}/`),
  },

  exams: {
    getAll: () => axios.get(`${API_BASE_URL}/api/v1/exams/`),
    getById: (id) => axios.get(`${API_BASE_URL}/api/v1/exams/${id}/`),
    create: (data) => axios.post(`${API_BASE_URL}/api/v1/exams/`, data),
    update: (id, data) => axios.put(`${API_BASE_URL}/api/v1/exams/${id}/`, data),
    delete: (id) => axios.delete(`${API_BASE_URL}/api/v1/exams/${id}/`),
  },
};

export default academicsService; 
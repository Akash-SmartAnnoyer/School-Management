import api from './api';

// Import API endpoints
export const importApi = {
  // Import students from Excel file
  importStudents: async (file, organizationId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (organizationId) {
      formData.append('organization_id', organizationId);
    }

    const response = await api.post('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        return percentCompleted;
      },
    });

    return response.data;
  },

  // Import teachers from Excel file
  importTeachers: async (file, organizationId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (organizationId) {
      formData.append('organization_id', organizationId);
    }

    const response = await api.post('/teachers/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        return percentCompleted;
      },
    });

    return response.data;
  },

  // Import classes from Excel file
  importClasses: async (file, organizationId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (organizationId) {
      formData.append('organization_id', organizationId);
    }

    const response = await api.post('/classes/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        return percentCompleted;
      },
    });

    return response.data;
  },

  // Get import history for students
  getStudentsImportHistory: async (params = {}) => {
    const response = await api.get('/students/import-history', { params });
    return response.data;
  },

  // Get import history for teachers
  getTeachersImportHistory: async (params = {}) => {
    const response = await api.get('/teachers/import-history', { params });
    return response.data;
  },

  // Get import history for classes
  getClassesImportHistory: async (params = {}) => {
    const response = await api.get('/classes/import-history', { params });
    return response.data;
  },

  // Get import details by ID
  getImportDetails: async (importId) => {
    const response = await api.get(`/imports/${importId}/details`);
    return response.data;
  },

  // Download import file
  downloadImportFile: async (importId, type = 'original') => {
    const response = await api.get(`/imports/${importId}/download`, {
      params: { type },
      responseType: 'blob',
    });
    return response.data;
  },

  // Check import status
  getImportStatus: async (importId) => {
    const response = await api.get(`/imports/${importId}/status`);
    return response.data;
  },

  // Download sample files
  downloadStudentsSample: async () => {
    const response = await api.get('/students/sample-file', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTeachersSample: async () => {
    const response = await api.get('/teachers/sample-file', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadClassesSample: async () => {
    const response = await api.get('/classes/sample-file', {
      responseType: 'blob',
    });
    return response.data;
  },
};

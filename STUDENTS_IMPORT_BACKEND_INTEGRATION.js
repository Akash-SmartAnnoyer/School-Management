// Updated Students.js implementation for backend integration
// Replace the existing import-related functions in Students.js with these:

import { importApi } from '../services/importApi';

// Updated handleImport function - replaces the mock implementation
const handleImport = async (file) => {
  setImportLoading(true);
  setImportStatus('uploading');
  setImportProgress(0);
  
  try {
    // Real API call to import students
    const response = await importApi.importStudents(file, organizationId);
    
    if (response.success) {
      setImportStatus('success');
      message.success(`Students imported successfully! ${response.data.successful_imports} records processed.`);
      
      // Refresh the students list
      refreshStudents();
      
      // Reload import history to show the new import
      loadImportHistory();
    } else {
      setImportStatus('error');
      message.error(response.message || 'Import failed');
    }
  } catch (error) {
    setImportStatus('error');
    console.error('Import error:', error);
    
    if (error.response?.data?.message) {
      message.error(error.response.data.message);
    } else {
      message.error('Import failed. Please try again.');
    }
  } finally {
    setImportLoading(false);
  }
};

// Updated loadImportHistory function - replaces the mock implementation
const loadImportHistory = async () => {
  setImportHistoryLoading(true);
  try {
    // Real API call to get import history
    const response = await importApi.getStudentsImportHistory({
      page: 1,
      limit: 10
    });
    
    if (response.success) {
      setImportHistory(response.data.imports);
    } else {
      message.error('Failed to load import history');
    }
  } catch (error) {
    console.error('History loading error:', error);
    message.error('Failed to load import history');
  } finally {
    setImportHistoryLoading(false);
  }
};

// Updated handleDownloadSample function - can use backend or frontend
const handleDownloadSample = async () => {
  try {
    // Option 1: Use backend sample file (recommended)
    const blob = await importApi.downloadStudentsSample();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students_sample.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Option 2: Use frontend generation (current implementation)
    // downloadSampleFile('students');
  } catch (error) {
    console.error('Sample download error:', error);
    // Fallback to frontend generation
    downloadSampleFile('students');
  }
};

// Updated handleDownloadImportFile function
const handleDownloadImportFile = async (record) => {
  try {
    const blob = await importApi.downloadImportFile(record.id, 'original');
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = record.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    message.error('Failed to download file');
  }
};

// New function to check import status (for real-time updates)
const checkImportStatus = async (importId) => {
  try {
    const response = await importApi.getImportStatus(importId);
    if (response.success) {
      // Update progress and status
      setImportProgress(response.data.progress);
      
      if (response.data.status === 'completed') {
        setImportStatus('success');
        loadImportHistory(); // Refresh history
      } else if (response.data.status === 'failed') {
        setImportStatus('error');
      }
    }
  } catch (error) {
    console.error('Status check error:', error);
  }
};

// Add this to useEffect to check status of ongoing imports
useEffect(() => {
  if (importStatus === 'processing' && importProgress < 100) {
    const interval = setInterval(() => {
      // Check status every 2 seconds for ongoing imports
      checkImportStatus(currentImportId);
    }, 2000);
    
    return () => clearInterval(interval);
  }
}, [importStatus, importProgress]);

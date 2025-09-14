# Backend Integration Guide for Import Feature

## Current Status
✅ **Frontend is 100% ready** - All UI components, modals, and user interactions are complete
❌ **Backend APIs needed** - Currently using mock data and simulated responses

## What Needs to Change When Backend is Ready

### 1. **Replace Mock Functions with Real API Calls**

#### **Current Mock Implementation:**
```javascript
// In Students.js - CURRENT (MOCK)
const handleImport = async (file) => {
  // Simulate upload progress
  for (let i = 0; i <= 100; i += 10) {
    setImportProgress(i);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  // Mock success response
  setImportStatus('success');
  message.success('Students imported successfully!');
};
```

#### **Backend Integration (REPLACE WITH):**
```javascript
// In Students.js - NEW (REAL API)
const handleImport = async (file) => {
  setImportLoading(true);
  setImportStatus('uploading');
  setImportProgress(0);
  
  try {
    const response = await importApi.importStudents(file, organizationId);
    
    if (response.success) {
      setImportStatus('success');
      message.success(`Students imported successfully! ${response.data.successful_imports} records processed.`);
      refreshStudents();
      loadImportHistory();
    } else {
      setImportStatus('error');
      message.error(response.message || 'Import failed');
    }
  } catch (error) {
    setImportStatus('error');
    message.error('Import failed. Please try again.');
  } finally {
    setImportLoading(false);
  }
};
```

### 2. **Files to Update**

#### **A. Add Import API Service** ✅ **CREATED**
- **File**: `src/services/importApi.js`
- **Status**: Ready to use
- **Purpose**: Centralized API calls for all import operations

#### **B. Update Students.js** 
- **Replace**: `handleImport` function (lines 3093-3130)
- **Replace**: `loadImportHistory` function (lines 3135-3195)
- **Replace**: `handleDownloadSample` function (lines 3130-3133)
- **Add**: Import API import statement
- **Add**: Real-time status checking

#### **C. Update Teachers.js** (Same pattern)
- Replace mock functions with real API calls
- Use `importApi.importTeachers()`
- Use `importApi.getTeachersImportHistory()`

#### **D. Update Classes.js** (Same pattern)
- Replace mock functions with real API calls
- Use `importApi.importClasses()`
- Use `importApi.getClassesImportHistory()`

### 3. **Required Backend APIs**

The backend must implement these endpoints exactly as specified:

#### **Import APIs:**
- `POST /api/students/import` - Upload and process students Excel
- `POST /api/teachers/import` - Upload and process teachers Excel
- `POST /api/classes/import` - Upload and process classes Excel

#### **History APIs:**
- `GET /api/students/import-history` - Get students import history
- `GET /api/teachers/import-history` - Get teachers import history
- `GET /api/classes/import-history` - Get classes import history

#### **Details APIs:**
- `GET /api/imports/{id}/details` - Get detailed import information
- `GET /api/imports/{id}/download` - Download original/results files
- `GET /api/imports/{id}/status` - Check import progress

#### **Sample Files:**
- `GET /api/students/sample-file` - Download students sample
- `GET /api/teachers/sample-file` - Download teachers sample
- `GET /api/classes/sample-file` - Download classes sample

### 4. **Step-by-Step Integration Process**

#### **Step 1: Add API Service** ✅ **DONE**
```javascript
// Already created: src/services/importApi.js
import { importApi } from '../services/importApi';
```

#### **Step 2: Update Students.js**
```javascript
// Add this import at the top
import { importApi } from '../services/importApi';

// Replace the mock functions with the real implementations
// (See STUDENTS_IMPORT_BACKEND_INTEGRATION.js for complete code)
```

#### **Step 3: Update Teachers.js**
```javascript
// Same pattern as Students.js but use:
// importApi.importTeachers()
// importApi.getTeachersImportHistory()
```

#### **Step 4: Update Classes.js**
```javascript
// Same pattern as Students.js but use:
// importApi.importClasses()
// importApi.getClassesImportHistory()
```

### 5. **What Will Work Immediately After Backend Deployment**

#### **✅ Already Working (No Changes Needed):**
- Import modal UI and tabs
- File upload interface
- Progress tracking UI
- History table display
- Sample file download (frontend)
- Error handling UI
- All styling and animations

#### **🔄 Will Work After Backend Integration:**
- Real file upload to server
- Actual import processing
- Live import history data
- Real-time progress updates
- Server-side error messages
- File downloads from server

### 6. **Testing Checklist**

#### **Before Backend Integration:**
- [ ] UI components render correctly
- [ ] File upload interface works
- [ ] Mock data displays properly
- [ ] Sample file download works (frontend)

#### **After Backend Integration:**
- [ ] Real file upload works
- [ ] Import processing completes
- [ ] History loads from server
- [ ] Error messages display correctly
- [ ] Progress tracking works
- [ ] File downloads work

### 7. **Fallback Strategy**

If backend sample files are not ready, the frontend sample generation will continue to work:

```javascript
const handleDownloadSample = async () => {
  try {
    // Try backend first
    const blob = await importApi.downloadStudentsSample();
    // ... download logic
  } catch (error) {
    // Fallback to frontend generation
    downloadSampleFile('students');
  }
};
```

### 8. **Environment Configuration**

Make sure your API base URL is configured:

```javascript
// In src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

## Summary

**Frontend is 100% ready!** When the backend APIs are deployed:

1. **Replace 3 functions** in each screen (Students, Teachers, Classes)
2. **Add 1 import statement** for the API service
3. **Test the integration** - everything else will work automatically

**Total changes needed**: ~15 lines of code per screen
**Time required**: ~30 minutes per screen
**Risk level**: Very low (UI is already complete and tested)

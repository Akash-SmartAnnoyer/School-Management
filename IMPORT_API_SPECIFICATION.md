# Import Feature API Specification

The frontend now includes import functionality for Students, Teachers, and Classes screens. Each screen allows users to upload Excel files to bulk import data. The backend needs to provide APIs to handle file upload, validation, and data processing.

## Task Description


## API Endpoints Required

### 1. Students Import API

#### **POST** `/api/students/import`

**Description:** Upload and process Excel file to import students data

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  ```json
  {
    "file": "Excel file (.xlsx/.xls)",
    "organization_id": "string (optional)"
  }
  ```

**Expected Excel File Structure:**
```
| First Name | Last Name | Student ID | Email | Phone | Date of Birth | Gender | Class | Section | Status | Address | Parent Name | Parent Phone | Parent Email | Admission Date |
|------------|-----------|------------|-------|-------|---------------|--------|-------|---------|--------|---------|-------------|--------------|--------------|----------------|
| John       | Doe       | STU001     | john@example.com | +1234567890 | 2010-05-15 | Male | Class 10 | A | Active | 123 Main St | Jane Doe | +1234567891 | jane@example.com | 2024-01-15 |
```

**Response:**
```json
{
  "success": true,
  "message": "Students imported successfully",
  "data": {
    "total_processed": 50,
    "successful_imports": 48,
    "failed_imports": 2,
    "import_id": "imp_123456789",
    "errors": [
      {
        "row": 15,
        "field": "email",
        "error": "Invalid email format"
      },
      {
        "row": 23,
        "field": "student_id",
        "error": "Student ID already exists"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Import failed",
  "error": "Invalid file format. Please upload an Excel file.",
  "code": "INVALID_FILE_FORMAT"
}
```

---

### 2. Teachers Import API

#### **POST** `/api/teachers/import`

**Description:** Upload and process Excel file to import teachers data

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  ```json
  {
    "file": "Excel file (.xlsx/.xls)",
    "organization_id": "string (optional)"
  }
  ```

**Expected Excel File Structure:**
```
| First Name | Last Name | Teacher ID | Email | Phone | Date of Birth | Gender | Subject | Qualification | Experience | Address | Emergency Contact | Emergency Phone | Status | Joining Date | Salary |
|------------|-----------|------------|-------|-------|---------------|--------|---------|---------------|------------|---------|------------------|-----------------|--------|--------------|--------|
| Alice      | Johnson   | TCH001     | alice@school.com | +1234567894 | 1985-03-10 | Female | Mathematics | M.Sc Mathematics | 5 years | 789 Pine St | David Johnson | +1234567895 | Active | 2020-06-01 | 50000 |
```

**Response:**
```json
{
  "success": true,
  "message": "Teachers imported successfully",
  "data": {
    "total_processed": 25,
    "successful_imports": 24,
    "failed_imports": 1,
    "import_id": "imp_123456790",
    "errors": [
      {
        "row": 12,
        "field": "teacher_id",
        "error": "Teacher ID already exists"
      }
    ]
  }
}
```

---

### 3. Classes Import API

#### **POST** `/api/classes/import`

**Description:** Upload and process Excel file to import classes data

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  ```json
  {
    "file": "Excel file (.xlsx/.xls)",
    "organization_id": "string (optional)"
  }
  ```

**Expected Excel File Structure:**
```
| Class Name | Section | Teacher Name | Teacher Email | Capacity | Room Number | Subject | Schedule | Status | Academic Year | Description |
|------------|---------|--------------|---------------|----------|-------------|---------|----------|--------|---------------|-------------|
| Class 10   | A       | Alice Johnson | alice@school.com | 30 | 101 | Mathematics | Monday-Friday 9:00-10:00 | Active | 2024-2025 | Advanced Mathematics for Class 10 |
```

**Response:**
```json
{
  "success": true,
  "message": "Classes imported successfully",
  "data": {
    "total_processed": 15,
    "successful_imports": 14,
    "failed_imports": 1,
    "import_id": "imp_123456791",
    "errors": [
      {
        "row": 8,
        "field": "teacher_email",
        "error": "Teacher not found with this email"
      }
    ]
  }
}
```

---

## Additional API Endpoints

### 4. Sample File Download APIs

#### **GET** `/api/students/sample-file`
#### **GET** `/api/teachers/sample-file`
#### **GET** `/api/classes/sample-file`

**Description:** Download sample Excel files for each entity type

**Response:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Body:** Excel file stream

---

### 5. Import Status API

#### **GET** `/api/imports/{import_id}/status`

**Description:** Check the status of an ongoing import process

**Response:**
```json
{
  "success": true,
  "data": {
    "import_id": "imp_123456789",
    "status": "processing", // "uploading", "processing", "completed", "failed"
    "progress": 75,
    "total_processed": 150,
    "successful_imports": 148,
    "failed_imports": 2,
    "estimated_completion": "2024-01-15T10:30:00Z"
  }
}
```

---

### 6. Import History APIs

#### **GET** `/api/students/import-history`
#### **GET** `/api/teachers/import-history`
#### **GET** `/api/classes/import-history`

**Description:** Get import history for each entity type

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `status` (optional): Filter by status (completed, failed, processing)
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "imports": [
      {
        "id": "imp_123456789",
        "filename": "students_batch_1.xlsx",
        "status": "completed",
        "progress": 100,
        "records": {
          "total": 50,
          "successful": 48,
          "failed": 2
        },
        "uploaded_at": "2024-01-15T10:30:00Z",
        "completed_at": "2024-01-15T10:32:00Z",
        "message": "Students imported successfully",
        "errors": [
          {
            "row": 15,
            "field": "email",
            "error": "Invalid email format"
          }
        ]
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_records": 50,
      "per_page": 10
    }
  }
}
```

---

### 7. Import Details API

#### **GET** `/api/imports/{import_id}/details`

**Description:** Get detailed information about a specific import

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "imp_123456789",
    "filename": "students_batch_1.xlsx",
    "status": "completed",
    "progress": 100,
    "records": {
      "total": 50,
      "successful": 48,
      "failed": 2
    },
    "uploaded_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-15T10:32:00Z",
    "message": "Students imported successfully",
    "errors": [
      {
        "row": 15,
        "field": "email",
        "error": "Invalid email format"
      },
      {
        "row": 23,
        "field": "student_id",
        "error": "Student ID already exists"
      }
    ],
    "successful_records": [
      {
        "row": 1,
        "data": {
          "first_name": "John",
          "last_name": "Doe",
          "student_id": "STU001",
          "email": "john@example.com"
        }
      }
    ],
    "failed_records": [
      {
        "row": 15,
        "data": {
          "first_name": "Jane",
          "last_name": "Smith",
          "student_id": "STU015",
          "email": "invalid-email"
        },
        "errors": ["Invalid email format"]
      }
    ]
  }
}
```

---

### 8. Download Import Results API

#### **GET** `/api/imports/{import_id}/download`

**Description:** Download the original import file or results file

**Query Parameters:**
- `type` (optional): "original" or "results" (default: "original")

**Response:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Body:** Excel file stream

---

## Field Validation Rules

### Students
- **Required Fields:** First Name, Last Name, Student ID, Email, Phone, Date of Birth, Gender, Class, Section, Status
- **Email:** Must be valid email format and unique
- **Student ID:** Must be unique
- **Phone:** Must be valid phone number format
- **Date of Birth:** Must be valid date format (YYYY-MM-DD)
- **Gender:** Must be "Male" or "Female"
- **Status:** Must be "Active" or "Inactive"

### Teachers
- **Required Fields:** First Name, Last Name, Teacher ID, Email, Phone, Date of Birth, Gender, Subject, Qualification, Status
- **Email:** Must be valid email format and unique
- **Teacher ID:** Must be unique
- **Phone:** Must be valid phone number format
- **Date of Birth:** Must be valid date format (YYYY-MM-DD)
- **Gender:** Must be "Male" or "Female"
- **Status:** Must be "Active" or "Inactive"

### Classes
- **Required Fields:** Class Name, Section, Teacher Name, Teacher Email, Capacity, Room Number, Subject, Status
- **Teacher Email:** Must exist in teachers table
- **Capacity:** Must be a positive integer
- **Room Number:** Must be unique per organization
- **Status:** Must be "Active" or "Inactive"

---

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_FILE_FORMAT` | File is not a valid Excel format |
| `FILE_TOO_LARGE` | File size exceeds maximum limit |
| `MISSING_REQUIRED_FIELDS` | Required fields are missing in the file |
| `DUPLICATE_ENTRY` | Duplicate entry found (ID, email, etc.) |
| `INVALID_DATA_FORMAT` | Data format is invalid for specific fields |
| `TEACHER_NOT_FOUND` | Referenced teacher not found (for classes) |
| `ORGANIZATION_NOT_FOUND` | Organization ID not found |
| `IMPORT_LIMIT_EXCEEDED` | Too many records in single import |

---


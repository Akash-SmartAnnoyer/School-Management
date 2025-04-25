# API Endpoints for School Management System

## 1. Authentication
| S.No. | Endpoint | Method | Description |
|-------|----------|---------|-------------|
| 1 | `/api/auth/login/` | POST | User login |
| 2 | `/api/auth/logout/` | POST | User logout |
| 3 | `/api/auth/register/` | POST | User registration |

## 2. Theme Management
| S.No. | Endpoint | Method | Description |
|-------|----------|---------|-------------|
| 1 | `/api/theme/colors/` | GET | Get theme colors |
| 2 | `/api/theme/colors/` | POST | Update theme colors |
| 3 | `/api/health/` | GET | Check API health status |

## 3. Academic Management
| S.No. | Endpoint | Method | Description |
|-------|----------|---------|-------------|
| 1 | `/api/exams/` | GET | List all exams |
| 2 | `/api/exams/` | POST | Create new exam |
| 3 | `/api/exams/{id}/` | PUT | Update exam details |
| 4 | `/api/exams/{id}/` | DELETE | Delete exam |
| 5 | `/api/marks/` | GET | List all marks |
| 6 | `/api/marks/` | POST | Add new marks |
| 7 | `/api/marks/{id}/` | PUT | Update marks |
| 8 | `/api/marks/{id}/` | DELETE | Delete marks |
| 9 | `/api/marks/exam/{examId}/` | GET | Get marks by exam |
| 10 | `/api/marks/student/{studentId}/` | GET | Get marks for student |

## 4. Class Management
| S.No. | Endpoint | Method | Description |
|-------|----------|---------|-------------|
| 1 | `/api/classes/` | GET | List all classes |
| 2 | `/api/classes/{id}/students/` | GET | Get students in class |

## 5. Subject Management
| S.No. | Endpoint | Method | Description |
|-------|----------|---------|-------------|
| 1 | `/api/subjects/` | GET | List all subjects |
| 2 | `/api/subjects/` | POST | Create new subject |
| 3 | `/api/subjects/{id}/` | PUT | Update subject details |
| 4 | `/api/subjects/{id}/` | DELETE | Delete subject |

## 6. Student Management
| S.No. | Endpoint | Method | Description |
|-------|----------|---------|-------------|
| 1 | `/api/students/` | GET | List all students |
| 2 | `/api/students/` | POST | Create new student |
| 3 | `/api/students/{id}/` | PUT | Update student details |
| 4 | `/api/students/{id}/` | DELETE | Delete student |
| 5 | `/api/students/class/{classId}/` | GET | Get students by class |

## 7. Teacher Management
| S.No. | Endpoint | Method | Description |
|-------|----------|---------|-------------|
| 1 | `/api/teachers/` | GET | List all teachers |
| 2 | `/api/teachers/` | POST | Create new teacher |
| 3 | `/api/teachers/{id}/` | PUT | Update teacher details |
| 4 | `/api/teachers/{id}/` | DELETE | Delete teacher |
| 5 | `/api/teachers/{id}/schedule/` | GET | Get teacher schedule |

## 8. Attendance Management
| S.No. | Endpoint | Method | Description |
|-------|----------|---------|-------------|
| 1 | `/api/attendance/` | GET | List all attendance records |
| 2 | `/api/attendance/` | POST | Add attendance record |
| 3 | `/api/attendance/date/{date}/` | GET | Get attendance by date |

## 9. Analytics
| S.No. | Endpoint | Method | Description |
|-------|----------|---------|-------------|
| 1 | `/api/analytics/performance/` | GET | Get performance analytics |
| 2 | `/api/analytics/attendance/` | GET | Get attendance analytics |
| 3 | `/api/analytics/finance/` | GET | Get financial analytics |

## Common Features for All Endpoints:
1. Authentication: All endpoints (except login, register, and health check) require JWT token authentication
2. Response Format:
```json
{
    "status": "success/error",
    "data": {},
    "message": "string",
    "errors": []
}
```

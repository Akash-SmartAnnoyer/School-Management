import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Login from './pages/Login';
import ExamManagement from './pages/ExamManagement';
import AcademicCalendar from './pages/AcademicCalendar';
import TeacherAttendance from './pages/TeacherAttendance';
import Timetable from './pages/Timetable';
import AttendanceReport from './pages/AttendanceReport';
import Register from './pages/Register';
import Academics from './screens/Academics';

// Inside the Routes component in MainLayout
<Routes>
  <Route path="/" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />
  <Route path="/students" element={
    <ProtectedRoute>
      <Students />
    </ProtectedRoute>
  } />
  <Route path="/teachers" element={
    <ProtectedRoute>
      <Teachers />
    </ProtectedRoute>
  } />
  <Route path="/classes" element={
    <ProtectedRoute>
      <Classes />
    </ProtectedRoute>
  } />
  <Route path="/attendance" element={
    <ProtectedRoute>
      <Attendance />
    </ProtectedRoute>
  } />
  <Route path="/profile" element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } />
  <Route path="/exam-management" element={
    <ProtectedRoute>
      <ExamManagement />
    </ProtectedRoute>
  } />
  <Route path="/academic-calendar" element={
    <ProtectedRoute>
      <AcademicCalendar />
    </ProtectedRoute>
  } />
  <Route path="/teacher-attendance" element={
    <ProtectedRoute>
      <TeacherAttendance />
    </ProtectedRoute>
  } />
  <Route path="/attendance-reports" element={
    <ProtectedRoute>
      <AttendanceReport />
    </ProtectedRoute>
  } />
  <Route path="/timetable/*" element={
    <ProtectedRoute>
      <Timetable />
    </ProtectedRoute>
  } />
  <Route path="/settings" element={
    <ProtectedRoute>
      <AccountSettings />
    </ProtectedRoute>
  } />
  <Route path="/academics" element={
    <ProtectedRoute>
      <Academics />
    </ProtectedRoute>
  } />
</Routes> 
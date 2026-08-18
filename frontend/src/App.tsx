import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RequireAuth from "./auth/RequireAuth";
import ProtectedLayout from "./layouts/ProtectedLayout";
import StudentPreRegistrationPage from "./pages/PreReg/StudentPreRegistrationPage";

import SignIn from "./pages/Authentication/SignIn";
import ForgotPassword from "./pages/Authentication/ForgotPassword";
import VerifyCode from "./pages/Authentication/VerifyCode";
import "./styles/buttons.css";
import "./styles/users.css";

import StudentLayoutPage from "./pages/Student/StudentLayoutPage";
import StudentDashboard from "./pages/Student/StudentDashboard";
import StudentSchedulePage from "./pages/Student/StudentSchedulePage";
import StudentAIAssistantPage from "./pages/Student/StudentAIAssistantPage";
import StudentProfilePage from "./pages/Student/ProfilePage";
import AttendancePage from "./pages/Student/AttendancePage";
import AnnouncementsPage from "./pages/Student/AnnouncementsPage";
import GradesPage from "./pages/Student/GradesPage";
import DocumentsPage from "./pages/Student/DocumentsPage";
import FeesPaymentsPage from "./pages/Student/FeesPaymentsPage";
import HelpCenterPage from "./pages/Student/HelpCenterPage";

import FacultyLayoutPage from "./pages/Faculty/FacultyLayoutPage";
import FacultyDashboard from "./pages/Faculty/FacultyDashboard";
import StudentsPage from "./pages/Faculty/StudentsPage";
import MyClassesPage from "./pages/Faculty/MyClassesPage";
import FacultyAnnouncementsPage from "./pages/Faculty/FacultyAnnouncementsPage";
import CourseMaterialsPage from "./pages/Faculty/CourseMaterialsPage";
import TeachingSchedulePage from "./pages/Faculty/TeachingSchedulePage";
import AttendanceTrackingPage from "./pages/Faculty/AttendanceTrackingPage";
import GradeManagementPage from "./pages/Faculty/GradeManagementPage";
import FacultyAIAssistantPage from "./pages/Faculty/FacultyAIAssistantPage";
import FacultySettingsPage from "./pages/Faculty/FacultySettingsPage";

import RegistrarLayout from "./pages/Registrar/RegistrarLayout";
import RegistrarDashboard from "./pages/Registrar/RegistrarDashboard";
import ApplicationsPage from "./pages/Registrar/ApplicationsPage";
import StudentRecordsPage from "./pages/Registrar/StudentRecordsPage";
import StudentEnrollmentPage from "./pages/Registrar/StudentEnrollmentPage";
import SectionsManagementPage from "./pages/Registrar/SectionsManagementPage";
import DocumentRequestsPage from "./pages/Registrar/DocumentRequestsPage";
import FacultyAccountsPage from "./pages/Registrar/FacultyAccountsPage";
import CoursesPage from "./pages/Registrar/CoursesManagementPage";
import DepartmentsManagementPage from "./pages/Registrar/DepartmentsManagementPage";
import RegistrarHelpPage from "./pages/Registrar/RegistrarHelpPage";
import RegistrarAIAssistantPage from "./pages/Registrar/RegistrarAIAssistantPage";
import RegistrarSettings from "./pages/Registrar/RegistrarSettings";

import SuperAdminLayoutPage from "./pages/SuperAdmin/SuperAdminLayoutPage";
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";
import RoleManagementPage from "./pages/SuperAdmin/RoleManagementPage";
import AIKnowledgeBasePage from "./pages/SuperAdmin/AIKnowledgeBasePage";
import AIKnowledgeCategoryPage from "./pages/SuperAdmin/AIKnowledgeCategoryPage";
import ActivityLogsPage from "./pages/SuperAdmin/ActivityLogsPage";
import SettingsPage from "./pages/SuperAdmin/SettingsPage";
import UsersPage from "./pages/SuperAdmin/UsersPage";

import DepartmentHeadLayoutPage from "./pages/DepartmentHead/DepartmentHeadLayoutPage";
import DepartmentHeadDashboard from "./pages/DepartmentHead/DepartmentHeadDashboard";
import ScheduleManagementPage from "./pages/DepartmentHead/ScheduleManagementPage";
import DepartmentHeadFaculty from "./pages/DepartmentHead/DepartmentHeadFaculty";
import DepartmentHeadSubjects from "./pages/DepartmentHead/DepartmentHeadSubjects";
import DepartmentHeadRooms from "./pages/DepartmentHead/DepartmentHeadRooms";
import DepartmentHeadSettings from "./pages/DepartmentHead/DepartmentHeadSettings";
import DepartmentHeadHelpSupport from "./pages/DepartmentHead/DepartmentHeadHelpSupport";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/prereg" element={<StudentPreRegistrationPage />} />

      {/* Student */}
      <Route
        path="/student"
        element={
          <RequireAuth allowedRoles={["Student"]}>
            <ProtectedLayout>
              <StudentLayoutPage />
            </ProtectedLayout>
          </RequireAuth>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="schedule" element={<StudentSchedulePage />} />
        <Route path="aiassistant" element={<StudentAIAssistantPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="fees" element={<FeesPaymentsPage />} />
        <Route path="help" element={<HelpCenterPage />} />
      </Route>

      {/* Faculty */}
      <Route
        path="/faculty"
        element={
          <RequireAuth allowedRoles={["Faculty"]}>
            <ProtectedLayout>
              <FacultyLayoutPage />
            </ProtectedLayout>
          </RequireAuth>
        }
      >
        <Route index element={<FacultyDashboard />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="classes" element={<MyClassesPage />} />
        <Route path="announcements" element={<FacultyAnnouncementsPage />} />
        <Route path="materials" element={<CourseMaterialsPage />} />
        <Route path="schedule" element={<TeachingSchedulePage />} />
        <Route path="attendance" element={<AttendanceTrackingPage />} />
        <Route path="grades" element={<GradeManagementPage />} />
        <Route path="aiassistant" element={<FacultyAIAssistantPage />} />
        <Route path="settings" element={<FacultySettingsPage />} />
      </Route>

      {/* Registrar */}
      <Route
        path="/registrar"
        element={
          <RequireAuth allowedRoles={["Registrar"]}>
            <ProtectedLayout>
              <RegistrarLayout />
            </ProtectedLayout>
          </RequireAuth>
        }
      >
        <Route index element={<RegistrarDashboard />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="students" element={<StudentRecordsPage />} />
        <Route path="enrollment" element={<StudentEnrollmentPage />} />
        <Route path="sections" element={<SectionsManagementPage />} />
        <Route path="faculty" element={<FacultyAccountsPage />} />
        <Route path="documents" element={<DocumentRequestsPage />} />
        <Route path="ai-assistant" element={<RegistrarAIAssistantPage />} />
        <Route path="departments" element={<DepartmentsManagementPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="settings" element={<RegistrarSettings />} />
        <Route path="help" element={<RegistrarHelpPage />} />
      </Route>

      {/* Super Admin */}
      <Route
        path="/superadmin"
        element={
          <RequireAuth allowedRoles={["Super Admin"]}>
            <ProtectedLayout>
              <SuperAdminLayoutPage />
            </ProtectedLayout>
          </RequireAuth>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="roles" element={<RoleManagementPage />} />
        <Route path="aiknowledge" element={<AIKnowledgeBasePage />} />
        <Route
          path="aiknowledge/:categoryId"
          element={<AIKnowledgeCategoryPage />}
        />
        <Route path="logs" element={<ActivityLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      {/* Department Head */}
      <Route
        path="/dept-head"
        element={
          <RequireAuth allowedRoles={["Dept Head"]}>
            <ProtectedLayout>
              <DepartmentHeadLayoutPage />
            </ProtectedLayout>
          </RequireAuth>
        }
      >
        <Route index element={<DepartmentHeadDashboard />} />
        <Route path="schedules" element={<ScheduleManagementPage />} />
        <Route path="faculty" element={<DepartmentHeadFaculty />} />
        <Route path="subjects" element={<DepartmentHeadSubjects />} />
        <Route path="rooms" element={<DepartmentHeadRooms />} />
        <Route path="settings" element={<DepartmentHeadSettings />} />
        <Route path="help" element={<DepartmentHeadHelpSupport />} />
      </Route>
    </Routes>
  );
}
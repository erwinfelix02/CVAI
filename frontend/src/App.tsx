import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignIn from "./pages/Authentication/SignIn";
import SignUp from "./pages/Authentication/SignUp";
import ForgotPassword from "./pages/Authentication/ForgotPassword";
import VerifyCode from "./pages/Authentication/VerifyCode";
import "./styles/buttons.css";
import "./styles/admin.css";
import "./styles/users.css";
import Admin from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import Users from "./pages/Admin/Users";

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

export default function App() {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-code" element={<VerifyCode />} />

      {/* Admin */}
      <Route path="/admin" element={<Admin />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
      </Route>

      {/* Student */}
      <Route path="/student" element={<StudentLayoutPage />}>
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

      {/* ✅ Faculty */}
      <Route path="/faculty" element={<FacultyLayoutPage />}>
        <Route index element={<FacultyDashboard />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="classes" element={<MyClassesPage />} />
        <Route path="announcements" element={<FacultyAnnouncementsPage />} />
        <Route path="materials" element={<CourseMaterialsPage />} />
      </Route>
    </Routes>
  );
}

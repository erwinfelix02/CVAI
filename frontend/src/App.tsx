import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignIn from "./pages/Authentication/SignIn";
import SignUp from "./pages/Authentication/SignUp";
import ForgotPassword from "./pages/Authentication/ForgotPassword";
import VerifyCode from "./pages/Authentication/VerifyCode";
import "./styles/buttons.css";
import "./styles/admin.css";
import "./styles/users.css";
import "./styles/chat.css";
import Admin from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import Users from "./pages/Admin/Users";
import ChatLandingPage from "./pages/ChatPage/ChatLandingPage";

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

      {/* Chat */}
      <Route path="/chat" element={<ChatLandingPage />} />


    </Routes>
  );
}

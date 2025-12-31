import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import "./styles/buttons.css";
import "./styles/admin.css";
import"./styles/admin-sidebar.css";
import "./styles/users.css";
import Admin from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import Users from "./pages/Admin/Users";



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
       <Route path="/verify-code" element={<VerifyCode />} /> 
       
       
        <Route path="/admin" element={<Admin />}>
        <Route path="dashboard" element={<Dashboard />} />
         <Route path="users" element={<Users />} /> 
      </Route>
    </Routes>
  );
}

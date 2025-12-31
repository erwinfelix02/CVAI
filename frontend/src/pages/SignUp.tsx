import { useState } from "react";
import { Link } from "react-router-dom";
import ArrowIcon from "../assets/arrow-right.png";
import AuthCard from "../components/AuthCard";
import Logo from "../assets/graduation.png";
import "../styles/auth.css";
import Button from "../components/Button";
import {
  FaIdCard,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
} from "react-icons/fa";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-layout">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <h3 className="school-name text-center mb-3">
          ABC National High School
        </h3>
        <h1 className="campus-name">Campus AI</h1>
        <p>Smart Learning Assistant</p>
        <p className="auth-description">
          Your AI-powered companion for academic success and campus life
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <AuthCard
          title="Get Started"
          subtitle="Create your account to get started"
          header={
            <h1 className="campus-ai-header-mobile text-center mb-3">
              <span className="campus-ai-logo-wrapper">
                <img src={Logo} alt="CampusAI logo" className="navbar-logo" />
              </span>
              Campus AI
            </h1>
          }
          footer={
            <p className="text-center mt-3">
              Already have an account? <Link to="/signin">Sign in</Link>
            </p>
          }
        >
          {/* FULL NAME */}
          <div className="outlined-field">
            <input className="outlined-input" placeholder=" " required />
            <label>Full Name</label>
            <FaUser className="outlined-icon" />
          </div>

          {/* SCHOOL ID */}
          <div className="outlined-field">
            <input className="outlined-input" placeholder=" " required />
            <label>School ID Number</label>
            <FaIdCard className="outlined-icon" />
          </div>

          {/* EMAIL */}
          <div className="outlined-field">
            <input
              type="email"
              className="outlined-input"
              placeholder=" "
              required
            />
            <label>Email Address</label>
            <FaEnvelope className="outlined-icon" />
          </div>

          {/* PASSWORD */}
          <div className="outlined-field">
            <input
              type={showPassword ? "text" : "password"}
              className="outlined-input"
              placeholder=" "
              required
            />
            <label>Password</label>

            <button
              type="button"
              className="outlined-icon"
              onClick={() => setShowPassword((p) => !p)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <Button className="btn-brand w-100 d-flex align-items-center justify-content-center gap-2">
            Create Account
            <img src={ArrowIcon} alt="" className="btn-arrow" />
          </Button>
        </AuthCard>
      </div>
    </div>
  );
}

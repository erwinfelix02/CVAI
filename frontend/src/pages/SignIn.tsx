import { useState } from "react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import AuthCard from "../components/AuthCard";
import RoleSelector from "../components/RoleSelector";
import "../styles/auth.css";
import ArrowIcon from "../assets/arrow-right.png";
import Button from "../components/Button";

import {
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaShieldAlt,
} from "react-icons/fa";

type Role = "student" | "employee" | "admin";

export default function SignIn() {
  const [role, setRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);

  const roleEmailIcon: Record<Role, ReactNode> = {
    student: <FaUserGraduate />,
    employee: <FaChalkboardTeacher />,
    admin: <FaShieldAlt />,
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue to CampusAI"
      footer={
        <p className="text-center mt-3">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      }
    >
      {/* ROLE */}
      <div className="mb-3">
        <label className="form-label small fw-semibold">I AM A</label>
        <RoleSelector role={role} setRole={setRole} />
      </div>

      {/* EMAIL */}
      <div className="mb-3">
        <label htmlFor="email" className="form-label fw-semibold">
          Email Address
        </label>

        <div className="input-group">
          <span className="input-group-text">{roleEmailIcon[role]}</span>

          <input
            id="email"
            type="email"
            className="form-control"
            placeholder="you@university.edu"
          />
        </div>
      </div>

      {/* PASSWORD */}
      <div className="mb-2">
        <label htmlFor="password" className="form-label fw-semibold">
          Password
        </label>

        <div className="input-group">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="form-control"
            placeholder="Enter your password"
          />

          <button
            type="button"
            className="input-group-text bg-transparent"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{ cursor: "pointer" }}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {/* FORGOT PASSWORD */}
      <div className="text-end mb-3">
        <Link to="/forgot-password" className="small">
          Forgot password?
        </Link>
      </div>

      <Button className="w-100 mb-3 d-inline-flex align-items-center justify-content-center gap-2">
        Sign In
        <img src={ArrowIcon} alt="" className="btn-arrow" />
      </Button>
    </AuthCard>
  );
}

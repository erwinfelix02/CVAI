import { useState } from "react";
import type { ReactNode } from "react";
import ArrowIcon from "../assets/arrow-right.png";
import AuthCard from "../components/AuthCard";
import RoleSelector, { type Role } from "../components/RoleSelector";
import "../styles/auth.css";
import Button from "../components/Button";

import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

export default function SignUp() {
  const [role, setRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);

  // ❌ admin NOT included here
  const roleConfig: Record<
    Exclude<Role, "admin">,
    {
      label: string;
      placeholder: string;
      icon: ReactNode;
    }
  > = {
    student: {
      label: "Student ID Number",
      placeholder: "e.g. 2024-0001",
      icon: <FaUserGraduate />,
    },
    employee: {
      label: "Employee ID Number",
      placeholder: "e.g. EMPLY-1023",
      icon: <FaChalkboardTeacher />,
    },
  };

  return (
    <AuthCard
      title="Get Started"
      subtitle="Create your account to get started"
      footer={
        <p className="text-center mt-3">
          Already have an account? <a href="/signin">Sign in</a>
        </p>
      }
    >
      {/* ROLE */}
      <div className="mb-3">
        <label className="form-label small fw-semibold">I AM A</label>
        <RoleSelector
          role={role}
          setRole={setRole}
          allowedRoles={["student", "employee"]} // ✅ admin hidden
        />
      </div>

      {/* FULL NAME */}
      <div className="mb-3">
        <label htmlFor="fullName" className="form-label fw-semibold">
          Full Name
        </label>
        <input
          id="fullName"
          className="form-control"
          placeholder="Enter your full name"
        />
      </div>

      {/* ROLE ID NUMBER */}
      {role !== "admin" && (
        <div className="mb-3">
          <label htmlFor="roleId" className="form-label fw-semibold">
            {roleConfig[role].label}
          </label>

          <div className="input-group">
            <span className="input-group-text">{roleConfig[role].icon}</span>

            <input
              id="roleId"
              className="form-control"
              placeholder={roleConfig[role].placeholder}
            />
          </div>
        </div>
      )}

      {/* EMAIL */}
      <div className="mb-3">
        <label htmlFor="email" className="form-label fw-semibold">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          className="form-control"
          placeholder="you@university.edu"
        />
      </div>

      {/* PASSWORD */}
      <div className="mb-4">
        <label htmlFor="password" className="form-label fw-semibold">
          Password
        </label>

        <div className="input-group">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="form-control"
            placeholder="Create a secure password"
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

      <Button className="w-100 mb-3 d-inline-flex align-items-center justify-content-center gap-2">
        Create Account
        <img src={ArrowIcon} alt="" className="btn-arrow" />
      </Button>
    </AuthCard>
  );
}

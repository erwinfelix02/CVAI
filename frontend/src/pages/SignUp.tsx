import { useState } from "react";
import ArrowIcon from "../assets/arrow-right.png";
import AuthCard from "../components/AuthCard";
import "../styles/auth.css";
import Button from "../components/Button";

import { FaIdCard, FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);

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
      {/* FULL NAME */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Full Name</label>
        <input
          className="form-control"
          placeholder="Enter your full name"
        />
      </div>

      {/* SCHOOL ID */}
      <div className="mb-3">
        <label className="form-label fw-semibold">School ID Number</label>
        <div className="input-group">
          <span className="input-group-text">
            <FaIdCard />
          </span>
          <input
            className="form-control"
            placeholder="Student or Employee ID"
          />
        </div>
        <small className="text-muted">
          Your role will be determined automatically.
        </small>
      </div>

      {/* EMAIL */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Email Address</label>
        <input
          type="email"
          className="form-control"
          placeholder="you@university.edu"
        />
      </div>

      {/* PASSWORD */}
      <div className="mb-4">
        <label className="form-label fw-semibold">Password</label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            placeholder="Create a secure password"
          />
          <button
            type="button"
            className="input-group-text bg-transparent"
            onClick={() => setShowPassword((p) => !p)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      <Button className="w-100 d-flex align-items-center justify-content-center gap-2">
        Create Account
        <img src={ArrowIcon} alt="" className="btn-arrow" />
      </Button>
    </AuthCard>
  );
}

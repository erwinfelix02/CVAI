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

  // Inputs
  const [fullName, setFullName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<{
    fullName?: string;
    schoolId?: string;
    email?: string;
    password?: string;
  }>({});

  const allowedDomains = ["gmail.com", "yahoo.com", "hotmail.com"];

  const isValidEmail = (value: string) => {
    const parts = value.split("@");
    if (parts.length !== 2) return false;
    const [local, domain] = parts;
    if (!local) return false;
    return allowedDomains.includes(domain.toLowerCase());
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Remove spaces automatically
    const sanitizedValue = value.replace(/\s/g, "");
    setPassword(sanitizedValue);
    // Clear any existing password errors immediately
    setErrors((prev) => ({ ...prev, password: undefined }));

    // Real-time space validation
    if (/\s/.test(value)) {
      setErrors((prev) => ({ ...prev, password: "Spaces are not allowed" }));
    }
  };

  const handleSubmit = () => {
    const newErrors: typeof errors = {};

    if (!fullName) newErrors.fullName = "Full Name is required";
    if (!schoolId) newErrors.schoolId = "School ID is required";
    else if (!/^\d+$/.test(schoolId))
      newErrors.schoolId = "School ID must be numeric";

    if (!email) newErrors.email = "Email is required";
    else if (!isValidEmail(email)) newErrors.email = "Invalid email format";

    if (!password) newErrors.password = "Password is required";
    else {
      const missing: string[] = [];

      if (password.length < 8) missing.push("8+ chars");
      if (!/[A-Z]/.test(password)) missing.push("uppercase");
      if (!/[a-z]/.test(password)) missing.push("lowercase");
      if (!/\d/.test(password)) missing.push("number");
      if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password))
        missing.push("special char");

      if (missing.length > 0)
        newErrors.password = "Password must have: " + missing.join(", ");
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Form valid:", { fullName, schoolId, email, password });
      // send data to backend
    }
  };

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
            <input
              className={`outlined-input ${errors.fullName ? "input-error" : ""}`}
              placeholder=" "
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors({ ...errors, fullName: undefined });
              }}
              required
            />
            <label className={errors.fullName ? "label-error" : ""}>
              Full Name
            </label>
            <FaUser
              className={`outlined-icon ${errors.fullName ? "icon-error" : ""}`}
            />
            <div className="error-space">
              <span
                className={errors.fullName ? "error-text show" : "error-text"}
              >
                {errors.fullName || "placeholder"}
              </span>
            </div>
          </div>

          {/* SCHOOL ID */}
          <div className="outlined-field">
            <input
              className={`outlined-input ${errors.schoolId ? "input-error" : ""}`}
              placeholder=" "
              value={schoolId}
              onChange={(e) => {
                setSchoolId(e.target.value);
                setErrors({ ...errors, schoolId: undefined });
              }}
              required
            />
            <label className={errors.schoolId ? "label-error" : ""}>
              School ID Number
            </label>
            <FaIdCard
              className={`outlined-icon ${errors.schoolId ? "icon-error" : ""}`}
            />
            <div className="error-space">
              <span
                className={errors.schoolId ? "error-text show" : "error-text"}
              >
                {errors.schoolId || "placeholder"}
              </span>
            </div>
          </div>

          {/* EMAIL */}
          <div className="outlined-field">
            <input
              type="email"
              className={`outlined-input ${errors.email ? "input-error" : ""}`}
              placeholder=" "
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: undefined });
              }}
              required
            />
            <label className={errors.email ? "label-error" : ""}>
              Email Address
            </label>
            <FaEnvelope
              className={`outlined-icon ${errors.email ? "icon-error" : ""}`}
            />
            <div className="error-space">
              <span className={errors.email ? "error-text show" : "error-text"}>
                {errors.email || "placeholder"}
              </span>
            </div>
          </div>

          {/* PASSWORD */}
          <div className="outlined-field">
            <input
              type={showPassword ? "text" : "password"}
              className={`outlined-input ${errors.password ? "input-error" : ""}`}
              placeholder=" "
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
            />

            <label className={errors.password ? "label-error" : ""}>
              Password
            </label>
            <button
              type="button"
              className={`outlined-icon ${errors.password ? "icon-error" : ""}`}
              onClick={() => setShowPassword((p) => !p)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            <div className="error-space">
              <span
                className={errors.password ? "error-text show" : "error-text"}
              >
                {errors.password || "placeholder"}
              </span>
            </div>
          </div>

          <Button
            className="btn-brand w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleSubmit}
          >
            Create Account
            <img src={ArrowIcon} alt="" className="btn-arrow" />
          </Button>
        </AuthCard>
      </div>
    </div>
  );
}

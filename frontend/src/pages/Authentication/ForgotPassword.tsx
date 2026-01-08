import { useState } from "react";
import { FaKey, FaEnvelope } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import ArrowIcon from "../../assets/arrow-right.png";
import AuthCard from "../../components/Authentication/AuthCard";
import Button from "../../components/Authentication/Button";
import "../../styles/auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const navigate = useNavigate();

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!email) newErrors.email = "Email is required";
    else if (!isValidEmail(email)) newErrors.email = "Invalid email format";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // UI check only
      navigate("/verify-code");
    }
  };

  return (
    <AuthCard
      header={
        <div className="d-flex justify-content-center mb-3">
          <div className={`reset-icon ${errors.email ? "icon-error" : ""}`}>
            <FaKey />
          </div>
        </div>
      }
      title="Reset your password"
      subtitle="Enter your email and we'll send you a code to reset your password"
      footer={
        <p className="text-center mt-3 mb-0">
          <Link to="/signin" className="small">
            ← Back to Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Email input */}
        <div className="outlined-field">
          <input
            id="email"
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
          <label className={errors.email ? "label-error" : ""}>Email</label>
          <FaEnvelope
            className={`outlined-icon ${errors.email ? "icon-error" : ""}`}
          />
          <div className="error-space">
            <span className={errors.email ? "error-text show" : "error-text"}>
              {errors.email || "placeholder"}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          className="btn-brand w-100 d-inline-flex align-items-center justify-content-center gap-2"
          disabled={!email}
        >
          Send Reset Code
          <img src={ArrowIcon} alt="" className="btn-arrow" />
        </Button>
      </form>
    </AuthCard>
  );
}

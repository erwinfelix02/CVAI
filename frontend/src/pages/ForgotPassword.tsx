import { useState } from "react";
import { FaKey } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import ArrowIcon from "../assets/arrow-right.png";
import { FaEnvelope } from "react-icons/fa";
import AuthCard from "../components/AuthCard";
import Button from "../components/Button";
import "../styles/auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) return;

    // UI check only
    navigate("/verify-code");
  };

  return (
    <AuthCard
      header={
        <div className="d-flex justify-content-center mb-3">
          <div className="reset-icon">
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
        {/* Modern outlined input */}
        <div className="outlined-field">
          <input
            id="email"
            type="email"
            className="outlined-input"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            required
          />
          <label>Email</label>
          <FaEnvelope className="outlined-icon" />
        </div>

        {/* Error text */}
        {touched && !isEmailValid && (
          <small className="text-danger mb-2">
            Please enter a valid email address
          </small>
        )}

        <Button
          type="submit"
          className="btn-brand w-100 d-inline-flex align-items-center justify-content-center gap-2"
          disabled={!isEmailValid}
        >
          Send Reset Code
          <img src={ArrowIcon} alt="" className="btn-arrow" />
        </Button>
      </form>
    </AuthCard>
  );
}

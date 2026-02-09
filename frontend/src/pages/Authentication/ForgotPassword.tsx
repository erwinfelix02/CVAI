import { useState, useEffect } from "react";
import {
  FaKey,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import PreRegNavbar from "../../components/PreReg/PreRegNavbar";
import AuthCard from "../../components/Authentication/AuthCard";
import Button from "../../components/Authentication/Button";
import AuthLayout from "../../components/Authentication/AuthLayout";

import ArrowIcon from "../../assets/arrow-right.png";
import "../../styles/auth.css";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);

  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const isCodeComplete = code.every((d) => d !== "");
  const isPasswordValid =
    password.length >= 8 && password === confirmPassword;

  /* ================= RESEND TIMER ================= */
  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  /* ================= SUBMIT ================= */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      const newErrors: typeof errors = {};
      if (!email) newErrors.email = "Email is required";
      else if (!isValidEmail(email))
        newErrors.email = "Invalid email format";

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;

      setStep(2);
      setResendTimer(30);
      return;
    }

    if (step === 2) {
      if (!isCodeComplete) return;
      setStep(3);
      return;
    }

    // Step 3 (UI only)
    console.log("New password:", password);
  };

  /* ================= PREVIOUS ================= */
  const handlePrevious = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  /* ================= RESEND ================= */
  const handleResend = () => {
    if (resendTimer > 0) return;
    setCode(Array(6).fill(""));
    setResendTimer(30);
  };

  /* ================= CODE INPUT ================= */
  const handleCodeChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleBackspace = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key !== "Backspace") return;

    const newCode = [...code];
    if (newCode[index]) newCode[index] = "";
    else if (index > 0)
      document.getElementById(`code-${index - 1}`)?.focus();

    setCode(newCode);
  };

  return (
    <>
      <PreRegNavbar />

      <AuthLayout>
        <AuthCard
          header={
            <div className="d-flex justify-content-center mb-3">
              <div className="reset-icon">
                {step === 3 ? <FaLock /> : step === 2 ? <FaEnvelope /> : <FaKey />}
              </div>
            </div>
          }
          title={
            step === 1
              ? "Reset your password"
              : step === 2
              ? "Check your email"
              : "Set a new password"
          }
          subtitle={
            step === 1
              ? "Enter your email and we'll send you a code"
              : step === 2
              ? <>We sent a 6-digit code to <strong>{email}</strong></>
              : <>Create a new password for <strong>{email}</strong></>
          }
          footer={
            step === 1 && (
              <p className="text-center mt-3 mb-0">
                <Link to="/signin" className="small">
                  ← Back to Sign in
                </Link>
              </p>
            )
          }
        >
          {/* ================= STEPPER ================= */}
          <div className="auth-stepper compact">
            <div className={`auth-step ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}>
              <FaEnvelope />
              <span>Email</span>
            </div>
            <div className="auth-step-line" />
            <div className={`auth-step ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>
              <FaKey />
              <span>Verify</span>
            </div>
            <div className="auth-step-line" />
            <div className={`auth-step ${step === 3 ? "active" : ""}`}>
              <FaLock />
              <span>Password</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* STEP 1 */}
            {step === 1 && (
              <div className="outlined-field">
                <input
                  type="email"
                  className={`outlined-input ${errors.email ? "input-error" : ""}`}
                  placeholder=" "
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ email: undefined });
                  }}
                />
                <label>Email</label>
                <FaEnvelope className="outlined-icon" />
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <div className="d-flex justify-content-center gap-2 mb-3">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="code-input text-center"
                      value={digit}
                      onChange={(e) =>
                        handleCodeChange(e.target.value, index)
                      }
                      onKeyDown={(e) => handleBackspace(e, index)}
                    />
                  ))}
                </div>

                <p className="text-center small">
                  Didn’t receive the code?{" "}
                  <button
                    type="button"
                    className="resend-btn"
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                  >
                    {resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : "Resend"}
                  </button>
                </p>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <div className="outlined-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="outlined-input"
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label>New Password</label>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className="outlined-field">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="outlined-input"
                    placeholder=" "
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <label>Confirm Password</label>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </>
            )}

            {/* ================= ACTION BUTTONS ================= */}
            <div className="d-flex gap-2">
              {step > 1 && (
                <Button
                  type="button"
                  className="btn-outline w-50"
                  onClick={handlePrevious}
                >
                  Previous
                </Button>
              )}

              <Button
                type="submit"
                className={`btn-brand ${step > 1 ? "w-50" : "w-100"}`}
                disabled={
                  (step === 2 && !isCodeComplete) ||
                  (step === 3 && !isPasswordValid)
                }
              >
                {step === 1
                  ? "Send Reset Code"
                  : step === 2
                  ? "Verify Code"
                  : "Update Password"}
                <img src={ArrowIcon} alt="" className="btn-arrow" />
              </Button>
            </div>
          </form>
        </AuthCard>
      </AuthLayout>
    </>
  );
}
